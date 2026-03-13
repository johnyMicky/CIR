import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  ChevronDown,
  Eye,
  EyeOff,
  LayoutDashboard,
  Wallet,
  ArrowUpDown,
  RefreshCw,
  History,
  Settings,
  LifeBuoy,
  Search,
  LogOut,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Send,
  TrendingUp,
  TrendingDown,
  Copy,
  CheckCircle2,
} from "lucide-react";

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
};

type TxStatus = "Pending" | "Completed" | "Failed";
type TxType = "Receive" | "Withdraw" | "Transfer" | "Deposit" | "Buy";

type Transaction = {
  id: string;
  type: TxType;
  asset: string;
  amount: number;
  usdValue: number;
  status: TxStatus;
  date: string;
};

const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "My Wallets", icon: Wallet },
  { label: "Send / Receive", icon: ArrowUpDown },
  { label: "Exchange / Swap", icon: RefreshCw },
  { label: "Transactions History", icon: History },
  { label: "Settings", icon: Settings },
  { label: "Support / Help", icon: LifeBuoy },
];

const portfolio: PortfolioAsset[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", amount: 0.2458 },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", amount: 2.86 },
  { id: "tether", symbol: "USDT", name: "Tether", amount: 5400 },
  { id: "solana", symbol: "SOL", name: "Solana", amount: 22.5 },
  { id: "binancecoin", symbol: "BNB", name: "BNB", amount: 5.1 },
];

const mockNotifications = [
  { id: 1, text: "Transaction confirmed", time: "2 min ago", unread: true },
  { id: 2, text: "New login detected", time: "18 min ago", unread: true },
  { id: 3, text: "Deposit received", time: "1 hour ago", unread: false },
];

const COLORS = ["#3B82F6", "#22D3EE", "#8B5CF6", "#10B981", "#F59E0B"];

