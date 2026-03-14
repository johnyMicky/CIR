import React, { useEffect, useMemo, useState } from "react";
import { ref, onValue, update, push, set } from "firebase/database";
import { useParams } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Wallet,
  Wifi,
  WifiOff,
  Clock3,
  Save,
  RefreshCw,
  BadgeDollarSign,
  Activity,
  ChevronRight,
  ShieldAlert,
  Ban,
  RotateCcw,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import { db } from "../../firebase";

type WalletMap = {
  BTC?: number | string;
  ETH?: number | string;
  USDT?: number | string;
};

type UserRecord = {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  country?: string;
  stateRegion?: string;
  city?: string;
  role?: string;
  status?: string;
  accountStatus?: "active" | "suspended" | "blocked" | string;
  created_at?: string;
  last_seen?: number | string;
  online?: boolean;

  wallets?: WalletMap;

  btc_balance?: number | string;
  eth_balance?: number | string;
  usdt_balance?: number | string;
  usd_balance?: number | string;

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

type ManualActionStatus = "Pending" | "Completed" | "Failed";
type ManualActionKind = "credit" | "debit";
type ManualInputMode = "usd_to_crypto" | "crypto_direct";

type MarketPrices = {
  BTC: number;
  ETH: number;
  USDT: number;
};

const toNumber = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const formatLastSeen = (value?: number | string) => {
  if (!value) return "No activity yet";

  const timestamp = typeof value === "string" ? Number(value) : value;
  if (!timestamp) return "No activity yet";

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

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

const formatCoin = (value: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 8 : 6,
  }).format(value);

const AdminUserDetails = () => {
  const { id } = useParams();

  const [userData, setUserData] = useState<UserRecord | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [marketPrices, setMarketPrices] = useState<MarketPrices>({
    BTC: 65000,
    ETH: 3500,
    USDT: 1,
  });

  const [wallets, setWallets] = useState({
    btc_address: "",
    eth_address: "",
    usdt_address: "",
  });

  const [balances, setBalances] = useState({
    btc_balance: "",
    eth_balance: "",
    usdt_balance: "",
    usd_balance: "",
  });

  const [balanceReason, setBalanceReason] = useState("");

  const [manualAction, setManualAction] = useState({
    kind: "credit" as ManualActionKind,
    inputMode: "usd_to_crypto" as ManualInputMode,
    coin: "BTC",
    usd: "",
    crypto: "",
    label: "Daily Gift",
    note: "",
    status: "Completed" as ManualActionStatus,
  });

  const [savingWallets, setSavingWallets] = useState(false);
  const [savingBalances, setSavingBalances] = useState(false);
  const [applyingManualAction, setApplyingManualAction] = useState(false);
  const [updatingAccountStatus, setUpdatingAccountStatus] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchMarket = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether"
        );
        const data = await res.json();

        if (!mounted || !Array.isArray(data)) return;

        const btc = data.find((c: any) => c.id === "bitcoin")?.current_price ?? 65000;
        const eth = data.find((c: any) => c.id === "ethereum")?.current_price ?? 3500;
        const usdt = data.find((c: any) => c.id === "tether")?.current_price ?? 1;

        setMarketPrices({
          BTC: Number(btc),
          ETH: Number(eth),
          USDT: Number(usdt),
        });
      } catch (error) {
        console.error("Admin user details market fetch error:", error);
      }
    };

    fetchMarket();
    const interval = setInterval(fetchMarket, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!id) return;

    const userRef = ref(db, `users/${id}`);
    const activityRef = ref(db, `activity_logs/${id}`);

    const unsubUser = onValue(userRef, (snapshot) => {
      if (!snapshot.exists()) {
        setUserData(null);
        return;
      }

      const data = snapshot.val() as UserRecord;
      setUserData(data);

      const walletsNode = data.wallets || {};

      setWallets({
        btc_address: data.btc_address || "",
        eth_address: data.eth_address || "",
        usdt_address: data.usdt_address || "",
      });

      setBalances({
        btc_balance: String(toNumber(walletsNode.BTC ?? data.btc_balance)),
        eth_balance: String(toNumber(walletsNode.ETH ?? data.eth_balance)),
        usdt_balance: String(toNumber(walletsNode.USDT ?? data.usdt_balance)),
        usd_balance: String(toNumber(data.usd_balance)),
      });
    });

    const unsubActivity = onValue(activityRef, (snapshot) => {
      if (!snapshot.exists()) {
        setActivities([]);
        return;
      }

      const data = snapshot.val();
      const rows = Object.entries(data).map(([activityId, value]) => ({
        id: activityId,
        ...(value as any),
      })) as ActivityItem[];

      rows.sort((a, b) => Number(b.created_at || 0) - Number(a.created_at || 0));
      setActivities(rows.slice(0, 12));
    });

    return () => {
      unsubUser();
      unsubActivity();
    };
  }, [id]);

  const fullName = useMemo(() => {
    if (!userData) return "User";
    return (
      userData.fullName ||
      `${userData.firstName || ""} ${userData.lastName || ""}`.trim() ||
      "User"
    );
  }, [userData]);

  const accountStatus = useMemo(() => {
    return (userData?.accountStatus || userData?.status || "active").toLowerCase();
  }, [userData]);

  const totalEstimatedUsd = useMemo(() => {
    const btc = toNumber(balances.btc_balance);
    const eth = toNumber(balances.eth_balance);
    const usdt = toNumber(balances.usdt_balance);
    return (
      btc * marketPrices.BTC +
      eth * marketPrices.ETH +
      usdt * marketPrices.USDT
    );
  }, [balances, marketPrices]);

  const manualPreview = useMemo(() => {
    const price = marketPrices[manualAction.coin as keyof MarketPrices] || 1;
    const usdValue = toNumber(manualAction.usd);
    const cryptoValue = toNumber(manualAction.crypto);

    if (manualAction.inputMode === "usd_to_crypto") {
      const cryptoResult = price > 0 ? usdValue / price : 0;
      return {
        cryptoAmount: cryptoResult,
        usdAmount: usdValue,
      };
    }

    return {
      cryptoAmount: cryptoValue,
      usdAmount: cryptoValue * price,
    };
  }, [manualAction, marketPrices]);

  const clearMessages = () => {
    setSuccessMessage("");
    setErrorMessage("");
  };

  const addAdminLog = async (action: string, details: any = {}) => {
    try {
      const logRef = push(ref(db, "admin_logs"));
      await set(logRef, {
        targetUserId: id,
        action,
        details,
        created_at: Date.now(),
      });
    } catch (err) {
      console.error("Admin log error:", err);
    }
  };

  const addActivityLog = async (type: string, details: any = {}) => {
    if (!id) return;

    try {
      const logRef = push(ref(db, `activity_logs/${id}`));
      await set(logRef, {
        type,
        page: `/dashboard`,
        details,
        created_at: Date.now(),
      });
    } catch (err) {
      console.error("Activity log error:", err);
    }
  };

  const syncUserBalances = async (nextBalances: {
    btc_balance: number;
    eth_balance: number;
    usdt_balance: number;
    usd_balance: number;
  }) => {
    if (!id) return;

    await update(ref(db, `users/${id}`), {
      btc_balance: nextBalances.btc_balance,
      eth_balance: nextBalances.eth_balance,
      usdt_balance: nextBalances.usdt_balance,
      usd_balance: nextBalances.usd_balance,
      wallets: {
        BTC: nextBalances.btc_balance,
        ETH: nextBalances.eth_balance,
        USDT: nextBalances.usdt_balance,
      },
    });
  };

  const handleSaveWallets = async () => {
    if (!id) return;

    clearMessages();
    setSavingWallets(true);

    try {
      await update(ref(db, `users/${id}`), {
        btc_address: wallets.btc_address.trim(),
        eth_address: wallets.eth_address.trim(),
        usdt_address: wallets.usdt_address.trim(),
      });

      await addAdminLog("updated_wallet_addresses", { ...wallets });
      await addActivityLog("wallet_addresses_updated", {
        message: "Wallet addresses updated by admin.",
        ...wallets,
      });

      setSuccessMessage("Wallet addresses updated successfully.");
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to update wallet addresses.");
    } finally {
      setSavingWallets(false);
    }
  };

  const handleSaveBalances = async () => {
    if (!id) return;

    clearMessages();
    setSavingBalances(true);

    try {
      const payload = {
        btc_balance: toNumber(balances.btc_balance),
        eth_balance: toNumber(balances.eth_balance),
        usdt_balance: toNumber(balances.usdt_balance),
        usd_balance: toNumber(balances.usd_balance),
      };

      await syncUserBalances(payload);

      const reasonText = balanceReason.trim() || "Manual balance update";

      await addAdminLog("updated_balances", {
        ...payload,
        reason: reasonText,
      });

      await addActivityLog("balances_updated", {
        message: reasonText,
        balances: payload,
      });

      setSuccessMessage("Balances updated successfully.");
      setBalanceReason("");
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to update balances.");
    } finally {
      setSavingBalances(false);
    }
  };

  const updateUserAccountStatus = async (nextStatus: "active" | "suspended" | "blocked") => {
    if (!id) return;

    clearMessages();
    setUpdatingAccountStatus(true);

    try {
      await update(ref(db, `users/${id}`), {
        accountStatus: nextStatus,
        status: nextStatus === "active" ? "active" : nextStatus,
      });

      await addAdminLog("updated_account_status", {
        accountStatus: nextStatus,
      });

      await addActivityLog("account_status_updated", {
        message: `Account status changed to ${nextStatus}.`,
        accountStatus: nextStatus,
      });

      setSuccessMessage(
        nextStatus === "active"
          ? "Account reactivated successfully."
          : nextStatus === "suspended"
          ? "Account suspended successfully."
          : "Account blocked successfully."
      );
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to update account status.");
    } finally {
      setUpdatingAccountStatus(false);
    }
  };

  const handleApplyManualAction = async () => {
    if (!id) return;

    clearMessages();
    setApplyingManualAction(true);

    try {
      const cryptoAmount = manualPreview.cryptoAmount;
      const usdAmount = manualPreview.usdAmount;

      if (cryptoAmount <= 0) {
        setErrorMessage("Enter a valid amount.");
        setApplyingManualAction(false);
        return;
      }

      const currentBalances = {
        btc_balance: toNumber(balances.btc_balance),
        eth_balance: toNumber(balances.eth_balance),
        usdt_balance: toNumber(balances.usdt_balance),
        usd_balance: toNumber(balances.usd_balance),
      };

      const coinField =
        manualAction.coin === "BTC"
          ? "btc_balance"
          : manualAction.coin === "ETH"
          ? "eth_balance"
          : "usdt_balance";

      const nextBalances = { ...currentBalances };

      if (manualAction.kind === "credit") {
        nextBalances[coinField] = Number(nextBalances[coinField]) + cryptoAmount;
        nextBalances.usd_balance = Number(nextBalances.usd_balance) + usdAmount;
      } else {
        if (Number(nextBalances[coinField]) < cryptoAmount) {
          setErrorMessage(`Insufficient ${manualAction.coin} balance for debit.`);
          setApplyingManualAction(false);
          return;
        }

        nextBalances[coinField] = Number(nextBalances[coinField]) - cryptoAmount;
        nextBalances.usd_balance = Math.max(0, Number(nextBalances.usd_balance) - usdAmount);
      }

      await syncUserBalances(nextBalances);

      setBalances({
        btc_balance: String(nextBalances.btc_balance),
        eth_balance: String(nextBalances.eth_balance),
        usdt_balance: String(nextBalances.usdt_balance),
        usd_balance: String(nextBalances.usd_balance),
      });

      const txRef = push(ref(db, `transactions/${id}`));

      await set(txRef, {
        id: txRef.key,
        userId: id,
        userName: fullName,
        userEmail: userData?.email || "",
        type: manualAction.kind === "credit" ? "deposit" : "withdraw",
        asset: manualAction.coin,
        amount: cryptoAmount,
        usdValue: usdAmount,
        inputMode: manualAction.inputMode,
        inputUsd: toNumber(manualAction.usd),
        inputCrypto: toNumber(manualAction.crypto),
        status: manualAction.status,
        label: manualAction.label.trim() || "Manual Adjustment",
        displayLabel: manualAction.label.trim() || "Manual Adjustment",
        note: manualAction.note.trim() || "",
        createdAt: Date.now(),
        createdAtLabel: new Date().toLocaleString(),
        createdByAdmin: true,
        adminActionKind: manualAction.kind,
        priceAtExecution: marketPrices[manualAction.coin as keyof MarketPrices] || 0,
      });

      await addAdminLog("manual_balance_action", {
        kind: manualAction.kind,
        asset: manualAction.coin,
        inputMode: manualAction.inputMode,
        inputUsd: toNumber(manualAction.usd),
        inputCrypto: toNumber(manualAction.crypto),
        cryptoAmount,
        usdAmount,
        label: manualAction.label.trim() || "Manual Adjustment",
        status: manualAction.status,
        note: manualAction.note.trim() || "",
      });

      await addActivityLog("manual_balance_action_applied", {
        message: manualAction.label.trim() || "Manual Adjustment",
        kind: manualAction.kind,
        asset: manualAction.coin,
        cryptoAmount,
        usdAmount,
        status: manualAction.status,
      });

      setSuccessMessage("Manual balance action applied successfully.");
      setManualAction((prev) => ({
        ...prev,
        usd: "",
        crypto: "",
        note: "",
      }));
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to apply manual balance action.");
    } finally {
      setApplyingManualAction(false);
    }
  };

  if (!userData) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-10 text-center text-slate-400">
        User not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col 2xl:flex-row 2xl:items-center 2xl:justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-blue-300/80 font-bold mb-2">
            User Details
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">{fullName}</h1>
          <p className="text-slate-400 mt-2">
            Manage profile, wallets, balances, manual actions and client activity.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm ${
              userData.online
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                : "border-white/10 bg-white/[0.04] text-slate-300"
            }`}
          >
            {userData.online ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span>{userData.online ? "Online" : "Offline"}</span>
          </div>

          <div
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm ${
              accountStatus === "active"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                : accountStatus === "suspended"
                ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
                : "border-rose-500/20 bg-rose-500/10 text-rose-300"
            }`}
          >
            <ShieldAlert size={16} />
            <span className="capitalize">{accountStatus}</span>
          </div>
        </div>
      </div>

      {(successMessage || errorMessage) && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            successMessage
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
              : "border-rose-500/20 bg-rose-500/10 text-rose-300"
          }`}
        >
          {successMessage || errorMessage}
        </div>
      )}

      <div className="grid xl:grid-cols-[340px_minmax(0,1fr)] gap-6">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-white/10 bg-[#0a1222] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.14)]">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center text-blue-300">
                <User size={18} />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-1">
                  Profile
                </div>
                <div className="text-xl font-black">Basic Information</div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { icon: <User size={16} />, label: "Full Name", value: fullName },
                { icon: <Mail size={16} />, label: "Email", value: userData.email || "-" },
                { icon: <Phone size={16} />, label: "Phone", value: userData.phone || "-" },
                {
                  icon: <Globe size={16} />,
                  label: "Country / Region",
                  value: `${userData.country || "-"} / ${userData.stateRegion || "-"}`,
                },
                { icon: <MapPin size={16} />, label: "City", value: userData.city || "-" },
                {
                  icon: <Clock3 size={16} />,
                  label: "Last Seen",
                  value: formatLastSeen(userData.last_seen),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-blue-300 mt-0.5">{item.icon}</div>
                    <div className="min-w-0">
                      <div className="text-sm text-slate-400">{item.label}</div>
                      <div className="font-medium mt-1 break-words">{item.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-white/8 bg-black/20 p-4">
              <div className="text-sm text-slate-400 mb-1">Estimated Total Balance</div>
              <div className="text-2xl font-black">{formatMoney(totalEstimatedUsd)}</div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#0a1222] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.14)]">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-400/20 flex items-center justify-center text-rose-300">
                <ShieldAlert size={18} />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-1">
                  Account Control
                </div>
                <div className="text-xl font-black">Suspend / Block / Reactivate</div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => updateUserAccountStatus("suspended")}
                disabled={updatingAccountStatus}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/15 disabled:opacity-50 px-5 py-3.5 font-semibold transition-all"
              >
                {updatingAccountStatus ? <RefreshCw size={16} className="animate-spin" /> : <ShieldAlert size={16} />}
                <span>Suspend Account</span>
              </button>

              <button
                onClick={() => updateUserAccountStatus("blocked")}
                disabled={updatingAccountStatus}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/15 disabled:opacity-50 px-5 py-3.5 font-semibold transition-all"
              >
                {updatingAccountStatus ? <RefreshCw size={16} className="animate-spin" /> : <Ban size={16} />}
                <span>Block Account</span>
              </button>

              <button
                onClick={() => updateUserAccountStatus("active")}
                disabled={updatingAccountStatus}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/15 disabled:opacity-50 px-5 py-3.5 font-semibold transition-all"
              >
                {updatingAccountStatus ? <RefreshCw size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                <span>Reactivate Account</span>
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#0a1222] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.14)]">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-400/20 flex items-center justify-center text-cyan-300">
                <Wallet size={18} />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-1">
                  Wallets
                </div>
                <div className="text-xl font-black">Assign Addresses</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">BTC Address</label>
                <input
                  type="text"
                  value={wallets.btc_address}
                  onChange={(e) =>
                    setWallets((prev) => ({ ...prev, btc_address: e.target.value }))
                  }
                  className="w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  placeholder="Assign BTC wallet address"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">ETH Address</label>
                <input
                  type="text"
                  value={wallets.eth_address}
                  onChange={(e) =>
                    setWallets((prev) => ({ ...prev, eth_address: e.target.value }))
                  }
                  className="w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  placeholder="Assign ETH wallet address"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">USDT Address</label>
                <input
                  type="text"
                  value={wallets.usdt_address}
                  onChange={(e) =>
                    setWallets((prev) => ({ ...prev, usdt_address: e.target.value }))
                  }
                  className="w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  placeholder="Assign USDT wallet address"
                />
              </div>

              <button
                onClick={handleSaveWallets}
                disabled={savingWallets}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-5 py-3.5 font-semibold transition-all"
              >
                {savingWallets ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{savingWallets ? "Saving..." : "Save Wallets"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid 2xl:grid-cols-2 gap-6">
            <div className="rounded-[28px] border border-white/10 bg-[#0a1222] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.14)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center text-emerald-300">
                  <BadgeDollarSign size={18} />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-1">
                    Balances
                  </div>
                  <div className="text-xl font-black">Manual Update</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">BTC</label>
                  <input
                    type="number"
                    step="any"
                    value={balances.btc_balance}
                    onChange={(e) =>
                      setBalances((prev) => ({ ...prev, btc_balance: e.target.value }))
                    }
                    className="w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">ETH</label>
                  <input
                    type="number"
                    step="any"
                    value={balances.eth_balance}
                    onChange={(e) =>
                      setBalances((prev) => ({ ...prev, eth_balance: e.target.value }))
                    }
                    className="w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">USDT</label>
                  <input
                    type="number"
                    step="any"
                    value={balances.usdt_balance}
                    onChange={(e) =>
                      setBalances((prev) => ({ ...prev, usdt_balance: e.target.value }))
                    }
                    className="w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">USD</label>
                  <input
                    type="number"
                    step="any"
                    value={balances.usd_balance}
                    onChange={(e) =>
                      setBalances((prev) => ({ ...prev, usd_balance: e.target.value }))
                    }
                    className="w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-slate-400 mb-2">Reason / Note</label>
                <input
                  type="text"
                  value={balanceReason}
                  onChange={(e) => setBalanceReason(e.target.value)}
                  className="w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  placeholder="Example: Deposit, Gift, Manual adjustment"
                />
              </div>

              <button
                onClick={handleSaveBalances}
                disabled={savingBalances}
                className="w-full mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-5 py-3.5 font-semibold transition-all"
              >
                {savingBalances ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{savingBalances ? "Saving..." : "Save Balances"}</span>
              </button>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#0a1222] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.14)]">
              <div className="flex items-center gap-3 mb-5">
                <div
                  className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${
                    manualAction.kind === "credit"
                      ? "bg-amber-500/15 border-amber-400/20 text-amber-300"
                      : "bg-rose-500/15 border-rose-400/20 text-rose-300"
                  }`}
                >
                  {manualAction.kind === "credit" ? (
                    <ArrowDownCircle size={18} />
                  ) : (
                    <ArrowUpCircle size={18} />
                  )}
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-1">
                    Manual Action
                  </div>
                  <div className="text-xl font-black">Credit / Debit + Custom Label</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Action</label>
                  <select
                    value={manualAction.kind}
                    onChange={(e) =>
                      setManualAction((prev) => ({
                        ...prev,
                        kind: e.target.value as ManualActionKind,
                      }))
                    }
                    className="w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Coin</label>
                  <select
                    value={manualAction.coin}
                    onChange={(e) =>
                      setManualAction((prev) => ({ ...prev, coin: e.target.value }))
                    }
                    className="w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                    <option value="USDT">USDT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Input Mode</label>
                  <select
                    value={manualAction.inputMode}
                    onChange={(e) =>
                      setManualAction((prev) => ({
                        ...prev,
                        inputMode: e.target.value as ManualInputMode,
                      }))
                    }
                    className="w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="usd_to_crypto">USD → Crypto</option>
                    <option value="crypto_direct">Crypto Direct</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Transaction Status</label>
                  <select
                    value={manualAction.status}
                    onChange={(e) =>
                      setManualAction((prev) => ({
                        ...prev,
                        status: e.target.value as ManualActionStatus,
                      }))
                    }
                    className="w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>

              {manualAction.inputMode === "usd_to_crypto" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">USD Amount</label>
                    <input
                      type="number"
                      step="any"
                      value={manualAction.usd}
                      onChange={(e) =>
                        setManualAction((prev) => ({ ...prev, usd: e.target.value }))
                      }
                      className="w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                      placeholder="Enter USD amount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Crypto Preview</label>
                    <div className="w-full rounded-2xl bg-white/[0.03] border border-white/10 px-4 py-3 text-white font-semibold">
                      {formatCoin(manualPreview.cryptoAmount)} {manualAction.coin}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Crypto Amount</label>
                    <input
                      type="number"
                      step="any"
                      value={manualAction.crypto}
                      onChange={(e) =>
                        setManualAction((prev) => ({ ...prev, crypto: e.target.value }))
                      }
                      className="w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                      placeholder={`Enter ${manualAction.coin} amount`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">USD Preview</label>
                    <div className="w-full rounded-2xl bg-white/[0.03] border border-white/10 px-4 py-3 text-white font-semibold">
                      {formatMoney(manualPreview.usdAmount)}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 grid gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Display Label</label>
                  <input
                    type="text"
                    value={manualAction.label}
                    onChange={(e) =>
                      setManualAction((prev) => ({ ...prev, label: e.target.value }))
                    }
                    className="w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    placeholder="Example: Daily Gift, Deposit, Profit, Bonus"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Reason / Note</label>
                  <input
                    type="text"
                    value={manualAction.note}
                    onChange={(e) =>
                      setManualAction((prev) => ({ ...prev, note: e.target.value }))
                    }
                    className="w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    placeholder="Example: Profit payout, Manual deposit, Daily gift"
                  />
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="text-sm text-slate-400 mb-2">Preview</div>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-slate-400">Action:</span>{" "}
                    <span className="font-semibold capitalize">{manualAction.kind}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Client will receive/change:</span>{" "}
                    <span className="font-semibold">
                      {formatCoin(manualPreview.cryptoAmount)} {manualAction.coin}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">USD value:</span>{" "}
                    <span className="font-semibold">{formatMoney(manualPreview.usdAmount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Label:</span>{" "}
                    <span className="font-semibold">{manualAction.label || "Manual Adjustment"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Status:</span>{" "}
                    <span className="font-semibold">{manualAction.status}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleApplyManualAction}
                disabled={applyingManualAction}
                className={`w-full mt-5 inline-flex items-center justify-center gap-2 rounded-2xl disabled:opacity-50 px-5 py-3.5 font-semibold transition-all ${
                  manualAction.kind === "credit"
                    ? "bg-amber-500 hover:bg-amber-400 text-black"
                    : "bg-rose-500 hover:bg-rose-400 text-white"
                }`}
              >
                {applyingManualAction ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <ChevronRight size={16} />
                )}
                <span>
                  {applyingManualAction
                    ? "Applying..."
                    : manualAction.kind === "credit"
                    ? "Apply Credit"
                    : "Apply Debit"}
                </span>
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#0a1222] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.14)]">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-violet-500/15 border border-violet-400/20 flex items-center justify-center text-violet-300">
                <Clock3 size={18} />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-1">
                  Activity
                </div>
                <div className="text-xl font-black">Client Log</div>
              </div>
            </div>

            {activities.length === 0 ? (
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 text-slate-400 text-sm">
                No recent activity found for this user.
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/8 bg-black/20 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-white">
                        {item.details?.message || item.type || "Activity"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatActivityTime(item.created_at)}
                      </div>
                    </div>

                    {item.details && (
                      <div className="mt-2 text-sm text-slate-400 break-words">
                        {JSON.stringify(item.details)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetails;
