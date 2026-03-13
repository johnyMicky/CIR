import React, { useEffect, useMemo, useRef, useState } from "react";
import { ref, onValue, push, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Copy,
  CheckCircle2,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  X,
  Lock,
  LayoutDashboard,
  History,
  Settings,
  Wallet,
  ChevronDown,
  Activity,
} from "lucide-react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

type CoinKey = "BTC" | "ETH" | "USDT";

type MarketItem = {
  price: number;
  image: string;
};

type MarketState = Record<CoinKey, MarketItem>;

type WithdrawFormState = {
  address: string;
  amount: string;
};

type SwapFormState = {
  toCoin: CoinKey;
  amount: string;
};

const COINS: CoinKey[] = ["ETH", "BTC", "USDT"];

const COIN_META: Record<
  CoinKey,
  { label: string; key: "eth" | "btc" | "usdt"; network: string }
> = {
  ETH: {
    label: "Ethereum",
    key: "eth",
    network: "ERC-20 Network",
  },
  BTC: {
    label: "Bitcoin",
    key: "btc",
    network: "Bitcoin Network",
  },
  USDT: {
    label: "Tether",
    key: "usdt",
    network: "Stablecoin Network",
  },
};

const INITIAL_MARKET: MarketState = {
  BTC: {
    price: 0,
    image:
      "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/btc.png",
  },
  ETH: {
    price: 0,
    image:
      "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/eth.png",
  },
  USDT: {
    price: 0,
    image:
      "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/usdt.png",
  },
};

const glassCard =
  "rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.35)]";

const formatCurrency = (value: number) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatPrice = (value: number) =>
  value.toLocaleString(undefined, {
    maximumFractionDigits: value < 1 ? 4 : 2,
  });

