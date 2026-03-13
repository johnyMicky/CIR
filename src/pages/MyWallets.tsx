import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  RefreshCw,
  Search,
  Send,
  Wallet,
  ChevronRight,
  X,
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
  locked?: number;
  walletAddress?: string;
};

type ModalType = "deposit" | "withdraw" | "transfer" | null;

type ShellContext = {
  showBalance: boolean;
  setShowBalance: React.Dispatch<React.SetStateAction<boolean>>;
  globalSearch: string;
};

const portfolio: PortfolioAsset[] = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    amount: 0.2458,
    locked: 0.012,
    walletAddress: "",
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
    walletAddress: "",
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
    walletAddress: "",
  },
];

const COLORS = ["#3B82F6", "#22D3EE", "#8B5CF6", "#10B981", "#F59E0B"];

const MyWallets = () => {
  const { showBalance, globalSearch } = useOutletContext<ShellContext>();

  const [market, setMarket] = useState<MarketCoin[]>([]);
  const [loadingMarket, setLoadingMarket] = useState(true);
  const [toast, setToast] = useState("");
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedAsset, setSelectedAsset] = useState("BTC");
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
    const q = globalSearch.trim().toLowerCase();
    if (!q) return walletRows;

    return walletRows.filter(
      (asset) =>
        asset.name.toLowerCase().includes(q) ||
        asset.symbol.toLowerCase().includes(q) ||
        asset.id.toLowerCase().includes(q)
    );
  }, [walletRows, globalSearch]);

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
    if (!value) {
      setToast("Wallet address is not assigned yet");
      return;
    }

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

  const selectedWallet = walletRows.find((w) => w.symbol === selectedAsset);

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

  const renderAddressState = (walletAddress?: string) => {
    if (walletAddress && walletAddress.trim()) {
      return walletAddress;
    }
    return "Generating wallet address";
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {toast && (
        <div className="fixed right-4 top-24 z-[100] rounded-2xl border border-cyan-400/20 bg-[#0F1B33]/95 px-4 py-3 text-sm text-cyan-100 shadow-2xl backdrop-blur-xl">
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
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
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
                    {selectedWallet?.walletAddress?.trim()
                      ? selectedWallet.walletAddress
                      : "Wallet address is being assigned by administrator"}
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

      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
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

        <button
          onClick={() => setToast("Market refresh is automatic")}
          className="inline-flex h-12 items-center gap-2 rounded-2xl border border-cyan-400/15 bg-cyan-500/10 px-4 text-sm text-cyan-200 hover:bg-cyan-500/15"
        >
          <RefreshCw className="h-4 w-4" />
          Auto Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_1fr]">
        <section className="overflow-hidden rounded-[28px] border border-cyan-300/10 bg-[linear-gradient(135deg,rgba(59,130,246,0.16),rgba(34,211,238,0.10),rgba(139,92,246,0.14))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)] sm:p-6 lg:p-7">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.35fr)_380px]">
            <div className="min-w-0">
              <div className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200/80">
                Total Wallet Value
              </div>

              <div className="mt-6 min-w-0">
                <div className="max-w-full text-[42px] font-semibold leading-none tracking-tight tabular-nums sm:text-[54px] xl:text-[62px]">
                  {showBalance ? formatMoney(totalAssets) : "••••••••"}
                </div>
              </div>

              <div className="mt-6 text-base text-slate-300">
                Combined value across {walletRows.length} active crypto wallets
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-2">
              <div className="rounded-[26px] bg-white/8 p-5 ring-1 ring-white/10">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Available
                </div>
                <div className="mt-4 text-[28px] font-semibold leading-none tabular-nums sm:text-[34px]">
                  {showBalance ? formatMoney(totalAvailable) : "••••••"}
                </div>
              </div>

              <div className="rounded-[26px] bg-white/8 p-5 ring-1 ring-white/10">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Locked
                </div>
                <div className="mt-4 text-[28px] font-semibold leading-none tabular-nums sm:text-[34px]">
                  {showBalance ? formatMoney(totalLocked) : "••••••"}
                </div>
              </div>

              <div className="rounded-[26px] bg-white/8 p-5 ring-1 ring-white/10 sm:col-span-2">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Best 24H Performer
                </div>

                <div className="mt-4 flex items-center gap-3">
                  {bestPerformer?.image ? (
                    <img
                      src={bestPerformer.image}
                      alt={bestPerformer.name}
                      className="h-11 w-11 rounded-full"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                      <Wallet className="h-4 w-4" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="truncate text-[18px] font-semibold">
                      {bestPerformer?.name || "—"}
                    </div>
                    <div className="mt-1 text-[18px] font-medium text-emerald-300 tabular-nums">
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

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
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
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className={`group rounded-3xl bg-gradient-to-br ${action.cls} p-5 text-left ring-1 ring-white/10 transition duration-200 hover:scale-[1.02] hover:ring-white/20`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50 transition group-hover:translate-x-1" />
                  </div>
                  <div className="mt-8 text-lg font-semibold">{action.label}</div>
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
              value={globalSearch}
              readOnly
              placeholder="Search by asset name or symbol"
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-400"
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
              const hasAddress = !!asset.walletAddress?.trim();

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
                          <div
                            className={`mt-2 break-all text-sm ${
                              hasAddress ? "text-slate-200" : "text-amber-200"
                            }`}
                          >
                            {showBalance
                              ? renderAddressState(asset.walletAddress)
                              : hasAddress
                              ? shortenAddress(asset.walletAddress || "")
                              : "Generating wallet address"}
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            copyText(asset.walletAddress || "", `${asset.symbol} address`)
                          }
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
  );
};

export default MyWallets;
