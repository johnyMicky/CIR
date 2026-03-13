import React, { useEffect, useMemo, useState } from "react";
import { ref, onValue } from "firebase/database";
import {
  Bell,
  Search,
  Eye,
  EyeOff,
  LayoutDashboard,
  Wallet,
  ArrowUpDown,
  History,
  Settings,
  LifeBuoy,
  ShieldAlert,
  ShieldCheck,
  Bitcoin,
  Coins,
  Landmark,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  CreditCard,
  ChevronRight,
  Wifi,
  WifiOff,
  Clock3,
  Mail,
  Phone,
  Globe,
  MapPin,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  XCircle
} from "lucide-react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

type UserData = {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  stateRegion?: string;
  city?: string;
  online?: boolean;
  last_seen?: number | string;
  lastSeen?: string;

  btc_balance?: number;
  eth_balance?: number;
  usdt_balance?: number;
  usd_balance?: number;
  balance?: string | number;

  btc_address?: string;
  eth_address?: string;
  usdt_address?: string;

  kycStatus?: "verified" | "pending" | "unverified";
  twoFactorEnabled?: boolean;
};

type TxItem = {
  id: string;
  type?: string;
  currency?: string;
  asset?: string;
  amount?: string | number;
  status?: "pending" | "processing" | "completed" | "rejected" | "failed";
  created_at?: number | string;
  date?: string;
};

type NotificationItem = {
  id: string;
  title?: string;
  message?: string;
  read?: boolean;
  created_at?: number | string;
};

const sidebarItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "wallets", label: "My Wallets", icon: Wallet },
  { key: "send-receive", label: "Send / Receive", icon: ArrowUpDown },
  { key: "swap", label: "Exchange / Swap", icon: Repeat },
  { key: "history", label: "Transactions History", icon: History },
  { key: "settings", label: "Settings & Security", icon: Settings },
  { key: "support", label: "Support / Help", icon: LifeBuoy }
];

const marketSeed = [
  { symbol: "BTC/USD", price: 68223.41, change: 2.18 },
  { symbol: "ETH/USD", price: 3214.77, change: 1.46 },
  { symbol: "USDT/USD", price: 1.0, change: 0.0 },
  { symbol: "SOL/USD", price: 146.28, change: 3.12 }
];

