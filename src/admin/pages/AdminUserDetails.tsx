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
  RefreshCw
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

const COIN_PRICES = {
  BTC: 65000,
  ETH: 3500,
  USDT: 1
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

  const [converter, setConverter] = useState({
    mode: "usd_to_crypto",
    coin: "BTC",
    usd: "",
    crypto: ""
  });

  const [savingWallets, setSavingWallets] = useState(false);
  const [savingBalances, setSavingBalances] = useState(false);

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

  const cryptoPreview = useMemo(() => {
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
        page: "/admin/users/" + id,
        details,
        created_at: Date.now()
      });
    } catch (err) {
      console.error("Activity log error:", err);
    }
  };

  const handleSaveWallets = async () => {
    if (!id) return;

    setSuccessMessage("");
    setErrorMessage("");
    setSavingWallets(true);

    try {
      await update(ref(db, `users/${id}`), {
        btc_address: wallets.btc_address.trim(),
        eth_address: wallets.eth_address.trim(),
        usdt_address: wallets.usdt_address.trim()
      });

      await addAdminLog("updated_wallet_addresses", { ...wallets });
      await addActivityLog("wallet_addresses_updated", { ...wallets });

      setSuccessMessage("Wallet addresses updated successfully.");
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to update wallet addresses.");
    } finally {
      setSavingWallets(false);
    }
  };

  const handleSaveBalances = async () => {
    if (!id) return;

    setSuccessMessage("");
    setErrorMessage("");
    setSavingBalances(true);

    try {
      const payload = {
        btc_balance: Number(balances.btc_balance || 0),
        eth_balance: Number(balances.eth_balance || 0),
        usdt_balance: Number(balances.usdt_balance || 0),
        usd_balance: Number(balances.usd_balance || 0)
      };

      await update(ref(db, `users/${id}`), payload);

      await addAdminLog("updated_balances", payload);
      await addActivityLog("balances_updated", payload);

      setSuccessMessage("Balances updated successfully.");
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to update balances.");
    } finally {
      setSavingBalances(false);
    }
  };

  const handleApplyConverter = async () => {
    if (!id) return;

    setSuccessMessage("");
    setErrorMessage("");
    setSavingBalances(true);

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
        const cryptoAmount = Number(cryptoPreview || 0);

        nextBalances[coinField as keyof typeof nextBalances] =
          Number(nextBalances[coinField as keyof typeof nextBalances]) + cryptoAmount;

        nextBalances.usd_balance = nextBalances.usd_balance + usdAmount;
      } else {
        const cryptoAmount = Number(converter.crypto || 0);
        const usdAmount = Number(cryptoPreview || 0);

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

      await addAdminLog("applied_balance_conversion", {
        mode: converter.mode,
        coin: converter.coin,
        usd: converter.usd,
        crypto: converter.crypto,
        preview: cryptoPreview
      });

      await addActivityLog("balance_conversion_applied", {
        mode: converter.mode,
        coin: converter.coin,
        usd: converter.usd,
        crypto: converter.crypto,
        preview: cryptoPreview
      });

      setSuccessMessage("Balance conversion applied successfully.");
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to apply conversion.");
    } finally {
      setSavingBalances(false);
    }
  };

  if (!userData) {
    return (
      <div className="text-white">
        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-10 text-center text-slate-400">
          User not found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-blue-300 font-bold mb-2">
            Admin User Details
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            {fullName}
          </h1>
          <p className="text-slate-400 mt-2">
            Manage user profile, balances, wallet assignment and activity logs.
          </p>
        </div>

        <div
          className={`inline-flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm w-fit ${
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

      <div className="grid xl:grid-cols-[0.92fr_1.08fr] gap-6">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,#0b1220_0%,#0d1628_100%)] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.16)]">
            <div className="flex items-center gap-3 mb-5">
              <User size={18} className="text-blue-400" />
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-1">
                  User Profile
                </div>
                <div className="text-xl font-black tracking-tight">
                  Basic Information
                </div>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4 flex items-start gap-3">
                <User size={16} className="text-blue-300 mt-0.5" />
                <div>
                  <div className="text-slate-400">Full Name</div>
                  <div className="font-medium">{fullName}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-black/20 p-4 flex items-start gap-3">
                <Mail size={16} className="text-blue-300 mt-0.5" />
                <div>
                  <div className="text-slate-400">Email</div>
                  <div className="font-medium break-all">{userData.email || "-"}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-black/20 p-4 flex items-start gap-3">
                <Phone size={16} className="text-blue-300 mt-0.5" />
                <div>
                  <div className="text-slate-400">Phone</div>
                  <div className="font-medium">{userData.phone || "-"}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-black/20 p-4 flex items-start gap-3">
                <Globe size={16} className="text-blue-300 mt-0.5" />
                <div>
                  <div className="text-slate-400">Country / Region</div>
                  <div className="font-medium">
                    {userData.country || "-"} / {userData.stateRegion || "-"}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-black/20 p-4 flex items-start gap-3">
                <MapPin size={16} className="text-blue-300 mt-0.5" />
                <div>
                  <div className="text-slate-400">City</div>
                  <div className="font-medium">{userData.city || "-"}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-black/20 p-4 flex items-start gap-3">
                <Clock3 size={16} className="text-blue-300 mt-0.5" />
                <div>
                  <div className="text-slate-400">Last Seen</div>
                  <div className="font-medium">{formatLastSeen(userData.last_seen)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,#0b1220_0%,#0d1628_100%)] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.16)]">
            <div className="flex items-center gap-3 mb-5">
              <Wallet size={18} className="text-cyan-400" />
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-1">
                  Wallet Assignment
                </div>
                <div className="text-xl font-black tracking-tight">
                  Crypto Addresses
                </div>
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
                  className="w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
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
                  className="w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
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
                  className="w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  placeholder="Assign USDT wallet address"
                />
              </div>

              <button
                onClick={handleSaveWallets}
                disabled={savingWallets}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-5 py-3 font-semibold transition-all"
              >
                {savingWallets ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{savingWallets ? "Saving..." : "Save Wallet Addresses"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,#0b1220_0%,#0d1628_100%)] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.16)]">
            <div className="flex items-center gap-3 mb-5">
              <CheckCircle2 size={18} className="text-emerald-400" />
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-1">
                  Balance Editor
                </div>
                <div className="text-xl font-black tracking-tight">
                  Manual Balances
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">BTC Balance</label>
                <input
                  type="number"
                  step="any"
                  value={balances.btc_balance}
                  onChange={(e) =>
                    setBalances((prev) => ({ ...prev, btc_balance: e.target.value }))
                  }
                  className="clean-number w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">ETH Balance</label>
                <input
                  type="number"
                  step="any"
                  value={balances.eth_balance}
                  onChange={(e) =>
                    setBalances((prev) => ({ ...prev, eth_balance: e.target.value }))
                  }
                  className="clean-number w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">USDT Balance</label>
                <input
                  type="number"
                  step="any"
                  value={balances.usdt_balance}
                  onChange={(e) =>
                    setBalances((prev) => ({ ...prev, usdt_balance: e.target.value }))
                  }
                  className="clean-number w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">USD Balance</label>
                <input
                  type="number"
                  step="any"
                  value={balances.usd_balance}
                  onChange={(e) =>
                    setBalances((prev) => ({ ...prev, usd_balance: e.target.value }))
                  }
                  className="clean-number w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              onClick={handleSaveBalances}
              disabled={savingBalances}
              className="w-full mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-5 py-3 font-semibold transition-all"
            >
              {savingBalances ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{savingBalances ? "Saving..." : "Save Balances"}</span>
            </button>
          </div>

          <div className="rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,#0b1220_0%,#0d1628_100%)] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.16)]">
            <div className="flex items-center gap-3 mb-5">
              <AlertCircle size={18} className="text-amber-400" />
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-1">
                  USD / Crypto Conversion
                </div>
                <div className="text-xl font-black tracking-tight">
                  Auto Calculation
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Mode</label>
                <select
                  value={converter.mode}
                  onChange={(e) =>
                    setConverter((prev) => ({ ...prev, mode: e.target.value }))
                  }
                  className="w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500"
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
                  className="w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="USDT">USDT</option>
                </select>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <div className="text-sm text-slate-400">Reference Price</div>
                <div className="font-semibold mt-1">
                  ${COIN_PRICES[converter.coin as keyof typeof COIN_PRICES].toLocaleString()}
                </div>
              </div>
            </div>

            {converter.mode === "usd_to_crypto" ? (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">USD Amount</label>
                  <input
                    type="number"
                    step="any"
                    value={converter.usd}
                    onChange={(e) =>
                      setConverter((prev) => ({ ...prev, usd: e.target.value }))
                    }
                    className="clean-number w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Enter USD amount"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Crypto Preview
                  </label>
                  <div className="w-full rounded-2xl bg-white/[0.03] border border-white/8 px-4 py-3 text-white font-semibold">
                    {cryptoPreview} {converter.coin}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Crypto Amount
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={converter.crypto}
                    onChange={(e) =>
                      setConverter((prev) => ({ ...prev, crypto: e.target.value }))
                    }
                    className="clean-number w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    placeholder={`Enter ${converter.coin} amount`}
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">USD Preview</label>
                  <div className="w-full rounded-2xl bg-white/[0.03] border border-white/8 px-4 py-3 text-white font-semibold">
                    ${cryptoPreview}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleApplyConverter}
              disabled={savingBalances}
              className="w-full mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black disabled:opacity-50 px-5 py-3 font-semibold transition-all"
            >
              {savingBalances ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              <span>{savingBalances ? "Applying..." : "Apply Conversion to Balances"}</span>
            </button>
          </div>

          <div className="rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,#0b1220_0%,#0d1628_100%)] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.16)]">
            <div className="flex items-center gap-3 mb-5">
              <Clock3 size={18} className="text-blue-400" />
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-1">
                  Recent User Activity
                </div>
                <div className="text-xl font-black tracking-tight">
                  Latest Actions
                </div>
              </div>
            </div>

            {activities.length === 0 ? (
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 text-slate-400 text-sm">
                No recent activity found for this user.
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold text-white">
                          {item.type || "Activity"}
                        </div>
                        <div className="text-sm text-slate-400 mt-1">
                          {item.page || "-"}
                        </div>
                      </div>

                      <div className="text-right text-xs text-slate-400">
                        {formatActivityTime(item.created_at)}
                      </div>
                    </div>

                    {item.details && (
                      <div className="mt-3 text-xs text-slate-500 break-words">
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
