import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Shield, Users, LayoutDashboard, ArrowDownToLine, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth() as any;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Admin logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="border-b border-white/10 bg-[#030712]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-[0_0_25px_rgba(37,99,235,0.18)]">
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight">Axcel Admin</div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-white/30 font-bold mt-1">
                Control Panel
              </div>
            </div>
          </div>

          <div className="text-sm text-slate-400 hidden md:block">
            {user?.email || 'admin'}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        <aside className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 h-fit">
          <div className="space-y-2">
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-white/5 transition"
            >
              <LayoutDashboard size={18} className="text-blue-400" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/admin/users"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-white/5 transition"
            >
              <Users size={18} className="text-cyan-400" />
              <span>Users</span>
            </Link>

            <Link
              to="/admin/withdrawals"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-white/5 transition"
            >
              <ArrowDownToLine size={18} className="text-emerald-400" />
              <span>Withdrawals</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-rose-500/10 text-rose-400 transition"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <section>
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default AdminLayout;
