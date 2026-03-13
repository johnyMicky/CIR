import React, { useEffect, useMemo, useState } from "react";
import { ref, onValue, push, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, Copy, CheckCircle2, ArrowDownLeft, ArrowUpRight, 
  RefreshCw, X, QrCode, Lock, TrendingUp, LayoutDashboard, 
  History, Settings, Activity, Globe, Zap, ShieldAlert, ChevronDown, Terminal
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
  const [activeCoin, setActiveCoin] = useState<CoinKey>("ETH");
  const [withdrawForm, setWithdrawForm] = useState({ address: "", amount: "", network: "Ethereum (ERC-20)" });
  const [withdrawStep, setWithdrawStep] = useState(0); // 0: input, 1: timeline, 2: success
  const [swapForm, setSwapForm] = useState({ toCoin: "BTC" as CoinKey, amount: "" });
  const [swapStep, setSwapStep] = useState(0);

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
  
  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopied("copied");
    setTimeout(() => setCopied(""), 2000);
  };

  const handleWithdrawAction = async () => {
    if (!withdrawForm.amount || !withdrawForm.address) return showToast("Fill all fields");
    if (Number(withdrawForm.amount) > balances[activeCoin.toLowerCase() as keyof typeof balances]) return showToast("Insufficient balance");
    
    setWithdrawStep(1);
    // Timeline Simulation
    setTimeout(() => {
        const transRef = push(ref(db, "transactions"));
        set(transRef, {
            userId: user.id,
            userEmail: user.email,
            type: "withdraw",
            coin: activeCoin,
            amount: withdrawForm.amount,
            address: withdrawForm.address,
            status: "pending",
            created_at: Date.now()
        });
        setWithdrawStep(2);
    }, 8000);
  };

  const swapRate = (market[activeCoin].price / market[swapForm.toCoin].price).toFixed(6);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-[#f1f5f9] font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* GLOBAL BLOB BACKGROUND */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      {/* SIDEBAR - Fixed and Corrected */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-white/10 bg-white/[0.02] backdrop-filter blur-3xl lg:block z-50">
        <div className="flex h-24 items-center px-8 border-b border-white/5">
          <ShieldCheck className="text-blue-500 mr-3" size={24} />
          <span className="text-sm font-black tracking-widest uppercase italic leading-tight text-white">Axcel Private<br/>Wallet</span>
        </div>
        <nav className="p-6 space-y-3">
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-5 py-3.5 bg-blue-600/20 text-blue-400 rounded-2xl font-bold border border-blue-500/20"><LayoutDashboard size={20} /> Dashboard</button>
          <button onClick={() => navigate('/history')} className="w-full flex items-center gap-3 px-5 py-3.5 text-slate-500 hover:text-white transition-all"><History size={20} /> History</button>
          <button className="w-full flex items-center gap-3 px-5 py-3.5 text-slate-500 hover:text-white transition-all"><Settings size={20} /> Settings</button>
        </nav>
        <div className="absolute bottom-8 left-0 w-full px-6">
          <button onClick={logout} className="flex w-full items-center gap-3 px-5 py-3.5 text-rose-500/70 hover:text-rose-500 font-bold transition-all hover:bg-rose-500/5 rounded-xl"><Lock size={20} /> Logout</button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="lg:hidden flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02] backdrop-blur-xl sticky top-0 z-[60]">
         <div className="flex items-center gap-2"><ShieldCheck className="text-blue-500" size={20} /><span className="font-black text-xs uppercase tracking-widest">Axcel Private</span></div>
         <button onClick={() => navigate('/history')} className="text-slate-400"><History size={20} /></button>
      </div>

      {/* MAIN CONTENT */}
      <main className="relative z-10 lg:ml-64 p-4 md:p-10">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight italic">Node Terminal</h1>
            <p className="text-slate-400 mt-2 font-medium flex items-center gap-2">
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
                Session Integrity: <span className="text-emerald-500 font-bold">Verified</span>
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-2xl p-3 rounded-[24px] border border-white/10 shadow-2xl self-start md:self-center">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-600/20">{userData?.firstName?.[0] || 'U'}</div>
            <div className="pr-4">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operator ID</div>
              <div className="text-sm font-mono text-blue-400 font-bold">#{user.id.slice(0, 8).toUpperCase()}</div>
            </div>
          </div>
        </header>

        {/* BALANCE SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 relative overflow-hidden rounded-[40px] bg-gradient-to-br from-white/14 to-white/[0.03] border border-white/25 p-8 md:p-12 backdrop-filter blur-3xl saturate-200 shadow-[0_30px_80px_rgba(0,0,0,0.65)] group">
            <div className="relative z-10">
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Total Portfolio Value</span>
              <div className="text-5xl md:text-7xl font-black text-white mt-4 mb-10 tracking-tighter">
                ${balances.usd.toLocaleString(undefined, {minimumFractionDigits: 2})}
              </div>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => setReceiveOpen(true)} className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30 active:scale-95"><ArrowDownLeft size={20} /> Deposit</button>
                <button onClick={() => {setWithdrawStep(0); setWithdrawOpen(true);}} className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-white/10 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 active:scale-95"><ArrowUpRight size={20} /> Withdraw</button>
                <button onClick={() => {setSwapStep(0); setSwapOpen(true);}} className="w-full md:w-auto flex items-center justify-center gap-3 bg-white/5 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5 border-dashed"><RefreshCw size={20} /> Swap</button>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 shadow-2xl flex flex-col justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8 italic">Node Intelligence</h3>
            <div className="space-y-6">
              {Object.entries(market).map(([coin, data]: any) => (
                <div key={coin} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <img src={data.image} className="h-8 w-8" alt="" />
                    <div><div className="font-black text-white text-sm">{coin} Core</div><div className="text-[9px] font-bold text-slate-600">Secure Route</div></div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-white text-sm">${data.price.toLocaleString()}</div>
                    <div className="text-[9px] font-bold text-emerald-500 flex items-center justify-end gap-1">Live</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-4">
                <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="h-6 w-6 rounded-full border border-[#020617] bg-slate-800" />)}
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Operators</span>
            </div>
          </div>
        </div>

        {/* ASSET LIST */}
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
          <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
            <h3 className="font-black text-white uppercase tracking-widest text-[10px] italic">Asset Inventory</h3>
            <Terminal size={18} className="text-blue-500/50" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead><tr className="text-[10px] uppercase tracking-[0.3em] text-slate-600 border-b border-white/5"><th className="px-8 py-6">Source</th><th className="px-8 py-6">Node Balance</th><th className="px-8 py-6">Value</th><th className="px-8 py-6">Actions</th></tr></thead>
                <tbody className="divide-y divide-white/10">
                {(['ETH', 'BTC', 'USDT'] as CoinKey[]).map((id) => (
                    <tr key={id} className="hover:bg-white/[0.03] transition-all group">
                    <td className="px-8 py-8"><div className="flex items-center gap-4"><img src={market[id].image} className="h-10 w-10" alt="" /><div><div className="font-black text-white text-sm uppercase">{id} Asset</div><div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Protocol V4</div></div></div></td>
                    <td className="px-8 py-8 font-black text-white text-base">{balances[id.toLowerCase() as keyof typeof balances]} <span className="text-slate-600 text-[10px]">{id}</span></td>
                    <td className="px-8 py-8 font-black text-blue-500 text-base">${(balances[id.toLowerCase() as keyof typeof balances] * market[id].price).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td className="px-8 py-8">
                        <button onClick={() => handleCopy(userData?.[`${id.toLowerCase()}_address`] || '')} className="flex items-center gap-2 bg-white/[0.05] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 border border-white/10 transition-all">
                          {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          <span className="font-mono opacity-30">{userData?.[`${id.toLowerCase()}_address`]?.slice(0,10)}...</span>
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL: DEPOSIT (Premium Integrated) */}
      {receiveOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-2xl overflow-y-auto">
          <div className="bg-gradient-to-br from-white/14 to-white/[0.03] border border-white/25 w-full max-w-[520px] rounded-[32px] p-8 md:p-10 relative shadow-[0_30px_80px_rgba(0,0,0,0.8)] backdrop-filter saturate-200">
            <button onClick={() => setReceiveOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-all"><X /></button>
            <div className="mb-8"><h2 className="text-2xl font-black text-white italic uppercase">Deposit Assets</h2></div>
            
            <div className="mb-8">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Select Asset</span>
              <div className="flex gap-2">
                {(['ETH', 'BTC', 'USDT'] as CoinKey[]).map(c => (
                  <button key={c} onClick={() => setActiveCoin(c)} className={`flex-1 py-4 rounded-2xl border flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${activeCoin === c ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.45)]' : 'bg-white/5 border-white/10 text-slate-500'}`}><img src={market[c].image} className="w-5 h-5" />{c}</button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
               <div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Node Address</span>
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-5 font-mono text-xs break-all text-blue-400 border-dashed">{userData?.[`${activeCoin.toLowerCase()}_address`] || 'Initializing node...'}</div>
               </div>
               <div className="flex justify-center bg-white p-4 rounded-3xl border border-white/10 shadow-inner">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${userData?.[`${activeCoin.toLowerCase()}_address`] || 'none'}`} className="h-44 w-44" alt="QR" />
               </div>
               <button onClick={() => handleCopy(userData?.[`${activeCoin.toLowerCase()}_address`] || '')} className="w-full bg-blue-600 py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-600/30 hover:translate-y-[-2px] transition-all">{copied ? "Copied ✓" : "Copy Node Address"}</button>
               <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest font-medium italic">Send only {activeCoin} to this node. Deposits are credited after network sync.</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: WITHDRAW (Premium Integrated with Timeline) */}
      {withdrawOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-2xl overflow-y-auto">
          {withdrawStep === 0 && (
            <div className="bg-gradient-to-br from-white/14 to-white/[0.03] border border-white/25 w-full max-w-[520px] rounded-[32px] p-8 md:p-10 relative shadow-[0_30px_80px_rgba(0,0,0,0.8)] backdrop-filter saturate-200">
                <button onClick={() => setWithdrawOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-all"><X /></button>
                <div className="flex justify-between items-center mb-10"><h2 className="text-2xl font-black text-white italic uppercase">Withdraw Asset</h2><div className="text-[10px] font-black text-slate-500">Node Balance: <span className="text-white">{balances[activeCoin.toLowerCase() as keyof typeof balances]} {activeCoin}</span></div></div>
                
                <div className="mb-8">
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Choose Asset</span>
                  <div className="flex gap-2">
                    {(['ETH', 'BTC', 'USDT'] as CoinKey[]).map(c => (
                      <button key={c} onClick={() => setActiveCoin(c)} className={`flex-1 py-4 rounded-2xl border flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${activeCoin === c ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.45)]' : 'bg-white/5 border-white/10 text-slate-500'}`}><img src={market[c].image} className="w-5 h-5" />{c}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Destination Address</label>
                        <input type="text" placeholder="Enter secure address node" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all" onChange={(e) => setWithdrawForm({...withdrawForm, address: e.target.value})} />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center"><label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Amount to Transfer</label><span className="text-[10px] font-black text-blue-500 cursor-pointer" onClick={() => setWithdrawForm({...withdrawForm, amount: balances[activeCoin.toLowerCase() as keyof typeof balances].toString()})}>MAX</span></div>
                        <input type="number" placeholder="0.00" value={withdrawForm.amount} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all" onChange={(e) => setWithdrawForm({...withdrawForm, amount: e.target.value})} />
                    </div>
                    <div className="pt-6 border-t border-white/10 space-y-3">
                        <div className="flex justify-between text-xs font-bold text-slate-500"><span>Network Fee</span><span className="text-white">Applied (v4)</span></div>
                        <div className="flex justify-between text-base font-black text-white"><span>Total to Receive</span><span className="text-blue-500">{withdrawForm.amount || '0.00'} {activeCoin}</span></div>
                    </div>
                    <button onClick={handleWithdrawAction} className="w-full bg-blue-600 py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-600/30 hover:translate-y-[-2px] active:scale-95 transition-all">Initiate Withdrawal</button>
                </div>
            </div>
          )}

          {withdrawStep === 1 && (
            <div className="bg-gradient-to-br from-white/14 to-white/[0.03] border border-white/25 w-full max-w-[420px] rounded-[32px] p-10 relative shadow-2xl backdrop-blur-3xl text-center">
                <h2 className="text-xl font-black text-white italic uppercase mb-8">Routing Asset Node</h2>
                {/* Visual Timeline */}
                <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-12">
                   <div className="h-full bg-blue-600 animate-[pulseMove_2.2s_linear_infinite]" />
                </div>
                <div className="space-y-6 text-left">
                   <div className="flex items-center justify-between text-xs font-bold text-blue-400"><div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" /> Request Submitted</div><span>ACTIVE</span></div>
                   <div className="flex items-center justify-between text-xs font-bold text-slate-600"><div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-slate-700" /> Security Verification</div><span>WAITING</span></div>
                   <div className="flex items-center justify-between text-xs font-bold text-slate-600"><div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-slate-700" /> Node Processing</div><span>WAITING</span></div>
                </div>
                <p className="mt-12 text-[10px] text-slate-500 font-bold uppercase tracking-widest italic animate-pulse">Encrypting Blockchain Route...</p>
            </div>
          )}

          {withdrawStep === 2 && (
             <div className="bg-gradient-to-br from-white/14 to-white/[0.03] border border-white/25 w-full max-w-[420px] rounded-[32px] p-12 relative shadow-2xl backdrop-blur-3xl text-center animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-blue-600/20 border-2 border-blue-500 rounded-full flex items-center justify-center mx-auto mb-8 text-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.4)] animate-bounce">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-black text-white italic uppercase mb-2">Request Verified</h3>
                <p className="text-slate-400 text-sm mb-10 italic font-medium">Withdrawal has passed security protocols and is pending admin release.</p>
                <button onClick={() => setWithdrawOpen(false)} className="w-full bg-white/10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10">Return to Terminal</button>
             </div>
          )}
        </div>
      )}

      {/* MODAL: SWAP (Premium Integrated) */}
      {swapOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-2xl overflow-y-auto">
          <div className="bg-gradient-to-br from-white/14 to-white/[0.03] border border-white/25 w-full max-w-[520px] rounded-[32px] p-8 md:p-10 relative shadow-[0_30px_80px_rgba(0,0,0,0.8)] backdrop-filter saturate-200">
            <button onClick={() => setSwapOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-all"><X /></button>
            <div className="mb-10 text-center"><h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Exchange Assets</h2></div>
            
            <div className="space-y-6">
               <div className="bg-black/40 border border-white/10 rounded-3xl p-6">
                  <div className="flex justify-between items-center mb-4"><span className="text-[10px] font-black uppercase text-slate-500">Sell Asset</span><span className="text-[10px] font-black text-blue-500">Bal: {balances[activeCoin.toLowerCase() as keyof typeof balances]}</span></div>
                  <div className="flex justify-between">
                     <select className="bg-transparent font-black text-2xl outline-none text-white appearance-none" value={activeCoin} onChange={(e) => setActiveCoin(e.target.value as CoinKey)}>
                        <option value="ETH">ETH</option><option value="BTC">BTC</option><option value="USDT">USDT</option>
                     </select>
                     <input type="number" placeholder="0.00" className="bg-transparent text-right font-black text-2xl w-1/2 outline-none text-white" value={swapForm.amount} onChange={(e) => setSwapForm({...swapForm, amount: e.target.value})} />
                  </div>
               </div>

               <div className="flex justify-center -my-6 relative z-10"><div className="bg-blue-600 p-3 rounded-2xl border border-blue-500/30 text-white shadow-xl shadow-blue-600/30 hover:rotate-180 transition-all duration-500 cursor-pointer" onClick={() => {const old=activeCoin; setActiveCoin(swapForm.toCoin); setSwapForm({...swapForm, toCoin: old})}}><RefreshCw size={20} /></div></div>

               <div className="bg-black/40 border border-white/10 rounded-3xl p-6">
                  <div className="flex justify-between items-center mb-4"><span className="text-[10px] font-black uppercase text-slate-500">Buy Asset</span></div>
                  <div className="flex justify-between">
                     <select className="bg-transparent font-black text-2xl outline-none text-white appearance-none" value={swapForm.toCoin} onChange={(e) => setSwapForm({...swapForm, toCoin: e.target.value as CoinKey})}>
                        <option value="BTC">BTC</option><option value="ETH">ETH</option><option value="USDT">USDT</option>
                     </select>
                     <div className="font-black text-2xl text-blue-500">{(Number(swapForm.amount) * Number(swapRate)).toFixed(4)}</div>
                  </div>
               </div>

               <div className="p-5 border-t border-white/10 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-500"><span>Protocol Rate</span><span className="text-white">1 {activeCoin} = {swapRate} {swapForm.toCoin}</span></div>
                  <div className="flex justify-between text-xs font-bold text-slate-500"><span>System Fee</span><span className="text-white">0.2%</span></div>
               </div>

               <button className="w-full bg-blue-600 py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-600/30 hover:translate-y-[-2px] transition-all">Execute Core Swap</button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL TOAST */}
      {toast && <div className="fixed bottom-10 right-10 bg-blue-600 text-white px-10 py-5 rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl z-[200] animate-bounce italic border border-white/20">{toast}</div>}
    </div>
  );
};

export default Dashboard;
