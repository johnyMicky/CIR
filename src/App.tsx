import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get } from 'firebase/database';

import { auth, db } from './firebase';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

import AdminRoute from './components/AdminRoute';
import AdminLayout from './admin/components/AdminLayout';
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminUsers from './admin/pages/AdminUsers';
import AdminUserDetails from './admin/pages/AdminUserDetails';
import AdminWithdrawals from './admin/pages/Withdrawals';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center">
      <div className="text-center space-y-6 px-6">
        <h1 className="text-4xl font-bold">Axcel Private Wallet</h1>
        <p className="text-slate-400">Secure digital asset environment</p>

        <div className="flex gap-4 justify-center flex-wrap">
          <a href="/login" className="bg-blue-600 px-6 py-3 rounded-xl">
            Login
          </a>
          <a href="/register" className="border border-white/20 px-6 py-3 rounded-xl">
            Register
          </a>
          <a href="/admin/login" className="border border-blue-500/30 text-blue-300 px-6 py-3 rounded-xl">
            Admin
          </a>
        </div>
      </div>
    </div>
  );
};

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
            ...dbUser,
          });
        } else {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
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

      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/login" replace />}
      />

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
