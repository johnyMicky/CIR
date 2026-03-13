import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  RefreshCw,
  Search,
  Send,
  Wallet,
  CheckCircle2,
  ChevronRight,
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
  walletAddress: string;
  locked?: number;
};

type ModalType = "deposit" | "withdraw" | "transfer" | null;

const portfolio: PortfolioAsset[] = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    amount: 0.2458,
    locked: 0.012,
    walletAddress: "bc1qaxcelci8d8wq9f2d4m0q3n8w3v9k3u5l7c2x1",
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    amount: 2.86,
    locked: 0.2,
    walletAddress: "0xAxcE1ciETH7eF53b2d12AA91fABC1234567890EF",
  },
  {
    id: "tether",
    symbol: "USDT",
    name: "Tether",
    amount: 5400,
    locked: 350,
    walletAddress: "0xAxcE1ciUSDT09fA71bDaC98123456789abcdef123",
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    amount: 22.5,
    locked: 1.1,
    walletAddress: "7RxAxcelciSo1aNa9mL3Q8pQ2r2m4X1aBcDeFgHiJkL",
  },
  {
    id: "binancecoin",
    symbol: "BNB",
    name: "BNB",
    amount: 5.1,
    locked: 0.4,
    walletAddress: "bnb1axcelci76n0lmk8wq3d7x2g5u9s0y6z4t8n1p2",
  },
];

const COLORS = ["#3B82F6", "#22D3EE", "#8B5CF6", "#10B981", "#F59E0B"];

