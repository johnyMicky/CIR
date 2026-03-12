import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  CreditCard,
  LogOut,
  ChevronRight
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
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400">
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
            <div className="px-5 md:px-8 py-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-blue-300/80 font-bold mb-1">
                  Admin Workspace
                </div>
                <div className="text-xl md:text-2xl font-black tracking-tight">
                  Management Console
                </div>
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
