import React, { useEffect, useMemo, useState } from "react";
import { ref, onValue, push, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, Bitcoin, Coins, Wallet, Copy, 
  CheckCircle2, ArrowDownLeft, ArrowUpRight, RefreshCw, X, 
  QrCode, Lock, TrendingUp, LayoutDashboard, History, Settings,
  Activity, Globe, Zap, ShieldAlert, ChevronDown
} from "lucide-react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

type CoinKey = "BTC" | "ETH" | "USDT";

const Dashboard = () => {
  const { user, logout } = useAuth() as any;
  const navigate = useNavigate();

  const [userData, setUserData] = useState<any>(null);
  const [market, setMarket] = useState<any>({
    BTC: { price: 0, image: "https://cryptologos.cc/logos/bitcoin-btc-logo.png" },
    ETH: { price: 0, image: "https://cryptologos.cc/logos/ethereum-eth-logo.png" },
    USDT: { price: 0, image: "https://cryptologos.cc/logos/tether-usdt-logo.png" }
  });
  
  const [copied, setCopied] = useState("");
  const [toast, setToast] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // მოდალების კონტროლი
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);
  const [receiveCoin, setReceiveCoin] = useState<CoinKey>("BTC");

  // ფორმების State-ები
  const [withdrawForm, setWithdrawForm] = useState({ coin: "BTC" as CoinKey, amount: "", address: "", network: "Mainnet" });
  const [swapForm, setSwapForm] = useState({ fromCoin: "BTC" as CoinKey, toCoin: "USDT" as CoinKey, fromAmount: "" });

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
            if (item.id === "bitcoin") next.BTC = { price: item.current_price, image: item.image };
            if (item.id === "ethereum") next.ETH = { price: item.current_price, image: item.image };
            if (item.id === "tether") next.USDT = { price: item.current_price, image: item.image };
          });
          setMarket(next);
        }
      } catch (e) { console.error("Market fetch failed", e); }
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

  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(""), 3000);
  };

  const handleCopy = (val: string, key: string) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  // --- WITHDRAW LOGIC (ადმინისთვის შეტყობინების გაგზავნა) ---
  const submitWithdraw = async () => {
    if (!withdrawForm.amount || !withdrawForm.address) return showToast("Fill all fields");
    if (Number(withdrawForm.amount) > balances[withdrawForm.coin.toLowerCase() as keyof typeof balances]) return showToast("Insufficient funds");

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
        status: "pending", // ადმინი აქედან დაინახავს
        created_at: Date.now()
      });
      setWithdrawOpen(false);
      showToast("Withdrawal Pending - Waiting for Admin");
    } catch (e) { showToast("Error submitting request"); } finally { setSubmitting(false); }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#06080c] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-white/5 bg-[#080b11]/80 backdrop-blur-xl lg:block z-50">
        <div className="flex h-24 items-center px-8 border-b border-white/5">
          <div className="bg-blue-600/20 p-2 rounded-xl border border-blue-500/20 mr-3">
             <ShieldCheck className="text-blue-500" size={22} />
          </div>
          <span className="text-xs font-black tracking-widest text-white uppercase italic leading-tight">Axcel Private<br/>Wallet</span>
        </div>
        <nav className="p-6 space-y-3">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-xl font-bold border border-blue-500/10">
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button onClick={() => navigate('/history')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-white transition-all">
            <History size={18} /> History
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-white transition-all">
            <Settings size={18} /> Settings
          </button>
        </nav>
        <div className="absolute bottom-8 left-0 w-full px-6">
          <button onClick={logout} className="flex w-full items-center gap-3 px-4 py-3 text-rose-500/70 hover:text-rose-500 font-bold transition-all border border-rose-500/5 rounded-xl hover:bg-rose-500/5">
            <Lock size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="lg:ml-64 p-4 md:p-8">
        {/* STATS BAR */}
        <div className="flex flex-wrap items-center gap-6 mb-8 bg-white/[0.02] border border-white/5 p-4 rounded-2xl backdrop-blur-md">
            <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Network: <span className="text-emerald-500">Secure</span></span>
            </div>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2">
                <Globe size={14} className="text-blue-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Node: <span className="text-white">Encrypted</span></span>
            </div>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2">
                <Zap size={14} className="text-amber-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Latency: <span className="text-white">12ms</span></span>
            </div>
        </div>

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3 italic">Hi, {userData?.firstName || 'User'}</h1>
            <p className="text-slate-500 mt-1 font-medium italic opacity-70">Axcel secure node environment is active.</p>
          </div>
          <div className="flex items-center gap-3 bg-[#0b0e14]/60 backdrop-blur-xl p-2 rounded-2xl border border-white/5 shadow-2xl">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-600/20">
              {userData?.firstName?.[0] || 'U'}
            </div>
            <div className="pr-4">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Verified Client</div>
              <div className="text-sm font-mono text-blue-400 font-bold">#{user.id.slice(0, 8).toUpperCase()}</div>
            </div>
          </div>
        </header>

        {/* PORTFOLIO CARD WITH GLASSMORPHISM */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[#0e1421] to-[#070b14] border border-white/10 p-10 group shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 blur-[120px] -z-10 group-hover:bg-blue-600/20 transition-all duration-1000" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                  <Activity size={16} className="text-blue-500" />
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Node Portfolio Assets</span>
              </div>
              <div className="flex items-baseline gap-4 mb-10">
                <div className="text-7xl font-black text-white tracking-tighter drop-shadow-2xl">${balances.usd.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                <div className="text-emerald-500 font-black text-sm bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 animate-pulse">+4.2%</div>
              </div>

              {/* ANIMATED CHART BARS */}
              <div className="mb-12 flex gap-1.5 h-16 items-end opacity-50">
                {[40, 70, 45, 90, 65, 80, 100, 75, 85, 60, 95, 110, 80, 90, 70].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-blue-600/20 to-blue-500/40 rounded-t-md hover:from-blue-500 hover:to-cyan-400 transition-all cursor-pointer duration-500" style={{ height: `${h}%` }} />
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <button onClick={() => setReceiveOpen(true)} className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30 hover:-translate-y-1 active:scale-95">
                  <ArrowDownLeft size={18} /> Receive
                </button>
                <button onClick={() => setWithdrawOpen(true)} className="flex items-center gap-3 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all hover:-translate-y-1 active:scale-95">
                  <ArrowUpRight size={18} /> Withdraw
                </button>
                <button onClick={() => setSwapOpen(true)} className="flex items-center gap-3 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all border-dashed">
                  <RefreshCw size={18} /> Swap
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#0b0e14]/80 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 shadow-2xl">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8 italic">Market Intelligence</h3>
            <div className="space-y-7">
              {Object.entries(market).map(([coin, data]: any) => (
                <div key={coin} className="flex items-center justify-between group cursor-pointer hover:translate-x-1 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-blue-500/40 transition-all relative">
                        <div className="absolute inset-0 bg-blue-500/10 blur-lg opacity-0 group-hover:opacity-100 transition-all" />
                        <img src={data.image} className="h-6 w-6 relative z-10" alt="" />
                    </div>
                    <div>
                      <div className="font-black text-white text-sm tracking-tight">{coin} Asset</div>
                      <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Protocol V4.2</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-white text-sm tracking-tight">${data.price.toLocaleString()}</div>
                    <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center justify-end gap-1">
                        <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" /> Live
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ASSETS TABLE */}
        <div className="bg-[#0b0e14]/40 backdrop-blur-3xl border border-white/5 rounded-[40px] overflow-hidden shadow-2xl relative">
          <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <h3 className="font-black text-white uppercase tracking-widest text-xs italic opacity-80 underline decoration-blue-500 decoration-2 underline-offset-8">Encrypted Asset Nodes</h3>
            <div className="flex items-center gap-2 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20">
                <ShieldCheck size={14} className="text-blue-500" />
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Protocol Integrity: 100%</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                <tr className="text-[10px] uppercase tracking-[0.3em] text-slate-600 border-b border-white/5">
                    <th className="px-10 py-6">Asset Source</th>
                    <th className="px-10 py-6">Node Balance</th>
                    <th className="px-10 py-6">USD Value</th>
                    <th className="px-10 py-6">Routing</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                {(['BTC', 'ETH', 'USDT'] as CoinKey[]).map((id) => (
                    <tr key={id} className="hover:bg-white/[0.03] transition-all group">
                    <td className="px-10 py-9">
                        <div className="flex items-center gap-5">
                            <div className="relative">
                                <div className={`absolute inset-0 blur-xl opacity-0 group-hover:opacity-30 transition-all rounded-full ${id==='BTC'?'bg-orange-500':id==='ETH'?'bg-blue-400':'bg-emerald-400'}`} />
                                <img src={market[id].image} className="h-10 w-10 relative z-10" alt="" />
                            </div>
                            <div>
                                <div className="font-black text-white text-base tracking-tighter uppercase italic">{id} Node</div>
                                <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Distributed Ledger</div>
                            </div>
                        </div>
                    </td>
                    <td className="px-10 py-9 font-black text-white text-lg tracking-tight">
                        {balances[id.toLowerCase() as keyof typeof balances]} <span className="text-slate-500 text-sm font-bold">{id}</span>
                    </td>
                    <td className="px-10 py-9 font-black text-blue-500 text-lg tracking-tight italic">
                        ${(balances[id.toLowerCase() as keyof typeof balances] * market[id].price).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                    <td className="px-10 py-9">
                        <button 
                        onClick={() => handleCopy(userData?.[`${id.toLowerCase()}_address`] || '', id)} 
                        className="flex items-center gap-3 bg-white/[0.03] px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 border border-white/5 transition-all text-slate-400 hover:text-white"
                        >
                        {copied === id ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                        <span className="font-mono opacity-30">
                            {userData?.[`${id.toLowerCase()}_address`]?.slice(0,12) || 'Assigning'}...
                        </span>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
          <div className="bg-[#0b101a] border border-white/10 w-full max-w-md rounded-[50px] p-10 relative shadow-2xl">
            <button onClick={() => setReceiveOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-all"><X /></button>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-10">Inbound Node</h2>
            <div className="flex gap-3 mb-10">
              {(['BTC', 'ETH', 'USDT'] as CoinKey[]).map((c) => (
                <button key={c} onClick={() => setReceiveCoin(c)} className={`flex-1 py-4 rounded-2xl border transition-all font-black text-[10px] tracking-widest ${receiveCoin === c ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-600 hover:bg-white/10'}`}>{c}</button>
              ))}
            </div>
            <div className="bg-black/60 p-10 rounded-[40px] border border-white/5 text-center shadow-inner">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${userData?.[`${receiveCoin.toLowerCase()}_address`] || 'none'}`} className="mx-auto h-48 w-48 rounded-[30px] mb-10 border-8 border-white shadow-2xl" alt="QR" />
              <div className="text-[10px] uppercase tracking-[0.3em] text-slate-600 mb-4 font-black">Your {receiveCoin} Address</div>
              <button onClick={() => handleCopy(userData?.[`${receiveCoin.toLowerCase()}_address`] || '', 'modal-addr')} className="w-full font-mono text-[11px] text-blue-400 break-all bg-blue-600/5 p-5 rounded-2xl border border-blue-500/10 hover:border-blue-500/30 transition-all flex items-center justify-center gap-3">
                {userData?.[`${receiveCoin.toLowerCase()}_address`] || 'Initializing...'}
                {copied === 'modal-addr' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} className="opacity-20" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: WITHDRAW (ადმინის ფუნქციონალით) */}
      {withdrawOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
          <div className="bg-[#0b101a] border border-white/10 w-full max-w-lg rounded-[50px] p-10 relative">
            <button onClick={() => setWithdrawOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X /></button>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-8 underline decoration-blue-500 decoration-4">Withdraw Assets</h2>
            <div className="space-y-6">
                <div className="flex gap-2">
                    {(['BTC', 'ETH', 'USDT'] as CoinKey[]).map(c => (
                        <button key={c} onClick={() => setWithdrawForm({...withdrawForm, coin: c})} className={`flex-1 py-4 rounded-2xl border font-black text-xs ${withdrawForm.coin === c ? 'bg-blue-600 border-blue-500' : 'bg-white/5 border-white/5 opacity-50'}`}>{c}</button>
                    ))}
                </div>
                <input type="text" placeholder="Destination Address" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold placeholder:opacity-30 outline-none focus:border-blue-500 transition-all" onChange={(e) => setWithdrawForm({...withdrawForm, address: e.target.value})} />
                <input type="number" placeholder="Amount" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-blue-500" onChange={(e) => setWithdrawForm({...withdrawForm, amount: e.target.value})} />
                <button onClick={submitWithdraw} disabled={submitting} className="w-full bg-blue-600 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-600/20 hover:scale-[1.02] transition-all active:scale-95">
                    {submitting ? "Processing Node..." : "Initiate Withdrawal"}
                </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SWAP */}
      {swapOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
          <div className="bg-[#0b101a] border border-white/10 w-full max-w-md rounded-[50px] p-10 relative">
            <button onClick={() => setSwapOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X /></button>
            <h2 className="text-3xl font-black text-white italic uppercase mb-8">Asset Swap</h2>
            <div className="space-y-6">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                    <div className="text-[10px] font-black uppercase text-slate-500 mb-4">From Node</div>
                    <div className="flex justify-between items-center">
                        <select className="bg-transparent font-black text-2xl outline-none" value={swapForm.fromCoin} onChange={(e) => setSwapForm({...swapForm, fromCoin: e.target.value as CoinKey})}>
                            <option value="BTC">BTC</option><option value="ETH">ETH</option><option value="USDT">USDT</option>
                        </select>
                        <input type="number" placeholder="0.00" className="bg-transparent text-right font-black text-2xl w-1/2 outline-none" onChange={(e) => setSwapForm({...swapForm, fromAmount: e.target.value})} />
                    </div>
                </div>
                <div className="flex justify-center -my-6 relative z-10"><div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-600/30"><RefreshCw size={20} /></div></div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                    <div className="text-[10px] font-black uppercase text-slate-500 mb-4">To Node (Estimated)</div>
                    <div className="flex justify-between items-center">
                        <select className="bg-transparent font-black text-2xl outline-none" value={swapForm.toCoin} onChange={(e) => setSwapForm({...swapForm, toCoin: e.target.value as CoinKey})}>
                            <option value="USDT">USDT</option><option value="BTC">BTC</option><option value="ETH">ETH</option>
                        </select>
                        <div className="text-2xl font-black opacity-40">0.00</div>
                    </div>
                </div>
                <button className="w-full bg-white text-blue-900 py-5 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-blue-50">Exchange Assets</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && <div className="fixed bottom-10 right-10 bg-blue-600 text-white px-10 py-5 rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl z-[200] animate-bounce italic">{toast}</div>}
    </div>
  );
};

export default Dashboard;
