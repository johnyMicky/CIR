import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import {
  Shield,
  Lock,
  UserPlus,
  ArrowRight,
  Wallet,
  TrendingUp,
  Globe,
  Users,
  Activity,
  ShieldCheck,
  ChevronRight,
  BarChart3,
  Layers3,
  Quote,
  Star,
  Mail,
  Database,
  Sparkles
} from 'lucide-react';

import { auth, db } from './firebase';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import MyWallets from './pages/MyWallets';
import SendReceive from './pages/SendReceive';
import SettingsPage from './pages/SettingsPage';
import ExchangeSwap from './pages/ExchangeSwap';
import SupportPage from './pages/SupportPage';
import Documentation from './pages/Documentation';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AmlKycPolicy from './pages/AmlKycPolicy';
import AppShell from './components/AppShell';

import AdminRoute from './components/AdminRoute';
import AdminLayout from './admin/components/AdminLayout';
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminUsers from './admin/pages/AdminUsers';
import AdminUserDetails from './admin/pages/AdminUserDetails';
import AdminWithdrawals from './admin/pages/Withdrawals';

const buttonFx =
  "relative overflow-hidden transition-all duration-300 before:content-[''] before:absolute before:w-[140%] before:h-[140%] before:top-[-140%] before:left-[-140%] before:bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.28),transparent)] before:rotate-[25deg] before:transition-all before:duration-700 hover:before:top-[140%] hover:before:left-[140%]";

const reviews = [
  { name: 'Michael Anderson', country: 'United States', city: 'New York', text: 'The platform feels premium from the first login. Private wallet access, clean balance visibility and strong visual trust.', rating: 5 },
  { name: 'Emily Carter', country: 'Australia', city: 'Sydney', text: 'Fast, elegant and secure. It looks more like an institutional wallet interface than a standard retail crypto panel.', rating: 5 },
  { name: 'James Walker', country: 'United Kingdom', city: 'London', text: 'Excellent client-facing experience. The dashboard is clear, premium and reassuring for private asset management.', rating: 5 },
  { name: 'Olivia Bennett', country: 'Canada', city: 'Toronto', text: 'Smooth onboarding, polished layout and a protected atmosphere throughout the platform. Very well structured.', rating: 5 },
  { name: 'Lukas Schneider', country: 'Germany', city: 'Berlin', text: 'The level of visual control and the secure wallet presentation give the platform a strong professional feel.', rating: 5 },
  { name: 'Claire Dubois', country: 'France', city: 'Paris', text: 'A refined private wallet interface with premium design language. It feels trustworthy and highly controlled.', rating: 5 }
];

const activityItems = [
  'Daniel Brooks • United States • Secure wallet session initialized',
  'Charlotte Evans • Australia • Premium access layer verified',
  'Oliver Hughes • United Kingdom • BTC wallet environment opened',
  'Sophie Martin • Canada • Private client dashboard activated',
  'Felix Wagner • Germany • Routing layer synchronized',
  'Camille Laurent • France • Protected wallet visibility enabled',
  'Elias Frei • Switzerland • Multi-asset access confirmed'
];

const flagMap: Record<string, string> = {
  'United States': '🇺🇸',
  Australia: '🇦🇺',
  'United Kingdom': '🇬🇧',
  Canada: '🇨🇦',
  Germany: '🇩🇪',
  France: '🇫🇷',
  Switzerland: '🇨🇭'
};

// 👉 LandingPage უცვლელად დატოვე (ზუსტად შენ რაც გაქვს)

function App() {
  const { user, setUser } = useAuth() as any;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        const userRef = ref(db, `users/${firebaseUser.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const dbUser = snapshot.val();
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            ...dbUser
          });
        } else {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email
          });
        }
      } catch (error) {
        console.error('Auth sync error:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712] text-white">
        Loading secure session...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/documentation" element={<Documentation />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/aml-kyc" element={<AmlKycPolicy />} />

      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

      <Route element={user ? <AppShell /> : <Navigate to="/login" replace />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-wallets" element={<MyWallets />} />
        <Route path="/send-receive" element={<SendReceive />} />
        <Route path="/exchange" element={<ExchangeSwap />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/support" element={<SupportPage />} />
      </Route>

      <Route
        path="/admin/login"
        element={user?.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />}
      />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/:id" element={<AdminUserDetails />} />
        <Route path="withdrawals" element={<AdminWithdrawals />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