const Dashboard = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [search, setSearch] = useState("");
  const [market, setMarket] = useState<MarketCoin[]>([]);
  const [loadingMarket, setLoadingMarket] = useState(true);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        setLoadingMarket(true);

        const ids = [
          "bitcoin",
          "ethereum",
          "tether",
          "solana",
          "binancecoin",
          "ripple",
        ].join(",");

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

  const marketMap = useMemo(() => {
    return market.reduce<Record<string, MarketCoin>>((acc, coin) => {
      acc[coin.id] = coin;
      return acc;
    }, {});
  }, [market]);

  const assetRows = useMemo(() => {
    return portfolio.map((asset) => {
      const coin = marketMap[asset.id];
      const currentPrice = coin?.current_price ?? 0;
      const totalValue = currentPrice * asset.amount;

      return {
        ...asset,
        image: coin?.image || "",
        currentPrice,
        totalValue,
        priceChange: coin?.price_change_percentage_24h ?? 0,
      };
    });
  }, [marketMap]);

  const totalAssets = useMemo(() => {
    return assetRows.reduce((sum, asset) => sum + asset.totalValue, 0);
  }, [assetRows]);

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
        asset: "SOL",
        amount: 5,
        usdValue: (marketMap["solana"]?.current_price || 0) * 5,
        status: "Failed",
        date: "2026-03-13 14:08",
      },
      {
        id: "TX-20463",
        type: "Buy",
        asset: "BNB",
        amount: 1.1,
        usdValue: (marketMap["binancecoin"]?.current_price || 0) * 1.1,
        status: "Completed",
        date: "2026-03-13 11:44",
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
    if (!search.trim()) return transactions;

    const q = search.toLowerCase().trim();

    return transactions.filter(
      (tx) =>
        tx.id.toLowerCase().includes(q) ||
        tx.asset.toLowerCase().includes(q) ||
        tx.type.toLowerCase().includes(q)
    );
  }, [transactions, search]);

  const unreadCount = mockNotifications.filter((n) => n.unread).length;

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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_18%),radial-gradient(circle_at_right_top,_rgba(139,92,246,0.14),_transparent_22%),linear-gradient(180deg,#07111F_0%,#0A1427_45%,#0C1730_100%)] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden xl:flex w-72 shrink-0 flex-col border-r border-white/10 bg-[#0A1220]/80 backdrop-blur-xl">
          <div className="px-6 py-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 shadow-[0_0_30px_rgba(59,130,246,0.35)]">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold tracking-wide">Axcelci.com</div>
                <div className="text-xs text-slate-400">Private Wallet Dashboard</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-5 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className={`w-full rounded-2xl px-4 py-3 transition-all duration-200 ${
                    item.active
                      ? "bg-gradient-to-r from-blue-500/20 via-cyan-400/10 to-violet-500/20 text-white shadow-[0_0_25px_rgba(59,130,246,0.15)] ring-1 ring-cyan-300/15"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="text-sm font-medium">Secure wallet access</div>
              <div className="mt-1 text-xs leading-5 text-slate-400">
                Clean responsive dashboard with live crypto prices and asset
                breakdown.
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-[#081120]/75 backdrop-blur-xl">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex h-20 items-center gap-3 sm:gap-4">
                <div className="xl:hidden flex items-center gap-3 min-w-[140px]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-sm font-semibold">Axcelci</div>
                </div>

                <div className="relative flex-1 max-w-2xl">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by transaction ID or asset"
                    className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-400 focus:border-cyan-400/40 focus:bg-white/10"
                  />
                </div>

                <button
                  onClick={() => setShowBalance((s) => !s)}
                  className="hidden sm:flex h-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-slate-200 hover:bg-white/10"
                >
                  {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <span>{showBalance ? "Hide" : "Show"}</span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowNotifications((s) => !s)}
                    className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10"
                  >
                    <Bell className="h-5 w-5 text-slate-200" />
                    {unreadCount > 0 && (
                      <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-[#081120]" />
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-3 w-80 rounded-3xl border border-white/10 bg-[#0F1B33]/95 p-3 shadow-2xl backdrop-blur-xl">
                      <div className="mb-2 px-2 text-sm font-semibold">Notifications</div>
                      <div className="space-y-2">
                        {mockNotifications.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-2xl bg-white/5 px-3 py-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-sm text-white">{item.text}</div>
                                <div className="mt-1 text-xs text-slate-400">{item.time}</div>
                              </div>
                              {item.unread && (
                                <span className="mt-1 h-2 w-2 rounded-full bg-rose-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 sm:px-4 hover:bg-white/10">
                  <img
                    src="https://i.pravatar.cc/100?img=12"
                    alt="User"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium">Michael Carter</div>
                    <div className="text-xs text-slate-400">Client account</div>
                  </div>
                  <ChevronDown className="hidden md:block h-4 w-4 text-slate-400" />
                </button>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[1.45fr_1fr]">
              <section className="overflow-hidden rounded-[28px] border border-cyan-300/10 bg-[linear-gradient(135deg,rgba(59,130,246,0.16),rgba(34,211,238,0.10),rgba(139,92,246,0.14))] p-5 sm:p-6 lg:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200/80">
                      Total Assets
                    </div>

                    <div className="mt-4 flex flex-wrap items-end gap-3">
                      <div className="min-w-0 max-w-full text-3xl font-semibold leading-none tracking-tight sm:text-4xl lg:text-5xl tabular-nums">
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
                        24H P/L
                      </div>
                      <div className="mt-2 text-lg font-semibold tabular-nums">
                        {showBalance ? formatMoney(total24hChangeValue) : "••••••"}
                      </div>
                    </div>
                    <div className="rounded-3xl bg-white/8 p-4 ring-1 ring-white/10">
                      <div className="text-xs uppercase tracking-[0.15em] text-slate-400">
                        Assets
                      </div>
                      <div className="mt-2 text-lg font-semibold">{assetRows.length}</div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 sm:p-6 lg:p-7 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                      Quick Actions
                    </div>
                    <div className="mt-1 text-lg font-semibold">Move funds faster</div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  {[
                    {
                      label: "Deposit",
                      icon: ArrowDownLeft,
                      cls: "from-emerald-500/25 to-cyan-500/15 text-emerald-300",
                    },
                    {
                      label: "Withdraw",
                      icon: ArrowUpRight,
                      cls: "from-rose-500/25 to-orange-500/15 text-orange-300",
                    },
                    {
                      label: "Transfer",
                      icon: Send,
                      cls: "from-blue-500/25 to-cyan-500/15 text-sky-300",
                    },
                    {
                      label: "Buy Crypto",
                      icon: CreditCard,
                      cls: "from-violet-500/25 to-fuchsia-500/15 text-violet-300",
                    },
                  ].map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.label}
                        className={`group rounded-3xl bg-gradient-to-br ${action.cls} p-4 sm:p-5 text-left ring-1 ring-white/10 transition duration-200 hover:scale-[1.02] hover:ring-white/20`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                            <Icon className="h-5 w-5" />
                          </div>
                          <ChevronDown className="h-4 w-4 rotate-[-90deg] opacity-50 transition group-hover:translate-x-1" />
                        </div>
                        <div className="mt-6 text-sm font-semibold sm:text-base">
                          {action.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 2xl:grid-cols-[1.25fr_1fr]">
              <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 sm:p-6 lg:p-7 backdrop-blur-xl">
                <div className="flex flex-col gap-6">
                  <div>
                    <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                      Asset Allocation
                    </div>
                    <div className="mt-1 text-lg font-semibold">Portfolio breakdown</div>
                  </div>

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
                            className="h-11 w-11 rounded-2xl ring-1 ring-white/10 flex items-center justify-center overflow-hidden"
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
                </div>
              </section>

              <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 sm:p-6 lg:p-7 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                      Live Market Prices
                    </div>
                    <div className="mt-1 text-lg font-semibold">Top crypto movers</div>
                  </div>

                  <div className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300 ring-1 ring-cyan-400/20">
                    Auto refresh
                  </div>
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
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={coin.image}
                              alt={coin.name}
                              className="h-10 w-10 rounded-full"
                            />
                            <div className="min-w-0">
                              <div className="font-medium">{coin.name}</div>
                              <div className="text-sm text-slate-400 uppercase">
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

            <section className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5 sm:p-6 lg:p-7 backdrop-blur-xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                    Recent Transactions
                  </div>
                  <div className="mt-1 text-lg font-semibold">Latest activity</div>
                </div>

                <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">
                  <Copy className="h-4 w-4" />
                  Export
                </button>
              </div>

              <div className="mt-6 overflow-x-auto">
                <div className="min-w-[820px]">
                  <div className="grid grid-cols-[1.4fr_0.9fr_1fr_1fr_1fr] gap-4 px-4 py-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
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
                        className="grid grid-cols-[1.4fr_0.9fr_1fr_1fr_1fr] gap-4 rounded-3xl bg-white/5 px-4 py-4 ring-1 ring-white/8 transition hover:bg-white/[0.07]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8">
                            {getTypeIcon(tx.type)}
                          </div>
                          <div>
                            <div className="font-medium">{tx.type}</div>
                            <div className="text-sm text-slate-400">{tx.id}</div>
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
                            <div className="text-sm text-slate-400 tabular-nums">
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

            <div className="mt-6 sm:hidden">
              <button
                onClick={() => setShowBalance((s) => !s)}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 text-sm text-slate-200 hover:bg-white/10"
              >
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <span>{showBalance ? "Hide Balance" : "Show Balance"}</span>
              </button>
            </div>

            <div className="mt-6 flex justify-end">
              <button className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-sm text-rose-200 hover:bg-rose-500/15">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
