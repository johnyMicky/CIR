import React, { useEffect, useMemo, useState } from "react";
import { ref, onValue, push, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, Copy, CheckCircle2, ArrowDownLeft, ArrowUpRight, 
  RefreshCw, X, QrCode, Lock, LayoutDashboard, History, Settings, 
  Activity, Globe, Zap, Terminal, ChevronDown 
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
  
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");
  
  // Modals State
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);

  // Form States
  const [activeCoin, setActiveCoin] = useState<CoinKey>("ETH");
  const [withdrawForm, setWithdrawForm] = useState({ address: "", amount: "" });
  const [withdrawStep, setWithdrawStep] = useState(0); // 0: Input, 1: Timeline, 2: Success
  const [swapForm, setSwapForm] = useState({ to: "BTC" as CoinKey, amount: "" });
  const [swapStep, setSwapStep] = useState(0); // 0: Input, 1: Processing, 2: Success

  useEffect(() => {
    if (!user?.id) return;
    const userRef = ref(db, `users/${user.id}`);
    const unsub = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) setUserData(snapshot.val());
    });
    return () => unsub();
  }, [user?.id]);

  useEffect(() => {
    const updatePrices = async () => {
      try {
        const res = await fetch("https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,USDT&tsyms=USD");
        const data = await res.json();
        setMarket((prev: any) => ({
          ...prev,
          BTC: { ...prev.BTC, price: data.BTC.USD },
          ETH: { ...prev.ETH, price: data.ETH.USD },
          USDT: { ...prev.USDT, price: data.USDT.USD }
        }));
      } catch (e) { console.error("API error"); }
    };
    updatePrices();
    setInterval(updatePrices, 30000);
  }, []);

  const balances = useMemo(() => ({
    eth: Number(userData?.eth_balance || 0),
    btc: Number(userData?.btc_balance || 0),
    usdt: Number(userData?.usdt_balance || 0),
    usd: (Number(userData?.eth_balance || 0) * market.ETH.price) + 
         (Number(userData?.btc_balance || 0) * market.BTC.price) + 
         (Number(userData?.usdt_balance || 0) * market.USDT.price)
  }), [userData, market]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdrawAction = async () => {
    if (!withdrawForm.amount || !withdrawForm.address) return;
    setWithdrawStep(1);
    // შენი მოთხოვნილი Timeline სიმულაცია
    setTimeout(() => {
      const transRef = push(ref(db, "transactions"));
      set(transRef, {
        userId: user.id,
        type: "withdraw",
        coin: activeCoin,
        amount: withdrawForm.amount,
        address: withdrawForm.address,
        status: "pending",
        created_at: Date.now()
      });
      setWithdrawStep(2);
    }, 9000);
  };

  const handleSwapAction = () => {
    if (!swapForm.amount) return;
    setSwapStep(1);
    setTimeout(() => setSwapStep(2), 4000);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-[#f1f5f9] font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* GLOBAL BLOB */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-white/10 bg-white/[0.02] backdrop-filter blur-3xl lg:block z-50">
        <div className="flex h-24 items-center px-8 border-b border-white/5">
          <ShieldCheck className="text-blue-500 mr-3" size={24} />
          <span className="text-sm font-black tracking-widest uppercase italic text-white leading-tight">Axcel Private<br/>Wallet</span>
        </div>
        <nav className="p-6 space-y-3">
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-5 py-3.5 bg-blue-600/20 text-blue-400 rounded-2xl font-bold border border-blue-500/20 transition-all"><LayoutDashboard size={20} /> Dashboard</button>
          <button onClick={() => navigate('/history')} className="w-full flex items-center gap-3 px-5 py-3.5 text-slate-500 hover:text-white transition-all"><History size={20} /> History</button>
          <button className="w-full flex items-center gap-3 px-5 py-3.5 text-slate-500 hover:text-white transition-all"><Settings size={20} /> Settings</button>
        </nav>
        <div className="absolute bottom-8 left-0 w-full px-6">
          <button onClick={logout} className="flex w-full items-center gap-3 px-5 py-3.5 text-rose-500/70 hover:text-rose-500 font-bold transition-all rounded-xl hover:bg-rose-500/5"><Lock size={20} /> Logout</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="relative z-10 lg:ml-64 p-4 md:p-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight italic">Node Terminal</h1>
            <p className="text-slate-400 mt-2 font-medium flex items-center gap-2">
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
                Network Integrity: <span className="text-emerald-500 font-bold">Encrypted</span>
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-2xl p-3 rounded-[24px] border border-white/10 shadow-2xl">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center font-black text-white text-xl">{userData?.firstName?.[0] || 'U'}</div>
            <div className="pr-4">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operator</div>
              <div className="text-sm font-mono text-blue-400 font-bold">#{user.id.slice(0, 8).toUpperCase()}</div>
            </div>
          </div>
        </header>

        {/* PORTFOLIO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 relative overflow-hidden rounded-[32px] bg-gradient-to-br from-white/14 to-white/[0.03] border border-white/25 p-10 backdrop-filter blur-3xl saturate-200 shadow-2xl group">
            <div className="relative z-10">
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Total Portfolio Assets</span>
              <div className="text-6xl md:text-7xl font-black text-white mt-4 mb-10 tracking-tighter transition-transform duration-500 group-hover:scale-[1.01]">
                ${balances.usd.toLocaleString(undefined, {minimumFractionDigits: 2})}
              </div>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => setReceiveOpen(true)} className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl active:scale-95"><ArrowDownLeft size={20} /> Deposit</button>
                <button onClick={() => {setWithdrawStep(0); setWithdrawOpen(true);}} className="flex items-center gap-3 bg-white/10 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 active:scale-95"><ArrowUpRight size={20} /> Withdraw</button>
                <button onClick={() => {setSwapStep(0); setSwapOpen(true);}} className="flex items-center gap-3 bg-white/5 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5 border-dashed"><RefreshCw size={20} /> Swap</button>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 shadow-2xl">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8 italic">Market Nodes</h3>
            <div className="space-y-6">
              {Object.entries(market).map(([coin, data]: any) => (
                <div key={coin} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <img src={data.image} className="h-8 w-8 transition-transform group-hover:scale-110" alt="" />
                    <div><div className="font-black text-white text-sm tracking-tight">{coin} Network</div><div className="text-[9px] font-bold text-slate-600 uppercase">Live Routing</div></div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-white text-sm">${data.price.toLocaleString()}</div>
                    <div className="text-[9px] font-black text-emerald-500 flex items-center justify-end gap-1">Live</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ASSET TABLE */}
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
          <div className="px-10 py-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
            <h3 className="font-black text-white uppercase tracking-widest text-xs italic opacity-80 underline decoration-blue-500 decoration-2 underline-offset-8">Core Asset Ledger</h3>
            <div className="bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 text-[10px] font-black text-blue-400 tracking-widest uppercase">Protocol Integrity: 100%</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead><tr className="text-[10px] uppercase tracking-[0.3em] text-slate-600 border-b border-white/5"><th className="px-10 py-6">Asset Source</th><th className="px-10 py-6">Node Balance</th><th className="px-10 py-6">USD Value</th><th className="px-10 py-6">Secure Route</th></tr></thead>
                <tbody className="divide-y divide-white/10">
                {(['ETH', 'BTC', 'USDT'] as CoinKey[]).map((id) => (
                    <tr key={id} className="hover:bg-white/[0.03] transition-all group">
                    <td className="px-10 py-8"><div className="flex items-center gap-5"><img src={market[id].image} className="h-10 w-10 relative z-10" alt="" /><div><div className="font-black text-white text-base tracking-tighter uppercase">{id} Core</div><div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">Mainnet V4.2</div></div></div></td>
                    <td className="px-10 py-8 font-black text-white text-lg">{balances[id.toLowerCase() as keyof typeof balances]} <span className="text-slate-600 text-xs font-bold uppercase">{id}</span></td>
                    <td className="px-10 py-8 font-black text-blue-500 text-lg italic">${(balances[id.toLowerCase() as keyof typeof balances] * market[id].price).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td className="px-10 py-8">
                        <button onClick={() => handleCopy(userData?.[`${id.toLowerCase()}_address`] || '')} className="flex items-center gap-3 bg-white/[0.05] px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 border border-white/10 transition-all text-slate-400 hover:text-white">
                        {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                        <span className="font-mono opacity-30">{userData?.[`${id.toLowerCase()}_address`]?.slice(0,12)}...</span>
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL: DEPOSIT */}
      {receiveOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/95 backdrop-blur-2xl overflow-y-auto">
          <div className="bg-gradient-to-br from-white/14 to-white/[0.03] border border-white/25 w-full max-w-[520px] rounded-[32px] p-8 md:p-10 relative shadow-[0_30px_80px_rgba(0,0,0,0.8)] backdrop-filter saturate-200">
            <button onClick={() => setReceiveOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-all"><X /></button>
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-10">Deposit Assets</h2>
            <div className="flex gap-2 mb-10">
              {(['ETH', 'BTC', 'USDT'] as CoinKey[]).map(c => (
                <button key={c} onClick={() => setActiveCoin(c)} className={`flex-1 py-4 rounded-2xl border transition-all font-black text-[10px] tracking-widest uppercase ${activeCoin === c ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.45)]' : 'bg-white/5 border-white/10 text-slate-600 hover:bg-white/10'}`}>{c}</button>
              ))}
            </div>
            <div className="bg-black/60 p-10 rounded-[40px] border border-white/5 text-center shadow-inner">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${userData?.[`${activeCoin.toLowerCase()}_address`] || 'none'}`} className="mx-auto h-48 w-48 rounded-[30px] mb-10 border-8 border-white shadow-2xl" alt="QR" />
              <div className="text-[10px] uppercase tracking-[0.3em] text-slate-600 mb-4 font-black">Your {activeCoin} Address</div>
              <button onClick={() => handleCopy(userData?.[`${activeCoin.toLowerCase()}_address`] || '')} className="w-full font-mono text-[11px] text-blue-400 break-all bg-blue-600/5 p-5 rounded-2xl border border-blue-500/10 hover:border-blue-500/30 transition-all flex items-center justify-center gap-3">
                {userData?.[`${activeCoin.toLowerCase()}_address`] || 'Initializing node...'}
                {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} className="opacity-20" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: WITHDRAW */}
      {withdrawOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/95 backdrop-blur-2xl overflow-y-auto">
          {withdrawStep === 0 && (
            <div className="bg-gradient-to-br from-white/14 to-white/[0.03] border border-white/25 w-full max-w-[520px] rounded-[32px] p-8 md:p-10 relative shadow-[0_30px_80px_rgba(0,0,0,0.8)] backdrop-filter saturate-200">
                <button onClick={() => setWithdrawOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-all"><X /></button>
                <h2 className="text-2xl font-black text-white italic uppercase mb-10">Withdraw Assets</h2>
                <div className="flex gap-2 mb-8">
                  {(['ETH', 'BTC', 'USDT'] as CoinKey[]).map(c => (
                    <button key={c} onClick={() => setActiveCoin(c)} className={`flex-1 py-4 rounded-2xl border transition-all font-black text-[10px] tracking-widest uppercase ${activeCoin === c ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.45)]' : 'bg-white/5 border-white/10 text-slate-600 hover:bg-white/10'}`}>{c}</button>
                  ))}
                </div>
                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Destination Address</label>
                        <input type="text" placeholder="Wallet address node" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-blue-500 outline-none" onChange={(e) => setWithdrawForm({...withdrawForm, address: e.target.value})} />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Amount to Send</label>
                        <input type="number" placeholder="0.00" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-blue-500 outline-none" onChange={(e) => setWithdrawForm({...withdrawForm, amount: e.target.value})} />
                    </div>
                    <button onClick={handleWithdrawAction} className="w-full bg-blue-600 py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-600/30 hover:translate-y-[-2px] active:scale-95 transition-all">Initiate Transfer</button>
                </div>
            </div>
          )}

          {withdrawStep === 1 && (
            <div className="bg-[#0b101a] border border-white/10 w-full max-w-md rounded-[40px] p-12 relative shadow-2xl text-center backdrop-blur-3xl animate-in zoom-in">
                <h2 className="text-xl font-black text-white italic uppercase mb-8">Routing Asset Node</h2>
                <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-12">
                   <div className="h-full bg-blue-600 animate-[pulseMove_2.2s_linear_infinite]" />
                </div>
                <div className="space-y-6 text-left">
                   <div className="flex items-center justify-between text-xs font-bold text-blue-400"><span>Submitted</span><CheckCircle2 size={16} /></div>
                   <div className="flex items-center justify-between text-xs font-bold text-slate-600 italic"><span>Verification Layer...</span><RefreshCw size={16} className="animate-spin" /></div>
                </div>
                <style>{`@keyframes pulseMove{0%{left:-100%}100%{left:100%}}`}</style>
            </div>
          )}

          {withdrawStep === 2 && (
             <div className="bg-[#0b101a] border border-white/10 w-full max-w-md rounded-[40px] p-12 relative shadow-2xl text-center backdrop-blur-3xl animate-in zoom-in">
                <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-500"><CheckCircle2 size={40} /></div>
                <h3 className="text-2xl font-black text-white italic uppercase mb-2">Request Processed</h3>
                <p className="text-slate-500 text-sm mb-10 italic">Withdrawal is pending admin finalization.</p>
                <button onClick={() => setWithdrawOpen(false)} className="w-full bg-white/10 py-4 rounded-2xl font-black text-xs uppercase hover:bg-white/20 transition-all border border-white/10">Close Terminal</button>
             </div>
          )}
        </div>
      )}

      {/* MODAL: SWAP */}
      {swapOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/95 backdrop-blur-2xl overflow-y-auto">
          <div className="bg-gradient-to-br from-white/14 to-white/[0.03] border border-white/25 w-full max-w-[520px] rounded-[32px] p-8 md:p-10 relative shadow-[0_30px_80px_rgba(0,0,0,0.8)] backdrop-filter saturate-200">
            <button onClick={() => setSwapOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-all"><X /></button>
            <h2 className="text-2xl font-black text-white italic uppercase mb-10 text-center">Core Asset Swap</h2>
            <div className="space-y-6">
                <div className="bg-black/40 border border-white/10 rounded-3xl p-6">
                    <div className="text-[10px] font-black uppercase text-slate-500 mb-4">From Node</div>
                    <div className="flex justify-between items-center">
                        <select className="bg-transparent font-black text-2xl outline-none text-white appearance-none" value={activeCoin} onChange={(e) => setActiveCoin(e.target.value as CoinKey)}>
                            <option value="ETH">ETH</option><option value="BTC">BTC</option><option value="USDT">USDT</option>
                        </select>
                        <input type="number" placeholder="0.00" className="bg-transparent text-right font-black text-2xl w-1/2 outline-none text-white" onChange={(e) => setSwapForm({...swapForm, amount: e.target.value})} />
                    </div>
                </div>
                <div className="flex justify-center -my-6 relative z-10"><div className="bg-blue-600 p-3 rounded-2xl border border-blue-500/30 text-white shadow-xl shadow-blue-600/30"><RefreshCw size={20} /></div></div>
                <div className="bg-black/40 border border-white/10 rounded-3xl p-6">
                    <div className="text-[10px] font-black uppercase text-slate-500 mb-4">To Node</div>
                    <div className="flex justify-between items-center">
                        <select className="bg-transparent font-black text-2xl outline-none text-white appearance-none" value={swapForm.to} onChange={(e) => setSwapForm({...swapForm, to: e.target.value as CoinKey})}>
                            <option value="BTC">BTC</option><option value="ETH">ETH</option><option value="USDT">USDT</option>
                        </select>
                        <div className="text-2xl font-black text-blue-500">{(Number(swapForm.amount) * (market[activeCoin].price / market[swapForm.to].price)).toFixed(4)}</div>
                    </div>
                </div>
                <button onClick={handleSwapAction} className="w-full bg-blue-600 py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-600/30 hover:translate-y-[-2px] transition-all">Execute Core Swap</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
