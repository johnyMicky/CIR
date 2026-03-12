import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { auth, db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth() as any;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = cred.user;

      const userRef = ref(db, `users/${firebaseUser.uid}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        throw new Error('User record not found in database.');
      }

      const dbUser = snapshot.val();

      if (dbUser.role !== 'admin') {
        throw new Error('This account is not an admin account.');
      }

      setUser({
        ...dbUser,
        id: firebaseUser.uid,
        email: firebaseUser.email
      });

      navigate('/admin', { replace: true });
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError(err?.message || 'Admin login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
            <ShieldCheck size={30} />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Admin Access</h1>
          <p className="text-slate-400 mt-2">Sign in to the Axcel admin control panel</p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Admin Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl bg-black/20 border border-white/10 pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-2xl bg-black/20 border border-white/10 pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                placeholder="Enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-4 font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <span>{loading ? 'Signing in...' : 'Enter Admin Panel'}</span>
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
