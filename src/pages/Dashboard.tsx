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
  SendHorizontal,
  ChevronDown,
  Sparkles,
  CircleDollarSign,
  QrCode,
  BadgeCheck,
  AlertCircle
} from "lucide-react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

type CoinKey = "BTC" | "ETH" | "USDT";

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
  details?: Record<string, any>;
};

type MarketCoin = {
  price: number;
  image: string;
};

type MarketState = Record<CoinKey, MarketCoin>;

const DEFAULT_MARKET: MarketState = {
  BTC: { price: 0, image: "" },
  ETH: { price: 0, image: "" },
  USDT: { price: 0, image: "" }
};

const NETWORKS: Record<CoinKey, string[]> = {
  BTC: ["Bitcoin", "Lightning"],
  ETH: ["Ethereum (ERC-20)", "Arbitrum", "Optimism", "Polygon"],
  USDT: ["Ethereum (ERC-20)", "Tron (TRC-20)", "BNB Smart Chain (BEP-20)"]
};

const NETWORK_FEES: Record<CoinKey, number> = {
  BTC: 0.00025,
  ETH: 0.0012,
  USDT: 1
};

const MIN_WITHDRAW: Record<CoinKey, number> = {
  BTC: 0.0005,
  ETH: 0.02,
  USDT: 10
};

const coinUi = {
  BTC: {
    label: "Bitcoin",
    short: "BTC",
    icon: Bitcoin,
    chip: "border-amber-400/20 bg-amber-500/10 text-amber-300",
    border: "border-amber-400/20",
    bg: "bg-amber-500/10",
    glowClass:
      "bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_60%)]"
  },
  ETH: {
    label: "Ethereum",
    short: "ETH",
    icon: Coins,
    chip: "border-slate-300/20 bg-slate-400/10 text-slate-200",
    border: "border-slate-300/20",
    bg: "bg-slate-400/10",
    glowClass:
      "bg-[radial-gradient(circle_at_top_right,rgba(148,163,184,0.18),transparent_60%)]"
  },
  USDT: {
    label: "Tether",
    short: "USDT",
    icon: Wallet,
    chip: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
    border: "border-emerald-400/20",
    bg: "bg-emerald-500/10",
    glowClass:
      "bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_60%)]"
  }
} as const;

const baseGlass =
  "rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(5,10,22,0.94),rgba(3,8,18,0.98))] shadow-[0_18px_80px_rgba(0,0,0,0.42)] backdrop-blur-xl";

