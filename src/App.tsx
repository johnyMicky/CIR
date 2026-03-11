import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CompanyPolicy from './pages/CompanyPolicy';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Login from './pages/Login';
import Register from './pages/Register';
import ScrollToTop from './components/ScrollToTop';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import { AuthProvider, useAuth } from './context/AuthContext';

import DashboardLayout from './components/DashboardLayout';
import PaymentMethods from './pages/PaymentMethods';
import Bookings from './pages/Bookings';
import RemoteAssist from './pages/RemoteAssist';
import OrderWallet from './pages/OrderWallet';
import CryptoAssets from './pages/CryptoAssets';
import BuyCrypto from './pages/BuyCrypto';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactElement, allowedRoles?: string[] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="company-policy" element={<CompanyPolicy />} />
            <Route path="terms-of-service" element={<TermsOfService />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="contact" element={<Contact />} />
            <Route path="faq" element={<FAQ />} />
          </Route>
          
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['client']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="payment-methods" element={<PaymentMethods />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="remote-assist" element={<RemoteAssist />} />
            <Route path="order" element={<OrderWallet />} />
            <Route path="assets" element={<CryptoAssets />} />
            <Route path="buy" element={<BuyCrypto />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          } />

          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
