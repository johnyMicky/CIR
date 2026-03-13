import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, ArrowLeft, History as HistoryIcon, 
  ArrowDownLeft, ArrowUpRight, Clock3, LayoutDashboard, 
  Settings, Lock, Activity, Search, Terminal, RefreshCw // <-- იმპორტი დამატებულია
} from "lucide-react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const History = () => {
  const { user, logout } = useAuth() as any;
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const transRef = ref(db, "transactions");
    const unsub = onValue(transRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const userTrans = Object.entries(data)
          .map(([id, val]: any) => ({ id, ...val }))
          .filter((t: any) => t.userId === user.id)
          .sort((a, b) => b.created_at - a.created_at);
        setTransactions(userTrans);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [user?.id]);

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
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-white transition-all">
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-xl font-bold border border-blue-500/10">
            <HistoryIcon size={18} /> History
          </div>
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
        
        {/* LOG STATUS BAR */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-8 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Log Status: <span className="text-white">Live Sync</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <Activity size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Hash Integrity: <span className="text-emerald-500">Verified</span></span>
                </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Listening to P2P Nodes...</span>
            </div>
        </div>

        <header className="mb-12">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-all group font-bold text-xs uppercase tracking-widest"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Terminal
          </button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                  <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Transaction Logs</h1>
                  <p className="text-slate-500 mt-2 font-medium italic">Encrypted record of all inbound and outbound node activities.</p>
              </div>
              <div className="bg-[#0b0e14] border border-white/5 rounded-xl px-4 py-2 flex items-center gap-2 text-slate-500">
                  <Search size={16} />
                  <input type="text" placeholder="Search Hash..." className="bg-transparent border-none outline-none text-xs font-bold w-32" />
              </div>
          </div>
        </header>

        {/* LOG TABLE */}
        <div className="bg-[#0b0e14] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl relative">
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.3em] text-slate-600 border-b border-white/5">
                  <th className="px-10 py-7">Event Type</th>
                  <th className="px-10 py-7">Asset Node</th>
                  <th className="px-10 py-7">Amount</th>
                  <th className="px-10 py-7">Timestamp</th>
                  <th className="px-10 py-7 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={5} className="px-10 py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                          <RefreshCw className="animate-spin text-blue-500" size={32} />
                          <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Decrypting Ledger...</span>
                      </div>
                  </td></tr>
                ) : transactions.length === 0 ? (
                  <tr><td colSpan={5} className="px-10 py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                          <HistoryIcon className="text-slate-800" size={48} />
                          <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-600">No logs detected on this address</span>
                      </div>
                  </td></tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-all group">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl border ${
                            t.type === 'withdraw' 
                            ? 'bg-rose-500/5 border-rose-500/10 text-rose-500' 
                            : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500'
                          }`}>
                            {t.type === 'withdraw' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                          </div>
                          <div>
                              <div className="font-black text-white text-base uppercase italic">{t.type}</div>
                              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">P2P Routing</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                            <span className="font-mono text-blue-400 font-black text-sm uppercase tracking-tighter">{t.currency || t.coin} Network</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className={`text-xl font-black tracking-tighter ${t.type === 'withdraw' ? 'text-white' : 'text-emerald-500'}`}>
                          {t.type === 'withdraw' ? '-' : '+'}{t.amount}
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-300">{new Date(t.created_at).toLocaleDateString()}</span>
                            <span className="text-[10px] font-medium text-slate-600">{new Date(t.created_at).toLocaleTimeString()}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border ${
                          t.status === 'completed' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20' : 
                          t.status === 'pending' ? 'bg-amber-500/5 text-amber-500 border-amber-500/20 animate-pulse' : 
                          'bg-rose-500/5 text-rose-500 border-rose-500/20'
                        }`}>
                          <div className={`h-1 w-1 rounded-full ${t.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default History;
