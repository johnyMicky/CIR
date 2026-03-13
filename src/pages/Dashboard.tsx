import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { onValue, ref } from "firebase/database";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  CheckCircle2,
  Send,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Wallet,
  History,
  RefreshCw,
  ArrowDownUp,
} from "lucide-react";

import { auth, db } from "../firebase";

type MarketCoin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
};

type PortfolioAsset = {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  locked?: number;
};

type TxStatus = "Pending" | "Completed" | "Failed";
type TxType = "Receive" | "Withdraw" | "Transfer" | "Deposit";

type Transaction = {
  id: string;
  type: TxType;
  asset: string;
  amount: number;
  usdValue: number;
  status: TxStatus;
  date: string;
};

type ShellContext = {
  showBalance: boolean;
  setShowBalance: React.Dispatch<React.SetStateAction<boolean>>;
  globalSearch: string;
};

type UserWalletData = {
  wallets?: Record<string, number | string>;
  btc_balance?: number | string;
  eth_balance?: number | string;
  usdt_balance?: number | string;
};

const ASSET_META = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "tether", symbol: "USDT", name: "Tether" },
];

const COLORS = ["#F7931A", "#627EEA", "#26A17B"];

const toNumber = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { showBalance, globalSearch } = useOutletContext<ShellContext>();

  const [market, setMarket] = useState<MarketCoin[]>([]);
  const [loadingMarket, setLoadingMarket] = useState(true);
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [copiedTxId, setCopiedTxId] = useState("");
  const [toast, setToast] = useState("");
  const [walletSource, setWalletSource] = useState<UserWalletData>({});

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        setLoadingMarket(true);

        const ids = ["bitcoin", "ethereum", "tether"].join(",");

        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`
        );

        if (!res.ok) throw new Error("Failed to fetch market data");

        const data = await res.json();
        setMarket(data);
      } catch (error) {
        console.error("Market fetch error:", error);
      } finally {
        setLoadingMarket(false);
      }
    };

    fetchMarket();
    const interval = setInterval(fetchMarket, 45000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setWalletSource({});
        setLoadingWallets(false);
        return;
      }

      setLoadingWallets(true);

      const userRef = ref(db, `users/${firebaseUser.uid}`);
      const unsubscribeValue = onValue(
        userRef,
        (snapshot) => {
          const data = (snapshot.val() || {}) as UserWalletData;
          setWalletSource(data || {});
          setLoadingWallets(false);
        },
        (error) => {
          console.error("Dashboard wallet data fetch error:", error);
          setWalletSource({});
          setLoadingWallets(false);
        }
      );

      return unsubscribeValue;
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const marketMap = useMemo(() => {
    return market.reduce<Record<string, MarketCoin>>((acc, coin) => {
      acc[coin.id] = coin;
      return acc;
    }, {});
  }, [market]);

  const portfolio: PortfolioAsset[] = useMemo(() => {
    const wallets = walletSource.wallets || {};

    return ASSET_META.map((asset) => {
      let amount = 0;

      if (asset.symbol === "BTC") {
        amount = toNumber(wallets.BTC ?? walletSource.btc_balance);
      }

      if (asset.symbol === "ETH") {
        amount = toNumber(wallets.ETH ?? walletSource.eth_balance);
      }

      if (asset.symbol === "USDT") {
        amount = toNumber(wallets.USDT ?? walletSource.usdt_balance);
      }

      return {
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        amount,
        locked: 0,
      };
    });
  }, [walletSource]);

  const assetRows = useMemo(() => {
    return portfolio.map((asset) => {
      const coin = marketMap[asset.id];
      const currentPrice = coin?.current_price ?? 0;
      const totalValue = currentPrice * asset.amount;
      const lockedValue = (asset.locked || 0) * currentPrice;
      const available = Math.max(asset.amount - (asset.locked || 0), 0);
      const availableValue = available * currentPrice;

      return {
        ...asset,
        image: coin?.image || "",
        currentPrice,
        totalValue,
        lockedValue,
        available,
        availableValue,
        priceChange: coin?.price_change_percentage_24h ?? 0,
      };
    });
  }, [portfolio, marketMap]);

  const totalAssets = useMemo(() => {
    return assetRows.reduce((sum, asset) => sum + asset.totalValue, 0);
  }, [assetRows]);

  const totalLocked = useMemo(() => {
    return assetRows.reduce((sum, asset) => sum + asset.lockedValue, 0);
  }, [assetRows]);

  const totalAvailable = useMemo(() => {
    return Math.max(totalAssets - totalLocked, 0);
  }, [totalAssets, totalLocked]);

  const total24hChangeValue = useMemo(() => {
    return assetRows.reduce((sum, asset) => {
      const pct = asset.priceChange || 0;
      const current = asset.totalValue;
      const divisor = 1 + pct / 100;
      const prev = divisor !== 0 ? current / divisor : current;
      return sum + (current - prev);
    }, 0);
  }, [assetRows]);

  const total24hPercent = useMemo(() => {
    const base = totalAssets - total24hChangeValue;
    if (base <= 0) return 0;
    return (total24hChangeValue / base) * 100;
  }, [totalAssets, total24hChangeValue]);

  const allocationData = useMemo(() => {
    if (totalAssets <= 0) {
      return assetRows.map((asset, index) => ({
        ...asset,
        percent: 0,
        color: COLORS[index % COLORS.length],
      }));
    }

    return assetRows.map((asset, index) => ({
      ...asset,
      percent: (asset.totalValue / totalAssets) * 100,
      color: COLORS[index % COLORS.length],
    }));
  }, [assetRows, totalAssets]);

  const transactions: Transaction[] = useMemo(
    () => [
      {
        id: "TX-20491",
        type: "Receive",
        asset: "BTC",
        amount: 0.0215,
        usdValue: (marketMap["bitcoin"]?.current_price || 0) * 0.0215,
        status: "Completed",
        date: "2026-03-13 20:16",
      },
      {
        id: "TX-20488",
        type: "Withdraw",
        asset: "USDT",
        amount: 800,
        usdValue: 800,
        status: "Pending",
        date: "2026-03-13 18:52",
      },
      {
        id: "TX-20480",
        type: "Deposit",
        asset: "ETH",
        amount: 0.85,
        usdValue: (marketMap["ethereum"]?.current_price || 0) * 0.85,
        status: "Completed",
        date: "2026-03-13 17:11",
      },
      {
        id: "TX-20472",
        type: "Transfer",
        asset: "ETH",
        amount: 1.25,
        usdValue: (marketMap["ethereum"]?.current_price || 0) * 1.25,
        status: "Failed",
        date: "2026-03-13 14:08",
      },
      {
        id: "TX-20451",
        type: "Receive",
        asset: "USDT",
        amount: 1200,
        usdValue: 1200,
        status: "Completed",
        date: "2026-03-13 09:05",
      },
    ],
    [marketMap]
  );

  const filteredTransactions = useMemo(() => {
    if (!globalSearch.trim()) return transactions;

    const q = globalSearch.toLowerCase().trim();

    return transactions.filter(
      (tx) =>
        tx.id.toLowerCase().includes(q) ||
        tx.asset.toLowerCase().includes(q) ||
        tx.type.toLowerCase().includes(q)
    );
  }, [transactions, globalSearch]);

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: value >= 1000 ? 2 : 4,
    }).format(value);

  const formatCoinAmount = (value: number) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: value < 1 ? 4 : 2,
      maximumFractionDigits: value < 1 ? 6 : 2,
    }).format(value);

  const handleExport = () => {
    const rows = [
      ["Type", "Asset", "Amount", "USD Value", "Status", "Date", "Transaction ID"],
      ...filteredTransactions.map((tx) => [
        tx.type,
        tx.asset,
        String(tx.amount),
        String(tx.usdValue),
        tx.status,
        tx.date,
        tx.id,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    link.click();
    URL.revokeObjectURL(url);

    setToast("Transactions exported");
  };

  const copyTxId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedTxId(id);
      setToast(`Copied ${id}`);
      setTimeout(() => setCopiedTxId(""), 1500);
    } catch {
      setToast("Copy failed");
    }
  };

  const getStatusClass = (status: TxStatus) => {
    if (status === "Completed") {
      return "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20";
    }
    if (status === "Pending") {
      return "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/20";
    }
    return "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/20";
  };

  const getTypeIcon = (type: TxType) => {
    if (type === "Receive" || type === "Deposit") {
      return <ArrowDownLeft className="h-4 w-4 text-emerald-400" />;
    }
    return <ArrowUpRight className="h-4 w-4 text-sky-400" />;
  };

  const isLoading = loadingMarket || loadingWallets;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {toast && (
        <div className="fixed right-4 top-24 z-[100] rounded-2xl border border-cyan-400/20 bg-[#0F1B33]/95 px-4 py-3 text-sm text-cyan-100 shadow-2xl backdrop-blur-xl">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[1.45fr_1fr]">
        <section className="overflow-hidden rounded-[28px] border border-cyan-300/10 bg-[linear-gradient(135deg,rgba(59,130,246,0.16),rgba(34,211,238,0.10),rgba(139,92,246,0.14))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)] sm:p-6 lg:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200/80">
                Total Assets
              </div>

              <div className="mt-4 flex flex-wrap items-end gap-3">
                <div className="max-w-full min-w-0 text-3xl font-semibold leading-none tracking-tight tabular-nums sm:text-4xl lg:text-5xl">
                  {showBalance ? formatMoney(totalAssets) : "••••••••"}
                </div>

                <div
                  className={`mb-1 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                    total24hPercent >= 0
                      ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20"
                      : "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/20"
                  }`}
                >
                  {total24hPercent >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {Math.abs(total24hPercent).toFixed(2)}% today
                </div>
              </div>

              <div className="mt-4 text-sm text-slate-300">
                {showBalance
                  ? `Portfolio value across ${assetRows.length} crypto assets`
                  : "Balance hidden for privacy"}
              </div>
            </div>

            <div className="grid w-full grid-cols-2 gap-3 sm:gap-4 lg:max-w-sm">
              <div className="rounded-3xl bg-white/8 p-4 ring-1 ring-white/10">
                <div className="text-xs uppercase tracking-[0.15em] text-slate-400">
                  Available
                </div>
                <div className="mt-2 text-lg font-semibold tabular-nums">
                  {showBalance ? formatMoney(totalAvailable) : "••••••"}
                </div>
              </div>
              <div className="rounded-3xl bg-white/8 p-4 ring-1 ring-white/10">
                <div className="text-xs uppercase tracking-[0.15em] text-slate-400">
                  Locked
                </div>
                <div className="mt-2 text-lg font-semibold tabular-nums">
                  {showBalance ? formatMoney(totalLocked) : "••••••"}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-6 lg:p-7">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                Quick Actions
              </div>
              <div className="mt-1 text-lg font-semibold">Open wallet operations</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            {[
              {
                label: "Deposit",
                icon: ArrowDownLeft,
                cls: "from-emerald-500/25 to-cyan-500/15 text-emerald-300",
                onClick: () => navigate("/send-receive"),
              },
              {
                label: "Withdraw",
                icon: ArrowUpRight,
                cls: "from-rose-500/25 to-orange-500/15 text-orange-300",
                onClick: () => navigate("/send-receive"),
              },
              {
                label: "Transfer",
                icon: Send,
                cls: "from-blue-500/25 to-cyan-500/15 text-sky-300",
                onClick: () => navigate("/send-receive"),
              },
              {
                label: "Swap",
                icon: ArrowDownUp,
                cls: "from-violet-500/25 to-fuchsia-500/15 text-violet-300",
                onClick: () => navigate("/exchange"),
              },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className={`group rounded-3xl bg-gradient-to-br ${action.cls} p-4 text-left ring-1 ring-white/10 transition duration-200 hover:scale-[1.02] hover:ring-white/20 sm:p-5`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50 transition group-hover:translate-x-1" />
                  </div>
                  <div className="mt-6 text-sm font-semibold sm:text-base">
                    {action.label}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/my-wallets")}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-slate-200 hover:bg-white/10"
            >
              <Wallet className="h-4 w-4" />
              My Wallets
            </button>

            <button
              onClick={() => navigate("/history")}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-slate-200 hover:bg-white/10"
            >
              <History className="h-4 w-4" />
              Full History
            </button>
          </div>
        </section>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 2xl:grid-cols-[1.25fr_1fr]">
        <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6 lg:p-7">
          <div className="flex flex-col gap-6">
            <div>
              <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                Asset Allocation
              </div>
              <div className="mt-1 text-lg font-semibold">Portfolio breakdown</div>
            </div>

            {isLoading ? (
              <div className="rounded-[28px] bg-white/5 p-6 text-sm text-slate-400 ring-1 ring-white/10">
                Loading allocation data...
              </div>
            ) : (
              <>
                <div className="rounded-[28px] bg-white/5 p-5 ring-1 ring-white/10">
                  <div className="space-y-4">
                    {allocationData.map((asset) => (
                      <div key={asset.id}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10">
                              {asset.image ? (
                                <img
                                  src={asset.image}
                                  alt={asset.name}
                                  className="h-6 w-6 object-contain"
                                />
                              ) : (
                                <span className="text-xs font-bold">{asset.symbol}</span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="font-medium">{asset.name}</div>
                              <div className="text-xs text-slate-400">
                                {asset.symbol} • {formatCoinAmount(asset.amount)}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-semibold tabular-nums">
                              {showBalance ? formatMoney(asset.totalValue) : "••••••"}
                            </div>
                            <div className="text-xs text-slate-400">
                              {asset.percent.toFixed(1)}%
                            </div>
                          </div>
                        </div>

                        <div className="h-3 w-full overflow-hidden rounded-full bg-white/8">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max(asset.percent, 4)}%`,
                              background: `linear-gradient(90deg, ${asset.color}, ${asset.color}CC)`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {assetRows.map((asset, index) => (
                    <div
                      key={asset.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white/5 p-4 ring-1 ring-white/8"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl ring-1 ring-white/10"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
                          }}
                        >
                          {asset.image ? (
                            <img
                              src={asset.image}
                              alt={asset.name}
                              className="h-7 w-7 object-contain"
                            />
                          ) : (
                            <span className="text-xs font-bold">{asset.symbol}</span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{asset.name}</span>
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            />
                          </div>
                          <div className="text-sm text-slate-400">
                            {asset.symbol} • {formatCoinAmount(asset.amount)}
                          </div>
                        </div>
                      </div>

                      <div className="grid min-w-[200px] grid-cols-2 gap-4 sm:min-w-[300px]">
                        <div className="text-right">
                          <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                            Price
                          </div>
                          <div className="mt-1 text-sm font-medium tabular-nums">
                            {showBalance ? formatMoney(asset.currentPrice) : "••••••"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                            Value
                          </div>
                          <div className="mt-1 text-sm font-semibold tabular-nums">
                            {showBalance ? formatMoney(asset.totalValue) : "••••••"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6 lg:p-7">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                Live Market Prices
              </div>
              <div className="mt-1 text-lg font-semibold">Top crypto movers</div>
            </div>

            <button
              onClick={() => setToast("Market refresh is automatic")}
              className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300 ring-1 ring-cyan-400/20"
            >
              <RefreshCw className="inline h-3.5 w-3.5 mr-1" />
              Auto
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {loadingMarket && market.length === 0 ? (
              <div className="rounded-3xl bg-white/5 p-6 text-sm text-slate-400">
                Loading market data...
              </div>
            ) : (
              market.map((coin) => {
                const positive = (coin.price_change_percentage_24h || 0) >= 0;
                return (
                  <div
                    key={coin.id}
                    className="flex items-center justify-between gap-4 rounded-3xl bg-white/5 p-4 ring-1 ring-white/8"
                  >
                    <div className="min-w-0 flex items-center gap-3">
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="h-10 w-10 rounded-full"
                      />
                      <div className="min-w-0">
                        <div className="font-medium">{coin.name}</div>
                        <div className="text-sm uppercase text-slate-400">
                          {coin.symbol}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold tabular-nums">
                        {formatMoney(coin.current_price)}
                      </div>
                      <div
                        className={`mt-1 text-sm ${
                          positive ? "text-emerald-300" : "text-rose-300"
                        }`}
                      >
                        {positive ? "+" : ""}
                        {coin.price_change_percentage_24h?.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6 lg:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
              Recent Transactions
            </div>
            <div className="mt-1 text-lg font-semibold">Latest activity</div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/history")}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
            >
              <History className="h-4 w-4" />
              View All
            </button>

            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
            >
              <Copy className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <div className="min-w-[820px]">
            <div className="grid grid-cols-[1.55fr_0.9fr_1fr_1fr_1fr] gap-4 px-4 py-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
              <div>Type</div>
              <div>Asset</div>
              <div>Amount</div>
              <div>Status</div>
              <div>Date</div>
            </div>

            <div className="space-y-3">
              {filteredTransactions.slice(0, 10).map((tx) => (
                <div
                  key={tx.id}
                  className="grid grid-cols-[1.55fr_0.9fr_1fr_1fr_1fr] gap-4 rounded-3xl bg-white/5 px-4 py-4 ring-1 ring-white/8 transition hover:bg-white/[0.07]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8">
                      {getTypeIcon(tx.type)}
                    </div>
                    <div>
                      <div className="font-medium">{tx.type}</div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                        <span>{tx.id}</span>
                        <button
                          onClick={() => copyTxId(tx.id)}
                          className="rounded-lg p-1 hover:bg-white/10"
                          title="Copy transaction ID"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        {copiedTxId === tx.id && (
                          <span className="text-cyan-300">Copied</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="rounded-full bg-white/8 px-3 py-1 text-sm font-medium">
                      {tx.asset}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <div>
                      <div className="font-medium tabular-nums">
                        {formatCoinAmount(tx.amount)} {tx.asset}
                      </div>
                      <div className="text-sm tabular-nums text-slate-400">
                        {showBalance ? formatMoney(tx.usdValue) : "••••••"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${getStatusClass(
                        tx.status
                      )}`}
                    >
                      {tx.status === "Completed" && (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      {tx.status}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-slate-300">
                    {tx.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
