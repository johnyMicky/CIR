import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  ArrowDownUp,
  RefreshCw,
  Wallet,
  ChevronDown,
  Info,
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
  locked?: number;
};

type ShellContext = {
  showBalance: boolean;
  setShowBalance: React.Dispatch<React.SetStateAction<boolean>>;
  globalSearch: string;
};

const portfolio: PortfolioAsset[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", amount: 0.2458, locked: 0.012 },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", amount: 2.86, locked: 0.2 },
  { id: "tether", symbol: "USDT", name: "Tether", amount: 5400, locked: 350 },
  { id: "solana", symbol: "SOL", name: "Solana", amount: 22.5, locked: 1.1 },
  { id: "binancecoin", symbol: "BNB", name: "BNB", amount: 5.1, locked: 0.4 },
];

const ExchangeSwap = () => {
  const { showBalance, globalSearch } = useOutletContext<ShellContext>();

  const [market, setMarket] = useState<MarketCoin[]>([]);
  const [loadingMarket, setLoadingMarket] = useState(true);
  const [toast, setToast] = useState("");

  const [fromAsset, setFromAsset] = useState("BTC");
  const [toAsset, setToAsset] = useState("USDT");
  const [fromAmount, setFromAmount] = useState("");
  const [slippage, setSlippage] = useState("0.50");

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
      acc[coin.symbol.toUpperCase()] = coin;
      return acc;
    }, {});
  }, [market]);

  const walletRows = useMemo(() => {
    return portfolio.map((asset) => {
      const coin = marketMap[asset.symbol];
      const currentPrice = coin?.current_price ?? 0;
      const available = asset.amount - (asset.locked || 0);
      const totalValue = currentPrice * asset.amount;

      return {
        ...asset,
        image: coin?.image || "",
        currentPrice,
        available,
        totalValue,
        change24h: coin?.price_change_percentage_24h ?? 0,
      };
    });
  }, [marketMap]);

  const filteredAssets = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return walletRows;

    return walletRows.filter(
      (asset) =>
        asset.name.toLowerCase().includes(q) ||
        asset.symbol.toLowerCase().includes(q) ||
        asset.id.toLowerCase().includes(q)
    );
  }, [walletRows, globalSearch]);

  const assetOptions = filteredAssets.length ? filteredAssets : walletRows;

  const fromWallet = useMemo(
    () => walletRows.find((w) => w.symbol === fromAsset),
    [walletRows, fromAsset]
  );

  const toWallet = useMemo(
    () => walletRows.find((w) => w.symbol === toAsset),
    [walletRows, toAsset]
  );

  const fromPrice = fromWallet?.currentPrice || 0;
  const toPrice = toWallet?.currentPrice || 0;

  const parsedFromAmount = Number(fromAmount) || 0;

  const grossUsdValue = parsedFromAmount * fromPrice;
  const feeRate = 0.0035;
  const feeUsd = grossUsdValue * feeRate;
  const netUsd = Math.max(grossUsdValue - feeUsd, 0);
  const estimatedReceive = toPrice > 0 ? netUsd / toPrice : 0;
  const rate = toPrice > 0 ? fromPrice / toPrice : 0;

  const minimumReceived = estimatedReceive * (1 - (Number(slippage) || 0) / 100);

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

  const reverseSwap = () => {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
    setFromAmount("");
  };

  const setMaxAmount = () => {
    if (!fromWallet) return;
    setFromAmount(String(fromWallet.available));
  };

  const handleSwap = () => {
    if (!fromWallet || !toWallet) {
      setToast("Select both assets");
      return;
    }

    if (!fromAmount || parsedFromAmount <= 0) {
      setToast("Enter swap amount");
      return;
    }

    if (parsedFromAmount > fromWallet.available) {
      setToast("Insufficient available balance");
      return;
    }

    if (fromAsset === toAsset) {
      setToast("Choose different assets");
      return;
    }

    setToast("Swap request submitted");
    setFromAmount("");
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {toast && (
        <div className="fixed right-4 top-24 z-[100] rounded-2xl border border-cyan-400/20 bg-[#0F1B33]/95 px-4 py-3 text-sm text-cyan-100 shadow-2xl backdrop-blur-xl">
          {toast}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <div className="text-sm uppercase tracking-[0.18em] text-cyan-300/80">
            Conversion Desk
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Exchange / Swap
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
            Convert assets inside your wallet using live market prices, estimated
            receive preview, and controlled fee visibility.
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_380px]">
        <section className="rounded-[28px] border border-cyan-300/10 bg-[linear-gradient(135deg,rgba(59,130,246,0.16),rgba(34,211,238,0.10),rgba(139,92,246,0.14))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)] sm:p-6 lg:p-7">
          <div className="rounded-[28px] bg-[#0C182D]/70 p-5 ring-1 ring-white/10 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                  Swap Panel
                </div>
                <div className="mt-1 text-lg font-semibold">Convert one asset into another</div>
              </div>

              <button
                onClick={reverseSwap}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10"
              >
                <ArrowDownUp className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5">
              <div className="rounded-[26px] bg-white/5 p-4 ring-1 ring-white/10">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    From
                  </div>
                  <button
                    onClick={setMaxAmount}
                    className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200 ring-1 ring-cyan-400/15"
                  >
                    Max
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="relative">
                    <select
                      value={fromAsset}
                      onChange={(e) => setFromAsset(e.target.value)}
                      className="h-14 w-full appearance-none rounded-2xl border border-white/10 bg-white/5 px-4 pr-10 text-sm outline-none focus:border-cyan-400/40"
                    >
                      {assetOptions.map((asset) => (
                        <option key={asset.symbol} value={asset.symbol} className="bg-slate-900">
                          {asset.symbol}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>

                  <input
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    placeholder="0.00"
                    className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-lg font-medium outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
                  <span>
                    Available:{" "}
                    {showBalance && fromWallet
                      ? `${formatCoinAmount(fromWallet.available)} ${fromWallet.symbol}`
                      : "••••••"}
                  </span>
                  <span>
                    {showBalance && fromWallet
                      ? formatMoney((fromWallet.available || 0) * (fromWallet.currentPrice || 0))
                      : "••••••"}
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={reverseSwap}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 hover:bg-cyan-500/15"
                >
                  <ArrowDownUp className="h-4 w-4 text-cyan-200" />
                </button>
              </div>

              <div className="rounded-[26px] bg-white/5 p-4 ring-1 ring-white/10">
                <div className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                  To
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="relative">
                    <select
                      value={toAsset}
                      onChange={(e) => setToAsset(e.target.value)}
                      className="h-14 w-full appearance-none rounded-2xl border border-white/10 bg-white/5 px-4 pr-10 text-sm outline-none focus:border-cyan-400/40"
                    >
                      {assetOptions.map((asset) => (
                        <option key={asset.symbol} value={asset.symbol} className="bg-slate-900">
                          {asset.symbol}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>

                  <div className="flex h-14 items-center rounded-2xl border border-white/10 bg-white/5 px-4 text-lg font-medium">
                    {estimatedReceive > 0 ? formatCoinAmount(estimatedReceive) : "0.00"}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
                  <span>
                    Estimated receive:{" "}
                    {estimatedReceive > 0 ? `${formatCoinAmount(estimatedReceive)} ${toAsset}` : `0.00 ${toAsset}`}
                  </span>
                  <span>
                    {showBalance ? formatMoney(netUsd) : "••••••"}
                  </span>
                </div>
              </div>

              <div className="rounded-[26px] bg-white/5 p-4 ring-1 ring-white/10">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Slippage tolerance</label>
                    <select
                      value={slippage}
                      onChange={(e) => setSlippage(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-cyan-400/40"
                    >
                      <option value="0.10" className="bg-slate-900">0.10%</option>
                      <option value="0.50" className="bg-slate-900">0.50%</option>
                      <option value="1.00" className="bg-slate-900">1.00%</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleSwap}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 text-sm font-medium text-white shadow-[0_0_25px_rgba(34,211,238,0.18)] hover:opacity-95"
                    >
                      <ArrowDownUp className="h-4 w-4" />
                      Confirm Swap
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
            <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
              Swap Preview
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/8">
                <span className="text-sm text-slate-400">Rate</span>
                <span className="text-sm font-medium tabular-nums">
                  {rate > 0 ? `1 ${fromAsset} ≈ ${formatCoinAmount(rate)} ${toAsset}` : "—"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/8">
                <span className="text-sm text-slate-400">Gross value</span>
                <span className="text-sm font-medium tabular-nums">
                  {showBalance ? formatMoney(grossUsdValue) : "••••••"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/8">
                <span className="text-sm text-slate-400">Fee</span>
                <span className="text-sm font-medium tabular-nums">
                  {showBalance ? formatMoney(feeUsd) : "••••••"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/8">
                <span className="text-sm text-slate-400">Minimum received</span>
                <span className="text-sm font-medium tabular-nums">
                  {minimumReceived > 0 ? `${formatCoinAmount(minimumReceived)} ${toAsset}` : `0.00 ${toAsset}`}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/8">
                <span className="text-sm text-slate-400">Price impact</span>
                <span className="text-sm font-medium text-emerald-300">Low</span>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
            <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
              Wallet Summary
            </div>

            {fromWallet ? (
              <div className="mt-4">
                <div className="flex items-center gap-3">
                  {fromWallet.image ? (
                    <img
                      src={fromWallet.image}
                      alt={fromWallet.name}
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                      <Wallet className="h-4 w-4" />
                    </div>
                  )}

                  <div>
                    <div className="text-lg font-semibold">{fromWallet.name}</div>
                    <div className="text-sm uppercase text-slate-400">{fromWallet.symbol}</div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                      Available
                    </div>
                    <div className="mt-2 text-sm font-semibold tabular-nums">
                      {showBalance ? formatCoinAmount(fromWallet.available) : "••••••"}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                      Price
                    </div>
                    <div className="mt-2 text-sm font-semibold tabular-nums">
                      {showBalance ? formatMoney(fromWallet.currentPrice) : "••••••"}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                      24H
                    </div>
                    <div
                      className={`mt-2 text-sm font-semibold ${
                        fromWallet.change24h >= 0 ? "text-emerald-300" : "text-rose-300"
                      }`}
                    >
                      {fromWallet.change24h >= 0 ? "+" : ""}
                      {fromWallet.change24h.toFixed(2)}%
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                      Value
                    </div>
                    <div className="mt-2 text-sm font-semibold tabular-nums">
                      {showBalance ? formatMoney(fromWallet.totalValue) : "••••••"}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-sm text-slate-400">No asset selected</div>
            )}
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 text-cyan-300" />
              <div>
                <div className="text-sm font-medium text-cyan-200">Swap info</div>
                <div className="mt-2 text-sm leading-6 text-slate-400">
                  Estimated output is based on live market prices and a mock conversion fee.
                  Final execution logic can be connected to your backend after the client
                  dashboard is fully finished.
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <section className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6 lg:p-7">
        <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
          Supported Wallet Assets
        </div>
        <div className="mt-1 text-lg font-semibold">Choose assets available for conversion</div>

        {loadingMarket && market.length === 0 ? (
          <div className="mt-6 rounded-3xl bg-white/5 p-6 text-sm text-slate-400">
            Loading asset data...
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
            {assetOptions.map((asset) => {
              const isFrom = asset.symbol === fromAsset;
              const isTo = asset.symbol === toAsset;

              return (
                <div
                  key={asset.id}
                  className="rounded-[26px] border border-white/10 bg-white/5 p-4 transition hover:bg-white/[0.07]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      {asset.image ? (
                        <img
                          src={asset.image}
                          alt={asset.name}
                          className="h-11 w-11 rounded-full"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                          <Wallet className="h-4 w-4" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="truncate font-semibold">{asset.name}</div>
                        <div className="text-sm uppercase text-slate-400">{asset.symbol}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setFromAsset(asset.symbol)}
                        className={`rounded-xl px-3 py-2 text-xs font-medium ${
                          isFrom
                            ? "bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-400/20"
                            : "bg-white/5 text-slate-300 ring-1 ring-white/10 hover:bg-white/10"
                        }`}
                      >
                        From
                      </button>

                      <button
                        onClick={() => setToAsset(asset.symbol)}
                        className={`rounded-xl px-3 py-2 text-xs font-medium ${
                          isTo
                            ? "bg-blue-500/15 text-blue-200 ring-1 ring-blue-400/20"
                            : "bg-white/5 text-slate-300 ring-1 ring-white/10 hover:bg-white/10"
                        }`}
                      >
                        To
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default ExchangeSwap;