const getShortAddress = (address?: string) => {
  if (!address) return "No address";
  if (address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
};

const Dashboard = () => {
  const { user, logout } = useAuth() as any;
  const navigate = useNavigate();

  const [userData, setUserData] = useState<any>(null);
  const [market, setMarket] = useState<MarketState>(INITIAL_MARKET);

  const [copiedCoin, setCopiedCoin] = useState<string>("");
  const [toast, setToast] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [receiveOpen, setReceiveOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);

  const [activeCoin, setActiveCoin] = useState<CoinKey>("ETH");
  const [withdrawForm, setWithdrawForm] = useState<WithdrawFormState>({
    address: "",
    amount: "",
  });
  const [withdrawStep, setWithdrawStep] = useState(0);
  const [swapForm, setSwapForm] = useState<SwapFormState>({
    toCoin: "BTC",
    amount: "",
  });
  const [swapStep, setSwapStep] = useState(0);

  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const withdrawTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    const loadMarket = async () => {
      try {
        const res = await fetch(
          "https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,USDT&tsyms=USD"
        );
        const data = await res.json();

        if (data?.BTC?.USD !== undefined) {
          setMarket((prev) => ({
            ...prev,
            BTC: { ...prev.BTC, price: Number(data.BTC.USD || 0) },
            ETH: { ...prev.ETH, price: Number(data.ETH.USD || 0) },
            USDT: { ...prev.USDT, price: Number(data.USDT.USD || 0) },
          }));
        }
      } catch (error) {
        console.error("Market fetch failed:", error);
      }
    };

    loadMarket();
    const interval = setInterval(loadMarket, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      if (withdrawTimeoutRef.current) clearTimeout(withdrawTimeoutRef.current);
    };
  }, []);

  const balances = useMemo(() => {
    const eth = Number(userData?.eth_balance || 0);
    const btc = Number(userData?.btc_balance || 0);
    const usdt = Number(userData?.usdt_balance || 0);

    const usd =
      eth * market.ETH.price + btc * market.BTC.price + usdt * market.USDT.price;

    return { eth, btc, usdt, usd };
  }, [userData, market]);

  const assetRows = useMemo(
    () =>
      COINS.map((coin) => {
        const key = COIN_META[coin].key;
        const amount = Number(balances[key] || 0);
        const value = amount * market[coin].price;
        const address = userData?.[`${key}_address`] || "";

        return {
          coin,
          label: COIN_META[coin].label,
          network: COIN_META[coin].network,
          amount,
          value,
          address,
          image: market[coin].image,
          price: market[coin].price,
        };
      }),
    [balances, market, userData]
  );

  const showToast = (text: string) => {
    setToast(text);

    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(""), 2600);
  };

  const handleCopy = async (value: string, key: string) => {
    if (!value) {
      showToast("Address not available");
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopiedCoin(key);

      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopiedCoin(""), 1800);

      showToast("Copied successfully");
    } catch (error) {
      console.error("Copy failed:", error);
      showToast("Copy failed");
    }
  };

  const resetWithdrawState = () => {
    setWithdrawForm({ address: "", amount: "" });
    setWithdrawStep(0);
    setSubmitting(false);
  };

  const handleWithdraw = async () => {
    const amount = Number(withdrawForm.amount);

    if (!withdrawForm.address.trim() || !withdrawForm.amount.trim()) {
      showToast("Fill all fields");
      return;
    }

    if (Number.isNaN(amount) || amount <= 0) {
      showToast("Enter valid amount");
      return;
    }

    const available = Number(balances[COIN_META[activeCoin].key] || 0);

    if (amount > available) {
      showToast("Insufficient balance");
      return;
    }

    try {
      setSubmitting(true);
      setWithdrawStep(1);

      withdrawTimeoutRef.current = setTimeout(async () => {
        try {
          const transRef = push(ref(db, "transactions"));

          await set(transRef, {
            userId: user.id,
            type: "withdraw",
            coin: activeCoin,
            amount: withdrawForm.amount,
            address: withdrawForm.address,
            status: "pending",
            created_at: Date.now(),
          });

          setWithdrawStep(2);
          showToast("Withdrawal request submitted");
        } catch (error) {
          console.error("Withdraw failed:", error);
          setWithdrawStep(0);
          showToast("Withdraw request failed");
        } finally {
          setSubmitting(false);
        }
      }, 2200);
    } catch (error) {
      console.error(error);
      setSubmitting(false);
      setWithdrawStep(0);
      showToast("Something went wrong");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#020617] text-slate-100 selection:bg-blue-500/30">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[-10%] h-[540px] w-[540px] rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="absolute bottom-[-12%] right-[-8%] h-[480px] w-[480px] rounded-full bg-indigo-500/15 blur-[120px]" />
        <div className="absolute left-[35%] top-[20%] h-[320px] w-[320px] rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      <aside className="fixed left-0 top-0 z-40 hidden h-full w-72 border-r border-white/10 bg-[#071121]/80 backdrop-blur-3xl lg:block">
        <div className="flex h-24 items-center gap-4 border-b border-white/10 px-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 shadow-lg shadow-blue-500/20">
            <ShieldCheck className="text-white" size={22} />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-[0.30em] text-blue-400">
              Axcel
            </div>
            <div className="text-sm font-extrabold tracking-wide text-white">
              Private Wallet
            </div>
          </div>
        </div>

        <nav className="space-y-2 p-5">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex w-full items-center gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/15 px-5 py-4 font-bold text-blue-300 transition hover:bg-blue-500/20"
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>

          <button
            onClick={() => navigate("/history")}
            className="flex w-full items-center gap-3 rounded-2xl px-5 py-4 font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <History size={20} />
            History
          </button>

          <button className="flex w-full items-center gap-3 rounded-2xl px-5 py-4 font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white">
            <Settings size={20} />
            Settings
          </button>
        </nav>

        <div className="absolute bottom-6 left-0 w-full px-5">
          <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-1 text-[11px] uppercase tracking-[0.25em] text-slate-500">
              Operator
            </div>
            <div className="font-mono text-sm font-bold text-blue-300">
              #{String(user.id || "").slice(0, 8).toUpperCase()}
            </div>
          </div>

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-2xl px-5 py-4 font-bold text-rose-400 transition hover:bg-rose-500/10"
          >
            <Lock size={20} />
            Logout
          </button>
        </div>
      </aside>

      <main className="relative z-10 px-4 py-5 md:px-8 lg:ml-72 lg:px-10 lg:py-8">
        <header className="mb-8 flex flex-col gap-6 md:mb-10 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Network secured
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">
              Wallet Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400 md:text-base">
              Monitor assets, review balances, and manage deposits or withdrawals
              in a premium secure environment.
            </p>
          </div>

          <div className={`${glassCard} flex items-center gap-4 p-3 md:p-4`}>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 text-lg font-black text-white shadow-lg shadow-blue-500/20">
              {userData?.firstName?.[0] || userData?.name?.[0] || "U"}
            </div>

            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                Account Holder
              </div>
              <div className="mt-1 text-sm font-bold text-white">
                {userData?.firstName
                  ? `${userData?.firstName} ${userData?.lastName || ""}`.trim()
                  : userData?.name || "User"}
              </div>
              <div className="mt-1 font-mono text-xs text-blue-300">
                #{String(user.id || "").slice(0, 8).toUpperCase()}
              </div>
            </div>

            <ChevronDown className="ml-1 hidden text-slate-500 md:block" size={18} />
          </div>
        </header>

        <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div
            className={`xl:col-span-2 ${glassCard} relative overflow-hidden p-7 md:p-9`}
          >
            <div className="absolute right-[-40px] top-[-40px] h-44 w-44 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute bottom-[-40px] left-[-40px] h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="relative z-10">
              <div className="mb-3 text-[11px] font-black uppercase tracking-[0.30em] text-slate-400">
                Total Portfolio Value
              </div>

              <div className="mb-8 text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl">
                ${formatCurrency(balances.usd)}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  onClick={() => setReceiveOpen(true)}
                  className="flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-blue-500 active:scale-[0.98]"
                >
                  <ArrowDownLeft size={18} />
                  Deposit
                </button>

                <button
                  onClick={() => {
                    setWithdrawStep(0);
                    setWithdrawOpen(true);
                  }}
                  className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-white/15 active:scale-[0.98]"
                >
                  <ArrowUpRight size={18} />
                  Withdraw
                </button>

                <button
                  onClick={() => {
                    setSwapStep(0);
                    setSwapOpen(true);
                  }}
                  className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-white/10 active:scale-[0.98]"
                >
                  <RefreshCw size={18} />
                  Swap
                </button>
              </div>
            </div>
          </div>

          <div className={`${glassCard} p-6`}>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.30em] text-slate-500">
                  Live Market
                </div>
                <h3 className="mt-2 text-lg font-extrabold text-white">
                  Market Intelligence
                </h3>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <Activity size={18} className="text-blue-400" />
              </div>
            </div>

            <div className="space-y-4">
              {COINS.map((coin) => (
                <div
                  key={coin}
                  className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={market[coin].image}
                      alt={coin}
                      className="h-10 w-10 rounded-full"
                    />
                    <div>
                      <div className="font-bold text-white">{coin}</div>
                      <div className="text-xs text-slate-500">
                        {COIN_META[coin].network}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-white">
                      ${formatPrice(market[coin].price)}
                    </div>
                    <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                      Live
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`${glassCard} overflow-hidden`}>
          <div className="flex flex-col gap-4 border-b border-white/10 bg-white/[0.02] px-6 py-6 md:flex-row md:items-center md:justify-between md:px-8">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.30em] text-slate-500">
                Asset Ledger
              </div>
              <h3 className="mt-2 text-xl font-extrabold text-white">
                Core Holdings
              </h3>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-blue-300">
              <ShieldCheck size={14} />
              Protocol integrity 100%
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="border-b border-white/8 text-[11px] uppercase tracking-[0.26em] text-slate-500">
                  <th className="px-8 py-5 font-black">Asset</th>
                  <th className="px-8 py-5 font-black">Balance</th>
                  <th className="px-8 py-5 font-black">USD Value</th>
                  <th className="px-8 py-5 font-black">Address</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/8">
                {assetRows.map((item) => (
                  <tr
                    key={item.coin}
                    className="transition hover:bg-white/[0.03]"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.coin}
                          className="h-11 w-11 rounded-full"
                        />
                        <div>
                          <div className="text-base font-black text-white">
                            {item.coin}
                          </div>
                          <div className="text-xs text-slate-500">
                            {item.network}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6 text-base font-bold text-white">
                      {item.amount} {item.coin}
                    </td>

                    <td className="px-8 py-6 text-base font-black text-blue-300">
                      ${formatCurrency(item.value)}
                    </td>

                    <td className="px-8 py-6">
                      <button
                        onClick={() => handleCopy(item.address, item.coin)}
                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                      >
                        {copiedCoin === item.coin ? (
                          <CheckCircle2 size={16} className="text-emerald-400" />
                        ) : (
                          <Copy size={16} />
                        )}
                        <span className="font-mono">{getShortAddress(item.address)}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {receiveOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/90 p-4 backdrop-blur-xl">
          <div
            className={`${glassCard} relative w-full max-w-[560px] border-white/15 p-7 md:p-8`}
          >
            <button
              onClick={() => setReceiveOpen(false)}
              className="absolute right-5 top-5 rounded-xl p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="mb-6 text-[11px] font-black uppercase tracking-[0.30em] text-slate-500">
              Deposit Assets
            </div>
            <h2 className="mb-6 text-2xl font-black text-white md:text-3xl">
              Receive Crypto
            </h2>

            <div className="mb-6 grid grid-cols-3 gap-2">
              {COINS.map((coin) => (
                <button
                  key={coin}
                  onClick={() => setActiveCoin(coin)}
                  className={`rounded-2xl px-4 py-4 text-xs font-black uppercase tracking-[0.22em] transition ${
                    activeCoin === coin
                      ? "border border-blue-400/30 bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "border border-white/8 bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  {coin}
                </button>
              ))}
            </div>

            <div className="rounded-[28px] border border-white/10 bg-black/40 p-6 text-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${
                  userData?.[`${activeCoin.toLowerCase()}_address`] || "none"
                }`}
                alt="QR Code"
                className="mx-auto mb-6 h-52 w-52 rounded-[24px] border-4 border-white bg-white p-2 shadow-2xl"
              />

              <div className="mb-3 text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">
                Wallet Address
              </div>

              <button
                onClick={() =>
                  handleCopy(
                    userData?.[`${activeCoin.toLowerCase()}_address`] || "",
                    `deposit-${activeCoin}`
                  )
                }
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm text-blue-300 transition hover:border-blue-500/35 hover:bg-blue-500/10"
              >
                <span className="break-all font-mono">
                  {userData?.[`${activeCoin.toLowerCase()}_address`] ||
                    "Initializing..."}
                </span>

                {copiedCoin === `deposit-${activeCoin}` ? (
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                ) : (
                  <Copy size={16} className="shrink-0 opacity-70" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {withdrawOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/90 p-4 backdrop-blur-xl">
          <div
            className={`${glassCard} relative w-full max-w-[560px] border-white/15 p-7 md:p-8`}
          >
            <button
              onClick={() => {
                setWithdrawOpen(false);
                resetWithdrawState();
              }}
              className="absolute right-5 top-5 rounded-xl p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="mb-6 text-[11px] font-black uppercase tracking-[0.30em] text-slate-500">
              Withdraw Assets
            </div>
            <h2 className="mb-6 text-2xl font-black text-white md:text-3xl">
              Request Withdrawal
            </h2>

            {withdrawStep === 0 && (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-2">
                  {COINS.map((coin) => (
                    <button
                      key={coin}
                      onClick={() => setActiveCoin(coin)}
                      className={`rounded-2xl px-4 py-4 text-xs font-black uppercase tracking-[0.22em] transition ${
                        activeCoin === coin
                          ? "border border-blue-400/30 bg-blue-600 text-white"
                          : "border border-white/8 bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white"
                      }`}
                    >
                      {coin}
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Available Balance
                  </div>
                  <div className="mt-2 text-xl font-black text-white">
                    {balances[COIN_META[activeCoin].key]} {activeCoin}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Withdrawal Address
                  </label>
                  <input
                    value={withdrawForm.address}
                    onChange={(e) =>
                      setWithdrawForm((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    placeholder="Enter wallet address"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500/40"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Amount
                  </label>
                  <input
                    value={withdrawForm.amount}
                    onChange={(e) =>
                      setWithdrawForm((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    placeholder={`Enter ${activeCoin} amount`}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500/40"
                  />
                </div>

                <button
                  onClick={handleWithdraw}
                  disabled={submitting}
                  className="w-full rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Submit Request
                </button>
              </div>
            )}

            {withdrawStep === 1 && (
              <div className="py-10 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                  <RefreshCw className="animate-spin text-blue-400" size={28} />
                </div>
                <div className="text-xl font-black text-white">
                  Processing Request
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  Your withdrawal request is being prepared.
                </p>
              </div>
            )}

            {withdrawStep === 2 && (
              <div className="py-8 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                  <CheckCircle2 className="text-emerald-400" size={30} />
                </div>
                <div className="text-xl font-black text-white">
                  Request Submitted
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  Status has been set to pending and sent for review.
                </p>

                <button
                  onClick={() => {
                    setWithdrawOpen(false);
                    resetWithdrawState();
                  }}
                  className="mt-6 rounded-2xl bg-white/10 px-6 py-3 font-bold text-white transition hover:bg-white/15"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {swapOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/90 p-4 backdrop-blur-xl">
          <div
            className={`${glassCard} relative w-full max-w-[520px] border-white/15 p-7 md:p-8`}
          >
            <button
              onClick={() => setSwapOpen(false)}
              className="absolute right-5 top-5 rounded-xl p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="mb-6 text-[11px] font-black uppercase tracking-[0.30em] text-slate-500">
              Swap Assets
            </div>
            <h2 className="mb-6 text-2xl font-black text-white md:text-3xl">
              Internal Swap
            </h2>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  From
                </label>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-white">
                  {activeCoin}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  To
                </label>
                <select
                  value={swapForm.toCoin}
                  onChange={(e) =>
                    setSwapForm((prev) => ({
                      ...prev,
                      toCoin: e.target.value as CoinKey,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-white outline-none focus:border-blue-500/40"
                >
                  {COINS.filter((coin) => coin !== activeCoin).map((coin) => (
                    <option key={coin} value={coin} className="bg-slate-900">
                      {coin}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Amount
                </label>
                <input
                  value={swapForm.amount}
                  onChange={(e) =>
                    setSwapForm((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                  placeholder={`Enter ${activeCoin} amount`}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500/40"
                />
              </div>

              <button
                onClick={() => showToast("Swap request feature can be connected next")}
                className="w-full rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-blue-500"
              >
                Continue Swap
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[200] rounded-2xl border border-white/10 bg-blue-600 px-6 py-4 text-xs font-black uppercase tracking-[0.24em] text-white shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
