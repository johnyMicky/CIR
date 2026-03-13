import React, { useEffect, useMemo, useState } from "react";
import { ref, onValue } from "firebase/database";
import { Link, useNavigate } from "react-router-dom";
import { 
  ShieldCheck, Bitcoin, Coins, Wallet, Landmark, Copy, 
  CheckCircle2, ArrowDownLeft, ArrowUpRight, RefreshCw, X, 
  QrCode, Lock, TrendingUp, LayoutDashboard, History, Settings,
  Activity, Globe, Zap, ShieldAlert
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
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [receiveCoin, setReceiveCoin] = useState<CoinKey>("BTC");

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

  const handleCopy = (val: string, key: string) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#06080c] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-white/5 bg-[#080b11] lg:block z-50">
        <div className="flex h-24 items-center px-8 border-b border-white/5">
          <div className="bg-blue-600/20 p-2 rounded-xl border border-blue-500/20 mr-3">
             <ShieldCheck className="text-blue-500" size={22} />
          </div>
          <span className="text-xs font-black tracking-widest text-white uppercase italic leading-tight">Axcel Private<br/>Wallet</span>
        </div>
        <nav className="p-6 space-y-3">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-xl font-bold transition-all border border-blue-500/10">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
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
        
        {/* TOP LIVE STATS BAR - ახალი სექცია */}
        <div className="flex flex-wrap items-center gap-6 mb-8 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
            <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Network: <span className="text-emerald-500">Secure</span></span>
            </div>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2">
                <Globe size={14} className="text-blue-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Node Location: <span className="text-white">Encrypted</span></span>
            </div>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2">
                <Zap size={14} className="text-amber-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Latency: <span className="text-white">12ms</span></span>
            </div>
        </div>

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                Hi, {userData?.firstName || 'User'}
                <ShieldAlert size={20} className="text-blue-500 opacity-50" />
            </h1>
            <p className="text-slate-500 mt-1 font-medium italic">Axcel secure node environment is active.</p>
          </div>
          <div className="flex items-center gap-3 bg-[#0b0e14] p-2 rounded-2xl border border-white/5 shadow-xl">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center font-black text-white text-xl">
              {userData?.firstName?.[0] || 'U'}
            </div>
            <div className="pr-4">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Verified Client</div>
              <div className="text-sm font-mono text-blue-400 font-bold">#{user.id.slice(0, 8).toUpperCase()}</div>
            </div>
          </div>
        </header>

        {/* PORTFOLIO CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 relative overflow-hidden rounded-[40px] bg-[#0b0e14] border border-white/5 p-10 group shadow-2xl">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -z-10 group-hover:bg-blue-600/20 transition-all duration-700" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                  <Activity size={16} className="text-blue-500" />
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Total Portfolio Assets</span>
              </div>
              <div className="flex items-baseline gap-4">
                <div className="text-7xl font-black text-white tracking-tighter">${balances.usd.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                <div className="text-emerald-500 font-black text-sm bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">+4.2%</div>
              </div>

              {/* პატარა ვიზუალური გრაფიკი */}
              <div className="mt-8 mb-10 flex gap-1 h-12 items-end">
                {[40, 70, 45, 90, 65, 80, 100, 75, 85, 60, 95, 110, 80].map((h, i) => (
                    <div key={i} className="flex-1 bg-blue-600/20 rounded-t-sm hover:bg-blue-500 transition-all cursor-pointer" style={{ height: `${h}%` }} />
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <button onClick={() => setReceiveOpen(true)} className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
                  <ArrowDownLeft size={18} /> Receive
                </button>
                <button className="flex items-center gap-3 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                  <ArrowUpRight size={18} /> Withdraw
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#0b0e14] border border-white/5 rounded-[40px] p-8 flex flex-col justify-between">
            <div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Node Market Data</h3>
                <div className="space-y-6">
                {Object.entries(market).map(([coin, data]: any) => (
                    <div key={coin} className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 group-hover:border-blue-500/30 transition-all">
                            <img src={data.image} className="h-6 w-6" alt="" />
                        </div>
                        <div>
                        <div className="font-black text-white text-sm">{coin}</div>
                        <div className="text-[10px] font-bold text-slate-600">Secure Pair</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-black text-white text-sm">${data.price.toLocaleString()}</div>
                        <div className="text-[10px] font-bold text-emerald-500">Live</div>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            <button className="w-full mt-8 py-4 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 transition-all">View All Markets</button>
          </div>
        </div>

        {/* ASSETS TABLE */}
        <div className="bg-[#0b0e14] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
          <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-black text-white uppercase tracking-widest text-sm italic">Encrypted Asset Nodes</h3>
            <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-full">
                <ShieldCheck size={14} className="text-blue-500" />
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Protocol V2.4 Active</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                <tr className="text-[10px] uppercase tracking-[0.3em] text-slate-600 border-b border-white/5">
                    <th className="px-10 py-6">Asset Source</th>
                    <th className="px-10 py-6">Node Balance</th>
                    <th className="px-10 py-6">USD Value</th>
                    <th className="px-10 py-6">Secure Route</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                {(['BTC', 'ETH', 'USDT'] as CoinKey[]).map((id) => (
                    <tr key={id} className="hover:bg-white/[0.02] transition-all group">
                    <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                        <img src={market[id].image} className="h-10 w-10 grayscale group-hover:grayscale-0 transition-all" alt="" />
                        <div>
                            <div className="font-black text-white text-base">{id} Asset</div>
                            <div className="text-xs text-slate-600 font-medium">Distributed Node</div>
                        </div>
                        </div>
                    </td>
                    <td className="px-10 py-8 font-black text-white text-lg">
                        {balances[id.toLowerCase() as keyof typeof balances]} {id}
                    </td>
                    <td className="px-10 py-8">
                        <div className="font-black text-blue-500 text-lg">${(balances[id.toLowerCase() as keyof typeof balances] * market[id].price).toLocaleString()}</div>
                    </td>
                    <td className="px-10 py-8">
                        <button 
                        onClick={() => handleCopy(userData?.[`${id.toLowerCase()}_address`] || '', id)} 
                        className="flex items-center gap-3 bg-white/[0.03] px-5 py-3 rounded-2xl text-[11px] font-bold hover:bg-white/10 border border-white/5 transition-all text-slate-400 hover:text-white"
                        >
                        {copied === id ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                        <span className="font-mono opacity-40">
                            {userData?.[`${id.toLowerCase()}_address`]?.slice(0,10) || 'Assigning'}...
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

      {/* MODAL: RECEIVE (მხოლოდ QR და მისამართი) */}
      {receiveOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
          <div className="bg-[#0b0e14] border border-white/10 w-full max-w-md rounded-[50px] p-10 relative shadow-2xl">
            <button onClick={() => setReceiveOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-all"><X /></button>
            
            <div className="mb-10">
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Inbound Node</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Select asset for deposit routing</p>
            </div>

            <div className="flex gap-3 mb-10">
              {(['BTC', 'ETH', 'USDT'] as CoinKey[]).map((c) => (
                <button 
                  key={c} 
                  onClick={() => setReceiveCoin(c)}
                  className={`flex-1 py-4 rounded-2xl border transition-all font-black text-xs tracking-widest ${receiveCoin === c ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 border-white/5 text-slate-600 hover:bg-white/10'}`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="bg-black/60 p-10 rounded-[40px] border border-white/5 text-center shadow-inner">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${userData?.[`${receiveCoin.toLowerCase()}_address`] || 'none'}`} 
                className="mx-auto h-48 w-48 rounded-[30px] mb-10 border-[12px] border-white shadow-2xl"
                alt="QR"
              />
              
              <div className="text-[10px] uppercase tracking-[0.3em] text-slate-600 mb-4 font-black">Secure {receiveCoin} Address</div>
              
              <button 
                onClick={() => handleCopy(userData?.[`${receiveCoin.toLowerCase()}_address`] || '', 'modal-addr')}
                className="w-full font-mono text-[11px] text-blue-400 break-all bg-blue-600/5 p-5 rounded-2xl border border-blue-500/10 hover:border-blue-500/30 transition-all flex items-center justify-center gap-3 group"
              >
                {userData?.[`${receiveCoin.toLowerCase()}_address`] || 'Initializing node...'}
                {copied === 'modal-addr' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} className="opacity-20 group-hover:opacity-100 transition-all" />}
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2">
                <ShieldCheck size={14} className="text-slate-600" />
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Protocol: End-to-End Encrypted</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
