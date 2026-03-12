import React from 'react';
import { useParams, Link } from 'react-router-dom';

const AdminUserDetails = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6 text-white">
      <div>
        <div className="text-[11px] uppercase tracking-[0.22em] text-blue-300 font-bold mb-2">
          Admin User Details
        </div>
        <h1 className="text-3xl font-black tracking-tight">User Profile</h1>
        <p className="text-slate-400 mt-2">
          Viewing user: {id}
        </p>
      </div>

      <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6">
        <div className="text-lg font-semibold mb-4">Basic Information</div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="text-sm text-slate-400 mb-2">User ID</div>
            <div className="font-medium break-all">{id}</div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="text-sm text-slate-400 mb-2">Status</div>
            <div className="font-medium text-emerald-400">Active</div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6">
        <div className="text-lg font-semibold mb-4">Admin Actions</div>

        <div className="flex flex-wrap gap-3">
          <button className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all">
            Edit Balances
          </button>

          <button className="px-5 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
            Send Notification
          </button>

          <button className="px-5 py-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500 hover:text-white transition-all">
            Suspend User
          </button>
        </div>
      </div>

      <div>
        <Link
          to="/admin/users"
          className="inline-flex items-center px-5 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
        >
          Back to Users
        </Link>
      </div>
    </div>
  );
};

export default AdminUserDetails;