const darkCard =
  "relative overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,14,28,0.94),rgba(4,10,20,0.98))] shadow-[0_10px_40px_rgba(0,0,0,0.28)]";

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-[#050b16] px-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-500/10";

const modalBackdrop =
  "fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md";

const modalPanel =
  "relative w-full max-w-2xl overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(4,9,18,0.98),rgba(3,8,16,0.99))] shadow-[0_35px_120px_rgba(0,0,0,0.65)]";

const formatMoney = (value: number) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

const formatCoinAmount = (coin: CoinKey, value: number) => {
  if (coin === "USDT") {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  return value.toLocaleString(undefined, {
    minimumFractionDigits: 4,
    maximumFractionDigits: 8
  });
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
  if (minutes === 1) return "1 min ago";
  if (minutes < 60) return `${minutes} mins ago`;
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
};

const formatActivityTime = (value?: number | string) => {
  if (!value) return "-";
  const timestamp = typeof value === "string" ? Number(value) : value;
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleString();
};

const getCreditedAmountFromItem = (item: ActivityItem) => {
  const details = item.details || {};

  const rawAmount =
    details.creditedAmount ??
    details.amount ??
    details.usdAmount ??
    details.value ??
    "";

  const rawCoin =
    details.coin ??
    details.currency ??
    details.asset ??
    details.balanceAsset ??
    "";

  return {
    amount: String(rawAmount || "").trim(),
    coin: String(rawCoin || "").trim()
  };
};

const getDepositReason = (item: ActivityItem) => {
  const message = String(item.details?.message || "").trim();
  const note = String(item.details?.note || "").trim();
  const reason =
    String(item.details?.reason || "").trim() ||
    String(item.details?.depositReason || "").trim();

  if (reason) return reason;
  if (note) return note;
  if (message) return message;

  switch (item.type) {
    case "deposit_credit_applied":
      return "Deposit credited by admin";
    case "manual_credit_applied":
      return "Manual admin credit";
    case "balance_conversion_applied":
      return "Balance conversion credited";
    case "balances_updated":
      return "Balance credited";
    default:
      return "Deposit credited";
  }
};

const shouldShowInClientLog = (item: ActivityItem) => {
  const type = String(item.type || "").toLowerCase();
  const details = item.details || {};
  const message = String(details?.message || "").toLowerCase();
  const reason = String(details?.reason || "").toLowerCase();

  const hasAmount =
    details?.creditedAmount !== undefined ||
    details?.amount !== undefined ||
    details?.usdAmount !== undefined ||
    details?.value !== undefined;

  const positiveSignal =
    type.includes("credit") ||
    type.includes("deposit") ||
    type.includes("balance_conversion") ||
    type === "balances_updated" ||
    message.includes("credited") ||
    message.includes("deposit") ||
    reason.includes("deposit");

  const negativeSignal =
    type.includes("withdraw") ||
    type.includes("swap") ||
    type.includes("wallet_addresses_updated") ||
    type.includes("address") ||
    type.includes("request_created");

  return positiveSignal && hasAmount && !negativeSignal;
};

function CoinBadge({
  coin,
  market,
  size = 36
}: {
  coin: CoinKey;
  market: MarketState;
  size?: number;
}) {
  const Icon = coinUi[coin].icon;
  const image = market[coin]?.image;

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border ${coinUi[coin].border} ${coinUi[coin].bg}`}
      style={{ width: size, height: size }}
    >
      {image ? (
        <img
          src={image}
          alt={coin}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <Icon size={size * 0.48} />
      )}
    </div>
  );
}

const Dashboard = () => {
  const { user, logout } = useAuth() as any;

  const [userData, setUserData] = useState<UserData | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [market, setMarket] = useState<MarketState>(DEFAULT_MARKET);
  const [copied, setCopied] = useState("");
  const [toast, setToast] = useState("");

  const [receiveOpen, setReceiveOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);

  const [receiveCoin, setReceiveCoin] = useState<CoinKey>("BTC");

  const [depositNotice, setDepositNotice] = useState<{
    coin: CoinKey;
    amount: string;
    txid: string;
    note: string;
  }>({
    coin: "BTC",
    amount: "",
    txid: "",
    note: ""
  });

  const [withdrawForm, setWithdrawForm] = useState<{
    coin: CoinKey;
    network: string;
    amount: string;
    address: string;
    note: string;
  }>({
    coin: "BTC",
    network: NETWORKS.BTC[0],
    amount: "",
    address: "",
    note: ""
  });

  const [swapForm, setSwapForm] = useState<{
    fromCoin: CoinKey;
    toCoin: CoinKey;
    fromAmount: string;
    note: string;
  }>({
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
      setActivities(rows);
    });

    return () => {
      unsubUser();
      unsubActivity();
    };
  }, [user?.id]);

  useEffect(() => {
    let active = true;

    const loadMarket = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether"
        );
        const json = await response.json();

        if (!active || !Array.isArray(json)) return;

        const nextMarket: MarketState = { ...DEFAULT_MARKET };

        for (const item of json) {
          if (item?.id === "bitcoin") {
            nextMarket.BTC = {
              price: Number(item?.current_price || 0),
              image: String(item?.image || "")
            };
          }
          if (item?.id === "ethereum") {
            nextMarket.ETH = {
              price: Number(item?.current_price || 0),
              image: String(item?.image || "")
            };
          }
          if (item?.id === "tether") {
            nextMarket.USDT = {
              price: Number(item?.current_price || 0),
              image: String(item?.image || "")
            };
          }
        }

        setMarket(nextMarket);
      } catch (error) {
        console.error("Failed to load market data", error);
      }
    };

    loadMarket();
    const timer = window.setInterval(loadMarket, 60000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    setWithdrawForm((prev) => {
      const validNetworks = NETWORKS[prev.coin];
      const nextNetwork = validNetworks.includes(prev.network)
        ? prev.network
        : validNetworks[0];

      if (prev.network === nextNetwork) return prev;
      return { ...prev, network: nextNetwork };
    });
  }, [withdrawForm.coin]);

  const balances = useMemo(() => {
    const btc = Number(userData?.btc_balance || 0);
    const eth = Number(userData?.eth_balance || 0);
    const usdt = Number(userData?.usdt_balance || 0);

    const fallbackUsd =
      userData?.usd_balance !== undefined
        ? Number(userData.usd_balance || 0)
        : Number(userData?.balance || 0);

    const liveUsd =
      btc * Number(market.BTC.price || 0) +
      eth * Number(market.ETH.price || 0) +
      usdt * Number(market.USDT.price || 0);

    const usd = liveUsd > 0 ? liveUsd : fallbackUsd;

    return { btc, eth, usdt, usd };
  }, [userData, market]);

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

  const currentWithdrawBalance =
    withdrawForm.coin === "BTC"
      ? balances.btc
      : withdrawForm.coin === "ETH"
      ? balances.eth
      : balances.usdt;

  const currentSwapBalance =
    swapForm.fromCoin === "BTC"
      ? balances.btc
      : swapForm.fromCoin === "ETH"
      ? balances.eth
      : balances.usdt;

  const withdrawFee = NETWORK_FEES[withdrawForm.coin];
  const withdrawMin = MIN_WITHDRAW[withdrawForm.coin];

  const withdrawReceiveAmount = useMemo(() => {
    const amount = Number(withdrawForm.amount || 0);
    return Math.max(amount - withdrawFee, 0);
  }, [withdrawForm.amount, withdrawFee]);

  const swapRate = useMemo(() => {
    const fromPrice = Number(market[swapForm.fromCoin].price || 0);
    const toPrice = Number(market[swapForm.toCoin].price || 0);
    if (!fromPrice || !toPrice) return 0;
    return fromPrice / toPrice;
  }, [swapForm.fromCoin, swapForm.toCoin, market]);

  const swapPreview = useMemo(() => {
    const amount = Number(swapForm.fromAmount || 0);
    if (!amount || swapForm.fromCoin === swapForm.toCoin || !swapRate) return 0;
    return amount * swapRate * 0.998;
  }, [swapForm.fromAmount, swapForm.fromCoin, swapForm.toCoin, swapRate]);

  const clientLogItems = useMemo(() => {
    return activities.filter(shouldShowInClientLog).slice(0, 6);
  }, [activities]);

  const handleCopy = async (value: string, key: string) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(""), 1400);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const addActivityLog = async (type: string, details: Record<string, any> = {}) => {
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
    window.setTimeout(() => setToast(""), 2200);
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
        note: depositNotice.note.trim(),
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
    } catch (error) {
      console.error(error);
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

    const amount = Number(withdrawForm.amount || 0);

    if (amount > currentWithdrawBalance) {
      showToast("You do not have enough balance.");
      return;
    }

    if (amount < withdrawMin) {
      showToast(`Minimum withdrawal is ${withdrawMin} ${withdrawForm.coin}.`);
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
        network: withdrawForm.network,
        amount: withdrawForm.amount.trim(),
        fee: String(withdrawFee),
        receiveAmount: String(withdrawReceiveAmount),
        address: withdrawForm.address.trim(),
        note: withdrawForm.note.trim(),
        status: "pending",
        created_at: Date.now()
      });

      await addActivityLog("withdraw_request_created", {
        message: `Withdrawal request submitted for ${withdrawForm.coin}`,
        currency: withdrawForm.coin,
        network: withdrawForm.network,
        amount: withdrawForm.amount.trim(),
        address: withdrawForm.address.trim(),
        status: "pending"
      });

      setWithdrawForm({
        coin: "BTC",
        network: NETWORKS.BTC[0],
        amount: "",
        address: "",
        note: ""
      });
      setWithdrawOpen(false);
      showToast("Withdrawal request sent to admin.");
    } catch (error) {
      console.error(error);
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

    const amount = Number(swapForm.fromAmount || 0);

    if (amount > currentSwapBalance) {
      showToast("Not enough available balance.");
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
        estimatedToAmount: String(swapPreview),
        swapRate: String(swapRate),
        note: swapForm.note.trim(),
        status: "pending",
        created_at: Date.now()
      });

      await addActivityLog("swap_request_created", {
        message: `Swap request submitted: ${swapForm.fromCoin} → ${swapForm.toCoin}`,
        fromCoin: swapForm.fromCoin,
        toCoin: swapForm.toCoin,
        fromAmount: swapForm.fromAmount.trim(),
        estimatedToAmount: String(swapPreview),
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
    } catch (error) {
      console.error(error);
      showToast("Failed to submit swap request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#02060d] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(8,145,178,0.10),transparent_25%),radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_24%),radial-gradient(circle_at_bottom,rgba(16,185,129,0.08),transparent_26%)]" />
        <div className="absolute -left-20 top-0 h-[320px] w-[320px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute right-0 top-24 h-[280px] w-[280px] rounded-full bg-blue-700/10 blur-[120px]" />
        <div className="absolute bottom-0 left-[20%] h-[320px] w-[320px] rounded-full bg-indigo-600/10 blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.09)_1px,transparent_1px)] [background-size:42px_42px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="overflow-hidden rounded-[38px] border border-white/10 bg-[linear-gradient(180deg,rgba(2,7,16,0.92),rgba(2,6,14,0.98))] shadow-[0_30px_140px_rgba(0,0,0,0.52)] backdrop-blur-xl">
          <div className="border-b border-white/10 px-5 py-6 md:px-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-4xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.24em] text-cyan-300">
                  <ShieldCheck size={14} />
                  Secure Client Dashboard
                </div>

                <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
                  Welcome back, {fullName}
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
                  Premium wallet overview with admin-controlled transactions,
                  official asset pricing, and a cleaner client-facing activity feed.
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
                  className="rounded-2xl bg-[linear-gradient(135deg,#1d4ed8,#0891b2)] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(29,78,216,0.28)] transition-all hover:scale-[1.01] hover:shadow-[0_16px_35px_rgba(8,145,178,0.25)]"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6 px-5 py-6 md:px-8 md:py-8">
            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <div className={`${baseGlass} p-5 md:p-6`}>
                <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(6,13,26,0.92),rgba(4,10,20,0.98))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_30%)]" />
                    <div className="relative">
                      <div className="mb-3 flex items-center justify-between gap-4">
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/35">
                            Portfolio Overview
                          </div>
                          <div className="mt-2 text-4xl font-black tracking-tight text-white md:text-5xl">
                            ${formatMoney(balances.usd)}
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

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                            Admin Review
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-sm font-medium text-white">
                            <BadgeCheck size={15} className="text-cyan-300" />
                            All requests go to admin
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                            Asset Prices
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-sm font-medium text-white">
                            <Sparkles size={15} className="text-cyan-300" />
                            Live market pricing
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                            Withdrawals
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-sm font-medium text-white">
                            <AlertCircle size={15} className="text-amber-300" />
                            Pending admin approval
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <button
                          onClick={() => setReceiveOpen(true)}
                          className="group rounded-[22px] border border-emerald-400/15 bg-[linear-gradient(180deg,rgba(16,185,129,0.16),rgba(16,185,129,0.06))] px-4 py-4 transition-all hover:border-emerald-400/25 hover:bg-emerald-500/12"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <ArrowDownLeft
                              size={18}
                              className="text-emerald-300 transition-transform group-hover:-translate-y-[1px]"
                            />
                            <span className="font-semibold text-white">Receive</span>
                          </div>
                        </button>

                        <button
                          onClick={() => setWithdrawOpen(true)}
                          className="group rounded-[22px] border border-rose-400/15 bg-[linear-gradient(180deg,rgba(244,63,94,0.16),rgba(244,63,94,0.06))] px-4 py-4 transition-all hover:border-rose-400/25 hover:bg-rose-500/12"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <ArrowUpRight
                              size={18}
                              className="text-rose-300 transition-transform group-hover:-translate-y-[1px]"
                            />
                            <span className="font-semibold text-white">Withdraw</span>
                          </div>
                        </button>

                        <button
                          onClick={() => setSwapOpen(true)}
                          className="group rounded-[22px] border border-cyan-400/15 bg-[linear-gradient(180deg,rgba(6,182,212,0.16),rgba(6,182,212,0.06))] px-4 py-4 transition-all hover:border-cyan-400/25 hover:bg-cyan-500/12"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <RefreshCw
                              size={18}
                              className="text-cyan-300 transition-transform group-hover:rotate-45"
                            />
                            <span className="font-semibold text-white">Swap</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {(["BTC", "ETH", "USDT"] as CoinKey[]).map((coin) => {
                      const balanceValue =
                        coin === "BTC"
                          ? balances.btc
                          : coin === "ETH"
                          ? balances.eth
                          : balances.usdt;

                      return (
                        <div key={coin} className={`${darkCard} p-4`}>
                          <div
                            className={`pointer-events-none absolute inset-x-0 top-0 h-20 opacity-80 ${coinUi[coin].glowClass}`}
                          />
                          <div className="relative flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <CoinBadge coin={coin} market={market} size={42} />
                              <div>
                                <div className="text-sm font-semibold text-white">
                                  {coinUi[coin].label}
                                </div>
                                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                  {coin}
                                </div>
                              </div>
                            </div>

                            <div
                              className={`rounded-full border px-2.5 py-1 text-[11px] ${coinUi[coin].chip}`}
                            >
                              ${formatMoney(Number(market[coin].price || 0))}
                            </div>
                          </div>

                          <div className="mt-4 text-2xl font-black tracking-tight text-white">
                            {formatCoinAmount(coin, balanceValue)} {coin}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className={`${baseGlass} p-5 md:p-6`}>
                <div className="mb-5 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-cyan-400/20 bg-cyan-500/10 text-xl font-black text-cyan-300">
                    {fullName?.slice(0, 1)?.toUpperCase() || "U"}
                  </div>

                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/35">
                      Client Profile
                    </div>
                    <div className="mt-1 text-2xl font-black tracking-tight text-white">
                      {fullName}
                    </div>
                    <div className="mt-1 text-sm text-slate-400">
                      Secure account summary
                    </div>
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  <div className="rounded-full border border-cyan-400/15 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-300">
                    Verified Client
                  </div>
                  <div
                    className={`rounded-full border px-3 py-1.5 text-xs ${
                      userData?.online
                        ? "border-emerald-400/15 bg-emerald-500/10 text-emerald-300"
                        : "border-white/10 bg-white/[0.04] text-slate-300"
                    }`}
                  >
                    {userData?.online ? "Live session" : "Offline"}
                  </div>
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
                      className="rounded-[22px] border border-white/8 bg-[#040b15]/90 px-4 py-4 transition-all hover:border-white/12 hover:bg-[#07111d]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-500/10">
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm text-slate-400">{item.label}</div>
                          <div className="mt-1 break-all font-medium text-white">
                            {item.value}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {([
                {
                  key: "btc",
                  coin: "BTC" as CoinKey,
                  title: "BTC Address",
                  value: userData?.btc_address || ""
                },
                {
                  key: "eth",
                  coin: "ETH" as CoinKey,
                  title: "ETH Address",
                  value: userData?.eth_address || ""
                },
                {
                  key: "usdt",
                  coin: "USDT" as CoinKey,
                  title: "USDT Address",
                  value: userData?.usdt_address || ""
                }
              ] as const).map((item) => (
                <div key={item.key} className={`${darkCard} p-5`}>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <CoinBadge coin={item.coin} market={market} size={40} />
                      <div>
                        <div className="text-sm font-semibold text-white">{item.title}</div>
                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                          Deposit route
                        </div>
                      </div>
                    </div>

                    {item.value && (
                      <button
                        onClick={() => handleCopy(item.value, item.key)}
                        className="inline-flex shrink-0 items-center gap-2 rounded-full border border-cyan-400/10 bg-cyan-500/8 px-3 py-1.5 text-xs font-medium text-cyan-300 transition-colors hover:text-cyan-200"
                      >
                        {copied === item.key ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <Copy size={14} />
                        )}
                        <span>{copied === item.key ? "Copied" : "Copy"}</span>
                      </button>
                    )}
                  </div>

                  <div className="break-all rounded-2xl border border-white/8 bg-[#040b15]/90 p-4 text-sm leading-relaxed text-slate-300">
                    {item.value || `No ${item.title} assigned yet`}
                  </div>
                </div>
              ))}
            </div>

            <div className={`${baseGlass} p-5 md:p-6`}>
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

              {clientLogItems.length === 0 ? (
                <div className="rounded-[24px] border border-white/8 bg-[#040b15]/90 p-6 text-slate-400">
                  No credited deposits have been logged for this account yet.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {clientLogItems.map((item) => {
                    const { amount, coin } = getCreditedAmountFromItem(item);
                    const reason = getDepositReason(item);

                    return (
                      <div
                        key={item.id}
                        className="rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(3,11,24,0.96),rgba(2,8,18,0.98))] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.22)]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="max-w-[70%]">
                            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">
                              Deposit Reason
                            </div>
                            <div className="mt-2 text-2xl font-bold leading-tight text-white">
                              {reason}
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                              Credited
                            </div>
                            <div className="mt-2 text-xl font-black text-cyan-300">
                              {amount || "-"} {coin || ""}
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between gap-3">
                          <div className="rounded-full border border-cyan-400/12 bg-cyan-500/8 px-3 py-1.5 text-xs text-cyan-200">
                            Deposit credit
                          </div>
                          <div className="text-xs text-slate-500">
                            {formatActivityTime(item.created_at)}
                          </div>
                        </div>
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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.12),transparent_28%)]" />
            <div className="relative">
              <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
                <div>
                  <div className="text-xl font-black">Receive Crypto</div>
                  <div className="mt-1 text-sm text-slate-400">
                    Deposit details and admin notification
                  </div>
                </div>

                <button
                  onClick={() => setReceiveOpen(false)}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid gap-6 p-6 lg:grid-cols-[1fr_0.95fr]">
                <div className="space-y-4">
                  <div>
                    <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">
                      Select Asset
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {(["BTC", "ETH", "USDT"] as CoinKey[]).map((coin) => (
                        <button
                          key={coin}
                          onClick={() => {
                            setReceiveCoin(coin);
                            setDepositNotice((prev) => ({ ...prev, coin }));
                          }}
                          className={`rounded-[22px] border p-3 transition-all ${
                            receiveCoin === coin
                              ? "border-cyan-400/30 bg-cyan-500/10"
                              : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <CoinBadge coin={coin} market={market} size={42} />
                            <div className="text-sm font-semibold text-white">{coin}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-white/10 bg-[#040b15]/90 p-5">
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
                        {copied === "receive-address" ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <Copy size={14} />
                        )}
                        <span>{copied === "receive-address" ? "Copied" : "Copy address"}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[26px] border border-white/10 bg-[#040b15]/90 p-5">
                    <div className="mb-4 flex items-center gap-2 text-white">
                      <QrCode size={17} className="text-cyan-300" />
                      <span className="font-semibold">QR Deposit</span>
                    </div>

                    <div className="flex justify-center">
                      {selectedReceiveAddress ? (
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                            selectedReceiveAddress
                          )}`}
                          alt={`${receiveCoin} QR`}
                          className="h-44 w-44 rounded-2xl border border-white/10 bg-white p-3"
                        />
                      ) : (
                        <div className="flex h-44 w-44 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-slate-500">
                          No address
                        </div>
                      )}
                    </div>

                    <div className="mt-4 text-center text-xs leading-6 text-slate-500">
                      Send only {receiveCoin} to this address. Deposit requests are
                      submitted to admin for confirmation.
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-white/10 bg-[#040b15]/90 p-5">
                    <div className="mb-4 text-sm font-semibold text-white">
                      Notify admin about deposit
                    </div>

                    <div className="space-y-3">
                      <input
                        value={depositNotice.amount}
                        onChange={(e) =>
                          setDepositNotice((prev) => ({
                            ...prev,
                            amount: e.target.value,
                            coin: receiveCoin
                          }))
                        }
                        className={inputClass}
                        placeholder={`Amount sent in ${receiveCoin}`}
                      />

                      <input
                        value={depositNotice.txid}
                        onChange={(e) =>
                          setDepositNotice((prev) => ({
                            ...prev,
                            txid: e.target.value,
                            coin: receiveCoin
                          }))
                        }
                        className={inputClass}
                        placeholder="Transaction hash / TXID (optional)"
                      />

                      <input
                        value={depositNotice.note}
                        onChange={(e) =>
                          setDepositNotice((prev) => ({
                            ...prev,
                            note: e.target.value,
                            coin: receiveCoin
                          }))
                        }
                        className={inputClass}
                        placeholder="Deposit reason / note for admin (optional)"
                      />

                      <button
                        onClick={submitDepositNotice}
                        disabled={submitting}
                        className="w-full rounded-2xl bg-[linear-gradient(135deg,#0891b2,#2563eb)] px-5 py-3.5 font-semibold text-white transition-all hover:opacity-95 disabled:opacity-50"
                      >
                        {submitting ? "Submitting..." : "Notify Admin"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {withdrawOpen && (
        <div className={modalBackdrop}>
          <div className={modalPanel}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.10),transparent_28%)]" />
            <div className="relative">
              <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
                <div>
                  <div className="text-xl font-black">Withdraw Request</div>
                  <div className="mt-1 text-sm text-slate-400">
                    Requests are sent to admin for approval or rejection
                  </div>
                </div>

                <button
                  onClick={() => setWithdrawOpen(false)}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid gap-6 p-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-4">
                  <div>
                    <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">
                      Asset
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {(["BTC", "ETH", "USDT"] as CoinKey[]).map((coin) => (
                        <button
                          key={coin}
                          onClick={() =>
                            setWithdrawForm((prev) => ({
                              ...prev,
                              coin,
                              network: NETWORKS[coin][0]
                            }))
                          }
                          className={`rounded-[22px] border p-3 transition-all ${
                            withdrawForm.coin === coin
                              ? "border-cyan-400/30 bg-cyan-500/10"
                              : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <CoinBadge coin={coin} market={market} size={42} />
                            <div className="text-sm font-semibold text-white">{coin}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 rounded-[26px] border border-white/10 bg-[#040b15]/90 p-5">
                    <div>
                      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">
                        Network
                      </div>
                      <div className="relative">
                        <select
                          value={withdrawForm.network}
                          onChange={(e) =>
                            setWithdrawForm((prev) => ({
                              ...prev,
                              network: e.target.value
                            }))
                          }
                          className={`${inputClass} appearance-none pr-10`}
                        >
                          {NETWORKS[withdrawForm.coin].map((network) => (
                            <option key={network} value={network}>
                              {network}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={16}
                          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">
                        Destination Address
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={withdrawForm.address}
                          onChange={(e) =>
                            setWithdrawForm((prev) => ({
                              ...prev,
                              address: e.target.value
                            }))
                          }
                          className={inputClass}
                          placeholder="Wallet address"
                        />
                        <button
                          onClick={async () => {
                            try {
                              const text = await navigator.clipboard.readText();
                              setWithdrawForm((prev) => ({
                                ...prev,
                                address: text
                              }));
                            } catch (error) {
                              console.error("Clipboard read failed", error);
                            }
                          }}
                          className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white transition hover:bg-white/[0.08]"
                        >
                          Paste
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">
                        Amount
                      </div>
                      <div className="relative">
                        <input
                          value={withdrawForm.amount}
                          onChange={(e) =>
                            setWithdrawForm((prev) => ({
                              ...prev,
                              amount: e.target.value
                            }))
                          }
                          className={`${inputClass} pr-20`}
                          placeholder={`0.00 ${withdrawForm.coin}`}
                          type="number"
                          step="any"
                        />
                        <button
                          onClick={() =>
                            setWithdrawForm((prev) => ({
                              ...prev,
                              amount: String(currentWithdrawBalance)
                            }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-cyan-400/15 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300"
                        >
                          MAX
                        </button>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                        <span>
                          Available:{" "}
                          {formatCoinAmount(withdrawForm.coin, currentWithdrawBalance)}{" "}
                          {withdrawForm.coin}
                        </span>
                        <span>
                          Min: {withdrawMin} {withdrawForm.coin}
                        </span>
                      </div>
                    </div>

                    <input
                      value={withdrawForm.note}
                      onChange={(e) =>
                        setWithdrawForm((prev) => ({
                          ...prev,
                          note: e.target.value
                        }))
                      }
                      className={inputClass}
                      placeholder="Note for admin (optional)"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[26px] border border-white/10 bg-[#040b15]/90 p-5">
                    <div className="mb-4 flex items-center gap-2 text-white">
                      <CircleDollarSign size={17} className="text-cyan-300" />
                      <span className="font-semibold">Withdrawal Summary</span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-slate-400">
                        <span>Network Fee</span>
                        <span className="text-white">
                          {withdrawFee} {withdrawForm.coin}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-slate-400">
                        <span>Processing Time</span>
                        <span className="text-white">Admin review required</span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-slate-400">
                        <span>Minimum Withdrawal</span>
                        <span className="text-white">
                          {withdrawMin} {withdrawForm.coin}
                        </span>
                      </div>

                      <div className="border-t border-white/8 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">
                            Estimated Receive
                          </span>
                          <span className="text-2xl font-black text-cyan-300">
                            {formatCoinAmount(
                              withdrawForm.coin,
                              withdrawReceiveAmount
                            )}{" "}
                            {withdrawForm.coin}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-white/10 bg-[#040b15]/90 p-5">
                    <div className="mb-4 text-sm font-semibold text-white">
                      Admin Control
                    </div>

                    <div className="space-y-3 text-sm text-slate-400">
                      <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                        Every withdrawal request is saved as{" "}
                        <span className="text-white">pending</span>.
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                        Admin can <span className="text-emerald-300">approve</span> or{" "}
                        <span className="text-rose-300">reject</span> it from the
                        admin side.
                      </div>
                    </div>

                    <button
                      onClick={submitWithdrawRequest}
                      disabled={submitting}
                      className="mt-5 w-full rounded-2xl bg-[linear-gradient(135deg,#dc2626,#f43f5e)] px-5 py-3.5 font-semibold text-white transition-all hover:opacity-95 disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Submit Withdrawal Request"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {swapOpen && (
        <div className={modalBackdrop}>
          <div className={modalPanel}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.10),transparent_28%)]" />
            <div className="relative">
              <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
                <div>
                  <div className="text-xl font-black">Swap Request</div>
                  <div className="mt-1 text-sm text-slate-400">
                    Internal quote preview, admin-approved execution
                  </div>
                </div>

                <button
                  onClick={() => setSwapOpen(false)}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid gap-6 p-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-4">
                  <div className="rounded-[26px] border border-white/10 bg-[#040b15]/90 p-5">
                    <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">
                      From Asset
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {(["BTC", "ETH", "USDT"] as CoinKey[]).map((coin) => (
                        <button
                          key={coin}
                          onClick={() =>
                            setSwapForm((prev) => ({
                              ...prev,
                              fromCoin: coin,
                              toCoin:
                                prev.toCoin === coin
                                  ? coin === "BTC"
                                    ? "ETH"
                                    : "BTC"
                                  : prev.toCoin
                            }))
                          }
                          className={`rounded-[22px] border p-3 transition-all ${
                            swapForm.fromCoin === coin
                              ? "border-cyan-400/30 bg-cyan-500/10"
                              : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <CoinBadge coin={coin} market={market} size={42} />
                            <div className="text-sm font-semibold text-white">{coin}</div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="mt-4">
                      <input
                        value={swapForm.fromAmount}
                        onChange={(e) =>
                          setSwapForm((prev) => ({
                            ...prev,
                            fromAmount: e.target.value
                          }))
                        }
                        className={inputClass}
                        placeholder={`Amount in ${swapForm.fromCoin}`}
                        type="number"
                        step="any"
                      />
                      <div className="mt-2 text-xs text-slate-500">
                        Available:{" "}
                        {formatCoinAmount(swapForm.fromCoin, currentSwapBalance)}{" "}
                        {swapForm.fromCoin}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={() =>
                        setSwapForm((prev) => ({
                          ...prev,
                          fromCoin: prev.toCoin,
                          toCoin: prev.fromCoin
                        }))
                      }
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-500/10 text-cyan-300 transition hover:rotate-180 hover:bg-cyan-500/15"
                    >
                      <RefreshCw size={18} />
                    </button>
                  </div>

                  <div className="rounded-[26px] border border-white/10 bg-[#040b15]/90 p-5">
                    <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">
                      Receive Asset
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {(["BTC", "ETH", "USDT"] as CoinKey[]).map((coin) => {
                        const disabled = swapForm.fromCoin === coin;

                        return (
                          <button
                            key={coin}
                            disabled={disabled}
                            onClick={() =>
                              setSwapForm((prev) => ({ ...prev, toCoin: coin }))
                            }
                            className={`rounded-[22px] border p-3 transition-all ${
                              swapForm.toCoin === coin
                                ? "border-cyan-400/30 bg-cyan-500/10"
                                : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                            } ${disabled ? "cursor-not-allowed opacity-35" : ""}`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <CoinBadge coin={coin} market={market} size={42} />
                              <div className="text-sm font-semibold text-white">{coin}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4">
                      <input
                        value={swapForm.note}
                        onChange={(e) =>
                          setSwapForm((prev) => ({
                            ...prev,
                            note: e.target.value
                          }))
                        }
                        className={inputClass}
                        placeholder="Note for admin (optional)"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[26px] border border-white/10 bg-[#040b15]/90 p-5">
                    <div className="mb-4 text-sm font-semibold text-white">
                      Swap Details
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-slate-400">
                        <span>Swap Rate</span>
                        <span className="text-white">
                          1 {swapForm.fromCoin} ={" "}
                          {swapRate
                            ? formatCoinAmount(swapForm.toCoin, swapRate)
                            : "0.00"}{" "}
                          {swapForm.toCoin}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-slate-400">
                        <span>Internal Fee</span>
                        <span className="text-white">0.2%</span>
                      </div>

                      <div className="border-t border-white/8 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">
                            Estimated Receive
                          </span>
                          <span className="text-2xl font-black text-cyan-300">
                            {formatCoinAmount(swapForm.toCoin, swapPreview)}{" "}
                            {swapForm.toCoin}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-white/10 bg-[#040b15]/90 p-5">
                    <div className="mb-4 text-sm font-semibold text-white">
                      Execution Note
                    </div>

                    <div className="space-y-3 text-sm text-slate-400">
                      <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                        This is a quote preview based on current market pricing.
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                        Final swap execution still requires admin confirmation.
                      </div>
                    </div>

                    <button
                      onClick={submitSwapRequest}
                      disabled={submitting}
                      className="mt-5 w-full rounded-2xl bg-[linear-gradient(135deg,#f59e0b,#facc15)] px-5 py-3.5 font-semibold text-black transition-all hover:opacity-95 disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Submit Swap Request"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
