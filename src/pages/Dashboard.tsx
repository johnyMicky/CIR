import React, { useEffect, useMemo, useState } from "react";
import { ref, onValue, push, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, Copy, CheckCircle2, ArrowDownLeft, ArrowUpRight, 
  RefreshCw, X, QrCode, Lock, TrendingUp, LayoutDashboard, 
  History, Settings, Activity, Globe, Zap, ShieldAlert, ChevronDown, Terminal
} from "lucide-react"; // ყველა ხატულა ადგილზეა
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

type CoinKey = "BTC" | "ETH" | "USDT";

const Dashboard = () => {
  const { user, logout } = useAuth() as any;
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [market, setMarket] = useState<any>({
    BTC: { price: 72391, image: "https://cryptologos.cc/logos/bitcoin-btc-logo.png" },
    ETH: { price: 2130.31, image: "https://cryptologos.cc/logos/ethereum-eth-logo.png" },
    USDT: { price: 1.0, image: "https://cryptologos.cc/logos/tether-usdt-logo.png" }
  });
  const [copied, setCopied] = useState("");
  const [toast, setToast] = useState("");
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);
  const [activeCoin, setActiveCoin] = useState<CoinKey>("ETH");
  const [withdrawForm, setWithdrawForm] = useState({ address: "", amount: "" });
  const [withdrawStep, setWithdrawStep] = useState(0);

  // Firebase მონაცემების წამოღება
  useEffect(() => {
    if (!user?.id) return;
    const userRef = ref(db, `users/${user.id}`);
    const unsub = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) setUserData(snapshot.val());
    });
    return () => unsub();
  }, [user?.id]);

  // CORS-ის ასარიდებლად ფასების განახლება (მარტივი ვერსია)
  useEffect(() => {
    const updatePrices = async () => {
      try {
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
      } catch (e) { console.error("Price fetch failed, using fallback"); }
    };
    updatePrices();
    const t = setInterval(updatePrices, 30000);
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

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopied("copied");
    setTimeout(() => setCopied(""), 2000);
  };

  const handleWithdraw = async () => {
    if (!withdrawForm.amount || !withdrawForm.address) return;
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
      {/* BACKGROUND BLOBS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-white/10 bg-white/[0.02] backdrop-filter blur-3xl lg:block z-50">
        <div className="flex h-24 items-center px-8 border-b border-white/5">
          <ShieldCheck className="text-blue-500 mr-3" size={24} />
          <span className="text-sm font-black tracking-widest uppercase italic text-white">Axcel Private<br/>Wallet</span>
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

      {/* MAIN CONTENT */}
      <main className="relative z-10 lg:ml-64 p-4 md:p-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight italic">Node Terminal</h1>
            <p className="text-slate-400 mt-2 font-medium flex items-center gap-2">
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
                Session Integrity: <span className="text-emerald-500 font-bold">Verified</span>
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-2xl p-3 rounded-[24px] border border-white/10">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center font-black text-white text-xl">{userData?.firstName?.[0] || 'U'}</div>
            <div className="pr-4">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operator ID</div>
              <div className="text-sm font-mono text-blue-400 font-bold">#{user.id.slice(0, 8).toUpperCase()}</div>
            </div>
          </div>
        </header>

        {/* BALANCE CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 relative overflow-hidden rounded-[40px] bg-gradient-to-br from-white/14 to-white/[0.03] border border-white/25 p-12 backdrop-filter blur-3xl saturate-200 shadow-2xl group">
            <div className="relative z-10">
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Total Portfolio Value</span>
              <div className="text-7xl font-black text-white mt-4 mb-10 tracking-tighter">
                ${balances.usd.toLocaleString(undefined, {minimumFractionDigits: 2})}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setReceiveOpen(true)} className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl active:scale-95"><ArrowDownLeft size={20} /> Deposit</button>
                <button onClick={() => setWithdrawOpen(true)} className="flex items-center gap-3 bg-white/10 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 active:scale-95"><ArrowUpRight size={20} /> Withdraw</button>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 shadow-2xl">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8 italic text-white">Node Intelligence</h3>
            <div className="space-y-6">
              {Object.entries(market).map(([coin, data]: any) => (
                <div key={coin} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={data.image} className="h-8 w-8" alt="" />
                    <div><div className="font-black text-white text-sm">{coin} Core</div><div className="text-[9px] font-bold text-slate-600">Secure Route</div></div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-white text-sm">${data.price.toLocaleString()}</div>
                    <div className="text-[9px] font-bold text-emerald-500">Live</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL: DEPOSIT */}
      {receiveOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-2xl">
          <div className="bg-gradient-to-br from-white/14 to-white/[0.03] border border-white/25 w-full max-w-[520px] rounded-[32px] p-10 relative">
            <button onClick={() => setReceiveOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X /></button>
            <h2 className="text-2xl font-black text-white italic uppercase mb-8">Deposit Assets</h2>
            <div className="flex gap-2 mb-8">
                {(['ETH', 'BTC', 'USDT'] as CoinKey[]).map(c => (
                  <button key={c} onClick={() => setActiveCoin(c)} className={`flex-1 py-4 rounded-2xl border font-black text-[10px] uppercase transition-all ${activeCoin === c ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-500'}`}>{c}</button>
                ))}
            </div>
            <div className="bg-black/40 p-10 rounded-[32px] border border-white/5 text-center shadow-inner">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${userData?.[`${activeCoin.toLowerCase()}_address`] || 'none'}`} className="mx-auto h-44 w-44 rounded-3xl mb-8 border-8 border-white" alt="QR" />
              <div className="text-[10px] uppercase tracking-[0.3em] text-slate-600 mb-4 font-black text-white">Your {activeCoin} Address</div>
              <div className="bg-blue-600/5 p-4 rounded-xl border border-blue-500/10 text-blue-400 font-mono text-xs break-all">{userData?.[`${activeCoin.toLowerCase()}_address`] || 'Contact Admin'}</div>
            </div>
            <button onClick={() => handleCopy(userData?.[`${activeCoin.toLowerCase()}_address`] || '')} className="w-full bg-blue-600 py-5 mt-6 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl">{copied ? "Copied ✓" : "Copy Address"}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
