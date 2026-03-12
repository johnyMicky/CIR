import React, { useEffect, useMemo, useState } from "react";
import { ref, onValue } from "firebase/database";
import { Link } from "react-router-dom";
import { Wallet, Bitcoin, Landmark, Coins, ShieldCheck } from "lucide-react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth() as any;
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (!user?.id) return;

    const userRef = ref(db, `users/${user.id}`);

    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserData(snapshot.val());
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, [user?.id]);

  const balances = useMemo(() => {
    const btc = Number(userData?.btc_balance || 0);
    const eth = Number(userData?.eth_balance || 0);
    const usdt = Number(userData?.usdt_balance || 0);

    const usd =
      userData?.usd_balance !== undefined
        ? Number(userData.usd_balance || 0)
        : Number(userData?.balance || 0);

    return { btc, eth, usdt, usd };
  }, [userData]);

  const fullName =
    userData?.fullName ||
    `${userData?.firstName || ""} ${userData?.lastName || ""}`.trim() ||
    userData?.name ||
    user?.email ||
    "User";

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-blue-300 mb-4">
                <ShieldCheck size={14} />
                Secure Client Dashboard
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                Welcome, {fullName}
              </h1>
              <p className="text-slate-400 mt-2">
                Your live balances are synced directly from Firebase.
              </p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Link
                to="/"
                className="px-5 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
              >
                Back Home
              </Link>
              <button
                onClick={logout}
                className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <div className="rounded-[28px] border border-white/8 bg-white/[0.04] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-400/20 flex items-center justify-center text-amber-300">
                  <Bitcoin size={18} />
                </div>
                <div className="text-sm text-slate-400">BTC Balance</div>
              </div>
              <div className="text-3xl font-black tracking-tight">
                {balances.btc.toFixed(8)}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-white/[0.04] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-slate-500/15 border border-slate-400/20 flex items-center justify-center text-slate-300">
                  <Coins size={18} />
                </div>
                <div className="text-sm text-slate-400">ETH Balance</div>
              </div>
              <div className="text-3xl font-black tracking-tight">
                {balances.eth.toFixed(8)}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-white/[0.04] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center text-emerald-300">
                  <Wallet size={18} />
                </div>
                <div className="text-sm text-slate-400">USDT Balance</div>
              </div>
              <div className="text-3xl font-black tracking-tight">
                {balances.usdt.toFixed(2)}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-white/[0.04] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-500/15 border border-blue-400/20 flex items-center justify-center text-blue-300">
                  <Landmark size={18} />
                </div>
                <div className="text-sm text-slate-400">USD Balance</div>
              </div>
              <div className="text-3xl font-black tracking-tight">
                ${balances.usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-5 mt-8">
            <div className="rounded-[28px] border border-white/8 bg-black/20 p-5">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-3">
                BTC Address
              </div>
              <div className="text-sm text-slate-300 break-all">
                {userData?.btc_address || "No BTC address assigned yet"}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-black/20 p-5">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-3">
                ETH Address
              </div>
              <div className="text-sm text-slate-300 break-all">
                {userData?.eth_address || "No ETH address assigned yet"}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-black/20 p-5">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-3">
                USDT Address
              </div>
              <div className="text-sm text-slate-300 break-all">
                {userData?.usdt_address || "No USDT address assigned yet"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
