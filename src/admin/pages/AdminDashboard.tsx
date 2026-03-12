import React from 'react';
import { Users, CreditCard, Bell, Wallet } from 'lucide-react';

const StatCard = ({
  title,
  value,
  icon
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold">
        {title}
      </div>
      <div className="text-blue-400">{icon}</div>
    </div>
    <div className="text-3xl font-black tracking-tight">{value}</div>
  </div>
);

const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <div className="text-[11px] uppercase tracking-[0.22em] text-blue-300 font-bold mb-2">
          Admin Overview
        </div>
        <h1 className="text-4xl font-black tracking-tight">Axcel Control Panel</h1>
        <p className="text-slate-400 mt-2">
          Manage users, balances, withdrawals and notifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard title="Users" value="--" icon={<Users size={20} />} />
        <StatCard title="Withdrawals" value="--" icon={<CreditCard size={20} />} />
        <StatCard title="Notifications" value="--" icon={<Bell size={20} />} />
        <StatCard title="Wallets" value="--" icon={<Wallet size={20} />} />
      </div>

      <div className="rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-8">
        <div className="text-xl font-bold mb-3">Admin dashboard is live</div>
        <p className="text-slate-400">
          Next step is connecting this panel to Firebase users, transactions and withdrawal approvals.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
