import React, { useEffect, useMemo, useState } from "react";
import { ref, onValue, update, remove } from "firebase/database";
import { Link } from "react-router-dom";
import {
  Search,
  Users,
  ChevronRight,
  Wifi,
  WifiOff,
  Filter,
  Ban,
  ShieldAlert,
  RotateCcw,
  Wallet,
  Trash2,
} from "lucide-react";
import { db } from "../../firebase";

type WalletMap = {
  BTC?: number | string;
  ETH?: number | string;
  USDT?: number | string;
};

type UserItem = {
  id: string;
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
};

type MarketMap = {
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

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

const getDisplayName = (user: UserItem) =>
  user.fullName ||
  `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
  user.email ||
  "Unnamed User";

const getAccountStatus = (user: UserItem) =>
  (user.accountStatus || user.status || "active").toLowerCase();

const AdminUsers = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("All");
  const [onlineFilter, setOnlineFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [minBalance, setMinBalance] = useState("");
  const [maxBalance, setMaxBalance] = useState("");
  const [toast, setToast] = useState("");
  const [market, setMarket] = useState<MarketMap>({
    BTC: 0,
    ETH: 0,
    USDT: 1,
  });
  const [deletingUserId, setDeletingUserId] = useState("");

  useEffect(() => {
    const usersRef = ref(db, "users");

    const unsub = onValue(usersRef, (snapshot) => {
      if (!snapshot.exists()) {
        setUsers([]);
        return;
      }

      const data = snapshot.val();

      const mapped = Object.entries(data).map(([id, value]) => ({
        id,
        ...(value as any),
      })) as UserItem[];

      mapped.sort((a, b) => {
        const aTime = new Date(a.created_at || 0).getTime();
        const bTime = new Date(b.created_at || 0).getTime();
        return bTime - aTime;
      });

      setUsers(mapped);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchMarket = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether"
        );
        const data = await res.json();

        if (!mounted || !Array.isArray(data)) return;

        const btc = data.find((c: any) => c.id === "bitcoin")?.current_price ?? 0;
        const eth = data.find((c: any) => c.id === "ethereum")?.current_price ?? 0;
        const usdt = data.find((c: any) => c.id === "tether")?.current_price ?? 1;

        setMarket({
          BTC: Number(btc),
          ETH: Number(eth),
          USDT: Number(usdt),
        });
      } catch (error) {
        console.error("Admin users market fetch error:", error);
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
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  const usersWithBalances = useMemo(() => {
    return users.map((user) => {
      const wallets = user.wallets || {};

      const btc = toNumber(wallets.BTC ?? user.btc_balance);
      const eth = toNumber(wallets.ETH ?? user.eth_balance);
      const usdt = toNumber(wallets.USDT ?? user.usdt_balance);

      const totalUsd = btc * market.BTC + eth * market.ETH + usdt * market.USDT;

      return {
        ...user,
        btc,
        eth,
        usdt,
        totalUsd,
      };
    });
  }, [users, market]);

  const countries = useMemo(() => {
    const unique = Array.from(
      new Set(usersWithBalances.map((u) => u.country).filter(Boolean))
    ).sort();
    return unique;
  }, [usersWithBalances]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = minBalance.trim() === "" ? null : Number(minBalance);
    const max = maxBalance.trim() === "" ? null : Number(maxBalance);

    return usersWithBalances.filter((user) => {
      const haystack = [
        user.firstName,
        user.lastName,
        user.fullName,
        user.email,
        user.phone,
        user.country,
        user.stateRegion,
        user.city,
        user.role,
        user.status,
        user.accountStatus,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !q || haystack.includes(q);
      const matchesCountry =
        countryFilter === "All" || (user.country || "") === countryFilter;
      const matchesOnline =
        onlineFilter === "All" ||
        (onlineFilter === "Online" && !!user.online) ||
        (onlineFilter === "Offline" && !user.online);

      const accountStatus = getAccountStatus(user);
      const matchesStatus =
        statusFilter === "All" || accountStatus === statusFilter.toLowerCase();

      const matchesMin = min === null || user.totalUsd >= min;
      const matchesMax = max === null || user.totalUsd <= max;

      return (
        matchesSearch &&
        matchesCountry &&
        matchesOnline &&
        matchesStatus &&
        matchesMin &&
        matchesMax
      );
    });
  }, [usersWithBalances, search, countryFilter, onlineFilter, statusFilter, minBalance, maxBalance]);

  const stats = useMemo(() => {
    const totalUsers = usersWithBalances.length;
    const onlineUsers = usersWithBalances.filter((u) => u.online).length;
    const suspendedUsers = usersWithBalances.filter(
      (u) => getAccountStatus(u) === "suspended"
    ).length;
    const blockedUsers = usersWithBalances.filter(
      (u) => getAccountStatus(u) === "blocked"
    ).length;
    const totalBalanceUsd = usersWithBalances.reduce((sum, u) => sum + u.totalUsd, 0);

    return {
      totalUsers,
      onlineUsers,
      suspendedUsers,
      blockedUsers,
      totalBalanceUsd,
    };
  }, [usersWithBalances]);

  const updateAccountStatus = async (
    userId: string,
    nextStatus: "active" | "suspended" | "blocked"
  ) => {
    try {
      await update(ref(db, `users/${userId}`), {
        accountStatus: nextStatus,
        status: nextStatus === "active" ? "active" : nextStatus,
      });

      setToast(
        nextStatus === "active"
          ? "User reactivated"
          : nextStatus === "suspended"
          ? "User suspended"
          : "User blocked"
      );
    } catch (error) {
      console.error("Account status update error:", error);
      setToast("Failed to update user status");
    }
  };

  const deleteUser = async (user: UserItem) => {
    const confirmed = window.confirm(
      `Delete ${getDisplayName(user)}?\n\nThis will remove:\n- user profile\n- user transactions\n- user activity logs\n\nThis action cannot be undone from the admin panel.`
    );

    if (!confirmed) return;

    try {
      setDeletingUserId(user.id);

      await Promise.all([
        remove(ref(db, `users/${user.id}`)),
        remove(ref(db, `transactions/${user.id}`)),
        remove(ref(db, `activity_logs/${user.id}`)),
      ]);

      setToast("User deleted from admin panel");
    } catch (error) {
      console.error("Delete user error:", error);
      setToast("Failed to delete user");
    } finally {
      setDeletingUserId("");
    }
  };

  return (
    <div className="space-y-6 text-white">
      {toast && (
        <div className="fixed right-4 top-4 z-[120] rounded-2xl border border-cyan-400/20 bg-[#0F1B33]/95 px-4 py-3 text-sm text-cyan-100 shadow-2xl backdrop-blur-xl">
          {toast}
        </div>
      )}

      <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-end 2xl:justify-between">
        <div className="max-w-2xl">
          <div className="mb-2 text-[11px] uppercase tracking-[0.22em] text-cyan-300 font-bold">
            Admin Users
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Users Management
          </h1>
          <p className="mt-2 text-slate-400">
            Full client overview with live status, balances, account control and filtering.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4">
            <div className="text-xs text-slate-400 mb-1">Users</div>
            <div className="text-2xl font-black">{stats.totalUsers}</div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4">
            <div className="text-xs text-slate-400 mb-1">Online</div>
            <div className="text-2xl font-black text-emerald-400">{stats.onlineUsers}</div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4">
            <div className="text-xs text-slate-400 mb-1">Suspended</div>
            <div className="text-2xl font-black text-amber-400">{stats.suspendedUsers}</div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4">
            <div className="text-xs text-slate-400 mb-1">Blocked</div>
            <div className="text-2xl font-black text-rose-400">{stats.blockedUsers}</div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4">
            <div className="text-xs text-slate-400 mb-1">Total Balance</div>
            <div className="text-2xl font-black break-words">
              {formatMoney(stats.totalBalanceUsd)}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 md:p-5 space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, country, city, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl bg-black/20 border border-white/10 pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/40"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400 mb-2">
              <Filter size={14} />
              Country
            </div>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none"
            >
              <option value="All" className="bg-slate-900">All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country} className="bg-slate-900">
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400 mb-2">
              Online Status
            </div>
            <select
              value={onlineFilter}
              onChange={(e) => setOnlineFilter(e.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none"
            >
              <option value="All" className="bg-slate-900">All</option>
              <option value="Online" className="bg-slate-900">Online</option>
              <option value="Offline" className="bg-slate-900">Offline</option>
            </select>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400 mb-2">
              Account Status
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none"
            >
              <option value="All" className="bg-slate-900">All</option>
              <option value="active" className="bg-slate-900">Active</option>
              <option value="suspended" className="bg-slate-900">Suspended</option>
              <option value="blocked" className="bg-slate-900">Blocked</option>
            </select>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400 mb-2">
              Min Balance USD
            </div>
            <input
              type="number"
              value={minBalance}
              onChange={(e) => setMinBalance(e.target.value)}
              placeholder="0"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400 mb-2">
              Max Balance USD
            </div>
            <input
              type="number"
              value={maxBalance}
              onChange={(e) => setMaxBalance(e.target.value)}
              placeholder="10000"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,#0b1220_0%,#0d1628_100%)] p-4 md:p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-14 text-slate-400">
            No users found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => {
              const accountStatus = getAccountStatus(user);
              const isDeleting = deletingUserId === user.id;

              return (
                <div
                  key={user.id}
                  className="rounded-[28px] border border-white/8 bg-black/20 p-4 md:p-5"
                >
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border border-blue-500/20 bg-blue-600/15 text-blue-300">
                            <Users size={20} />
                          </div>

                          <div className="min-w-0">
                            <div className="truncate text-xl font-semibold text-white">
                              {getDisplayName(user)}
                            </div>
                            <div className="mt-1 break-all text-base text-slate-400">
                              {user.email || "No email"}
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
                          <div className="rounded-2xl bg-white/[0.03] p-3">
                            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                              Country
                            </div>
                            <div className="mt-2 text-sm font-medium text-slate-200 break-words">
                              {user.country || "-"}
                            </div>
                          </div>

                          <div className="rounded-2xl bg-white/[0.03] p-3">
                            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                              Region
                            </div>
                            <div className="mt-2 text-sm font-medium text-slate-200 break-words">
                              {user.stateRegion || "-"}
                            </div>
                          </div>

                          <div className="rounded-2xl bg-white/[0.03] p-3">
                            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                              City
                            </div>
                            <div className="mt-2 text-sm font-medium text-slate-200 break-words">
                              {user.city || "-"}
                            </div>
                          </div>

                          <div className="rounded-2xl bg-white/[0.03] p-3">
                            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                              Phone
                            </div>
                            <div className="mt-2 text-sm font-medium text-slate-200 break-all">
                              {user.phone || "-"}
                            </div>
                          </div>

                          <div className="rounded-2xl bg-white/[0.03] p-3">
                            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                              Last Seen
                            </div>
                            <div className="mt-2 text-sm font-medium text-slate-200 break-words">
                              {formatLastSeen(user.last_seen)}
                            </div>
                          </div>

                          <div className="rounded-2xl bg-white/[0.03] p-3">
                            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                              Balance
                            </div>
                            <div className="mt-2 text-sm font-semibold text-slate-200 break-words">
                              {formatMoney(user.totalUsd)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex w-full flex-col gap-3 2xl:w-auto 2xl:min-w-[260px]">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-1">
                          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                            <div className="text-[11px] uppercase tracking-[0.18em] text-white/30 font-bold">
                              Role / Status
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-3">
                              <div className="text-sm capitalize text-slate-300">
                                {user.role || "user"}
                              </div>
                              <div
                                className={`text-sm font-semibold capitalize ${
                                  accountStatus === "active"
                                    ? "text-emerald-400"
                                    : accountStatus === "suspended"
                                    ? "text-amber-400"
                                    : "text-rose-400"
                                }`}
                              >
                                {accountStatus}
                              </div>
                            </div>
                          </div>

                          <div
                            className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm ${
                              user.online
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                                : "border-white/10 bg-white/[0.04] text-slate-300"
                            }`}
                          >
                            {user.online ? <Wifi size={16} /> : <WifiOff size={16} />}
                            <span>{user.online ? "Online" : "Offline"}</span>
                          </div>

                          <div className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300 sm:col-span-2 2xl:col-span-1">
                            <Wallet size={16} />
                            <span className="font-medium">{formatMoney(user.totalUsd)}</span>
                          </div>

                          <Link
                            to={`/admin/users/${user.id}`}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-blue-500 sm:col-span-2 2xl:col-span-1"
                          >
                            <span>Open</span>
                            <ChevronRight size={16} />
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => updateAccountStatus(user.id, "suspended")}
                        className="inline-flex items-center gap-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-sm text-amber-300 hover:bg-amber-500/15"
                      >
                        <ShieldAlert size={16} />
                        Suspend
                      </button>

                      <button
                        onClick={() => updateAccountStatus(user.id, "blocked")}
                        className="inline-flex items-center gap-2 rounded-2xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-300 hover:bg-rose-500/15"
                      >
                        <Ban size={16} />
                        Block
                      </button>

                      <button
                        onClick={() => updateAccountStatus(user.id, "active")}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-300 hover:bg-emerald-500/15"
                      >
                        <RotateCcw size={16} />
                        Reactivate
                      </button>

                      <button
                        onClick={() => deleteUser(user)}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-2 rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300 hover:bg-red-500/15 disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
