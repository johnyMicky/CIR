import React, { useEffect, useMemo, useState } from "react";
import { ref, onValue, push, set } from "firebase/database";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Bitcoin,
  Coins,
  Wallet,
  Landmark,
  Mail,
  Phone,
  Globe,
  MapPin,
  Wifi,
  WifiOff,
  Clock3,
  Copy,
  CheckCircle2,
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  X,
  SendHorizontal
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
};

type ActivityItem = {
  id: string;
  type?: string;
  page?: string;
  created_at?: number | string;
  details?: any;
};

const COIN_PRICES = {
  BTC: 65000,
  ETH: 3500,
  USDT: 1
};

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

const formatActivityTime = (value?: number | string) => {
  if (!value) return "-";
  const timestamp = typeof value === "string" ? Number(value) : value;
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleString();
};

const getActivityTitle = (item: ActivityItem) => {
  if (item.details?.message) return item.details.message;

  switch (item.type) {
    case "deposit_notice_created":
      return "Deposit notice submitted";
    case "withdraw_request_created":
      return "Withdrawal request submitted";
    case "swap_request_created":
      return "Swap request submitted";
    case "wallet_addresses_updated":
      return "Wallet addresses updated";
    case "balances_updated":
      return "Balances updated";
    case "balance_conversion_applied":
      return "Balance conversion applied";
    default:
      return item.type || "Activity";
  }
};

const getActivityMeta = (item: ActivityItem) => {
  if (!item.details) return [];

  const meta: string[] = [];

  if (item.details.coin) meta.push(`Coin: ${item.details.coin}`);
  if (item.details.currency) meta.push(`Currency: ${item.details.currency}`);
  if (item.details.amount) meta.push(`Amount: ${item.details.amount}`);
  if (item.details.address) meta.push("Address submitted");
  if (item.details.fromCoin) meta.push(`From: ${item.details.fromCoin}`);
  if (item.details.toCoin) meta.push(`To: ${item.details.toCoin}`);
  if (item.details.fromAmount) meta.push(`Amount: ${item.details.fromAmount}`);
  if (item.details.estimatedToAmount) meta.push(`Est.: ${item.details.estimatedToAmount}`);
  if (item.details.status) meta.push(`Status: ${item.details.status}`);

  return meta;
};

const cardClass =
  "group relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.22)] transition-all duration-300 hover:border-white/15 hover:bg-white/[0.05] hover:-translate-y-[2px]";
const inputClass =
  "w-full rounded-2xl bg-[#07111f] border border-white/10 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/10";
const modalBackdrop =
  "fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4";
const modalPanel =
  "w-full max-w-xl rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_30%),linear-gradient(180deg,rgba(8,15,31,0.98),rgba(4,9,20,0.98))] shadow-[0_30px_90px_rgba(0,0,0,0.6)] overflow-hidden";

const statIconWrap =
  "w-14 h-14 rounded-[18px] border flex items-center justify-center shrink-0";
const sectionGlass =
  "rounded-[30px] border border-white/10 bg-white/[0.035] backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)]";

