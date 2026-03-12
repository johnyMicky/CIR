import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import {
  ShieldCheck,
  Bell,
  Sun,
  Moon,
  LogOut,
  Wallet,
  ArrowLeftRight,
  ArrowUpRight
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [liveUser, setLiveUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const buttonFx =
    "relative overflow-hidden transition-all duration-300 before:content-[''] before:absolute before:w-[140%] before:h-[140%] before:top-[-140%] before:left-[-140%] before:bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.35),transparent)] before:rotate-[25deg] before:transition-all before:duration-700 hover:before:top-[140%] hover:before:left-[140%]";

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const userRef = ref(db, 'users/' + user.id);
    const unsubscribe = onValue(userRef, (snap) => {
      if (snap.exists()) {
        setLiveUser(snap.val());
      } else {
        setLiveUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center text-blue-500">
        Loading secure environment...
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? 'bg-[#030712] text-white' : 'bg-slate-100 text-slate-900'} min-h-screen transition-all duration-300`}>
      <nav className={`sticky top-0 z-40 backdrop-blur-xl border-b ${isDarkMode ? 'border-white/5 bg-[#030712]/75' : 'border-slate-200 bg-white/75'}`}>
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight italic">Axcel Wallet</div>
              <div className="text-[10px] uppercase tracking-[0.35em] opacity-35 font-bold">
                your private wallet
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className={`w-11 h-11 rounded-2xl border border-white/8 bg-white/5 hover:bg-white/10 flex items-center justify-center ${buttonFx}`}
            >
              <Bell size={18} className="opacity-70 relative z-10" />
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-11 h-11 rounded-2xl border border-white/8 bg-white/5 hover:bg-white/10 flex items-center justify-center ${buttonFx}`}
            >
              {isDarkMode ? (
                <Sun size={18} className="opacity-70 relative z-10" />
              ) : (
                <Moon size={18} className="opacity-70 relative z-10" />
              )}
            </button>

            <button
              onClick={handleLogout}
              className={`px-5 h-11 rounded-2xl border border-rose-500/20 bg-rose-500/8 text-rose-400 hover:bg-rose-500 hover:text-white flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] ${buttonFx}`}
            >
              <LogOut size={16} className="relative z-10" />
              <span className="relative z-10">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <section className="rounded-[36px] border border-white/6 bg-[linear-gradient(135deg,#0b1220_0%,#0d1830_55%,#0b1220_100%)] p-7 md:p-9 shadow-[0_12px_40px_rgba(0,0,0,0.22)]">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div>
                <div className="text-[12px] uppercase tracking-[0.22em] opacity-40 font-bold mb-3">
                  Welcome back, {liveUser?.firstName || user?.email || 'User'}
                </div>

                <h1 className="text-4xl md:text-6xl font-light tracking-tight text-blue-500 leading-none">
                  ${Number(liveUser?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h1>
              </div>

              <div className="grid grid-cols-2 gap-4 min-w-[280px]">
                <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                  <div className="text-[10px] uppercase tracking-[0.2em] opacity-35 font-black mb-2">
                    BTC
                  </div>
                  <div className="text-xl font-semibold">
                    {Number(liveUser?.wallets?.BTC || 0).toFixed(6)}
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                  <div className="text-[10px] uppercase tracking-[0.2em] opacity-35 font-black mb-2">
                    ETH
                  </div>
                  <div className="text-xl font-semibold">
                    {Number(liveUser?.wallets?.ETH || 0).toFixed(6)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                className={`px-7 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-[11px] font-black uppercase tracking-[0.24em] flex items-center gap-3 ${buttonFx}`}
              >
                <ArrowLeftRight size={16} className="relative z-10" />
                <span className="relative z-10">Asset Swap</span>
              </button>

              <button
                className={`px-7 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-[11px] font-black uppercase tracking-[0.24em] flex items-center gap-3 ${buttonFx}`}
              >
                <ArrowUpRight size={16} className="relative z-10" />
                <span className="relative z-10">Withdraw Funds</span>
              </button>

              <button
                className={`px-7 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-[11px] font-black uppercase tracking-[0.24em] flex items-center gap-3 ${buttonFx}`}
              >
                <Wallet size={16} className="relative z-10" />
                <span className="relative z-10">Receive Funds</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
