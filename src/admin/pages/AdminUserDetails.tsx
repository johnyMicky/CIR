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
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  Clock3,
  Save,
  RefreshCw,
  BadgeDollarSign,
  Activity,
  ChevronRight
} from "lucide-react";
import { db } from "../../firebase";

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
  created_at?: string;
  last_seen?: number | string;
  online?: boolean;

  btc_balance?: number;
  eth_balance?: number;
  usdt_balance?: number;
  usd_balance?: number;

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

const AdminUserDetails = () => {
  const { id } = useParams();

  const [userData, setUserData] = useState<UserRecord | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const [wallets, setWallets] = useState({
    btc_address: "",
    eth_address: "",
    usdt_address: ""
  });

  const [balances, setBalances] = useState({
    btc_balance: "",
    eth_balance: "",
    usdt_balance: "",
    usd_balance: ""
  });

  const [balanceReason, setBalanceReason] = useState("");

  const [converter, setConverter] = useState({
    mode: "usd_to_crypto",
    coin: "BTC",
    usd: "",
    crypto: "",
    reason: ""
  });

  const [savingWallets, setSavingWallets] = useState(false);
  const [savingBalances, setSavingBalances] = useState(false);
  const [applyingConversion, setApplyingConversion] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

      setWallets({
        btc_address: data.btc_address || "",
        eth_address: data.eth_address || "",
        usdt_address: data.usdt_address || ""
      });

      setBalances({
        btc_balance: String(data.btc_balance ?? 0),
        eth_balance: String(data.eth_balance ?? 0),
        usdt_balance: String(data.usdt_balance ?? 0),
        usd_balance: String(data.usd_balance ?? 0)
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
        ...(value as any)
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

  const conversionPreview = useMemo(() => {
    const usdValue = Number(converter.usd || 0);
    const cryptoValue = Number(converter.crypto || 0);
    const price = COIN_PRICES[converter.coin as keyof typeof COIN_PRICES] || 1;

    if (converter.mode === "usd_to_crypto") {
      const result = usdValue > 0 ? usdValue / price : 0;
      return result.toFixed(8);
    }

    const result = cryptoValue > 0 ? cryptoValue * price : 0;
    return result.toFixed(2);
  }, [converter]);

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
        created_at: Date.now()
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
        created_at: Date.now()
      });
    } catch (err) {
      console.error("Activity log error:", err);
    }
  };

  const handleSaveWallets = async () => {
    if (!id) return;

    clearMessages();
    setSavingWallets(true);

    try {
      await update(ref(db, `users/${id}`), {
        btc_address: wallets.btc_address.trim(),
        eth_address: wallets.eth_address.trim(),
        usdt_address: wallets.usdt_address.trim()
      });

      await addAdminLog("updated_wallet_addresses", { ...wallets });
      await addActivityLog("wallet_addresses_updated", {
        message: "Wallet addresses updated by admin.",
        ...wallets
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
        btc_balance: Number(balances.btc_balance || 0),
        eth_balance: Number(balances.eth_balance || 0),
        usdt_balance: Number(balances.usdt_balance || 0),
        usd_balance: Number(balances.usd_balance || 0)
      };

      await update(ref(db, `users/${id}`), payload);

      const reasonText = balanceReason.trim() || "Manual balance update";

      await addAdminLog("updated_balances", {
        ...payload,
        reason: reasonText
      });

      await addActivityLog("balances_updated", {
        message: reasonText,
        balances: payload
      });

      setSuccessMessage("Balances updated successfully.");
      setBalanceReason("");
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to update balances.");
    } finally {
      setSavingBalances(false);
    }
  };

  const handleApplyConversion = async () => {
    if (!id) return;

    clearMessages();
    setApplyingConversion(true);

    try {
      const coinField =
        converter.coin === "BTC"
          ? "btc_balance"
          : converter.coin === "ETH"
          ? "eth_balance"
          : "usdt_balance";

      const nextBalances = {
        btc_balance: Number(balances.btc_balance || 0),
        eth_balance: Number(balances.eth_balance || 0),
        usdt_balance: Number(balances.usdt_balance || 0),
        usd_balance: Number(balances.usd_balance || 0)
      };

      if (converter.mode === "usd_to_crypto") {
        const usdAmount = Number(converter.usd || 0);
        const cryptoAmount = Number(conversionPreview || 0);

        nextBalances[coinField as keyof typeof nextBalances] =
          Number(nextBalances[coinField as keyof typeof nextBalances]) + cryptoAmount;

        nextBalances.usd_balance = nextBalances.usd_balance + usdAmount;
      } else {
        const cryptoAmount = Number(converter.crypto || 0);
        const usdAmount = Number(conversionPreview || 0);

        nextBalances[coinField as keyof typeof nextBalances] =
          Number(nextBalances[coinField as keyof typeof nextBalances]) + cryptoAmount;

        nextBalances.usd_balance = nextBalances.usd_balance + usdAmount;
      }

      await update(ref(db, `users/${id}`), nextBalances);

      setBalances({
        btc_balance: String(nextBalances.btc_balance),
        eth_balance: String(nextBalances.eth_balance),
        usdt_balance: String(nextBalances.usdt_balance),
        usd_balance: String(nextBalances.usd_balance)
      });

      const reasonText = converter.reason.trim() || "Manual conversion applied";

      await addAdminLog("applied_balance_conversion", {
        mode: converter.mode,
        coin: converter.coin,
        usd: converter.usd,
        crypto: converter.crypto,
        preview: conversionPreview,
        reason: reasonText
      });

      await addActivityLog("balance_conversion_applied", {
        message: reasonText,
        mode: converter.mode,
        coin: converter.coin,
        usd: converter.usd,
        crypto: converter.crypto,
        result: conversionPreview
      });

      setSuccessMessage("Balance conversion applied successfully.");
      setConverter((prev) => ({
        ...prev,
        usd: "",
        crypto: "",
        reason: ""
      }));
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to apply conversion.");
    } finally {
      setApplyingConversion(false);
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
            Manage profile, wallets, balances and visible client activity.
          </p>
        </div>

        <div
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm w-fit ${
            userData.online
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
              : "border-white/10 bg-white/[0.04] text-slate-300"
          }`}
        >
          {userData.online ? <Wifi size={16} /> : <WifiOff size={16} />}
          <span>{userData.online ? "Online" : "Offline"}</span>
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
                  value: `${userData.country || "-"} / ${userData.stateRegion || "-"}`
                },
                { icon: <MapPin size={16} />, label: "City", value: userData.city || "-" },
                {
                  icon: <Clock3 size={16} />,
                  label: "Last Seen",
                  value: formatLastSeen(userData.last_seen)
                }
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
                    className="clean-number w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500"
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
                    className="clean-number w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500"
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
                    className="clean-number w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500"
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
                    className="clean-number w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-slate-400 mb-2">
                  Reason / Note
                </label>
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
                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-400/20 flex items-center justify-center text-amber-300">
                  <Activity size={18} />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-1">
                    Conversion
                  </div>
                  <div className="text-xl font-black">USD ↔ Crypto</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Mode</label>
                  <select
                    value={converter.mode}
                    onChange={(e) =>
                      setConverter((prev) => ({ ...prev, mode: e.target.value }))
                    }
                    className="w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="usd_to_crypto">USD → Crypto</option>
                    <option value="crypto_to_usd">Crypto → USD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Coin</label>
                  <select
                    value={converter.coin}
                    onChange={(e) =>
                      setConverter((prev) => ({ ...prev, coin: e.target.value }))
                    }
                    className="w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                    <option value="USDT">USDT</option>
                  </select>
                </div>
              </div>

              {converter.mode === "usd_to_crypto" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">USD Amount</label>
                    <input
                      type="number"
                      step="any"
                      value={converter.usd}
                      onChange={(e) =>
                        setConverter((prev) => ({ ...prev, usd: e.target.value }))
                      }
                      className="clean-number w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                      placeholder="Enter USD amount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Crypto Preview</label>
                    <div className="w-full rounded-2xl bg-white/[0.03] border border-white/10 px-4 py-3 text-white font-semibold">
                      {conversionPreview} {converter.coin}
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
                      value={converter.crypto}
                      onChange={(e) =>
                        setConverter((prev) => ({ ...prev, crypto: e.target.value }))
                      }
                      className="clean-number w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                      placeholder={`Enter ${converter.coin} amount`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">USD Preview</label>
                    <div className="w-full rounded-2xl bg-white/[0.03] border border-white/10 px-4 py-3 text-white font-semibold">
                      ${conversionPreview}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <label className="block text-sm text-slate-400 mb-2">
                  Reason / Note
                </label>
                <input
                  type="text"
                  value={converter.reason}
                  onChange={(e) =>
                    setConverter((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  className="w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  placeholder="Example: Deposit, Gift, Bonus, Manual correction"
                />
              </div>

              <button
                onClick={handleApplyConversion}
                disabled={applyingConversion}
                className="w-full mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black disabled:opacity-50 px-5 py-3.5 font-semibold transition-all"
              >
                {applyingConversion ? <RefreshCw size={16} className="animate-spin" /> : <ChevronRight size={16} />}
                <span>{applyingConversion ? "Applying..." : "Apply Conversion"}</span>
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