const Dashboard = () => {
  const { user, logout } = useAuth() as any;
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [copied, setCopied] = useState("");
  const [toast, setToast] = useState("");

  const [receiveOpen, setReceiveOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);

  const [receiveCoin, setReceiveCoin] = useState<"BTC" | "ETH" | "USDT">("BTC");
  const [depositNotice, setDepositNotice] = useState({
    coin: "BTC",
    amount: "",
    txid: "",
    note: ""
  });

  const [withdrawForm, setWithdrawForm] = useState({
    coin: "BTC",
    amount: "",
    address: "",
    note: ""
  });

  const [swapForm, setSwapForm] = useState({
    fromCoin: "BTC",
    toCoin: "USDT",
    fromAmount: "",
    note: ""
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const userRef = ref(db, `users/${user.id}`);
    const activityRef = ref(db, `activity_logs/${user.id}`);

    const unsubUser = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserData(snapshot.val());
      } else {
        setUserData(null);
      }
    });

    const unsubActivity = onValue(activityRef, (snapshot) => {
      if (!snapshot.exists()) {
        setActivities([]);
        return;
      }

      const data = snapshot.val();
      const rows = Object.entries(data).map(([activityId, value]) => ({
        id: activityId,
        ...(value as any)
      })) as ActivityItem[];

      rows.sort((a, b) => Number(b.created_at || 0) - Number(a.created_at || 0));
      setActivities(rows.slice(0, 8));
    });

    return () => {
      unsubUser();
      unsubActivity();
    };
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

  const locationText = [userData?.city, userData?.stateRegion, userData?.country]
    .filter(Boolean)
    .join(", ");

  const selectedReceiveAddress =
    receiveCoin === "BTC"
      ? userData?.btc_address || ""
      : receiveCoin === "ETH"
      ? userData?.eth_address || ""
      : userData?.usdt_address || "";

  const swapPreview = useMemo(() => {
    const amount = Number(swapForm.fromAmount || 0);
    if (!amount || swapForm.fromCoin === swapForm.toCoin) return "0.00";

    const fromPrice = COIN_PRICES[swapForm.fromCoin as keyof typeof COIN_PRICES] || 1;
    const toPrice = COIN_PRICES[swapForm.toCoin as keyof typeof COIN_PRICES] || 1;
    const result = (amount * fromPrice) / toPrice;
    return swapForm.toCoin === "USDT" ? result.toFixed(2) : result.toFixed(8);
  }, [swapForm]);

  const handleCopy = async (value: string, key: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(""), 1400);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

  const addActivityLog = async (type: string, details: any = {}) => {
    if (!user?.id) return;

    const logRef = push(ref(db, `activity_logs/${user.id}`));
    await set(logRef, {
      type,
      page: "/dashboard",
      details,
      created_at: Date.now()
    });
  };

  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(""), 2000);
  };

  const submitDepositNotice = async () => {
    if (!user?.id) return;
    if (!depositNotice.amount.trim()) {
      showToast("Enter deposit amount.");
      return;
    }

    setSubmitting(true);
    try {
      const requestRef = push(ref(db, "deposit_requests"));
      await set(requestRef, {
        userId: user.id,
        fullName,
        email: userData?.email || user?.email || "",
        coin: depositNotice.coin,
        amount: depositNotice.amount.trim(),
        txid: depositNotice.txid.trim(),
        note: depositNotice.note.trim(),
        address:
          depositNotice.coin === "BTC"
            ? userData?.btc_address || ""
            : depositNotice.coin === "ETH"
            ? userData?.eth_address || ""
            : userData?.usdt_address || "",
        status: "pending",
        created_at: Date.now()
      });

      await addActivityLog("deposit_notice_created", {
        message: `Deposit notice submitted for ${depositNotice.coin}`,
        coin: depositNotice.coin,
        amount: depositNotice.amount.trim(),
        txid: depositNotice.txid.trim(),
        status: "pending"
      });

      setDepositNotice({
        coin: "BTC",
        amount: "",
        txid: "",
        note: ""
      });
      setReceiveOpen(false);
      showToast("Deposit request sent to admin.");
    } catch (e) {
      console.error(e);
      showToast("Failed to submit deposit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitWithdrawRequest = async () => {
    if (!user?.id) return;
    if (!withdrawForm.amount.trim() || !withdrawForm.address.trim()) {
      showToast("Fill amount and destination address.");
      return;
    }

    setSubmitting(true);
    try {
      const requestRef = push(ref(db, "transactions"));
      await set(requestRef, {
        userId: user.id,
        fullName,
        email: userData?.email || user?.email || "",
        type: "withdraw",
        currency: withdrawForm.coin,
        amount: withdrawForm.amount.trim(),
        address: withdrawForm.address.trim(),
        note: withdrawForm.note.trim(),
        status: "pending",
        created_at: Date.now()
      });

      await addActivityLog("withdraw_request_created", {
        message: `Withdrawal request submitted for ${withdrawForm.coin}`,
        currency: withdrawForm.coin,
        amount: withdrawForm.amount.trim(),
        address: withdrawForm.address.trim(),
        status: "pending"
      });

      setWithdrawForm({
        coin: "BTC",
        amount: "",
        address: "",
        note: ""
      });
      setWithdrawOpen(false);
      showToast("Withdrawal request sent to admin.");
    } catch (e) {
      console.error(e);
      showToast("Failed to submit withdrawal request.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitSwapRequest = async () => {
    if (!user?.id) return;
    if (!swapForm.fromAmount.trim()) {
      showToast("Enter swap amount.");
      return;
    }
    if (swapForm.fromCoin === swapForm.toCoin) {
      showToast("Choose different assets.");
      return;
    }

    setSubmitting(true);
    try {
      const requestRef = push(ref(db, "swap_requests"));
      await set(requestRef, {
        userId: user.id,
        fullName,
        email: userData?.email || user?.email || "",
        fromCoin: swapForm.fromCoin,
        toCoin: swapForm.toCoin,
        fromAmount: swapForm.fromAmount.trim(),
        estimatedToAmount: swapPreview,
        note: swapForm.note.trim(),
        status: "pending",
        created_at: Date.now()
      });

      await addActivityLog("swap_request_created", {
        message: `Swap request submitted: ${swapForm.fromCoin} → ${swapForm.toCoin}`,
        fromCoin: swapForm.fromCoin,
        toCoin: swapForm.toCoin,
        fromAmount: swapForm.fromAmount.trim(),
        estimatedToAmount: swapPreview,
        status: "pending"
      });

      setSwapForm({
        fromCoin: "BTC",
        toCoin: "USDT",
        fromAmount: "",
        note: ""
      });
      setSwapOpen(false);
      showToast("Swap request sent to admin.");
    } catch (e) {
      console.error(e);
      showToast("Failed to submit swap request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030712] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.16),transparent_26%),radial-gradient(circle_at_bottom,rgba(16,185,129,0.10),transparent_30%)]" />
        <div className="absolute top-[-140px] left-[-80px] h-[320px] w-[320px] rounded-full bg-cyan-500/10 blur-[110px]" />
        <div className="absolute right-[-60px] top-[90px] h-[260px] w-[260px] rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute bottom-[-140px] left-[20%] h-[320px] w-[320px] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:36px_36px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(4,10,22,0.90),rgba(4,8,18,0.96))] shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="border-b border-white/10 px-5 py-6 md:px-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.24em] text-cyan-300">
                  <ShieldCheck size={14} />
                  Secure Client Dashboard
                </div>

                <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
                  Welcome back, {fullName}
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
                  Manage your portfolio, submit requests, and monitor recent account
                  activity through a cleaner premium crypto dashboard interface.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/"
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-slate-200 transition-all hover:bg-white/[0.08]"
                >
                  Back Home
                </Link>

                <button
                  onClick={logout}
                  className="rounded-2xl bg-[linear-gradient(135deg,#2563eb,#06b6d4)] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(37,99,235,0.28)] transition-all hover:scale-[1.01] hover:shadow-[0_16px_35px_rgba(6,182,212,0.20)]"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6 px-5 py-6 md:px-8 md:py-8">
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className={`${sectionGlass} p-5 md:p-6`}>
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-white/35">
                      Portfolio Overview
                    </div>

                    <div className="bg-[linear-gradient(90deg,#ffffff,#7dd3fc)] bg-clip-text text-4xl font-black tracking-tight text-transparent md:text-5xl">
                      $
                      {balances.usd.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </div>

                    <div className="mt-3 text-sm text-slate-400">
                      Total visible wallet value
                    </div>
                  </div>

                  <div
                    className={`inline-flex w-fit items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm ${
                      userData?.online
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                        : "border-white/10 bg-white/[0.04] text-slate-300"
                    }`}
                  >
                    {userData?.online ? <Wifi size={16} /> : <WifiOff size={16} />}
                    <span>{userData?.online ? "Online" : "Offline"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                  <div className={cardClass}>
                    <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-amber-400/10 blur-2xl" />
                    <div className="mb-4 flex items-center gap-3">
                      <div className={`${statIconWrap} border-amber-400/20 bg-amber-500/10 text-amber-300`}>
                        <Bitcoin size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          BTC Balance
                        </div>
                        <div className="mt-1 text-sm text-slate-400">Bitcoin wallet</div>
                      </div>
                    </div>
                    <div className="break-all text-3xl font-black tracking-tight">
                      {balances.btc.toFixed(8)}
                    </div>
                  </div>

                  <div className={cardClass}>
                    <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-slate-300/5 blur-2xl" />
                    <div className="mb-4 flex items-center gap-3">
                      <div className={`${statIconWrap} border-slate-400/20 bg-slate-500/10 text-slate-300`}>
                        <Coins size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          ETH Balance
                        </div>
                        <div className="mt-1 text-sm text-slate-400">Ethereum wallet</div>
                      </div>
                    </div>
                    <div className="break-all text-3xl font-black tracking-tight">
                      {balances.eth.toFixed(8)}
                    </div>
                  </div>

                  <div className={cardClass}>
                    <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl" />
                    <div className="mb-4 flex items-center gap-3">
                      <div className={`${statIconWrap} border-emerald-400/20 bg-emerald-500/10 text-emerald-300`}>
                        <Wallet size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          USDT Balance
                        </div>
                        <div className="mt-1 text-sm text-slate-400">Stablecoin wallet</div>
                      </div>
                    </div>
                    <div className="break-all text-3xl font-black tracking-tight">
                      {balances.usdt.toFixed(2)}
                    </div>
                  </div>

                  <div className={cardClass}>
                    <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl" />
                    <div className="mb-4 flex items-center gap-3">
                      <div className={`${statIconWrap} border-cyan-400/20 bg-cyan-500/10 text-cyan-300`}>
                        <Landmark size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          USD Balance
                        </div>
                        <div className="mt-1 text-sm text-slate-400">Fiat summary</div>
                      </div>
                    </div>
                    <div className="break-all text-3xl font-black tracking-tight">
                      $
                      {balances.usd.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <button
                    onClick={() => setReceiveOpen(true)}
                    className="group rounded-[22px] border border-emerald-400/15 bg-emerald-500/8 px-4 py-4 transition-all hover:border-emerald-400/25 hover:bg-emerald-500/12"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ArrowDownLeft size={18} className="text-emerald-300 transition-transform group-hover:-translate-y-[1px]" />
                      <span className="font-semibold text-white">Receive</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setWithdrawOpen(true)}
                    className="group rounded-[22px] border border-rose-400/15 bg-rose-500/8 px-4 py-4 transition-all hover:border-rose-400/25 hover:bg-rose-500/12"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ArrowUpRight size={18} className="text-rose-300 transition-transform group-hover:translate-y-[-1px]" />
                      <span className="font-semibold text-white">Withdraw</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setSwapOpen(true)}
                    className="group rounded-[22px] border border-cyan-400/15 bg-cyan-500/8 px-4 py-4 transition-all hover:border-cyan-400/25 hover:bg-cyan-500/12"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw size={18} className="text-cyan-300 transition-transform group-hover:rotate-45" />
                      <span className="font-semibold text-white">Swap</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className={`${sectionGlass} p-5 md:p-6`}>
                <div className="mb-5 text-[11px] font-bold uppercase tracking-[0.24em] text-white/35">
                  Client Profile
                </div>

                <div className="space-y-3">
                  {[
                    {
                      icon: <Mail size={16} className="text-cyan-300" />,
                      label: "Email",
                      value: userData?.email || user?.email || "-"
                    },
                    {
                      icon: <Phone size={16} className="text-cyan-300" />,
                      label: "Phone",
                      value: userData?.phone || "-"
                    },
                    {
                      icon: <Globe size={16} className="text-cyan-300" />,
                      label: "Country / Region",
                      value: `${userData?.country || "-"}${
                        userData?.stateRegion ? ` / ${userData.stateRegion}` : ""
                      }`
                    },
                    {
                      icon: <MapPin size={16} className="text-cyan-300" />,
                      label: "Location",
                      value: locationText || "-"
                    },
                    {
                      icon: <Clock3 size={16} className="text-cyan-300" />,
                      label: "Last Seen",
                      value: formatLastSeen(userData?.last_seen, userData?.lastSeen)
                    }
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="rounded-[22px] border border-white/8 bg-[#07111f]/80 px-4 py-4 transition-all hover:border-white/12 hover:bg-[#0a1628]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-500/10 shrink-0">
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm text-slate-400">{item.label}</div>
                          <div className="mt-1 break-all font-medium text-white">{item.value}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {[
                { key: "btc", title: "BTC Address", value: userData?.btc_address || "" },
                { key: "eth", title: "ETH Address", value: userData?.eth_address || "" },
                { key: "usdt", title: "USDT Address", value: userData?.usdt_address || "" }
              ].map((item) => (
                <div key={item.key} className={cardClass}>
                  <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-cyan-400/5 blur-2xl" />
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">
                      {item.title}
                    </div>

                    {item.value && (
                      <button
                        onClick={() => handleCopy(item.value, item.key)}
                        className="inline-flex shrink-0 items-center gap-2 text-xs font-medium text-cyan-300 transition-colors hover:text-cyan-200"
                      >
                        {copied === item.key ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                        <span>{copied === item.key ? "Copied" : "Copy"}</span>
                      </button>
                    )}
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-[#07111f]/80 p-4 text-sm leading-relaxed text-slate-300 break-all">
                    {item.value || `No ${item.title} assigned yet`}
                  </div>
                </div>
              ))}
            </div>

            <div className={`${sectionGlass} p-5 md:p-6`}>
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-violet-400/20 bg-violet-500/10 text-violet-300">
                  <Activity size={20} />
                </div>
                <div>
                  <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">
                    Activity
                  </div>
                  <div className="text-2xl font-black tracking-tight text-white">
                    Recent Client Log
                  </div>
                </div>
              </div>

              {activities.length === 0 ? (
                <div className="rounded-[22px] border border-white/8 bg-[#07111f]/80 p-5 text-slate-400">
                  No recent activity found for this account yet.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {activities.map((item) => {
                    const meta = getActivityMeta(item);

                    return (
                      <div
                        key={item.id}
                        className="rounded-[24px] border border-white/8 bg-[#07111f]/80 p-4 transition-all hover:border-white/12 hover:bg-[#0b1729]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="font-semibold leading-relaxed text-white">
                            {getActivityTitle(item)}
                          </div>
                          <div className="shrink-0 text-xs text-slate-500">
                            {formatActivityTime(item.created_at)}
                          </div>
                        </div>

                        <div className="mt-2 text-sm text-slate-500">
                          {item.page || "/dashboard"}
                        </div>

                        {meta.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {meta.map((entry, index) => (
                              <div
                                key={index}
                                className="rounded-full border border-cyan-400/10 bg-cyan-500/8 px-3 py-1.5 text-xs text-slate-200"
                              >
                                {entry}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-emerald-300 shadow-[0_14px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          {toast}
        </div>
      )}

      {receiveOpen && (
        <div className={modalBackdrop}>
          <div className={modalPanel}>
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
              <div className="text-xl font-black">Receive Crypto</div>
              <button onClick={() => setReceiveOpen(false)} className="text-slate-400 transition-colors hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid grid-cols-3 gap-3">
                {["BTC", "ETH", "USDT"].map((coin) => (
                  <button
                    key={coin}
                    onClick={() => setReceiveCoin(coin as "BTC" | "ETH" | "USDT")}
                    className={`rounded-2xl border px-4 py-3 font-semibold transition-all ${
                      receiveCoin === coin
                        ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-300"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.05]"
                    }`}
                  >
                    {coin}
                  </button>
                ))}
              </div>

              <div className="rounded-[24px] border border-white/8 bg-[#07111f]/80 p-5">
                <div className="mb-3 flex items-center gap-2 text-slate-300">
                  <SendHorizontal size={16} />
                  <span className="font-medium">{receiveCoin} Deposit Address</span>
                </div>

                <div className="break-all rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-slate-200">
                  {selectedReceiveAddress || `No ${receiveCoin} address assigned yet`}
                </div>

                {selectedReceiveAddress && (
                  <button
                    onClick={() => handleCopy(selectedReceiveAddress, "receive-address")}
                    className="mt-3 inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200"
                  >
                    {copied === "receive-address" ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                    <span>{copied === "receive-address" ? "Copied" : "Copy address"}</span>
                  </button>
                )}
              </div>

              <div className="space-y-4 rounded-[24px] border border-white/8 bg-[#07111f]/80 p-5">
                <div className="text-sm font-semibold text-white">Send deposit notice to admin</div>

                <input
                  value={depositNotice.amount}
                  onChange={(e) => setDepositNotice((p) => ({ ...p, amount: e.target.value, coin: receiveCoin }))}
                  className={inputClass}
                  placeholder={`Amount sent in ${receiveCoin}`}
                />

                <input
                  value={depositNotice.txid}
                  onChange={(e) => setDepositNotice((p) => ({ ...p, txid: e.target.value, coin: receiveCoin }))}
                  className={inputClass}
                  placeholder="Transaction hash / TXID (optional)"
                />

                <input
                  value={depositNotice.note}
                  onChange={(e) => setDepositNotice((p) => ({ ...p, note: e.target.value, coin: receiveCoin }))}
                  className={inputClass}
                  placeholder="Note for admin (optional)"
                />

                <button
                  onClick={submitDepositNotice}
                  disabled={submitting}
                  className="w-full rounded-2xl bg-[linear-gradient(135deg,#2563eb,#06b6d4)] px-5 py-3.5 font-semibold text-white transition-all hover:opacity-95 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Notify Admin"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {withdrawOpen && (
        <div className={modalBackdrop}>
          <div className={modalPanel}>
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
              <div className="text-xl font-black">Withdraw Request</div>
              <button onClick={() => setWithdrawOpen(false)} className="text-slate-400 transition-colors hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <select
                value={withdrawForm.coin}
                onChange={(e) => setWithdrawForm((p) => ({ ...p, coin: e.target.value }))}
                className={inputClass}
              >
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
                <option value="USDT">USDT</option>
              </select>

              <input
                value={withdrawForm.amount}
                onChange={(e) => setWithdrawForm((p) => ({ ...p, amount: e.target.value }))}
                className={inputClass}
                placeholder="Amount"
              />

              <input
                value={withdrawForm.address}
                onChange={(e) => setWithdrawForm((p) => ({ ...p, address: e.target.value }))}
                className={inputClass}
                placeholder="Destination wallet address"
              />

              <input
                value={withdrawForm.note}
                onChange={(e) => setWithdrawForm((p) => ({ ...p, note: e.target.value }))}
                className={inputClass}
                placeholder="Note for admin"
              />

              <button
                onClick={submitWithdrawRequest}
                disabled={submitting}
                className="w-full rounded-2xl bg-[linear-gradient(135deg,#ef4444,#fb7185)] px-5 py-3.5 font-semibold text-white transition-all hover:opacity-95 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Withdrawal Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {swapOpen && (
        <div className={modalBackdrop}>
          <div className={modalPanel}>
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
              <div className="text-xl font-black">Swap Request</div>
              <button onClick={() => setSwapOpen(false)} className="text-slate-400 transition-colors hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={swapForm.fromCoin}
                  onChange={(e) => setSwapForm((p) => ({ ...p, fromCoin: e.target.value }))}
                  className={inputClass}
                >
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="USDT">USDT</option>
                </select>

                <select
                  value={swapForm.toCoin}
                  onChange={(e) => setSwapForm((p) => ({ ...p, toCoin: e.target.value }))}
                  className={inputClass}
                >
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="USDT">USDT</option>
                </select>
              </div>

              <input
                value={swapForm.fromAmount}
                onChange={(e) => setSwapForm((p) => ({ ...p, fromAmount: e.target.value }))}
                className={inputClass}
                placeholder={`Amount in ${swapForm.fromCoin}`}
              />

              <div className="rounded-2xl border border-white/8 bg-[#07111f]/80 p-4">
                <div className="mb-2 text-sm text-slate-400">Estimated receive</div>
                <div className="text-2xl font-black text-white">
                  {swapPreview} {swapForm.toCoin}
                </div>
              </div>

              <input
                value={swapForm.note}
                onChange={(e) => setSwapForm((p) => ({ ...p, note: e.target.value }))}
                className={inputClass}
                placeholder="Note for admin"
              />

              <button
                onClick={submitSwapRequest}
                disabled={submitting}
                className="w-full rounded-2xl bg-[linear-gradient(135deg,#f59e0b,#facc15)] px-5 py-3.5 font-semibold text-black transition-all hover:opacity-95 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Swap Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