const formatLastSeen = (value?: number | string, legacy?: string) => {
  if (legacy && typeof legacy === "string") return legacy;
  if (!value) return "No recent activity";

  const timestamp = typeof value === "string" ? Number(value) : value;
  if (!timestamp) return "No recent activity";

  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour ago`;
  return `${days} day ago`;
};

const formatDate = (value?: number | string, fallback?: string) => {
  if (fallback) return fallback;
  if (!value) return "-";
  const ts = typeof value === "string" ? Number(value) : value;
  if (!ts) return "-";
  return new Date(ts).toLocaleString();
};

const statusPill = (status?: string) => {
  switch (status) {
    case "completed":
      return "text-emerald-300 bg-emerald-500/10 border-emerald-500/20";
    case "processing":
    case "pending":
      return "text-amber-300 bg-amber-500/10 border-amber-500/20";
    case "rejected":
    case "failed":
      return "text-rose-300 bg-rose-500/10 border-rose-500/20";
    default:
      return "text-slate-300 bg-white/[0.04] border-white/10";
  }
};

const statusIcon = (status?: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 size={14} />;
    case "processing":
    case "pending":
      return <AlertTriangle size={14} />;
    case "rejected":
    case "failed":
      return <XCircle size={14} />;
    default:
      return <Clock3 size={14} />;
  }
};

const buttonFx =
  "relative overflow-hidden transition-all duration-300 before:content-[''] before:absolute before:w-[140%] before:h-[140%] before:top-[-140%] before:left-[-140%] before:bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.22),transparent)] before:rotate-[25deg] before:transition-all before:duration-700 hover:before:top-[140%] hover:before:left-[140%]";

const Dashboard = () => {
  const { user, logout } = useAuth() as any;

  const [userData, setUserData] = useState<UserData | null>(null);
  const [transactions, setTransactions] = useState<TxItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [search, setSearch] = useState("");
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [marketData, setMarketData] = useState(marketSeed);

  useEffect(() => {
    if (!user?.id) return;

    const userRef = ref(db, `users/${user.id}`);
    const txRef = ref(db, "transactions");
    const notiRef = ref(db, `notifications/${user.id}`);

    const unsubUser = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserData(snapshot.val());
      } else {
        setUserData(null);
      }
    });

    const unsubTx = onValue(txRef, (snapshot) => {
      if (!snapshot.exists()) {
        setTransactions([]);
        return;
      }

      const data = snapshot.val();
      const rows = Object.entries(data)
        .map(([id, value]) => ({ id, ...(value as any) }))
        .filter((item: any) => item.userId === user.id) as TxItem[];

      rows.sort(
        (a, b) => Number(b.created_at || 0) - Number(a.created_at || 0)
      );

      setTransactions(rows.slice(0, 10));
    });

    const unsubNoti = onValue(notiRef, (snapshot) => {
      if (!snapshot.exists()) {
        setNotifications([]);
        return;
      }

      const data = snapshot.val();
      const rows = Object.entries(data).map(([id, value]) => ({
        id,
        ...(value as any)
      })) as NotificationItem[];

      rows.sort(
        (a, b) => Number(b.created_at || 0) - Number(a.created_at || 0)
      );

      setNotifications(rows.slice(0, 8));
    });

    return () => {
      unsubUser();
      unsubTx();
      unsubNoti();
    };
  }, [user?.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData((prev) =>
        prev.map((item) => {
          const drift = (Math.random() - 0.5) * 0.8;
          const nextPrice =
            item.symbol === "USDT/USD"
              ? 1
              : Number((item.price * (1 + drift / 100)).toFixed(2));
          const nextChange =
            item.symbol === "USDT/USD"
              ? 0
              : Number((item.change + drift / 2).toFixed(2));

          return { ...item, price: nextPrice, change: nextChange };
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const locationText = [userData?.city, userData?.stateRegion, userData?.country]
    .filter(Boolean)
    .join(", ");

  const totalAssets = balances.usd;
  const dayChange = 2.5;

  const assetRows = [
    {
      symbol: "BTC",
      amount: balances.btc,
      price: marketData[0].price,
      total: balances.btc * marketData[0].price,
      color: "#f59e0b"
    },
    {
      symbol: "ETH",
      amount: balances.eth,
      price: marketData[1].price,
      total: balances.eth * marketData[1].price,
      color: "#94a3b8"
    },
    {
      symbol: "USDT",
      amount: balances.usdt,
      price: 1,
      total: balances.usdt,
      color: "#10b981"
    }
  ];

  const allocationTotal = assetRows.reduce((sum, item) => sum + item.total, 0);

  const searchedTransactions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return transactions;

    return transactions.filter((tx) => {
      const hay = [
        tx.id,
        tx.type,
        tx.currency,
        tx.asset,
        String(tx.amount || ""),
        tx.status
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [transactions, search]);

  const donut = useMemo(() => {
    if (allocationTotal <= 0) return [];

    let cumulative = 0;
    return assetRows.map((item) => {
      const percent = (item.total / allocationTotal) * 100;
      const start = cumulative;
      cumulative += percent;
      return { ...item, percent, start };
    });
  }, [allocationTotal, assetRows]);

  if (!user || !userData) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        Loading wallet...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-120px] left-[10%] w-[340px] h-[340px] bg-blue-600/10 blur-[100px] rounded-full" />
        <div className="absolute top-[18%] right-[8%] w-[280px] h-[280px] bg-cyan-500/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-140px] left-[28%] w-[360px] h-[360px] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative flex min-h-screen">
        <aside className="hidden xl:flex w-[270px] shrink-0 border-r border-white/8 bg-[linear-gradient(180deg,#07101d_0%,#0a1220_100%)] flex-col">
          <div className="px-6 py-6 border-b border-white/8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-300 shadow-[0_0_25px_rgba(37,99,235,0.15)]">
                <ShieldCheck size={22} />
              </div>
              <div>
                <div className="text-xl font-black tracking-tight">Axcel Wallet</div>
                <div className="text-[10px] uppercase tracking-[0.26em] text-white/30 font-bold mt-1">
                  Private Client Access
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = activeMenu === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => setActiveMenu(item.key)}
                  className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 transition-all ${
                    active
                      ? "bg-blue-600/15 border border-blue-500/20 text-blue-300 shadow-[0_0_18px_rgba(37,99,235,0.10)]"
                      : "border border-transparent bg-white/[0.02] hover:bg-white/[0.05] text-slate-300"
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-auto p-4 border-t border-white/8">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 mb-3">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/30 font-bold mb-2">
                Security Status
              </div>
              <div className="text-sm text-slate-300">
                KYC:{" "}
                <span className="text-amber-300 font-semibold">
                  {userData.kycStatus || "unverified"}
                </span>
              </div>
              <div className="text-sm text-slate-300 mt-1">
                2FA:{" "}
                <span
                  className={`font-semibold ${
                    userData.twoFactorEnabled ? "text-emerald-300" : "text-rose-300"
                  }`}
                >
                  {userData.twoFactorEnabled ? "enabled" : "disabled"}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className={`w-full flex items-center justify-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-300 py-3 transition-all ${buttonFx}`}
            >
              <LogOut size={16} className="relative z-10" />
              <span className="font-medium relative z-10">Logout</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 border-b border-white/8 bg-[#020617]/85 backdrop-blur-xl">
            <div className="px-4 md:px-8 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.26em] text-blue-300/80 font-bold mb-1">
                    Client Workspace
                  </div>
                  <div className="text-2xl font-black tracking-tight">
                    Dashboard
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative min-w-[260px]">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search transaction ID or asset..."
                    className="w-full rounded-2xl bg-white/[0.04] border border-white/8 pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={() => setBalanceVisible((v) => !v)}
                  className="w-11 h-11 rounded-2xl border border-white/8 bg-white/[0.04] hover:bg-white/[0.07] flex items-center justify-center text-slate-300"
                >
                  {balanceVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>

                <button className="relative w-11 h-11 rounded-2xl border border-white/8 bg-white/[0.04] hover:bg-white/[0.07] flex items-center justify-center text-slate-300">
                  <Bell size={18} />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-500" />
                  )}
                </button>

                <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
                  <div className="text-sm font-semibold text-white">{fullName}</div>
                  <div className="text-xs text-slate-400">{userData.email || user.email}</div>
                </div>
              </div>
            </div>
          </header>

          <div className="px-4 md:px-8 py-6 md:py-8 space-y-6">
            {(!userData.kycStatus || userData.kycStatus !== "verified") && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-amber-200 flex items-start gap-3">
                <ShieldAlert size={18} className="mt-0.5" />
                <div>
                  <div className="font-semibold">Your profile is not verified.</div>
                  <div className="text-sm text-amber-100/80 mt-1">
                    Complete KYC to unlock higher limits and extended account access.
                  </div>
                </div>
              </div>
            )}

            {!userData.twoFactorEnabled && (
              <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 px-5 py-4 text-orange-200 flex items-start gap-3">
                <ShieldAlert size={18} className="mt-0.5" />
                <div>
                  <div className="font-semibold">Enable 2FA for better security.</div>
                  <div className="text-sm text-orange-100/80 mt-1">
                    Protect your wallet with two-factor authentication.
                  </div>
                </div>
              </div>
            )}

            <section className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6">
              <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.14)]">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-2">
                      Total Assets
                    </div>
                    <div className="text-4xl md:text-5xl font-black tracking-tight">
                      {balanceVisible
                        ? `$${totalAssets.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}`
                        : "••••••••"}
                    </div>
                    <div
                      className={`mt-3 text-sm font-semibold ${
                        dayChange >= 0 ? "text-emerald-300" : "text-rose-300"
                      }`}
                    >
                      {dayChange >= 0 ? "+" : ""}
                      {dayChange.toFixed(2)}% today
                    </div>
                  </div>

                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm w-fit ${
                      userData.online
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                        : "border-white/10 bg-white/[0.04] text-slate-300"
                    }`}
                  >
                    {userData.online ? <Wifi size={16} /> : <WifiOff size={16} />}
                    <span>{userData.online ? "Online" : "Offline"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="rounded-[24px] border border-white/8 bg-black/20 p-5">
                    <div className="flex items-center gap-3 mb-4 text-amber-300">
                      <Bitcoin size={18} />
                      <span className="text-sm text-slate-400">BTC</span>
                    </div>
                    <div className="text-2xl font-black">
                      {balanceVisible ? balances.btc.toFixed(8) : "••••••"}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/8 bg-black/20 p-5">
                    <div className="flex items-center gap-3 mb-4 text-slate-300">
                      <Coins size={18} />
                      <span className="text-sm text-slate-400">ETH</span>
                    </div>
                    <div className="text-2xl font-black">
                      {balanceVisible ? balances.eth.toFixed(8) : "••••••"}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/8 bg-black/20 p-5">
                    <div className="flex items-center gap-3 mb-4 text-emerald-300">
                      <Wallet size={18} />
                      <span className="text-sm text-slate-400">USDT</span>
                    </div>
                    <div className="text-2xl font-black">
                      {balanceVisible ? balances.usdt.toFixed(2) : "••••••"}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/8 bg-black/20 p-5">
                    <div className="flex items-center gap-3 mb-4 text-blue-300">
                      <Landmark size={18} />
                      <span className="text-sm text-slate-400">USD</span>
                    </div>
                    <div className="text-2xl font-black">
                      {balanceVisible
                        ? `$${balances.usd.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}`
                        : "••••••"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.02))] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.14)]">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-5">
                  Profile Snapshot
                </div>

                <div className="space-y-3">
                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4 flex items-start gap-3">
                    <Mail size={16} className="text-blue-300 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm text-slate-400">Email</div>
                      <div className="font-medium break-all">{userData.email || user.email}</div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4 flex items-start gap-3">
                    <Phone size={16} className="text-blue-300 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm text-slate-400">Phone</div>
                      <div className="font-medium">{userData.phone || "-"}</div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4 flex items-start gap-3">
                    <Globe size={16} className="text-blue-300 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm text-slate-400">Country / Region</div>
                      <div className="font-medium">
                        {userData.country || "-"}
                        {userData.stateRegion ? ` / ${userData.stateRegion}` : ""}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4 flex items-start gap-3">
                    <MapPin size={16} className="text-blue-300 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm text-slate-400">Location</div>
                      <div className="font-medium">{locationText || "-"}</div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4 flex items-start gap-3">
                    <Clock3 size={16} className="text-blue-300 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm text-slate-400">Last Seen</div>
                      <div className="font-medium">
                        {formatLastSeen(userData.last_seen, userData.lastSeen)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.02))] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.14)]">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-5">
                Quick Actions
              </div>

              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  {
                    label: "Deposit",
                    icon: ArrowDownLeft,
                    cls: "bg-emerald-500/15 border-emerald-400/20 text-emerald-300"
                  },
                  {
                    label: "Withdraw",
                    icon: ArrowUpRight,
                    cls: "bg-rose-500/15 border-rose-400/20 text-rose-300"
                  },
                  {
                    label: "Transfer",
                    icon: Repeat,
                    cls: "bg-blue-500/15 border-blue-400/20 text-blue-300"
                  },
                  {
                    label: "Buy Crypto",
                    icon: CreditCard,
                    cls: "bg-amber-500/15 border-amber-400/20 text-amber-300"
                  }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      className={`rounded-[24px] border border-white/8 bg-black/20 p-5 flex items-center gap-4 hover:scale-[1.02] transition-all ${buttonFx}`}
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${item.cls}`}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="font-semibold relative z-10">{item.label}</div>
                      <ChevronRight size={16} className="ml-auto text-slate-500 relative z-10" />
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="grid xl:grid-cols-[0.9fr_1.1fr] gap-6">
              <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.02))] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.14)]">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-5">
                  Asset Allocation
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-center">
                  <div className="relative w-[220px] h-[220px] shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="3"
                      />
                      {donut.map((item, index) => (
                        <circle
                          key={index}
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="none"
                          stroke={item.color}
                          strokeWidth="3"
                          strokeDasharray={`${item.percent} ${100 - item.percent}`}
                          strokeDashoffset={-item.start}
                        />
                      ))}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-sm text-slate-400">Portfolio</div>
                      <div className="text-2xl font-black">
                        {balanceVisible
                          ? `$${totalAssets.toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
                            })}`
                          : "••••••"}
                      </div>
                    </div>
                  </div>

                  <div className="w-full space-y-3">
                    {assetRows.map((item) => (
                      <div
                        key={item.symbol}
                        className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <div>
                              <div className="font-semibold">{item.symbol}</div>
                              <div className="text-sm text-slate-400">
                                {balanceVisible ? item.amount.toFixed(item.symbol === "USDT" ? 2 : 8) : "••••••"}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-semibold">
                              {balanceVisible
                                ? `$${item.total.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}`
                                : "••••••"}
                            </div>
                            <div className="text-sm text-slate-400">
                              ${item.price.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.02))] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.14)]">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-5">
                  Live Market Prices
                </div>

                <div className="space-y-3">
                  {marketData.map((item) => (
                    <div
                      key={item.symbol}
                      className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="font-semibold">{item.symbol}</div>
                        <div className="text-sm text-slate-400">Live market feed</div>
                      </div>

                      <div className="text-right">
                        <div className="font-semibold">${item.price.toLocaleString()}</div>
                        <div
                          className={`text-sm font-medium ${
                            item.change >= 0 ? "text-emerald-300" : "text-rose-300"
                          }`}
                        >
                          {item.change >= 0 ? "+" : ""}
                          {item.change.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.02))] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.14)]">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-5">
                Recent Transactions
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="text-left text-sm text-slate-400 border-b border-white/8">
                      <th className="pb-4 font-medium">Type</th>
                      <th className="pb-4 font-medium">Asset</th>
                      <th className="pb-4 font-medium">Amount</th>
                      <th className="pb-4 font-medium">Status</th>
                      <th className="pb-4 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchedTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          No transactions found.
                        </td>
                      </tr>
                    ) : (
                      searchedTransactions.slice(0, 10).map((tx) => {
                        const asset = tx.currency || tx.asset || "-";
                        const type = tx.type || "transaction";

                        return (
                          <tr
                            key={tx.id}
                            className="border-b border-white/5 text-sm text-slate-200"
                          >
                            <td className="py-4">
                              <div className="flex items-center gap-2">
                                {type === "withdraw" ? (
                                  <ArrowUpRight size={15} className="text-rose-300" />
                                ) : (
                                  <ArrowDownLeft size={15} className="text-emerald-300" />
                                )}
                                <span className="capitalize">{type}</span>
                              </div>
                            </td>
                            <td className="py-4">{asset}</td>
                            <td className="py-4">{tx.amount || "-"}</td>
                            <td className="py-4">
                              <div
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusPill(
                                  tx.status
                                )}`}
                              >
                                {statusIcon(tx.status)}
                                <span className="capitalize">{tx.status || "unknown"}</span>
                              </div>
                            </td>
                            <td className="py-4 text-slate-400">
                              {formatDate(tx.created_at, tx.date)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
