import React, { useEffect, useMemo, useState } from "react";
import { ref, onValue, push, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
// ყველა საჭირო ხატულას იმპორტი
import { 
  ShieldCheck, Copy, CheckCircle2, ArrowDownLeft, ArrowUpRight, 
  RefreshCw, X, QrCode, Lock, LayoutDashboard, History, Settings, 
  Activity, Globe, Zap, ShieldAlert, Terminal, Wallet, ChevronDown 
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
  
  // Forms
  const [activeCoin, setActiveCoin] = useState<CoinKey>("ETH");
  const [withdrawForm, setWithdrawForm] = useState({ address: "", amount: "" });
  const [withdrawStep, setWithdrawStep] = useState(0); 
  const [swapForm, setSwapForm] = useState({ toCoin: "BTC" as CoinKey, amount: "" });
  const [swapStep, setSwapStep] = useState(0);

  // 1. Firebase Sync
  useEffect(() => {
    if (!user?.id) return;
    const userRef = ref(db, `users/${user.id}`);
    const unsub = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) setUserData(snapshot.val());
    });
    return () => unsub();
  }, [user?.id]);

  // 2. Market Data Fix (CORS-ის გარეშე)
  useEffect(() => {
    const loadMarket = async () => {
      try {
        // ვიყენებთ ალტერნატიულ API-ს CORS ერორის ასაცილებლად
        const res = await fetch("https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,USDT&tsyms=USD");
        const data = await res.json();
        if (data.BTC) {
          setMarket((prev: any) => ({
            ...prev,
            BTC: { ...prev.BTC, price: data.BTC.USD },
            ETH: { ...prev.ETH, price: data.ETH.USD },
            USDT: { ...prev.USDT, price: data.USDT.USD }
          }));
        }
      } catch (e) { console.error("Market fetch failed", e); }
    };
    loadMarket();
    const t = setInterval(loadMarket, 30000);
    return () => clearInterval(t);
  }, []);

  // 3. Balance Calculation
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

  const handleWithdraw = async () => {
    if (!withdrawForm.amount || !withdrawForm.address) return showToast("Fill all fields");
    setWithdrawStep(1);
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
    }, 5000);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-[#f1f5f9] font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Sidebar Fix (იხ. ფოტო - აქSidebar უნდა ჩანდეს) */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-white/10 bg-white/[0.02] backdrop-filter blur-3xl lg:block z-50 shadow-2xl">
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

      {/* Main Content */}
      <main className="relative z-10 lg:ml-64 p-4 md:p-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight italic">Node Terminal</h1>
            <p className="text-slate-400 mt-2 font-medium flex items-center gap-2 italic">
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

        {/* Portfolio Balance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 relative overflow-hidden rounded-[32px] bg-gradient-to-br from-white/14 to-white/[0.03] border border-white/25 p-10 backdrop-filter blur-3xl saturate-200 shadow-2xl group">
            <div className="relative z-10">
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Total Asset Value</span>
              <div className="text-6xl md:text-7xl font-black text-white mt-4 mb-10 tracking-tighter">
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
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8 italic">Market Intelligence</h3>
            <div className="space-y-6">
              {Object.entries(market).map(([coin, data]: any) => (
                <div key={coin} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={data.image} className="h-8 w-8" alt="" />
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

        {/* Asset Table */}
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
          <div className="px-10 py-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
            <h3 className="font-black text-white uppercase tracking-widest text-xs italic opacity-80 underline decoration-blue-500 decoration-2 underline-offset-8">Core Ledger</h3>
            <div className="bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 text-[10px] font-black text-blue-400 tracking-widest uppercase">Protocol Integrity: 100%</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead><tr className="text-[10px] uppercase tracking-[0.3em] text-slate-600 border-b border-white/5"><th className="px-10 py-6">Asset Source</th><th className="px-10 py-6">Node Balance</th><th className="px-10 py-6">Value</th><th className="px-10 py-6">Route</th></tr></thead>
                <tbody className="divide-y divide-white/10">
                {(['ETH', 'BTC', 'USDT'] as CoinKey[]).map((id) => (
                    <tr key={id} className="hover:bg-white/[0.03] transition-all group">
                    <td className="px-10 py-8"><div className="flex items-center gap-5"><img src={market[id].image} className="h-10 w-10" alt="" /><div><div className="font-black text-white text-base tracking-tighter uppercase">{id} Node</div><div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">V4.2 Secure</div></div></div></td>
                    <td className="px-10 py-8 font-black text-white text-lg italic">{balances[id.toLowerCase() as keyof typeof balances]} {id}</td>
                    <td className="px-10 py-8 font-black text-blue-500 text-lg italic">${(balances[id.toLowerCase() as keyof typeof balances] * market[id].price).toLocaleString()}</td>
                    <td className="px-10 py-8">
                        <button onClick={() => handleCopy(userData?.[`${id.toLowerCase()}_address`] || '')} className="flex items-center gap-3 bg-white/[0.05] px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 border border-white/10 transition-all text-slate-400 hover:text-white">
                        {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                        <span className="font-mono opacity-30 italic">{userData?.[`${id.toLowerCase()}_address`]?.slice(0,12)}...</span>
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal - Deposit */}
      {receiveOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/95 backdrop-blur-2xl">
          <div className="bg-gradient-to-br from-white/14 to-white/[0.03] border border-white/25 w-full max-w-[520px] rounded-[32px] p-10 relative shadow-2xl backdrop-filter saturate-200">
            <button onClick={() => setReceiveOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-all"><X /></button>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-10 underline decoration-blue-500 decoration-4">Deposit Assets</h2>
            <div className="flex gap-2 mb-10">
              {(['ETH', 'BTC', 'USDT'] as CoinKey[]).map(c => (
                <button key={c} onClick={() => setActiveCoin(c)} className={`flex-1 py-4 rounded-2xl border transition-all font-black text-[10px] tracking-widest uppercase ${activeCoin === c ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-600 hover:bg-white/10'}`}>{c}</button>
              ))}
            </div>
            <div className="bg-black/60 p-10 rounded-[40px] border border-white/5 text-center shadow-inner">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${userData?.[`${activeCoin.toLowerCase()}_address`] || 'none'}`} className="mx-auto h-48 w-48 rounded-[30px] mb-10 border-8 border-white shadow-2xl" alt="QR" />
              <div className="text-[10px] uppercase tracking-[0.3em] text-slate-600 mb-4 font-black italic">Secure Node Address</div>
              <button onClick={() => handleCopy(userData?.[`${activeCoin.toLowerCase()}_address`] || '')} className="w-full font-mono text-[11px] text-blue-400 break-all bg-blue-600/5 p-5 rounded-2xl border border-blue-500/10 hover:border-blue-500/30 transition-all flex items-center justify-center gap-3">
                {userData?.[`${activeCoin.toLowerCase()}_address`] || 'Initializing...'}
                {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} className="opacity-20" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && <div className="fixed bottom-10 right-10 bg-blue-600 text-white px-10 py-5 rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl z-[200] animate-bounce italic border border-white/20">{toast}</div>}
    </div>
  );
};

export default Dashboard;
