import React from 'react';
import { Settings as SettingsIcon, Shield, Bell, User, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-2">Manage your account preferences and security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#1a1b1e] rounded-xl border border-slate-800 p-4">
            <nav className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white">
                <User size={18} />
                Profile
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-[#25262b] hover:text-white transition-colors">
                <Shield size={18} />
                Security
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-[#25262b] hover:text-white transition-colors">
                <Bell size={18} />
                Notifications
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-[#25262b] hover:text-white transition-colors">
                <Lock size={18} />
                Privacy
              </button>
            </nav>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-[#1a1b1e] rounded-xl border border-slate-800 p-6">
            <h3 className="text-xl font-bold text-white mb-6">Profile Information</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={user?.name || ''} 
                  readOnly
                  className="w-full bg-[#25262b] border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  readOnly
                  className="w-full bg-[#25262b] border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Username</label>
                <input 
                  type="text" 
                  value={user?.username || ''} 
                  readOnly
                  className="w-full bg-[#25262b] border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
