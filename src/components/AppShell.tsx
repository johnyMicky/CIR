import React, { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  Eye,
  EyeOff,
  LayoutDashboard,
  Wallet,
  ArrowUpDown,
  RefreshCw,
  History,
  Settings,
  LifeBuoy,
  Search,
  LogOut,
} from "lucide-react";

type SidebarKey =
  | "dashboard"
  | "wallets"
  | "send_receive"
  | "swap"
  | "history"
  | "settings"
  | "support";

const sidebarItems: {
  key: SidebarKey;
  label: string;
  icon: React.ElementType;
  path?: string;
}[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { key: "wallets", label: "My Wallets", icon: Wallet, path: "/my-wallets" },
  { key: "send_receive", label: "Send / Receive", icon: ArrowUpDown },
  { key: "swap", label: "Exchange / Swap", icon: RefreshCw },
  { key: "history", label: "Transactions History", icon: History, path: "/history" },
  { key: "settings", label: "Settings", icon: Settings },
  { key: "support", label: "Support / Help", icon: LifeBuoy },
];

const mockNotifications = [
  { id: 1, text: "Transaction confirmed", time: "2 min ago", unread: true },
  { id: 2, text: "New login detected", time: "18 min ago", unread: true },
  { id: 3, text: "Deposit received", time: "1 hour ago", unread: false },
];

const AppShell = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showBalance, setShowBalance] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  const notificationRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setShowNotifications(false);
      }

      if (profileRef.current && !profileRef.current.contains(target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const unreadCount = useMemo(
    () => mockNotifications.filter((item) => item.unread).length,
    []
  );

  const activeKey = useMemo<SidebarKey>(() => {
    if (location.pathname.startsWith("/my-wallets")) return "wallets";
    if (location.pathname.startsWith("/history")) return "history";
    if (location.pathname.startsWith("/dashboard")) return "dashboard";
    return "dashboard";
  }, [location.pathname]);

  const handleSidebarClick = (item: (typeof sidebarItems)[number]) => {
    if (item.path) {
      navigate(item.path);
      return;
    }

    setToast(`${item.label} page is ready for next step`);
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    setToast("Logout action clicked");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_18%),radial-gradient(circle_at_right_top,_rgba(139,92,246,0.14),_transparent_22%),linear-gradient(180deg,#07111F_0%,#0A1427_45%,#0C1730_100%)] text-white">
      {toast && (
        <div className="fixed right-4 top-4 z-[100] rounded-2xl border border-cyan-400/20 bg-[#0F1B33]/95 px-4 py-3 text-sm text-cyan-100 shadow-2xl backdrop-blur-xl">
          {toast}
        </div>
      )}

      <div className="flex min-h-screen">
        <aside className="hidden xl:flex w-72 shrink-0 flex-col border-r border-white/10 bg-[#071325]/80 backdrop-blur-xl">
          <div className="border-b border-white/10 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 shadow-[0_0_30px_rgba(59,130,246,0.35)]">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold tracking-wide">Axcelci.com</div>
                <div className="text-xs text-slate-400">Private Wallet Dashboard</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-5">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeKey === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => handleSidebarClick(item)}
                  className={`w-full rounded-2xl px-4 py-3 text-left transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500/20 via-cyan-400/10 to-violet-500/20 text-white shadow-[0_0_25px_rgba(59,130,246,0.15)] ring-1 ring-cyan-300/15"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="text-sm font-medium">Secure wallet access</div>
              <div className="mt-1 text-xs leading-5 text-slate-400">
                Shared private wallet layout across all client pages.
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-[#081120]/75 backdrop-blur-xl">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex h-20 items-center gap-3 sm:gap-4">
                <div className="flex min-w-[140px] items-center gap-3 xl:hidden">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-sm font-semibold">Axcelci</div>
                </div>

                <div className="relative max-w-2xl flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by transaction ID or asset"
                    className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-400 focus:border-cyan-400/40 focus:bg-white/10"
                  />
                </div>

                <button
                  onClick={() => setShowBalance((s) => !s)}
                  className="hidden h-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-slate-200 hover:bg-white/10 sm:flex"
                >
                  {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <span>{showBalance ? "Hide Balance" : "Show Balance"}</span>
                </button>

                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setShowNotifications((s) => !s)}
                    className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10"
                  >
                    <Bell className="h-5 w-5 text-slate-200" />
                    {unreadCount > 0 && (
                      <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-[#081120]" />
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-3 w-80 rounded-3xl border border-white/10 bg-[#0F1B33]/95 p-3 shadow-2xl backdrop-blur-xl">
                      <div className="mb-2 px-2 text-sm font-semibold">Notifications</div>
                      <div className="space-y-2">
                        {mockNotifications.map((item) => (
                          <div key={item.id} className="rounded-2xl bg-white/5 px-3 py-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-sm text-white">{item.text}</div>
                                <div className="mt-1 text-xs text-slate-400">{item.time}</div>
                              </div>
                              {item.unread && (
                                <span className="mt-1 h-2 w-2 rounded-full bg-rose-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setShowProfileMenu((s) => !s)}
                    className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 hover:bg-white/10 sm:px-4"
                  >
                    <img
                      src="https://i.pravatar.cc/100?img=12"
                      alt="User"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div className="hidden text-left md:block">
                      <div className="text-sm font-medium">Michael Carter</div>
                      <div className="text-xs text-slate-400">Client account</div>
                    </div>
                    <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-3 w-56 rounded-3xl border border-white/10 bg-[#0F1B33]/95 p-2 shadow-2xl backdrop-blur-xl">
                      <button
                        onClick={() => {
                          setToast("Profile clicked");
                          setShowProfileMenu(false);
                        }}
                        className="w-full rounded-2xl px-3 py-3 text-left text-sm hover:bg-white/5"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setToast("Settings page is ready for next step");
                        }}
                        className="w-full rounded-2xl px-3 py-3 text-left text-sm hover:bg-white/5"
                      >
                        Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full rounded-2xl px-3 py-3 text-left text-sm text-rose-200 hover:bg-rose-500/10"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="min-w-0">
            <Outlet context={{ showBalance, setShowBalance, globalSearch: search }} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppShell;
