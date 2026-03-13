import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { Link, useNavigate } from "react-router-dom";
import { 
  ShieldCheck, ArrowLeft, History as HistoryIcon, 
  ArrowDownLeft, ArrowUpRight, Clock3, LayoutDashboard, Settings, Lock
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

    // ვქაჩავთ ტრანზაქციებს ბაზიდან
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
    <div className="min-h-screen bg-[#080a0f] text-slate-200 font-sans">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-white/5 bg-[#0b0e14] lg:block">
        <div className="flex h-20 items-center px-8 border-b border-white/5">
          <ShieldCheck className="text-blue-500 mr-2" size={24} />
          <span className="text-sm font-black tracking-tighter text-white uppercase italic">Axcel Private Wallet</span>
        </div>
        <nav className="p-6 space-y-2">
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-white transition-all">
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-xl font-bold">
            <HistoryIcon size={20} /> History
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-white transition-all"><Settings size={20} /> Settings</button>
        </nav>
        <div className="absolute bottom-8 left-0 w-full px-6">
          <button onClick={logout} className="flex w-full items-center gap-3 px-4 py-3 text-rose-500/70 hover:text-rose-500 font-bold transition-all"><Lock size={20} /> Logout</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="lg:ml-64 p-4 md:p-8">
        <header className="mb-12">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-all"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-black text-white tracking-tight italic uppercase">Transaction History</h1>
          <p className="text-slate-500 mt-1">Review your secure node activities and routing logs.</p>
        </header>

        <div className="bg-[#0b0e14] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.2em] text-slate-500 border-b border-white/5">
                  <th className="px-8 py-5">Type</th>
                  <th className="px-8 py-5">Asset</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-500">Scanning blockchain nodes...</td></tr>
                ) : transactions.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-500">No transactions found in this node.</td></tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-all">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${t.type === 'withdraw' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            {t.type === 'withdraw' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                          </div>
                          <span className="font-bold capitalize text-white">{t.type}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-mono text-blue-400 font-bold">{t.currency || t.coin}</span>
                      </td>
                      <td className="px-8 py-6 font-black text-white">
                        {t.type === 'withdraw' ? '-' : '+'}{t.amount}
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <Clock3 size={14} />
                          {new Date(t.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          t.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                          t.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                          'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        }`}>
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
