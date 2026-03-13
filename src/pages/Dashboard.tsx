import React, { useEffect, useMemo, useState } from "react";
import { ref, onValue, push, set } from "firebase/database";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, Bitcoin, Coins, Wallet, Landmark, Mail, Clock3, 
  Copy, CheckCircle2, Activity, ArrowDownLeft, ArrowUpRight, 
  RefreshCw, X, SendHorizontal, QrCode, Lock, UserPlus, 
  TrendingUp, ArrowRight, LayoutDashboard, History, Settings, ChevronDown
} from "lucide-react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

type CoinKey = "BTC" | "ETH" | "USDT";

// --- დამხმარე ფუნქციები შენი კოდიდან ---
const formatMoney = (v: number) => v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatCoinAmount = (coin: CoinKey, v: number) => coin === "USDT" ? v.toLocaleString(undefined, { minimumFractionDigits: 2 }) : v.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 8 });

const Dashboard = () => {
  const { user, logout } = useAuth() as any;

  // --- შენი ორიგინალი State-ები ---
  const [userData, setUserData] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [market, setMarket] = useState<any>({
    BTC: { price: 0, image: "https://cryptologos.cc/logos/bitcoin-btc-logo.png" },
    ETH: { price: 0, image: "https://cryptologos.cc/logos/ethereum-eth-logo.png" },
    USDT: { price: 0, image: "https://cryptologos.cc/logos/tether-usdt-logo.png" }
  });
  const [copied, setCopied] = useState("");
  const [toast, setToast] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // მოდალების მართვა
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);

  const [receiveCoin, setReceiveCoin] = useState<CoinKey>("BTC");

  // ფორმების State-ები (ზუსტად შენი კოდიდან)
  const [depositNotice, setDepositNotice] = useState({ coin: "BTC" as CoinKey, amount: "", txid: "", note: "" });
  const [withdrawForm, setWithdrawForm] = useState({ coin: "BTC" as CoinKey, network: "Bitcoin", amount: "", address: "", note: "" });
  const [swapForm, setSwapForm] = useState({ fromCoin: "BTC" as CoinKey, toCoin: "USDT" as CoinKey, fromAmount: "", note: "" });

  // --- შენი ორიგინალი ეფექტები და ლოგიკა ---
  useEffect(() => {
    if (!user?.id) return;
    const userRef = ref(db, `users/${user.id}`);
    const unsub = onValue(userRef, (snapshot) => { if (snapshot.exists()) setUserData(snapshot.val()); });
    return () => unsub();
  }, [user?.id]);

  useEffect(() => {
    const loadMarket = async () => {
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether");
        const json = await res.json();
        if (Array.isArray(json)) {
          const next = { ...market };
          json.forEach(item => {
            if (item.id === "bitcoin") next.BTC = { price: item.current_price, image: item.image };
            if (item.id === "ethereum") next.ETH = { price: item.current_price, image: item.image };
            if (item.id === "tether") next.USDT = { price: item.current_price, image: item.image };
          });
          setMarket(next);
        }
      } catch (e) { console.error(e); }
    };
    loadMarket();
    const t = setInterval(loadMarket, 60000);
    return () => clearInterval(t);
  }, []);

  const balances = useMemo(() => {
    const btc = Number(userData?.btc_balance || 0);
    const eth = Number(userData?.eth_balance || 0);
    const usdt = Number(userData?.usdt_balance || 0);
    const usd = (btc * market.BTC.price) + (eth * market.ETH.price) + (usdt * market.USDT.price);
    return { btc, eth, usdt, usd };
  }, [userData, market]);

  const showToast = (text: string) => { setToast(text); setTimeout(() => setToast(""), 2200); };

  // --- ფუნქციონალი: DEPOSIT NOTICE ---
  const submitDepositNotice = async () => {
    if (!depositNotice.amount.trim()) return showToast("Enter amount");
    setSubmitting(true);
    try {
      const reqRef = push(ref(db, "deposit_requests"));
      await set(reqRef, { ...depositNotice, userId: user.id, status: "pending", created_at: Date.now() });
      setReceiveOpen(false);
      showToast("Notice Sent - Pending");
    } catch (e) { showToast("Error"); } finally { setSubmitting(false); }
  };

  // --- ფუნქციონალი: WITHDRAW ---
  const submitWithdrawRequest = async () => {
    const amount = Number(withdrawForm.amount);
    const currentBal = withdrawForm.coin === "BTC" ? balances.btc : withdrawForm.coin === "ETH" ? balances.eth : balances.usdt;
    if (amount > currentBal) return showToast("Insufficient balance");
    setSubmitting(true);
    try {
      const reqRef = push(ref(db, "transactions"));
      await set(reqRef, { ...withdrawForm, userId: user.id, type: "withdraw", status: "pending", created_at: Date.now() });
      setWithdrawOpen(false);
      showToast("Request Sent - Pending");
    } catch (e) { showToast("Error"); } finally { setSubmitting(false); }
  };

  const handleCopy = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-white/5 bg-[#0b0e14] lg:block">
        <div className="flex h-20 items-center px-8 border-b border-white/5">
          <ShieldCheck className="text-blue-500 mr-2" size={24} />
          <span className="text-lg font-black tracking-tighter text-white uppercase italic">Axcel Intel</span>
        </div>
        <nav className="p-6 space-y-2">
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-xl font-bold cursor-default">
            <LayoutDashboard size={20} /> Dashboard
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-white transition-all"><History size={20} /> History</button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-white transition-all"><Settings size={20} /> Settings</button>
        </nav>
        <div className="absolute bottom-8 left-0 w-full px-6">
          <button onClick={logout} className="flex w-full items-center gap-3 px-4 py-3 text-rose-500/70 hover:text-rose-500 font-bold transition-all"><Lock size={20} /> Logout</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="lg:ml-64 p-4 md:p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Welcome, {userData?.firstName || 'User'}</h1>
            <p className="text-slate-500 mt-1">Institutional node access is encrypted.</p>
          </div>
          <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-600/20">{userData?.firstName?.[0] || 'U'}</div>
            <div className="pr-4"><div className="text-xs font-bold text-slate-400 uppercase tracking-widest">ID</div><div className="text-sm font-mono text-blue-400">#{user.id.slice(0, 6)}</div></div>
          </div>
        </header>

        {/* BALANCE SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 relative overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-600 to-indigo-700 p-10 shadow-2xl shadow-blue-900/20">
            <div className="relative z-10">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-100/60">Portfolio Balance</span>
              <div className="text-6xl font-black text-white mt-2 mb-8">${formatMoney(balances.usd)}</div>
              <div className="flex gap-4">
                <button onClick={() => setReceiveOpen(true)} className="flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl"><ArrowDownLeft size={18} /> Receive</button>
                <button onClick={() => setWithdrawOpen(true)} className="flex items-center gap-2 bg-blue-500/20 border border-white/20 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"><ArrowUpRight size={18} /> Withdraw</button>
                <button onClick={() => setSwapOpen(true)} className="flex items-center gap-2 bg-white/5 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10"><RefreshCw size={18} /> Swap</button>
              </div>
            </div>
          </div>
          <div className="bg-[#0b0e14] border border-white/5 rounded-[32px] p-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6">Market Prices</h3>
            <div className="space-y-6">
              {Object.entries(market).map(([coin, data]: any) => (
                <div key={coin} className="flex items-center justify-between">
                  <div className="flex items-center gap-3"><img src={data.image} className="h-8 w-8" alt="" /><div><div className="font-bold text-white">{coin}</div><div className="text-xs text-slate-500">Live Feed</div></div></div>
                  <div className="text-right"><div className="font-bold text-white">${formatMoney(data.price)}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ASSET TABLE */}
        <div className="bg-[#0b0e14] border border-white/5 rounded-[32px] overflow-hidden">
          <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center"><h3 className="font-black text-white uppercase tracking-widest text-sm italic">Asset Nodes</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="text-[10px] uppercase tracking-[0.2em] text-slate-500"><th className="px-8 py-4">Coin</th><th className="px-8 py-4">Amount</th><th className="px-8 py-4">Value</th><th className="px-8 py-4">Address</th></tr></thead>
              <tbody className="divide-y divide-white/5">
                {(['BTC', 'ETH', 'USDT'] as CoinKey[]).map((id) => (
                  <tr key={id} className="hover:bg-white/[0.02] transition-all group">
                    <td className="px-8 py-6"><div className="flex items-center gap-3"><img src={market[id].image} className="h-10 w-10 p-1" alt="" /><div><div className="font-black text-white">{id} Wallet</div><div className="text-xs text-slate-500">Node v4.2</div></div></div></td>
                    <td className="px-8 py-6 font-bold text-white">{balances[id.toLowerCase() as keyof typeof balances]} {id}</td>
                    <td className="px-8 py-6 font-bold text-blue-400">${formatMoney(balances[id.toLowerCase() as keyof typeof balances] * market[id].price)}</td>
                    <td className="px-8 py-6">
                      <button onClick={() => handleCopy(userData?.[`${id.toLowerCase()}_address`] || '', id)} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl text-xs hover:bg-white/10 border border-white/5 transition-all">
                        {copied === id ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        <span className="font-mono opacity-50">{userData?.[`${id.toLowerCase()}_address`]?.slice(0,8) || 'Not Assigned'}...</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL: RECEIVE (შენი ფუნქციონალით) */}
      {receiveOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="bg-[#0b101a] border border-white/10 w-full max-w-lg rounded-[40px] p-8 relative">
            <button onClick={() => setReceiveOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X /></button>
            <h2 className="text-2xl font-black text-white mb-6 italic uppercase">Deposit Funds</h2>
            <div className="flex gap-3 mb-6">
              {(['BTC', 'ETH', 'USDT'] as CoinKey[]).map((c) => (
                <button key={c} onClick={() => setReceiveCoin(c)} className={`flex-1 py-4 rounded-2xl border transition-all font-bold ${receiveCoin === c ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/5 text-slate-500'}`}>{c}</button>
              ))}
            </div>
            <div className="bg-black/40 p-6 rounded-3xl border border-white/5 mb-6 text-center">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${userData?.[`${receiveCoin.toLowerCase()}_address`] || 'none'}`} className="mx-auto h-32 w-32 rounded-xl mb-4 border-4 border-white" alt="QR" />
              <div className="font-mono text-[10px] text-blue-400 break-all bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">{userData?.[`${receiveCoin.toLowerCase()}_address`] || 'Contact Admin'}</div>
            </div>
            <div className="space-y-3">
              <input type="number" placeholder="Amount Sent" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:border-blue-500 outline-none" onChange={(e) => setDepositNotice({...depositNotice, amount: e.target.value, coin: receiveCoin})} />
              <input type="text" placeholder="TXID / Hash (Optional)" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:border-blue-500 outline-none" onChange={(e) => setDepositNotice({...depositNotice, txid: e.target.value})} />
              <button onClick={submitDepositNotice} disabled={submitting} className="w-full bg-blue-600 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all">{submitting ? "Processing..." : "Notify Admin"}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: WITHDRAW (შენი ფუნქციონალით) */}
      {withdrawOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="bg-[#0b101a] border border-white/10 w-full max-w-lg rounded-[40px] p-8 relative">
            <button onClick={() => setWithdrawOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X /></button>
            <h2 className="text-2xl font-black text-white mb-6 italic uppercase">Withdraw Assets</h2>
            <div className="space-y-4">
               <div className="flex gap-2">
                  {(['BTC', 'ETH', 'USDT'] as CoinKey[]).map(c => (
                    <button key={c} onClick={() => setWithdrawForm({...withdrawForm, coin: c})} className={`flex-1 py-3 rounded-xl border text-xs font-bold ${withdrawForm.coin === c ? 'bg-blue-600 border-blue-500' : 'bg-white/5 border-white/5 opacity-50'}`}>{c}</button>
                  ))}
               </div>
               <input type="text" placeholder="Destination Address" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm" onChange={(e) => setWithdrawForm({...withdrawForm, address: e.target.value})} />
               <input type="number" placeholder="Amount" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm" onChange={(e) => setWithdrawForm({...withdrawForm, amount: e.target.value})} />
               <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                 <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500"><span>Network Fee</span><span className="text-white">Applied</span></div>
               </div>
               <button onClick={submitWithdrawRequest} disabled={submitting} className="w-full bg-rose-600 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-rose-500 transition-all">Confirm Withdrawal</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && <div className="fixed bottom-8 right-8 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl z-[200] animate-bounce">{toast}</div>}
    </div>
  );
};

export default Dashboard;
