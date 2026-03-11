import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  CreditCard, 
  Calendar, 
  Monitor, 
  ShoppingCart, 
  Bitcoin, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Wallet,
  Coins
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: CreditCard, label: 'Payment Methods', path: '/dashboard/payment-methods' },
    { icon: Calendar, label: 'My Booking Sessions', path: '/dashboard/bookings' },
    { icon: Monitor, label: 'Expert Remote Assist', path: '/dashboard/remote-assist' },
    { icon: Wallet, label: 'Order Trezor Wallet', path: '/dashboard/order' },
    { icon: Coins, label: 'Crypto Assets', path: '/dashboard/assets' },
    { icon: Bitcoin, label: 'Buy Crypto', path: '/dashboard/buy' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#0f1012] text-white font-sans flex">
      {/* Mobile Menu Button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#1a1b1e] border-r border-slate-800 transform transition-transform duration-200 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <div className="w-4 h-5 bg-black rounded-sm"></div>
            </div>
            <span className="text-xl font-bold">Trezor Safe 7</span>
          </div>

          <div className="flex bg-[#25262b] rounded-lg p-1 mb-6">
            <button className="flex-1 py-1.5 text-sm text-slate-400 font-medium">Onboarding</button>
            <button className="flex-1 py-1.5 text-sm bg-blue-600 text-white rounded-md font-medium shadow-sm">Dashboard</button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path 
                    ? 'bg-[#25262b] text-white' 
                    : 'text-slate-400 hover:bg-[#25262b] hover:text-white'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-800 bg-[#1a1b1e]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg font-medium">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-white">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
