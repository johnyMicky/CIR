import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import { useAuth } from './context/AuthContext';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-black mb-6">
          Axcel Wallet
        </h1>

        <p className="text-slate-400 mb-8">
          Secure crypto wallet dashboard
        </p>

        <a
          href="/login"
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition"
        >
          Login
        </a>
      </div>
    </div>
  );
};

function App() {

  const { user, loading } = useAuth() as any;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center text-blue-500">
        Loading...
      </div>
    );
  }

  return (
    <Routes>

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={
          user
            ? <Navigate to="/dashboard" replace />
            : <Login />
        }
      />

      <Route
        path="/dashboard"
        element={
          user
            ? <Dashboard />
            : <Navigate to="/login" replace />
        }
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}

export default App;
