import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  CreditCard,
  Activity,
  LogOut,
  ChevronRight,
  Bell,
  Search
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth() as any;

  const navItems = [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: <LayoutDashboard size={18} />
    },
    {
      label: "Users",
      to: "/admin/users",
      icon: <Users size={18} />
    },
    {
      label: "Withdrawals",
      to: "/admin/withdrawals",
      icon: <CreditCard size={18} />
    }
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex w-[290px] shrink-0 border-r border-white/8 bg-[linear-gradient(180deg,#08101f_0%,#0b1220_100%)] flex-col">
          <div className="px-6 py-6 border-b border-white/8">
            <Link to="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_25px_rgba(37,99,235,0.15)]">
                <ShieldCheck size={24} />
              </div>
              <div>
                <div className="text-xl font-black tracking-tight">Axcel Admin</div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-white/30 font-bold mt-1">
                  Control Panel
                </div>
              </div>
            </Link>
          </div>

          <div className="p-4 space-y-2">
            {navItems.map((item) => {
              const active =
                location.pathname === item.to ||
                (item.to === "/admin/dashboard" && location.pathname === "/admin");

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all ${
                    active
                      ? "bg-blue-600/15 border border-blue-500/20 text-blue-300 shadow-[0_0_18px_rgba(37,99,235,0.10)]"
                      : "border border-transparent bg-white/[0.02] hover:bg-white/[0.05] text-slate-300"
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                  {active && <ChevronRight size={16} className="ml-auto" />}
                </Link>
              );
            })}
          </div>

          <div className="px-4 mt-4">
            <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(37,99,235,0.10),rgba(255,255,255,0.02))] p-4">
              <div className="flex items-center gap-2 text-blue-300 mb-3">
                <Activity size={16} />
                <span className="text-[11px] uppercase tracking-[0.18em] font-bold">
                  Live Status
                </span>
              </div>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Admin session</span>
                  <span className="text-emerald-400 font-semibold">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Panel security</span>
                  <span className="text-blue-300 font-semibold">Protected</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto p-4 border-t border-white/8">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 mb-3">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/30 font-bold mb-2">
                Signed in as
              </div>
              <div className="font-semibold truncate">{user?.email || "Admin"}</div>
              <div className="text-sm text-blue-300 mt-1">{user?.role || "admin"}</div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-300 py-3 transition-all"
            >
              <LogOut size={16} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 border-b border-white/8 bg-[#030712]/85 backdrop-blur-xl">
            <div className="px-5 md:px-8 py-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-blue-300/80 font-bold mb-1">
                  Admin Workspace
                </div>
                <div className="text-xl md:text-2xl font-black tracking-tight">
                  Management Console
                </div>
              </div>

              <div className="hidden md:flex items-center gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-[220px] rounded-2xl bg-white/[0.04] border border-white/8 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button className="w-11 h-11 rounded-2xl border border-white/8 bg-white/[0.04] hover:bg-white/[0.07] flex items-center justify-center text-slate-300">
                  <Bell size={18} />
                </button>
              </div>
            </div>
          </header>

          <main className="px-5 md:px-8 py-6 md:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
