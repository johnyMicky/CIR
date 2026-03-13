import React, { useEffect, useMemo, useState } from "react";
import { ref, onValue, push, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, Copy, CheckCircle2, ArrowDownLeft, ArrowUpRight, 
  RefreshCw, X, Lock, LayoutDashboard, History, Settings, 
  Activity, Globe, Zap, ShieldAlert, Terminal, Wallet
} from "lucide-react";
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
  const [receiveOpen, setReceiveOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const userRef = ref(db, `users/${user.id}`);
    const unsub = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) setUserData(snapshot.val());
    });
    return () => unsub();
  }, [user?.id]);

  // ფასების განახლება CORS-ის გარეშე
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
      } catch (e) { console.error("API error"); }
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[140px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>

      {/* SIDEBAR - ULTRA PREMIUM */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-white/5 bg-[#030712]/80 backdrop-blur-2xl lg:block z-50">
        <div className="flex h-24 items-center px-8 border-b border-white/5">
          <div className="bg-blue-600 p-2 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <div className="ml-3">
            <span className="text-lg font-black tracking-tighter text-white uppercase italic">Axcel Intel</span>
            <div className="text-[10px] uppercase tracking-[0.2em] text-blue-500 font-bold">Secure Node</div>
          </div>
        </div>
        
        <nav className="p-6 space-y-2">
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-5 py-4 bg-blue-600/10 text-blue-400 rounded-2xl font-bold border border-blue-500/10 transition-all">
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button onClick={() => navigate('/history')} className="w-full flex items-center gap-3 px-5 py-4 text-slate-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
            <History size={20} /> History
          </button>
          <button className="w-full flex items-center gap-3 px-5 py-4 text-slate-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
            <Settings size={20} /> Settings
          </button>
        </nav>

        <div className="absolute bottom-8 left-0 w-full px-6">
          <button onClick={logout} className="flex w-full items-center gap-3 px-5 py-4 text-rose-500/70 hover:text-rose-500 font-bold transition-all border border-rose-500/5 rounded-2xl hover:bg-rose-500/5">
            <Lock size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="lg:ml-64 p-4 md:p-10 relative z-10">
        
        {/* HEADER AREA */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
              Welcome, {userData?.firstName || 'Demo'}
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
            </h1>
            <p className="text-slate-500 mt-2 font-medium italic">Institutional node access is encrypted.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-[#0b0e14]/60 backdrop-blur-xl p-3 rounded-[24px] border border-white/5 shadow-2xl">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-600/20">
              {userData?.firstName?.[0] || 'D'}
            </div>
            <div className="pr-4 border-r border-white/10 mr-2">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operator ID</div>
              <div className="text-sm font-mono text-blue-400 font-bold">#{user.id.slice(0, 8).toUpperCase()}</div>
            </div>
            <ShieldAlert size={20} className="text-blue-500 opacity-50" />
          </div>
        </header>

        {/* PORTFOLIO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* MAIN BALANCE CARD */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-[40px] bg-[#0b0e14] border border-white/5 p-10 group shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] -z-10 group-hover:bg-blue-600/10 transition-all duration-1000" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                  <Activity size={16} className="text-blue-500" />
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Node Portfolio Value</span>
              </div>
              <div className="flex items-baseline gap-4 mb-10">
                <div className="text-7xl font-black text-white tracking-tighter tabular-nums drop-shadow-2xl">
                  ${balances.usd.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </div>
                <div className="text-emerald-500 font-black text-sm bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  +4.2%
                </div>
              </div>

              {/* LIVE CHART SIMULATION */}
              <div className="flex items-end gap-1.5 h-16 mb-12 opacity-40">
                {[45, 60, 40, 85, 55, 75, 95, 65, 80, 50, 90, 110, 85].map((h, i) => (
                  <div key={i} className="flex-1 bg-gradient-to-t from-blue-600/20 to-blue-500 rounded-t-sm" style={{ height: `${h}%` }} />
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <button onClick={() => setReceiveOpen(true)} className="flex items-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95">
                  <ArrowDownLeft size={20} /> Receive
                </button>
                <button className="flex items-center gap-3 bg-white/5 border border-white/10 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95">
                  <ArrowUpRight size={20} /> Withdraw
                </button>
              </div>
            </div>
          </div>

          {/* MARKET DATA CARD */}
          <div className="bg-[#0b0e14] border border-white/5 rounded-[40px] p-8 shadow-2xl flex flex-col justify-between">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8 italic">Node Intelligence</h3>
            <div className="space-y-7">
              {Object.entries(market).map(([coin, data]: any) => (
                <div key={coin} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-blue-500/30 transition-all">
                      <img src={data.image} className="h-6 w-6" alt="" />
                    </div>
                    <div>
                      <div className="font-black text-white text-sm tracking-tight">{coin} Core</div>
                      <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest italic">Live Feed</div>
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
            <button className="w-full mt-8 py-4 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 transition-all">
              View All Nodes
            </button>
          </div>
        </div>

        {/* ASSET NODES TABLE */}
        <div className="bg-[#0b0e14] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl relative">
          <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
            <h3 className="font-black text-white uppercase tracking-widest text-sm italic">Encrypted Asset Nodes</h3>
            <div className="flex items-center gap-2 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20">
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
                      <div className="flex items-center gap-5">
                        <img src={market[id].image} className="h-11 w-11 grayscale group-hover:grayscale-0 transition-all duration-500" alt="" />
                        <div>
                          <div className="font-black text-white text-base tracking-tighter uppercase italic">{id} Asset</div>
                          <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Distributed Node</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 font-black text-white text-lg tabular-nums tracking-tight">
                      {balances[id.toLowerCase() as keyof typeof balances]} <span className="text-slate-600 text-xs">{id}</span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="font-black text-blue-500 text-lg tracking-tight italic tabular-nums">
                        ${(balances[id.toLowerCase() as keyof typeof balances] * market[id].price).toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <button className="flex items-center gap-3 bg-white/[0.03] px-6 py-3 rounded-2xl text-[11px] font-bold hover:bg-white/10 border border-white/5 transition-all text-slate-400 hover:text-white group">
                        <Terminal size={14} className="opacity-40 group-hover:opacity-100" />
                        <span className="font-mono opacity-30 group-hover:opacity-100 italic transition-all">
                          {userData?.[`${id.toLowerCase()}_address`]?.slice(0, 10) || 'Assigning...'}
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

      {/* MODAL: DEPOSIT */}
      {receiveOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-[#0b0e14] border border-white/10 w-full max-w-md rounded-[50px] p-10 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[80px] -z-10" />
            <button onClick={() => setReceiveOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-all"><X /></button>
            
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Inbound Node</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Private Deposit Route</p>
            </div>

            <div className="bg-black/60 p-10 rounded-[40px] border border-white/5 text-center shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=example_addr`} className="mx-auto h-48 w-48 rounded-[30px] mb-10 border-[12px] border-white shadow-2xl relative z-10" alt="QR" />
              <div className="text-[10px] uppercase tracking-[0.3em] text-slate-600 mb-4 font-black relative z-10">Secure Wallet Address</div>
              <div className="font-mono text-[11px] text-blue-400 break-all bg-blue-600/5 p-5 rounded-2xl border border-blue-500/10 relative z-10 italic">
                {userData?.btc_address || 'Initializing Node...'}
              </div>
            </div>

            <button className="w-full bg-blue-600 py-6 mt-10 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-600/30 hover:bg-blue-500 transition-all flex items-center justify-center gap-3 active:scale-95">
              <Copy size={16} /> Copy Terminal Address
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
