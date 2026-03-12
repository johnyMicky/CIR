import React, { useEffect, useMemo, useState } from "react";
import { ref, onValue } from "firebase/database";
import { Link } from "react-router-dom";
import {
  Wallet,
  Bitcoin,
  Landmark,
  Coins,
  ShieldCheck,
  Mail,
  Globe,
  MapPin,
  Phone,
  Wifi,
  WifiOff,
  Clock3,
  Activity,
  Copy,
  CheckCircle2
} from "lucide-react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

type UserData = {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  stateRegion?: string;
  city?: string;
  online?: boolean;
  last_seen?: number | string;
  lastSeen?: string;

  btc_balance?: number;
  eth_balance?: number;
  usdt_balance?: number;
  usd_balance?: number;
  balance?: string | number;

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

const formatLastSeen = (value?: number | string, legacy?: string) => {
  if (legacy && typeof legacy === "string") return legacy;
  if (!value) return "No recent activity";

  const timestamp = typeof value === "string" ? Number(value) : value;
  if (!timestamp) return "No recent activity";

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

const Dashboard = () => {
  const { user, logout } = useAuth() as any;
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    const userRef = ref(db, `users/${user.id}`);
    const activityRef = ref(db, `activity_logs/${user.id}`);

    const unsubUser = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserData(snapshot.val());
      } else {
        setUserData(null);
      }
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
      setActivities(rows.slice(0, 8));
    });

    return () => {
      unsubUser();
      unsubActivity();
    };
  }, [user?.id]);

  const balances = useMemo(() => {
    const btc = Number(userData?.btc_balance || 0);
    const eth = Number(userData?.eth_balance || 0);
    const usdt = Number(userData?.usdt_balance || 0);

    const usd =
      userData?.usd_balance !== undefined
        ? Number(userData.usd_balance || 0)
        : Number(userData?.balance || 0);

    return { btc, eth, usdt, usd };
  }, [userData]);

  const fullName =
    userData?.fullName ||
    `${userData?.firstName || ""} ${userData?.lastName || ""}`.trim() ||
    userData?.name ||
    user?.email ||
    "User";

  const locationText = [
    userData?.city,
    userData?.stateRegion,
    userData?.country
  ]
    .filter(Boolean)
    .join(", ");

  const handleCopy = async (value: string, key: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(""), 1600);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-100px] left-[6%] w-[340px] h-[340px] bg-blue-600/10 blur-[90px] rounded-full" />
        <div className="absolute top-[25%] right-[8%] w-[300px] h-[300px] bg-cyan-500/10 blur-[90px] rounded-full" />
        <div className="absolute bottom-[-120px] left-[20%] w-[360px] h-[360px] bg-violet-500/10 blur-[110px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        <div className="rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,13,28,0.95),rgba(7,11,20,0.92))] shadow-[0_24px_100px_rgba(0,0,0,0.42)] overflow-hidden">
          <div className="border-b border-white/8 px-6 md:px-8 py-6">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-blue-300 mb-4">
                  <ShieldCheck size={14} />
                  Secure Client Dashboard
                </div>

                <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                  Welcome, {fullName}
                </h1>
                <p className="text-slate-400 mt-3 text-base md:text-lg">
                  Premium multi-asset wallet overview with live Firebase sync.
                </p>
              </div>

              <div className="flex gap-3 flex-wrap">
                <Link
                  to="/"
                  className="px-5 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                >
                  Back Home
                </Link>
                <button
                  onClick={logout}
                  className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all shadow-[0_10px_30px_rgba(37,99,235,0.25)]"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 md:px-8 py-8 space-y-8">
            <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6">
              <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 md:p-7">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-2">
                      Portfolio Overview
                    </div>
                    <div className="text-2xl md:text-3xl font-black tracking-tight">
                      ${balances.usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm ${
                      userData?.online
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                        : "border-white/10 bg-white/[0.04] text-slate-300"
                    }`}
                  >
                    {userData?.online ? <Wifi size={16} /> : <WifiOff size={16} />}
                    <span>{userData?.online ? "Online" : "Offline"}</span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="rounded-[28px] border border-white/8 bg-black/20 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/20 flex items-center justify-center text-amber-300">
                        <Bitcoin size={18} />
                      </div>
                      <div className="text-sm text-slate-400">BTC Balance</div>
                    </div>
                    <div className="text-3xl font-black tracking-tight">
                      {balances.btc.toFixed(8)}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/8 bg-black/20 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-500/15 border border-slate-400/20 flex items-center justify-center text-slate-300">
                        <Coins size={18} />
                      </div>
                      <div className="text-sm text-slate-400">ETH Balance</div>
                    </div>
                    <div className="text-3xl font-black tracking-tight">
                      {balances.eth.toFixed(8)}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/8 bg-black/20 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center text-emerald-300">
                        <Wallet size={18} />
                      </div>
                      <div className="text-sm text-slate-400">USDT Balance</div>
                    </div>
                    <div className="text-3xl font-black tracking-tight">
                      {balances.usdt.toFixed(2)}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/8 bg-black/20 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-400/20 flex items-center justify-center text-blue-300">
                        <Landmark size={18} />
                      </div>
                      <div className="text-sm text-slate-400">USD Balance</div>
                    </div>
                    <div className="text-3xl font-black tracking-tight">
                      ${balances.usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-6 md:p-7">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-5">
                  Client Profile
                </div>

                <div className="space-y-3">
                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4 flex items-start gap-3">
                    <Mail size={16} className="text-blue-300 mt-0.5" />
                    <div>
                      <div className="text-sm text-slate-400">Email</div>
                      <div className="font-medium break-all">{userData?.email || user?.email || "-"}</div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4 flex items-start gap-3">
                    <Phone size={16} className="text-blue-300 mt-0.5" />
                    <div>
                      <div className="text-sm text-slate-400">Phone</div>
                      <div className="font-medium">{userData?.phone || "-"}</div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4 flex items-start gap-3">
                    <Globe size={16} className="text-blue-300 mt-0.5" />
                    <div>
                      <div className="text-sm text-slate-400">Country / Region</div>
                      <div className="font-medium">
                        {userData?.country || "-"}{userData?.stateRegion ? ` / ${userData.stateRegion}` : ""}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4 flex items-start gap-3">
                    <MapPin size={16} className="text-blue-300 mt-0.5" />
                    <div>
                      <div className="text-sm text-slate-400">Location</div>
                      <div className="font-medium">{locationText || "-"}</div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4 flex items-start gap-3">
                    <Clock3 size={16} className="text-blue-300 mt-0.5" />
                    <div>
                      <div className="text-sm text-slate-400">Last Seen</div>
                      <div className="font-medium">
                        {formatLastSeen(userData?.last_seen, userData?.lastSeen)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid xl:grid-cols-[1fr_1fr_1fr] gap-5">
              {[
                { key: "btc", title: "BTC Address", value: userData?.btc_address || "" },
                { key: "eth", title: "ETH Address", value: userData?.eth_address || "" },
                { key: "usdt", title: "USDT Address", value: userData?.usdt_address || "" }
              ].map((item) => (
                <div
                  key={item.key}
                  className="rounded-[28px] border border-white/8 bg-black/20 p-5"
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold">
                      {item.title}
                    </div>

                    {item.value && (
                      <button
                        onClick={() => handleCopy(item.value, item.key)}
                        className="inline-flex items-center gap-2 text-xs text-blue-300 hover:text-blue-200"
                      >
                        {copied === item.key ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                        <span>{copied === item.key ? "Copied" : "Copy"}</span>
                      </button>
                    )}
                  </div>

                  <div className="text-sm text-slate-300 break-all leading-relaxed">
                    {item.value || `No ${item.title} assigned yet`}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-6 md:p-7">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-400/20 flex items-center justify-center text-violet-300">
                  <Activity size={18} />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-1">
                    Activity
                  </div>
                  <div className="text-2xl font-black tracking-tight">Recent Client Log</div>
                </div>
              </div>

              {activities.length === 0 ? (
                <div className="rounded-2xl border border-white/8 bg-black/20 p-5 text-slate-400">
                  No recent activity found for this account yet.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {activities.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[24px] border border-white/8 bg-black/20 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-semibold text-white">
                          {item.details?.message || item.type || "Activity"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatActivityTime(item.created_at)}
                        </div>
                      </div>

                      <div className="text-sm text-slate-400 mt-2 break-words">
                        {item.page || "/dashboard"}
                      </div>

                      {item.details && (
                        <div className="mt-3 text-xs text-slate-500 break-words leading-relaxed">
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
    </div>
  );
};

export default Dashboard;
