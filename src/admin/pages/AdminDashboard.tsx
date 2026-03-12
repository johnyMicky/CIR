import React from "react";
import {
  Users,
  CreditCard,
  DollarSign,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Clock3
} from "lucide-react";

const statCards = [
  {
    title: "Total Users",
    value: "1,284",
    change: "+8.2%",
    icon: <Users size={18} />,
    color: "text-blue-400"
  },
  {
    title: "Pending Withdrawals",
    value: "37",
    change: "+4 today",
    icon: <CreditCard size={18} />,
    color: "text-amber-400"
  },
  {
    title: "Assets Managed",
    value: "$4.8M",
    change: "+12.4%",
    icon: <DollarSign size={18} />,
    color: "text-emerald-400"
  },
  {
    title: "Live Sessions",
    value: "94",
    change: "Currently online",
    icon: <Activity size={18} />,
    color: "text-cyan-400"
  }
];

const recentActions = [
  "Balance update applied to client wallet",
  "New user account created successfully",
  "USDT withdrawal moved to pending review",
  "Client wallet address updated by admin",
  "User profile opened from admin panel"
];

const AdminDashboard = () => {
  return (
    <div className="space-y-8 text-white">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-blue-300 font-bold mb-2">
            Admin Overview
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Axcel Control Panel
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl">
            Full management view for users, balances, wallet assignments, withdrawal requests and recent platform activity.
          </p>
        </div>

        <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(37,99,235,0.10),rgba(255,255,255,0.02))] px-5 py-4">
          <div className="text-[10px] uppercase tracking-[0.22em] text-blue-300/80 font-bold mb-1">
            Security Layer
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <ShieldCheck size={16} />
            Protected admin session
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((item) => (
          <div
            key={item.title}
            className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.14)]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-2xl bg-white/[0.04] border border-white/8 flex items-center justify-center ${item.color}`}>
                {item.icon}
              </div>
              <div className="text-xs text-slate-400 font-medium">{item.change}</div>
            </div>

            <div className="text-sm text-slate-400 mb-2">{item.title}</div>
            <div className="text-3xl font-black tracking-tight">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,#0b1220_0%,#0d1628_100%)] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.16)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-2">
                Performance Snapshot
              </div>
              <div className="text-2xl font-black tracking-tight">
                Weekly System Report
              </div>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
              <ArrowUpRight size={16} />
              Upward trend
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-400">Client Registrations</span>
                <span className="font-semibold">78%</span>
              </div>
              <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full w-[78%] bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-400">Withdrawal Processing</span>
                <span className="font-semibold">64%</span>
              </div>
              <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full w-[64%] bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-400">Wallet Assignment Coverage</span>
                <span className="font-semibold">91%</span>
              </div>
              <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full w-[91%] bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,#0b1220_0%,#0d1628_100%)] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.16)]">
          <div className="flex items-center gap-3 mb-6">
            <Clock3 size={18} className="text-blue-400" />
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-1">
                Recent Activity
              </div>
              <div className="text-xl font-black tracking-tight">
                Latest admin events
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {recentActions.map((item, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-slate-300"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6">
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-3">
            User Status
          </div>
          <div className="text-2xl font-black mb-2">94 Online</div>
          <div className="text-sm text-slate-400">
            Live connected users currently browsing the platform.
          </div>
        </div>

        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6">
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-3">
            Pending Reviews
          </div>
          <div className="text-2xl font-black mb-2">12 Profiles</div>
          <div className="text-sm text-slate-400">
            Recently updated client records waiting for admin validation.
          </div>
        </div>

        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6">
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-3">
            System Health
          </div>
          <div className="text-2xl font-black mb-2 text-emerald-400">Stable</div>
          <div className="text-sm text-slate-400">
            Admin workspace is running normally with active protections.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