const MyWallets = () => {
  const [market, setMarket] = useState<MarketCoin[]>([]);
  const [loadingMarket, setLoadingMarket] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedAsset, setSelectedAsset] = useState<string>("BTC");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [recipient, setRecipient] = useState("");

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

  const walletRows = useMemo(() => {
    return portfolio.map((asset, index) => {
      const coin = marketMap[asset.id];
      const currentPrice = coin?.current_price ?? 0;
      const totalValue = asset.amount * currentPrice;
      const lockedValue = (asset.locked || 0) * currentPrice;
      const available = asset.amount - (asset.locked || 0);

      return {
        ...asset,
        image: coin?.image || "",
        currentPrice,
        totalValue,
        lockedValue,
        available,
        priceChange: coin?.price_change_percentage_24h ?? 0,
        color: COLORS[index % COLORS.length],
      };
    });
  }, [marketMap]);

  const filteredWallets = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return walletRows;

    return walletRows.filter(
      (asset) =>
        asset.name.toLowerCase().includes(q) ||
        asset.symbol.toLowerCase().includes(q) ||
        asset.id.toLowerCase().includes(q)
    );
  }, [walletRows, search]);

  const totalAssets = useMemo(() => {
    return walletRows.reduce((sum, item) => sum + item.totalValue, 0);
  }, [walletRows]);

  const totalLocked = useMemo(() => {
    return walletRows.reduce((sum, item) => sum + item.lockedValue, 0);
  }, [walletRows]);

  const totalAvailable = useMemo(() => {
    return Math.max(totalAssets - totalLocked, 0);
  }, [totalAssets, totalLocked]);

  const bestPerformer = useMemo(() => {
    if (!walletRows.length) return null;
    return [...walletRows].sort((a, b) => b.priceChange - a.priceChange)[0];
  }, [walletRows]);

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: value >= 1000 ? 2 : 4,
    }).format(value);

  const formatCoinAmount = (value: number) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: value < 1 ? 4 : 2,
      maximumFractionDigits: value < 1 ? 6 : 4,
    }).format(value);

  const shortenAddress = (value: string) => {
    if (!value) return "";
    if (value.length <= 16) return value;
    return `${value.slice(0, 8)}...${value.slice(-8)}`;
  };

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setToast(`${label} copied`);
    } catch {
      setToast("Copy failed");
    }
  };

  const openModal = (type: ModalType, symbol?: string) => {
    setModalType(type);
    setSelectedAsset(symbol || "BTC");
    setAmount("");
    setAddress("");
    setRecipient("");
  };

  const closeModal = () => {
    setModalType(null);
    setAmount("");
    setAddress("");
    setRecipient("");
  };

  const submitAction = () => {
    if (!modalType) return;

    if (!amount) {
      setToast("Enter amount");
      return;
    }

    if (modalType === "withdraw" && !address) {
      setToast("Enter wallet address");
      return;
    }

    if (modalType === "transfer" && !recipient) {
      setToast("Enter recipient");
      return;
    }

    const labels: Record<Exclude<ModalType, null>, string> = {
      deposit: "Deposit request prepared",
      withdraw: "Withdraw request submitted",
      transfer: "Transfer request submitted",
    };

    setToast(labels[modalType]);
    closeModal();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_18%),radial-gradient(circle_at_right_top,_rgba(139,92,246,0.14),_transparent_22%),linear-gradient(180deg,#07111F_0%,#0A1427_45%,#0C1730_100%)] text-white">
      {toast && (
        <div className="fixed right-4 top-4 z-[100] rounded-2xl border border-cyan-400/20 bg-[#0F1B33]/95 px-4 py-3 text-sm text-cyan-100 shadow-2xl backdrop-blur-xl">
          {toast}
        </div>
      )}

      {modalType && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-[#0D1830] p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.18em] text-slate-400">
                  Wallet Action
                </div>
                <div className="mt-1 text-xl font-semibold">
                  {modalType === "deposit" && "Deposit"}
                  {modalType === "withdraw" && "Withdraw"}
                  {modalType === "transfer" && "Transfer"}
                </div>
              </div>

              <button
                onClick={closeModal}
                className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">Asset</label>
                <select
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-cyan-400/40"
                >
                  {walletRows.map((asset) => (
                    <option key={asset.symbol} value={asset.symbol} className="bg-slate-900">
                      {asset.symbol}
                    </option>
                  ))}
                </select>
              </div>

              {modalType === "deposit" && (
                <div className="rounded-3xl border border-cyan-400/10 bg-cyan-500/5 p-4">
                  <div className="text-sm text-slate-300">Deposit wallet address</div>
                  <div className="mt-2 break-all rounded-2xl bg-white/5 px-3 py-3 text-sm text-cyan-200">
                    {
                      walletRows.find((w) => w.symbol === selectedAsset)?.walletAddress ||
                      "Wallet address not found"
                    }
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm text-slate-300">Amount</label>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
                />
              </div>

              {modalType === "withdraw" && (
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Wallet Address</label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Recipient wallet address"
                    className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
                  />
                </div>
              )}

              {modalType === "transfer" && (
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Recipient Username / Email</label>
                  <input
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Enter recipient"
                    className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={closeModal}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={submitAction}
                className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-medium text-white shadow-[0_0_25px_rgba(34,211,238,0.25)] hover:opacity-95"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.18em] text-cyan-300/80">
              Wallet Center
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              My Wallets
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
              Manage your crypto balances, monitor available and locked funds, and access
              deposit, withdrawal, and transfer actions in one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowBalance((s) => !s)}
              className="inline-flex h-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-slate-200 hover:bg-white/10"
            >
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              <span>{showBalance ? "Hide Balance" : "Show Balance"}</span>
            </button>

            <button
              onClick={() => setToast("Market refresh is automatic")}
              className="inline-flex h-12 items-center gap-2 rounded-2xl border border-cyan-400/15 bg-cyan-500/10 px-4 text-sm text-cyan-200 hover:bg-cyan-500/15"
            >
              <RefreshCw className="h-4 w-4" />
              Auto Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_1fr]">
          <section className="overflow-hidden rounded-[28px] border border-cyan-300/10 bg-[linear-gradient(135deg,rgba(59,130,246,0.16),rgba(34,211,238,0.10),rgba(139,92,246,0.14))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)] sm:p-6 lg:p-7">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
              <div className="min-w-0">
                <div className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200/80">
                  Total Wallet Value
                </div>
                <div className="mt-4 text-3xl font-semibold leading-none tracking-tight tabular-nums sm:text-4xl lg:text-5xl">
                  {showBalance ? formatMoney(totalAssets) : "••••••••"}
                </div>
                <div className="mt-4 text-sm text-slate-300">
                  Combined value across {walletRows.length} active crypto wallets
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
                <div className="col-span-2 rounded-3xl bg-white/8 p-4 ring-1 ring-white/10">
                  <div className="text-xs uppercase tracking-[0.15em] text-slate-400">
                    Best 24H Performer
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    {bestPerformer?.image ? (
                      <img
                        src={bestPerformer.image}
                        alt={bestPerformer.name}
                        className="h-9 w-9 rounded-full"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                        <Wallet className="h-4 w-4" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{bestPerformer?.name || "—"}</div>
                      <div className="text-sm text-emerald-300">
                        {bestPerformer ? `${bestPerformer.priceChange.toFixed(2)}%` : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-6 lg:p-7">
            <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
              Quick Actions
            </div>
            <div className="mt-1 text-lg font-semibold">Manage wallet operations</div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              {[
                {
                  label: "Deposit",
                  icon: ArrowDownLeft,
                  cls: "from-emerald-500/25 to-cyan-500/15 text-emerald-300",
                  onClick: () => openModal("deposit"),
                },
                {
                  label: "Withdraw",
                  icon: ArrowUpRight,
                  cls: "from-rose-500/25 to-orange-500/15 text-orange-300",
                  onClick: () => openModal("withdraw"),
                },
                {
                  label: "Transfer",
                  icon: Send,
                  cls: "from-blue-500/25 to-cyan-500/15 text-sky-300",
                  onClick: () => openModal("transfer"),
                },
                {
                  label: "Buy Crypto",
                  icon: CreditCard,
                  cls: "from-violet-500/25 to-fuchsia-500/15 text-violet-300",
                  onClick: () => setToast("Buy Crypto page is next step"),
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
                    <div className="mt-6 text-sm font-semibold sm:text-base">{action.label}</div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6 lg:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                Wallet Assets
              </div>
              <div className="mt-1 text-lg font-semibold">All crypto balances</div>
            </div>

            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by asset name or symbol"
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-400 focus:border-cyan-400/40 focus:bg-white/10"
              />
            </div>
          </div>

          {loadingMarket && market.length === 0 ? (
            <div className="mt-6 rounded-3xl bg-white/5 p-6 text-sm text-slate-400">
              Loading wallet market data...
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
              {filteredWallets.map((asset) => {
                const positive = asset.priceChange >= 0;
                const allocationPercent =
                  totalAssets > 0 ? (asset.totalValue / totalAssets) * 100 : 0;

                return (
                  <div
                    key={asset.id}
                    className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-5 ring-1 ring-white/5 transition hover:border-cyan-400/15 hover:bg-white/[0.06]"
                  >
                    <div className="flex flex-col gap-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-3xl ring-1 ring-white/10"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
                            }}
                          >
                            {asset.image ? (
                              <img
                                src={asset.image}
                                alt={asset.name}
                                className="h-8 w-8 object-contain"
                              />
                            ) : (
                              <Wallet className="h-5 w-5 text-slate-200" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="truncate text-lg font-semibold">{asset.name}</h3>
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: asset.color }}
                              />
                            </div>
                            <div className="mt-1 text-sm uppercase tracking-wide text-slate-400">
                              {asset.symbol}
                            </div>
                          </div>
                        </div>

                        <div
                          className={`rounded-full px-3 py-1 text-sm font-medium ${
                            positive
                              ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20"
                              : "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/20"
                          }`}
                        >
                          {positive ? "+" : ""}
                          {asset.priceChange.toFixed(2)}%
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/8">
                          <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                            Balance
                          </div>
                          <div className="mt-2 text-sm font-semibold tabular-nums">
                            {showBalance ? formatCoinAmount(asset.amount) : "••••••"}
                          </div>
                        </div>

                        <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/8">
                          <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                            Available
                          </div>
                          <div className="mt-2 text-sm font-semibold tabular-nums">
                            {showBalance ? formatCoinAmount(asset.available) : "••••••"}
                          </div>
                        </div>

                        <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/8">
                          <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                            Locked
                          </div>
                          <div className="mt-2 text-sm font-semibold tabular-nums">
                            {showBalance ? formatCoinAmount(asset.locked || 0) : "••••••"}
                          </div>
                        </div>

                        <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/8">
                          <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                            Price
                          </div>
                          <div className="mt-2 text-sm font-semibold tabular-nums">
                            {showBalance ? formatMoney(asset.currentPrice) : "••••••"}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/8">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                              Wallet Address
                            </div>
                            <div className="mt-2 break-all text-sm text-slate-200">
                              {showBalance ? asset.walletAddress : shortenAddress(asset.walletAddress)}
                            </div>
                          </div>

                          <button
                            onClick={() => copyText(asset.walletAddress, `${asset.symbol} address`)}
                            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm hover:bg-white/10"
                          >
                            <Copy className="h-4 w-4" />
                            Copy
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.14em] text-slate-500">
                          <span>Allocation</span>
                          <span>{allocationPercent.toFixed(1)}%</span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-white/8">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max(allocationPercent, 4)}%`,
                              background: `linear-gradient(90deg, ${asset.color}, ${asset.color}CC)`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => openModal("deposit", asset.symbol)}
                          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-emerald-500/15 px-4 text-sm text-emerald-200 ring-1 ring-emerald-400/20 hover:bg-emerald-500/20"
                        >
                          <ArrowDownLeft className="h-4 w-4" />
                          Deposit
                        </button>

                        <button
                          onClick={() => openModal("withdraw", asset.symbol)}
                          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-rose-500/15 px-4 text-sm text-rose-200 ring-1 ring-rose-400/20 hover:bg-rose-500/20"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                          Withdraw
                        </button>

                        <button
                          onClick={() => openModal("transfer", asset.symbol)}
                          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-sky-500/15 px-4 text-sm text-sky-200 ring-1 ring-sky-400/20 hover:bg-sky-500/20"
                        >
                          <Send className="h-4 w-4" />
                          Transfer
                        </button>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl bg-white/[0.04] px-4 py-3 ring-1 ring-white/8">
                        <div className="text-sm text-slate-400">Total Value</div>
                        <div className="text-lg font-semibold tabular-nums">
                          {showBalance ? formatMoney(asset.totalValue) : "••••••"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loadingMarket && filteredWallets.length === 0 && (
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
              <div className="text-lg font-medium">No assets found</div>
              <div className="mt-2 text-sm text-slate-400">
                Try a different search keyword or asset symbol.
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
              Wallet Coverage
            </div>
            <div className="mt-2 text-2xl font-semibold">{walletRows.length}</div>
            <div className="mt-2 text-sm text-slate-400">
              Active crypto wallets available in your portfolio.
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
              Visible Funds
            </div>
            <div className="mt-2 text-2xl font-semibold tabular-nums">
              {showBalance ? formatMoney(totalAvailable) : "••••••"}
            </div>
            <div className="mt-2 text-sm text-slate-400">
              Funds currently available for transfer or withdrawal.
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
              Reserved Funds
            </div>
            <div className="mt-2 text-2xl font-semibold tabular-nums">
              {showBalance ? formatMoney(totalLocked) : "••••••"}
            </div>
            <div className="mt-2 text-sm text-slate-400">
              Funds locked in pending operations or internal reserve holds.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyWallets;
