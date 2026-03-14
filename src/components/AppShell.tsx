import React, { useMemo, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
  LayoutDashboard,
  Wallet,
  ArrowUpDown,
  RefreshCw,
  History,
  Settings,
  LifeBuoy,
  Bell,
  Search,
  Eye,
  EyeOff,
  LogOut,
} from "lucide-react";

import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";

type SidebarKey =
  | "dashboard"
  | "wallets"
  | "send_receive"
  | "swap"
  | "history"
  | "settings"
  | "support";

const AppShell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuth() as any;

  const [showBalance, setShowBalance] = useState(true);
  const [globalSearch, setGlobalSearch] = useState("");
  const [logoutMessage, setLogoutMessage] = useState("");

  const sidebarItems: {
    key: SidebarKey;
    label: string;
    icon: React.ElementType;
    path?: string;
  }[] = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { key: "wallets", label: "My Wallets", icon: Wallet, path: "/my-wallets" },
    { key: "send_receive", label: "Send / Receive", icon: ArrowUpDown, path: "/send-receive" },
    { key: "swap", label: "Exchange / Swap", icon: RefreshCw, path: "/exchange" },
    { key: "history", label: "Transactions History", icon: History, path: "/history" },
    { key: "settings", label: "Settings", icon: Settings, path: "/settings" },
    { key: "support", label: "Support / Help", icon: LifeBuoy, path: "/support" },
  ];

  const activeKey = useMemo<SidebarKey>(() => {
    if (location.pathname.startsWith("/my-wallets")) return "wallets";
    if (location.pathname.startsWith("/send-receive")) return "send_receive";
    if (location.pathname.startsWith("/history")) return "history";
    if (location.pathname.startsWith("/settings")) return "settings";
    if (location.pathname.startsWith("/exchange")) return "swap";
    if (location.pathname.startsWith("/support")) return "support";
    if (location.pathname.startsWith("/dashboard")) return "dashboard";
    return "dashboard";
  }, [location.pathname]);

  const displayName = useMemo(() => {
    return (
      user?.fullName ||
      `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
      user?.name ||
      user?.username ||
      user?.email ||
      "Client"
    );
  }, [user]);

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("authUser");
      setUser(null);
      setLogoutMessage("Successfully logged out");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 700);
    } catch (error) {
      console.error("Logout error:", error);
      setLogoutMessage("Logout failed");
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#070F1F] text-white">
      {logoutMessage && (
        <div className="fixed right-4 top-4 z-[120] rounded-2xl border border-cyan-400/20 bg-[#0F1B33]/95 px-4 py-3 text-sm text-cyan-100 shadow-2xl backdrop-blur-xl">
          {logoutMessage}
        </div>
      )}

      <aside className="flex w-[260px] flex-col border-r border-white/10 bg-[#0B1628] p-5">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20">
            <Wallet className="h-5 w-5 text-cyan-400" />
          </div>

          <div>
            <div className="text-lg font-semibold">Axcelci</div>
            <div className="text-xs text-slate-400">Private Wallet</div>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeKey === item.key;

            return (
              <button
                key={item.key}
                onClick={() => item.path && navigate(item.path)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-300"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto">
          <button
            onClick={logout}
            className="mt-6 flex w-full items-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm text-slate-300 hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-[70px] items-center justify-between border-b border-white/10 bg-[#0B1628] px-6">
          <div className="relative w-[380px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search transactions or assets..."
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowBalance((s) => !s)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10"
            >
              {showBalance ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </button>

            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10">
              <Bell className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-2">
              <div className="h-8 w-8 rounded-full bg-cyan-400/30"></div>
              <div className="text-sm">{displayName}</div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#070F1F]">
          <Outlet context={{ showBalance, setShowBalance, globalSearch }} />
        </main>
      </div>
    </div>
  );
};

export default AppShell;
