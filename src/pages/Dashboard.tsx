import React, { useEffect, useMemo, useState } from "react";
import { ref, onValue, push, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, Copy, CheckCircle2, ArrowDownLeft, ArrowUpRight, 
  RefreshCw, X, QrCode, Lock, TrendingUp, LayoutDashboard, 
  History, Settings, Activity, Globe, Zap, ShieldAlert, ChevronDown
} from "lucide-react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

type CoinKey = "BTC" | "ETH" | "USDT";

const Dashboard = () => {
  const { user, logout } = useAuth() as any;
  const navigate = useNavigate();

  const [userData, setUserData] = useState<any>(null);
  const [market, setMarket] = useState<any>({
    BTC: { price: 0, image: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/btc.png" },
    ETH: { price: 0, image: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/eth.png" },
    USDT: { price: 0, image: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/usdt.png" }
  });
  
  const [copied, setCopied] = useState("");
  const [toast, setToast] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Modals
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);
  
  // Forms State
  const [receiveCoin, setReceiveCoin] = useState<CoinKey>("ETH");
  const [withdrawForm, setWithdrawForm] = useState({ coin: "ETH" as CoinKey, amount: "", address: "" });
  const [swapForm, setSwapForm] = useState({ from: "ETH" as CoinKey, to: "BTC" as CoinKey, amount: "" });
  const [swapStep, setSwapStep] = useState(0); // 0: input, 1: processing, 2: success

  useEffect(() => {
    if (!user?.id) return;
    const userRef = ref(db, `users/${user.id}`);
    const unsub = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) setUserData(snapshot.val());
    });
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
            if (item.id === "bitcoin") next.BTC.price = item.current_price;
            if (item.id === "ethereum") next.ETH.price = item.current_price;
            if (item.id === "tether") next.USDT.price = item.current_price;
          });
          setMarket(next);
        }
      } catch (e) { console.error(e); }
    };
    loadMarket();
    const t = setInterval(loadMarket, 60000);
    return () => clearInterval(t);
  }, []);

  const balances = useMemo(() => ({
    eth: Number(userData?.eth_balance || 0),
    btc: Number(userData?.btc_balance || 0),
    usdt: Number(userData?.usdt_balance || 0),
    usd: (Number(userData?.eth_balance || 0) * market.ETH.price) + 
         (Number(userData?.btc_balance || 0) * market.BTC.price) + 
         (Number(userData?.usdt_balance || 0) * market.USDT.price)
  }), [userData, market]);

  const showToast = (text: string) => { setToast(text); setTimeout(() => setToast(""), 3000); };
  
  const handleCopy = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleWithdraw = async () => {
    if (!withdrawForm.amount || !withdrawForm.address) return showToast("Please fill all fields");
    if (Number(withdrawForm.amount) > balances[withdrawForm.coin.toLowerCase() as keyof typeof balances]) return showToast("Insufficient balance");
    
    setSubmitting(true);
    try {
      const transRef = push(ref(db, "transactions"));
      await set(transRef, {
        userId: user.id,
        userEmail: user.email,
        type: "withdraw",
        coin: withdrawForm.coin,
        amount: withdrawForm.amount,
        address: withdrawForm.address,
        status: "pending",
        created_at: Date.now()
      });
      setWithdrawOpen(false);
      showToast("Withdrawal Requested - Admin Review Pending");
    } catch (e) { showToast("Error"); } finally { setSubmitting(false); }
  };

  const handleSwap = () => {
    if (!swapForm.amount || Number(swapForm.amount) <= 0) return showToast("Enter amount");
    if (Number(swapForm.amount) > balances[swapForm.from.toLowerCase() as keyof typeof balances]) return showToast("Insufficient balance");
    
    setSwapStep(1);
    setTimeout(() => setSwapStep(2), 4000);
  };

  const swapRate = (market[swapForm.from].price / market[swapForm.to].price).toFixed(6);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-[#f1f5f9] font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* BACKGROUND BLOBS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-white/10 bg-white/[0.02] backdrop-filter blur-3xl lg:block z-50">
        <div className="flex h-24 items-center px-8 border-b border-white/5">
          <ShieldCheck className="text-blue-500 mr-3" size={24} />
          <span className="text-sm font-black tracking-widest uppercase italic">Axcel Wallet</span>
        </div>
        <nav className="p-6 space-y-3">
          <div className="flex items-center gap-3 px-5 py-3.5 bg-blue-600/20 text-blue-400 rounded-2xl font-bold border border-blue-500/20"><LayoutDashboard size={20} /> Dashboard</div>
          <button onClick={() => navigate('/history')} className="w-full flex items-center gap-3 px-5 py-3.5 text-slate-500 hover:text-white transition-all"><History size={20} /> History</button>
          <button className="w-full flex items-center gap-3 px-5 py-3.5 text-slate-500 hover:text-white transition-all"><Settings size={20} /> Settings</button>
        </nav>
        <div className="absolute bottom-8 left-0 w-full px-6">
          <button onClick={logout} className="flex w-full items-center gap-3 px-5 py-3.5 text-rose-500/70 hover:text-rose-500 font-bold transition-all hover:bg-rose-500/5 rounded-xl"><Lock size={20} /> Logout</button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="relative z-10 lg:ml-64 p-4 md:p-10">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight italic">Secure Node Access</h1>
            <p className="text-slate-400 mt-2 font-medium">Verified session: <span className="text-emerald-500 font-bold animate-pulse">Protected</span></p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-2xl p-3 rounded-[24px] border border-white/10 shadow-2xl">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center font-black text-white text-xl">{userData?.firstName?.[0] || 'U'}</div>
            <div className="pr-4">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Node</div>
              <div className="text-sm font-mono text-blue-400 font-bold">#{user.id.slice(0, 8).toUpperCase()}</div>
            </div>
          </div>
        </header>

        {/* BALANCE CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 relative overflow-hidden rounded-[32px] bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/20 p-10 backdrop-blur-3xl shadow-[0_30px_80px_rgba(0,0,0,0.5)] group">
            <div className="relative z-10">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Total Asset Value</span>
              <div className="text-7xl font-black text-white mt-4 mb-10 tracking-tighter transition-transform group-hover:scale-[1.02] duration-500">
                ${balances.usd.toLocaleString(undefined, {minimumFractionDigits: 2})}
              </div>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => setReceiveOpen(true)} className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30 active:scale-95"><ArrowDownLeft size={20} /> Receive</button>
                <button onClick={() => setWithdrawOpen(true)} className="flex items-center gap-3 bg-white/10 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 active:scale-95"><ArrowUpRight size={20} /> Withdraw</button>
                <button onClick={() => {setSwapStep(0); setSwapOpen(true);}} className="flex items-center gap-3 bg-white/5 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5 border-dashed"><RefreshCw size={20} /> Swap</button>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 shadow-2xl">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8">Live Network Stats</h3>
            <div className="space-y-7">
              {Object.entries(market).map(([coin, data]: any) => (
                <div key={coin} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-4">
                    <img src={data.image} className="h-8 w-8 transition-transform group-hover:rotate-12" alt="" />
                    <div><div className="font-black text-white text-sm">{coin} Network</div><div className="text-[9px] font-bold text-slate-600">Active Node</div></div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-white text-sm">${data.price.toLocaleString()}</div>
                    <div className="text-[9px] font-black text-emerald-500 flex items-center justify-end gap-1"><div className="h-1 w-1 bg-emerald-500 rounded-full animate-ping" /> Live</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ASSET LIST */}
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
          <div className="px-10 py-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
            <h3 className="font-black text-white uppercase tracking-widest text-xs italic">Encrypted Asset Ledger</h3>
            <div className="bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 text-[10px] font-black text-blue-400 tracking-widest uppercase">Protocol Integrity: 100%</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead><tr className="text-[10px] uppercase tracking-[0.3em] text-slate-600 border-b border-white/5"><th className="px-10 py-6">Asset</th><th className="px-10 py-6">Node Balance</th><th className="px-10 py-6">USD Value</th><th className="px-10 py-6">Action</th></tr></thead>
                <tbody className="divide-y divide-white/10">
                {(['ETH', 'BTC', 'USDT'] as CoinKey[]).map((id) => (
                    <tr key={id} className="hover:bg-white/[0.03] transition-all group">
                    <td className="px-10 py-8"><div className="flex items-center gap-5"><img src={market[id].image} className="h-10 w-10 relative z-10" alt="" /><div><div className="font-black text-white text-base tracking-tighter uppercase">{id} Core</div><div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">Mainnet V4.2</div></div></div></td>
                    <td className="px-10 py-8 font-black text-white text-lg">{balances[id.toLowerCase() as keyof typeof balances]} <span className="text-slate-600 text-xs font-bold uppercase">{id}</span></td>
                    <td className="px-10 py-8 font-black text-blue-500 text-lg">${(balances[id.toLowerCase() as keyof typeof balances] * market[id].price).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td className="px-10 py-8">
                        <button onClick={() => handleCopy(userData?.[`${id.toLowerCase()}_address`] || '', id)} className="flex items-center gap-3 bg-white/[0.05] px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 border border-white/10 transition-all text-slate-400 hover:text-white">
                        {copied === id ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                        <span className="font-mono opacity-30">{userData?.[`${id.toLowerCase()}_address`]?.slice(0,12) || 'Assigning'}...</span>
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL: RECEIVE */}
      {receiveOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-2xl">
          <div className="bg-gradient-to-br from-white/10 to-white/[0.03] border border-white/20 w-full max-w-md rounded-[40px] p-10 relative shadow-[0_30px_80px_rgba(0,0,0,0.8)]">
            <button onClick={() => setReceiveOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X /></button>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-10">Receive Asset</h2>
            <div className="flex gap-3 mb-10">
              {(['ETH', 'BTC', 'USDT'] as CoinKey[]).map((c) => (
                <button key={c} onClick={() => setReceiveCoin(c)} className={`flex-1 py-4 rounded-2xl border transition-all font-black text-[10px] tracking-widest uppercase ${receiveCoin === c ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-600 hover:bg-white/10'}`}>{c}</button>
              ))}
            </div>
            <div className="bg-black/40 p-10 rounded-[32px] border border-white/5 text-center shadow-inner">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${userData?.[`${receiveCoin.toLowerCase()}_address`] || 'none'}`} className="mx-auto h-48 w-48 rounded-[30px] mb-10 border-[12px] border-white shadow-2xl" alt="QR" />
              <div className="text-[10px] uppercase tracking-[0.3em] text-slate-600 mb-4 font-black">Secure {receiveCoin} Address</div>
              <button onClick={() => handleCopy(userData?.[`${receiveCoin.toLowerCase()}_address`] || '', 'modal-addr')} className="w-full font-mono text-[11px] text-blue-400 break-all bg-blue-600/5 p-5 rounded-2xl border border-blue-500/10 hover:border-blue-500/30 transition-all flex items-center justify-center gap-3">
                {userData?.[`${receiveCoin.toLowerCase()}_address`] || 'Contact Admin'}
                {copied === 'modal-addr' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} className="opacity-20" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: WITHDRAW (SEND) */}
      {withdrawOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-2xl">
          <div className="bg-gradient-to-br from-white/10 to-white/[0.03] border border-white/20 w-full max-w-lg rounded-[40px] p-10 relative shadow-[0_30px_80px_rgba(0,0,0,0.8)]">
            <button onClick={() => setWithdrawOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X /></button>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-8">Send Asset</h2>
            <div className="space-y-6">
                <div className="flex gap-2">
                    {(['ETH', 'BTC', 'USDT'] as CoinKey[]).map(c => (
                        <button key={c} onClick={() => setWithdrawForm({...withdrawForm, coin: c})} className={`flex-1 py-4 rounded-2xl border font-black text-xs ${withdrawForm.coin === c ? 'bg-blue-600 border-blue-500' : 'bg-white/5 border-white/5 opacity-50'}`}>{c}</button>
                    ))}
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Destination Address</label>
                  <input type="text" placeholder="Wallet address node" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all" onChange={(e) => setWithdrawForm({...withdrawForm, address: e.target.value})} />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Amount to send</label>
                  <input type="number" placeholder="0.00" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all" onChange={(e) => setWithdrawForm({...withdrawForm, amount: e.target.value})} />
                </div>
                <button onClick={handleWithdraw} disabled={submitting} className="w-full bg-blue-600 py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all">
                    {submitting ? "Encrypting Node..." : "Initiate Secure Transfer"}
                </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SWAP */}
      {swapOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-2xl">
          <div className="bg-gradient-to-br from-white/14 to-white/[0.03] border border-white/25 w-full max-w-[520px] rounded-[32px] p-10 relative shadow-[0_30px_80px_rgba(0,0,0,0.8)] backdrop-filter saturate-200">
            <button onClick={() => setSwapOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X /></button>
            
            {swapStep === 0 && (
              <>
                <h2 className="text-2xl font-black text-white italic uppercase mb-8">Asset Swap</h2>
                <div className="space-y-6">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-3 block">From Asset</span>
                    <div className="flex gap-2">
                      {(['ETH', 'BTC', 'USDT'] as CoinKey[]).map(c => (
                        <button key={c} onClick={() => setSwapForm({...swapForm, from: c})} className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${swapForm.from === c ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-slate-500'}`}><img src={market[c].image} className="w-4 h-4" />{c}</button>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <input type="number" placeholder="0.00" value={swapForm.amount} className="w-full bg-white/10 border border-white/10 rounded-2xl px-6 py-4 text-xl font-black text-white outline-none focus:border-blue-500" onChange={(e) => setSwapForm({...swapForm, amount: e.target.value})} />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-500">MAX</div>
                  </div>

                  <div className="flex justify-center"><div className="bg-blue-600/10 p-3 rounded-2xl border border-blue-500/20 text-blue-500 hover:rotate-180 transition-all duration-500 cursor-pointer" onClick={() => setSwapForm({from: swapForm.to, to: swapForm.from, amount: swapForm.amount})}><RefreshCw size={24} /></div></div>

                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Receive Asset</span>
                    <div className="flex gap-2">
                      {(['ETH', 'BTC', 'USDT'] as CoinKey[]).map(c => (
                        <button key={c} disabled={swapForm.from === c} onClick={() => setSwapForm({...swapForm, to: c})} className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${swapForm.to === c ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-slate-500 disabled:opacity-20'}`}><img src={market[c].image} className="w-4 h-4" />{c}</button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10 space-y-3">
                    <div className="flex justify-between text-xs font-bold text-slate-500"><span>Rate</span><span className="text-white">1 {swapForm.from} = {swapRate} {swapForm.to}</span></div>
                    <div className="flex justify-between text-base font-black text-white"><span>Estimated Receive</span><span className="text-blue-500">{(Number(swapForm.amount) * Number(swapRate) * 0.998).toFixed(6)} {swapForm.to}</span></div>
                  </div>

                  <button onClick={handleSwap} className="w-full bg-blue-600 py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-600/30 hover:translate-y-[-2px] transition-all">Confirm Swap</button>
                </div>
              </>
            )}

            {swapStep === 1 && (
              <div className="py-20 text-center">
                <RefreshCw size={60} className="animate-spin text-blue-500 mx-auto mb-10" />
                <h3 className="text-2xl font-black text-white italic uppercase mb-4">Processing Node Swap</h3>
                <div className="space-y-4 max-w-[200px] mx-auto text-left">
                  <div className="flex items-center gap-3 text-xs font-bold text-emerald-500"><CheckCircle2 size={16} /> Checking liquidity</div>
                  <div className="flex items-center gap-3 text-xs font-bold text-blue-500 animate-pulse"><RefreshCw size={16} className="animate-spin" /> Executing internal swap</div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-600">Finalizing transaction</div>
                </div>
              </div>
            )}

            {swapStep === 2 && (
              <div className="py-20 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-500 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-3xl font-black text-white italic uppercase mb-2">Swap Successful</h3>
                <p className="text-slate-400 text-sm mb-10 italic font-medium">Assets have been rerouted to your core node.</p>
                <button onClick={() => setSwapOpen(false)} className="bg-white/10 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10">Close Terminal</button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && <div className="fixed bottom-10 right-10 bg-blue-600 text-white px-10 py-5 rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl z-[200] animate-bounce italic border border-white/20">{toast}</div>}
    </div>
  );
};

export default Dashboard;
