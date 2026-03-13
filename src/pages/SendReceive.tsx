import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { onValue, push, ref, set } from "firebase/database";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Search,
  Send,
  Wallet,
  CheckCircle2,
  RefreshCw,
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
  walletAddress?: string;
};

type ShellContext = {
  showBalance: boolean;
  setShowBalance: React.Dispatch<React.SetStateAction<boolean>>;
  globalSearch: string;
};

type ActionTab = "receive" | "send" | "transfer";

type UserWalletData = {
  wallets?: Record<string, number | string>;
  btc_balance?: number | string;
  eth_balance?: number | string;
  usdt_balance?: number | string;
  btc_address?: string;
  eth_address?: string;
  usdt_address?: string;
  email?: string;
  username?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
};

const ASSET_META = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "tether", symbol: "USDT", name: "Tether" },
];

const toNumber = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const SendReceive = () => {
  const { showBalance, globalSearch } = useOutletContext<ShellContext>();

  const [market, setMarket] = useState<MarketCoin[]>([]);
  const [loadingMarket, setLoadingMarket] = useState(true);
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [toast, setToast] = useState("");
  const [activeTab, setActiveTab] = useState<ActionTab>("receive");
  const [userId, setUserId] = useState<string>("");
  const [userData, setUserData] = useState<UserWalletData>({});

  const [selectedAsset, setSelectedAsset] = useState("BTC");
  const [sendAmount, setSendAmount] = useState("");
  const [sendAddress, setSendAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferRecipient, setTransferRecipient] = useState("");
  const [note, setNote] = useState("");

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
        setUserId("");
        setUserData({});
        setLoadingWallets(false);
        return;
      }

      setUserId(firebaseUser.uid);
      setLoadingWallets(true);

      const userRef = ref(db, `users/${firebaseUser.uid}`);
      const unsubscribeValue = onValue(
        userRef,
        (snapshot) => {
          const data = (snapshot.val() || {}) as UserWalletData;
          setUserData(data || {});
          setLoadingWallets(false);
        },
        (error) => {
          console.error("SendReceive wallet data fetch error:", error);
          setUserData({});
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
    const wallets = userData.wallets || {};

    return ASSET_META.map((asset) => {
      let amount = 0;
      let walletAddress = "";

      if (asset.symbol === "BTC") {
        amount = toNumber(wallets.BTC ?? userData.btc_balance);
        walletAddress = userData.btc_address || "";
      }

      if (asset.symbol === "ETH") {
        amount = toNumber(wallets.ETH ?? userData.eth_balance);
        walletAddress = userData.eth_address || "";
      }

      if (asset.symbol === "USDT") {
        amount = toNumber(wallets.USDT ?? userData.usdt_balance);
        walletAddress = userData.usdt_address || "";
      }

      return {
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        amount,
        locked: 0,
        walletAddress,
      };
    });
  }, [userData]);

  const walletRows = useMemo(() => {
    return portfolio.map((asset) => {
      const coin = marketMap[asset.id];
      const currentPrice = coin?.current_price ?? 0;
      const totalValue = asset.amount * currentPrice;
      const available = asset.amount - (asset.locked || 0);

      return {
        ...asset,
        image: coin?.image || "",
        currentPrice,
        totalValue,
        available,
        priceChange: coin?.price_change_percentage_24h ?? 0,
      };
    });
  }, [portfolio, marketMap]);

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

  const selectedWallet = useMemo(() => {
    return walletRows.find((w) => w.symbol === selectedAsset);
  }, [walletRows, selectedAsset]);

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

  const renderAddressState = (walletAddress?: string) => {
    if (walletAddress && walletAddress.trim()) return walletAddress;
    return "Generating wallet address";
  };

  const hasAssignedAddress = !!selectedWallet?.walletAddress?.trim();

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

  const buildUserDisplayName = () => {
    if (userData.name) return userData.name;
    const full = `${userData.firstName || ""} ${userData.lastName || ""}`.trim();
    if (full) return full;
    if (userData.username) return userData.username;
    if (userData.email) return userData.email;
    return "Client";
  };

  const createTransaction = async (payload: {
    type: "deposit" | "withdraw" | "transfer";
    asset: string;
    amount: number;
    walletAddress?: string;
    recipient?: string;
    note?: string;
  }) => {
    if (!userId) {
      setToast("User session not found");
      return false;
    }

    try {
      const txRef = push(ref(db, `transactions/${userId}`));

      await set(txRef, {
        id: txRef.key,
        userId,
        userName: buildUserDisplayName(),
        userEmail: userData.email || "",
        type: payload.type,
        asset: payload.asset,
        amount: payload.amount,
        walletAddress: payload.walletAddress || "",
        recipient: payload.recipient || "",
        note: payload.note || "",
        status: "Pending",
        createdAt: Date.now(),
        createdAtLabel: new Date().toLocaleString(),
      });

      return true;
    } catch (error) {
      console.error("Transaction write error:", error);
      setToast("Failed to submit request");
      return false;
    }
  };

  const handleDepositRequest = async () => {
    if (!selectedWallet) {
      setToast("Select asset");
      return;
    }

    const parsedAmount = Number(sendAmount || "0");
    if (!parsedAmount || parsedAmount <= 0) {
      setToast("Enter deposit amount");
      return;
    }

    const ok = await createTransaction({
      type: "deposit",
      asset: selectedWallet.symbol,
      amount: parsedAmount,
      walletAddress: selectedWallet.walletAddress || "",
      note,
    });

    if (ok) {
      setToast("Deposit request submitted");
      setSendAmount("");
      setNote("");
    }
  };

  const handleSend = async () => {
    if (!selectedWallet) {
      setToast("Select asset");
      return;
    }

    const parsedAmount = Number(sendAmount || "0");

    if (!parsedAmount || parsedAmount <= 0) {
      setToast("Enter amount");
      return;
    }

    if (!sendAddress.trim()) {
      setToast("Enter destination wallet address");
      return;
    }

    if (parsedAmount > selectedWallet.available) {
      setToast("Insufficient available balance");
      return;
    }

    const ok = await createTransaction({
      type: "withdraw",
      asset: selectedWallet.symbol,
      amount: parsedAmount,
      walletAddress: sendAddress.trim(),
      note,
    });

    if (ok) {
      setToast("Withdraw request submitted");
      setSendAmount("");
      setSendAddress("");
      setNote("");
    }
  };

  const handleTransfer = async () => {
    if (!selectedWallet) {
      setToast("Select asset");
      return;
    }

    const parsedAmount = Number(transferAmount || "0");

    if (!parsedAmount || parsedAmount <= 0) {
      setToast("Enter transfer amount");
      return;
    }

    if (!transferRecipient.trim()) {
      setToast("Enter recipient username or email");
      return;
    }

    if (parsedAmount > selectedWallet.available) {
      setToast("Insufficient available balance");
      return;
    }

    const ok = await createTransaction({
      type: "transfer",
      asset: selectedWallet.symbol,
      amount: parsedAmount,
      recipient: transferRecipient.trim(),
      note,
    });

    if (ok) {
      setToast("Internal transfer request submitted");
      setTransferAmount("");
      setTransferRecipient("");
      setNote("");
    }
  };

  const quickStats = useMemo(() => {
    if (!selectedWallet) return null;

    return {
      balance: selectedWallet.amount,
      available: selectedWallet.available,
      locked: selectedWallet.locked || 0,
      price: selectedWallet.currentPrice,
      value: selectedWallet.totalValue,
    };
  }, [selectedWallet]);

  const isLoading = loadingMarket || loadingWallets;

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
            Wallet Operations
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Send / Receive
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
            Receive funds to your assigned wallet address, send assets to external
            wallets, or transfer funds internally between users.
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <section className="rounded-[28px] border border-cyan-300/10 bg-[linear-gradient(135deg,rgba(59,130,246,0.16),rgba(34,211,238,0.10),rgba(139,92,246,0.14))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)] sm:p-6 lg:p-7">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-3">
              {[
                { key: "receive", label: "Receive", icon: ArrowDownLeft },
                { key: "send", label: "Withdraw / Send", icon: ArrowUpRight },
                { key: "transfer", label: "Internal Transfer", icon: Send },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as ActionTab)}
                    className={`inline-flex h-12 items-center gap-2 rounded-2xl px-4 text-sm font-medium transition ${
                      isActive
                        ? "bg-white/12 text-white ring-1 ring-cyan-300/20"
                        : "bg-white/5 text-slate-300 ring-1 ring-white/10 hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="rounded-[28px] bg-white/6 p-5 ring-1 ring-white/10">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-end">
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

                <div className="relative">
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

              {selectedWallet && (
                <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
                  <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                      Balance
                    </div>
                    <div className="mt-2 text-sm font-semibold tabular-nums">
                      {showBalance ? formatCoinAmount(quickStats?.balance || 0) : "••••••"}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                      Available
                    </div>
                    <div className="mt-2 text-sm font-semibold tabular-nums">
                      {showBalance ? formatCoinAmount(quickStats?.available || 0) : "••••••"}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                      Locked
                    </div>
                    <div className="mt-2 text-sm font-semibold tabular-nums">
                      {showBalance ? formatCoinAmount(quickStats?.locked || 0) : "••••••"}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                      Price
                    </div>
                    <div className="mt-2 text-sm font-semibold tabular-nums">
                      {showBalance ? formatMoney(quickStats?.price || 0) : "••••••"}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                      Value
                    </div>
                    <div className="mt-2 text-sm font-semibold tabular-nums">
                      {showBalance ? formatMoney(quickStats?.value || 0) : "••••••"}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "receive" && selectedWallet && (
                <div className="mt-5 rounded-[26px] bg-white/5 p-5 ring-1 ring-white/10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                        Receive {selectedWallet.symbol}
                      </div>
                      <div className="mt-2 text-lg font-semibold">
                        Deposit to your assigned wallet
                      </div>
                    </div>

                    {selectedWallet.image ? (
                      <img
                        src={selectedWallet.image}
                        alt={selectedWallet.name}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                        <Wallet className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  <div className="mt-5 rounded-3xl bg-white/5 p-4 ring-1 ring-white/8">
                    <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                      Wallet Address
                    </div>
                    <div
                      className={`mt-3 break-all text-sm ${
                        hasAssignedAddress ? "text-slate-200" : "text-amber-200"
                      }`}
                    >
                      {showBalance
                        ? renderAddressState(selectedWallet.walletAddress)
                        : hasAssignedAddress
                        ? shortenAddress(selectedWallet.walletAddress || "")
                        : "Generating wallet address"}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() =>
                        copyText(selectedWallet.walletAddress || "", `${selectedWallet.symbol} address`)
                      }
                      className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm hover:bg-white/10"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Address
                    </button>

                    {!hasAssignedAddress && (
                      <div className="inline-flex h-11 items-center rounded-2xl bg-amber-500/10 px-4 text-sm text-amber-200 ring-1 ring-amber-400/15">
                        Wallet address is being assigned by administrator
                      </div>
                    )}
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-4">
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">Expected Amount</label>
                      <input
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        placeholder={`Enter ${selectedWallet.symbol} deposit amount`}
                        className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">Note</label>
                      <input
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Optional deposit note"
                        className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={handleDepositRequest}
                      className="inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-5 text-sm font-medium text-white shadow-[0_0_25px_rgba(16,185,129,0.18)] hover:opacity-95"
                    >
                      <ArrowDownLeft className="h-4 w-4" />
                      Submit Deposit Request
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "send" && selectedWallet && (
                <div className="mt-5 rounded-[26px] bg-white/5 p-5 ring-1 ring-white/10">
                  <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                    Withdraw / Send
                  </div>
                  <div className="mt-2 text-lg font-semibold">
                    Send {selectedWallet.symbol} to an external wallet
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-4">
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">Amount</label>
                      <input
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        placeholder={`Enter ${selectedWallet.symbol} amount`}
                        className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">Destination Wallet Address</label>
                      <input
                        value={sendAddress}
                        onChange={(e) => setSendAddress(e.target.value)}
                        placeholder="Recipient wallet address"
                        className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">Note</label>
                      <input
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Optional note"
                        className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={handleSend}
                      className="inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 px-5 text-sm font-medium text-white shadow-[0_0_25px_rgba(244,63,94,0.18)] hover:opacity-95"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                      Submit Withdrawal
                    </button>

                    <div className="inline-flex h-12 items-center rounded-2xl bg-white/5 px-4 text-sm text-slate-300 ring-1 ring-white/10">
                      Available: {showBalance ? formatCoinAmount(selectedWallet.available) : "••••••"}{" "}
                      {selectedWallet.symbol}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "transfer" && selectedWallet && (
                <div className="mt-5 rounded-[26px] bg-white/5 p-5 ring-1 ring-white/10">
                  <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                    Internal Transfer
                  </div>
                  <div className="mt-2 text-lg font-semibold">
                    Transfer {selectedWallet.symbol} to another client
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-4">
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">Recipient Username / Email</label>
                      <input
                        value={transferRecipient}
                        onChange={(e) => setTransferRecipient(e.target.value)}
                        placeholder="Enter recipient username or email"
                        className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">Amount</label>
                      <input
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        placeholder={`Enter ${selectedWallet.symbol} amount`}
                        className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">Note</label>
                      <input
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Optional note"
                        className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={handleTransfer}
                      className="inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 px-5 text-sm font-medium text-white shadow-[0_0_25px_rgba(14,165,233,0.18)] hover:opacity-95"
                    >
                      <Send className="h-4 w-4" />
                      Submit Transfer
                    </button>

                    <div className="inline-flex h-12 items-center rounded-2xl bg-white/5 px-4 text-sm text-slate-300 ring-1 ring-white/10">
                      Available: {showBalance ? formatCoinAmount(selectedWallet.available) : "••••••"}{" "}
                      {selectedWallet.symbol}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
            <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
              Selected Asset
            </div>

            {selectedWallet ? (
              <div className="mt-4">
                <div className="flex items-center gap-3">
                  {selectedWallet.image ? (
                    <img
                      src={selectedWallet.image}
                      alt={selectedWallet.name}
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                      <Wallet className="h-4 w-4" />
                    </div>
                  )}

                  <div>
                    <div className="text-lg font-semibold">{selectedWallet.name}</div>
                    <div className="text-sm uppercase text-slate-400">
                      {selectedWallet.symbol}
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                      Price
                    </div>
                    <div className="mt-2 text-sm font-semibold tabular-nums">
                      {showBalance ? formatMoney(selectedWallet.currentPrice) : "••••••"}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                      24H
                    </div>
                    <div
                      className={`mt-2 text-sm font-semibold ${
                        selectedWallet.priceChange >= 0 ? "text-emerald-300" : "text-rose-300"
                      }`}
                    >
                      {selectedWallet.priceChange >= 0 ? "+" : ""}
                      {selectedWallet.priceChange.toFixed(2)}%
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                      Balance
                    </div>
                    <div className="mt-2 text-sm font-semibold tabular-nums">
                      {showBalance ? formatCoinAmount(selectedWallet.amount) : "••••••"}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                      Value
                    </div>
                    <div className="mt-2 text-sm font-semibold tabular-nums">
                      {showBalance ? formatMoney(selectedWallet.totalValue) : "••••••"}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-sm text-slate-400">No asset selected</div>
            )}
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
            <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
              Operation Status
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-emerald-500/10 p-4 ring-1 ring-emerald-400/15">
                <div className="flex items-center gap-2 text-emerald-200">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Receiving enabled</span>
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="text-sm text-slate-300">
                  External withdrawals require a destination wallet address and amount.
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="text-sm text-slate-300">
                  Internal transfers require the recipient username or email.
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
            <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
              Assigned Wallet Address
            </div>

            <div
              className={`mt-4 break-all rounded-3xl p-4 text-sm ring-1 ${
                hasAssignedAddress
                  ? "bg-white/5 text-slate-200 ring-white/10"
                  : "bg-amber-500/10 text-amber-200 ring-amber-400/15"
              }`}
            >
              {showBalance
                ? renderAddressState(selectedWallet?.walletAddress)
                : hasAssignedAddress
                ? shortenAddress(selectedWallet?.walletAddress || "")
                : "Generating wallet address"}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() =>
                  copyText(selectedWallet?.walletAddress || "", `${selectedWallet?.symbol || "Wallet"} address`)
                }
                className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm hover:bg-white/10"
              >
                <Copy className="h-4 w-4" />
                Copy Address
              </button>
            </div>
          </section>
        </aside>
      </div>

      <section className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6 lg:p-7">
        <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
          Available Wallet Assets
        </div>
        <div className="mt-1 text-lg font-semibold">Choose an asset for sending or receiving</div>

        {isLoading ? (
          <div className="mt-6 rounded-3xl bg-white/5 p-6 text-sm text-slate-400">
            Loading asset data...
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filteredWallets.map((asset) => {
              const isSelected = asset.symbol === selectedAsset;
              return (
                <button
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset.symbol)}
                  className={`rounded-[26px] border p-4 text-left transition ${
                    isSelected
                      ? "border-cyan-400/25 bg-cyan-500/8 ring-1 ring-cyan-300/15"
                      : "border-white/10 bg-white/5 hover:bg-white/[0.07]"
                  }`}
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

                    <div className="text-right">
                      <div className="text-sm font-semibold tabular-nums">
                        {showBalance ? formatMoney(asset.totalValue) : "••••••"}
                      </div>
                      <div
                        className={`mt-1 text-sm ${
                          asset.priceChange >= 0 ? "text-emerald-300" : "text-rose-300"
                        }`}
                      >
                        {asset.priceChange >= 0 ? "+" : ""}
                        {asset.priceChange.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default SendReceive;
