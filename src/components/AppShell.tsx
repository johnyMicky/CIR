import React, { useEffect, useMemo, useState } from "react";
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
  Menu,
  X,
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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

  const handleSidebarNavigate = (path?: string) => {
    if (!path) return;
    navigate(path);
    setMobileSidebarOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div className="mb-6 flex items-center gap-3 px-1 lg:mb-8">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20">
          <Wallet className="h-5 w-5 text-cyan-400" />
        </div>

        <div className="min-w-0">
          <div className="truncate text-lg font-semibold">Axcelci</div>
          <div className="truncate text-xs text-slate-400">Private Wallet</div>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeKey === item.key;

          return (
            <button
              key={item.key}
              onClick={() => handleSidebarNavigate(item.path)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                isActive
                  ? "bg-cyan-500/15 text-cyan-300"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm text-slate-300 hover:bg-white/10"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="truncate">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen w-full bg-[#070F1F] text-white">
      {logoutMessage && (
        <div className="fixed right-4 top-4 z-[140] rounded-2xl border border-cyan-400/20 bg-[#0F1B33]/95 px-4 py-3 text-sm text-cyan-100 shadow-2xl backdrop-blur-xl">
          {logoutMessage}
        </div>
      )}

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-[120] flex w-[280px] flex-col border-r border-white/10 bg-[#0B1628] p-5 transition-transform duration-300 lg:static lg:z-auto lg:w-[260px] lg:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <div className="text-sm font-semibold text-slate-300">Menu</div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-300 hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <SidebarContent />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="border-b border-white/10 bg-[#0B1628] px-4 py-3 sm:px-5 lg:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="relative min-w-0 flex-1 lg:w-[380px] lg:flex-none">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="Search transactions or assets..."
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setShowBalance((s) => !s)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10"
                >
                  {showBalance ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>

                <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10">
                  <Bell className="h-4 w-4" />
                </button>
              </div>

              <div className="flex min-w-0 items-center gap-3 rounded-xl bg-white/5 px-3 py-2 sm:px-4">
                <div className="h-8 w-8 shrink-0 rounded-full bg-cyan-400/30"></div>
                <div className="min-w-0">
                  <div className="truncate text-sm">{displayName}</div>
                </div>
              </div>
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
