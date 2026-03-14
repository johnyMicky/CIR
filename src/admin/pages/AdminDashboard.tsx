import React from "react";
import {
  Users,
  CreditCard,
  DollarSign,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Clock3,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Layers3,
} from "lucide-react";

const statCards = [
  {
    title: "Total Users",
    value: "1,284",
    change: "+8.2%",
    icon: <Users size={18} />,
    color: "text-cyan-300",
    glow: "from-cyan-500/18 to-blue-500/10",
  },
  {
    title: "Pending Withdrawals",
    value: "37",
    change: "+4 today",
    icon: <CreditCard size={18} />,
    color: "text-amber-300",
    glow: "from-amber-500/18 to-orange-500/10",
  },
  {
    title: "Assets Managed",
    value: "$4.8M",
    change: "+12.4%",
    icon: <DollarSign size={18} />,
    color: "text-emerald-300",
    glow: "from-emerald-500/18 to-teal-500/10",
  },
  {
    title: "Live Sessions",
    value: "94",
    change: "Currently online",
    icon: <Activity size={18} />,
    color: "text-violet-300",
    glow: "from-violet-500/18 to-fuchsia-500/10",
  },
];

const recentActions = [
  "Balance update applied to client wallet",
  "New user account created successfully",
  "USDT withdrawal moved to pending review",
  "Client wallet address updated by admin",
  "User profile opened from admin panel",
];

const insightCards = [
  {
    title: "User Status",
    value: "94 Online",
    description: "Live connected users currently browsing the platform.",
    accent: "text-cyan-300",
    icon: <Users size={18} />,
  },
  {
    title: "Pending Reviews",
    value: "12 Profiles",
    description: "Recently updated client records waiting for admin validation.",
    accent: "text-amber-300",
    icon: <Layers3 size={18} />,
  },
  {
    title: "System Health",
    value: "Stable",
    description: "Admin workspace is running normally with active protections.",
    accent: "text-emerald-300",
    icon: <CheckCircle2 size={18} />,
  },
];

const performanceItems = [
  {
    label: "Client Registrations",
    value: "78%",
    width: "78%",
    bar: "from-cyan-400 via-blue-500 to-indigo-500",
  },
  {
    label: "Withdrawal Processing",
    value: "64%",
    width: "64%",
    bar: "from-amber-400 via-orange-500 to-rose-500",
  },
  {
    label: "Wallet Assignment Coverage",
    value: "91%",
    width: "91%",
    bar: "from-emerald-400 via-teal-400 to-cyan-400",
  },
];

const AdminDashboard = () => {
  return (
    <div className="space-y-8 text-white">
      <section className="relative overflow-hidden rounded-[34px] border border-white/8 bg-[linear-gradient(135deg,rgba(8,18,32,0.95),rgba(11,19,36,0.92),rgba(13,22,40,0.90))] px-6 py-7 shadow-[0_18px_50px_rgba(0,0,0,0.20)] sm:px-7 lg:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 top-[-40px] h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute -right-10 bottom-[-30px] h-52 w-52 rounded-full bg-blue-600/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-500/8 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-300">
              <Sparkles size={14} />
              Premium Admin Overview
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl xl:text-5xl">
              Axcel Control Panel
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Full management view for users, balances, wallet assignments, withdrawal
              requests and recent platform activity.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:w-auto xl:min-w-[420px]">
            <div className="rounded-[24px] border border-cyan-400/15 bg-cyan-500/8 px-5 py-4">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300/80">
                Security Layer
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                <ShieldCheck size={16} />
                Protected admin session
              </div>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-white/[0.04] px-5 py-4">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                Trend Watch
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
                <TrendingUp size={16} />
                Positive operational flow
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
        {statCards.map((item) => (
          <div
            key={item.title}
            className={`group relative overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_14px_34px_rgba(0,0,0,0.14)] transition-all hover:-translate-y-1 hover:border-white/12`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${item.glow} opacity-100`} />

            <div className="relative">
              <div className="mb-5 flex items-center justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] ${item.color}`}
                >
                  {item.icon}
                </div>

                <div className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-300">
                  {item.change}
                </div>
              </div>

              <div className="text-sm text-slate-400">{item.title}</div>
              <div className="mt-2 text-3xl font-black tracking-tight">{item.value}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,#0a1220_0%,#0d1628_100%)] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.18)] sm:p-7">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">
                Performance Snapshot
              </div>
              <div className="text-2xl font-black tracking-tight sm:text-3xl">
                Weekly System Report
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
              <ArrowUpRight size={16} />
              Upward trend
            </div>
          </div>

          <div className="space-y-6">
            {performanceItems.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="font-semibold text-white">{item.value}</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/5">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${item.bar}`}
                    style={{ width: item.width }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-white/35">
                Coverage
              </div>
              <div className="mt-2 text-2xl font-black text-cyan-300">91%</div>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-white/35">
                Velocity
              </div>
              <div className="mt-2 text-2xl font-black text-emerald-300">Fast</div>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-white/35">
                Review Flow
              </div>
              <div className="mt-2 text-2xl font-black text-amber-300">Active</div>
            </div>
          </div>
        </div>

        <div className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,#0a1220_0%,#0d1628_100%)] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.18)] sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
              <Clock3 size={18} />
            </div>

            <div>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">
                Recent Activity
              </div>
              <div className="text-xl font-black tracking-tight sm:text-2xl">
                Latest admin events
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {recentActions.map((item, index) => (
              <div
                key={index}
                className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-slate-300 transition hover:bg-white/[0.05]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {insightCards.map((item) => (
          <div
            key={item.title}
            className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.14)]"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] ${item.accent}`}>
                {item.icon}
              </div>
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">
                {item.title}
              </div>
            </div>

            <div className={`mb-2 text-2xl font-black ${item.accent}`}>{item.value}</div>
            <div className="text-sm leading-relaxed text-slate-400">{item.description}</div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default AdminDashboard;
