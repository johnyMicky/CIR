import React, { useMemo, useState } from "react";
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
  Search,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth() as any;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = useMemo(
    () => [
      {
        label: "Dashboard",
        to: "/admin/dashboard",
        icon: <LayoutDashboard size={18} />,
        hint: "Overview",
      },
      {
        label: "Users",
        to: "/admin/users",
        icon: <Users size={18} />,
        hint: "Clients",
      },
      {
        label: "Withdrawals",
        to: "/admin/withdrawals",
        icon: <CreditCard size={18} />,
        hint: "Requests",
      },
    ],
    []
  );

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const isActiveRoute = (to: string) =>
    location.pathname === to || (to === "/admin/dashboard" && location.pathname === "/admin");

  const SidebarContent = () => (
    <>
      <div className="border-b border-white/8 px-5 py-6">
        <Link to="/admin/dashboard" className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.12)]">
            <ShieldCheck size={24} />
          </div>

          <div className="min-w-0">
            <div className="truncate text-xl font-black tracking-tight text-white">
              Axcel Admin
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.28em] text-white/30">
              Control Center
            </div>
          </div>
        </Link>
      </div>

      <div className="p-4 space-y-2">
        {navItems.map((item) => {
          const active = isActiveRoute(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
                active
                  ? "border-cyan-400/20 bg-cyan-500/12 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.10)]"
                  : "border-transparent bg-white/[0.02] text-slate-300 hover:border-white/8 hover:bg-white/[0.05]"
              }`}
            >
              <div
                className={`shrink-0 ${
                  active ? "text-cyan-300" : "text-slate-400 group-hover:text-slate-200"
                }`}
              >
                {item.icon}
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{item.label}</div>
                <div className="mt-0.5 text-xs text-white/35">{item.hint}</div>
              </div>

              {active && <ChevronRight size={16} className="shrink-0" />}
            </Link>
          );
        })}
      </div>

      <div className="px-4 pt-2 pb-4">
        <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(34,211,238,0.10),rgba(255,255,255,0.02))] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
          <div className="mb-3 flex items-center gap-2 text-cyan-300">
            <Activity size={16} />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em]">
              Live Status
            </span>
          </div>

          <div className="space-y-2 text-sm text-slate-300">
            <div className="flex items-center justify-between">
              <span>Admin session</span>
              <span className="font-semibold text-emerald-400">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Panel security</span>
              <span className="font-semibold text-cyan-300">Protected</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Workspace</span>
              <span className="font-semibold text-violet-300">Premium</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/8 p-4">
        <div className="mb-3 rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
          <div className="mb-2 flex items-center gap-2 text-cyan-300">
            <Sparkles size={14} />
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
              Signed in as
            </div>
          </div>

          <div className="truncate font-semibold text-white">{user?.email || "Admin"}</div>
          <div className="mt-1 text-sm capitalize text-cyan-300">{user?.role || "admin"}</div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 py-3 text-rose-300 transition-all hover:bg-rose-500 hover:text-white"
        >
          <LogOut size={16} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[4%] top-[-120px] h-[320px] w-[320px] rounded-full bg-cyan-500/8 blur-[90px]" />
        <div className="absolute bottom-[-120px] right-[4%] h-[320px] w-[320px] rounded-full bg-blue-600/8 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="relative flex min-h-screen">
        <aside className="fixed left-6 top-6 z-[100] hidden w-[300px] shrink-0 transition-all duration-300 lg:flex">
          <div className="flex w-full flex-col overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,#07111f_0%,#0a1324_100%)] shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
            <SidebarContent />
          </div>
        </aside>

        <aside
          className={`fixed inset-y-0 left-0 z-[110] flex w-[290px] shrink-0 flex-col border-r border-white/8 bg-[linear-gradient(180deg,#07111f_0%,#0a1324_100%)] transition-transform duration-300 lg:hidden ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
            <div className="text-sm font-semibold text-slate-300">Admin Menu</div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
            >
              <X size={18} />
            </button>
          </div>

          <SidebarContent />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col lg:ml-[330px]">
          <header className="sticky top-0 z-30 border-b border-white/8 bg-[#030712]/80 backdrop-blur-xl">
            <div className="px-4 py-4 sm:px-5 md:px-8">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-start gap-3 sm:items-center">
                  <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] lg:hidden"
                  >
                    <Menu size={18} />
                  </button>

                  <div className="min-w-0">
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300/80">
                      Admin Workspace
                    </div>
                    <div className="text-xl font-black tracking-tight sm:text-2xl">
                      Management Console
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <div className="relative min-w-0 sm:w-[240px] lg:w-[280px]">
                    <Search
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="h-11 w-full rounded-2xl border border-white/8 bg-white/[0.04] pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/40"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <button className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08]">
                      <Bell size={18} />
                    </button>

                    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2.5 sm:px-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/12 text-cyan-300">
                        <ShieldCheck size={18} />
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-white">
                          {user?.email || "Admin"}
                        </div>
                        <div className="truncate text-xs capitalize text-cyan-300">
                          {user?.role || "admin"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 py-5 sm:px-5 md:px-8 md:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
