import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail } from 'lucide-react';
import { auth, db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth() as any;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      const userRef = ref(db, `users/${uid}`);
      const snapshot = await get(userRef);

      const dbUser = snapshot.exists() ? snapshot.val() : null;

      if (!dbUser || dbUser.role !== 'admin') {
        setErrorMsg('This account is not an admin account.');
        setLoading(false);
        return;
      }

      setUser({
        ...dbUser,
        id: uid,
        email: cred.user.email
      });

      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error('Admin login error:', error);
      setErrorMsg(error?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-8 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.2)]">
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight">Admin Login</div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-white/30 font-bold mt-1">
              Axcel Control Access
            </div>
          </div>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 block mb-2">Admin Email</label>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <Mail size={18} className="text-blue-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@email.com"
                className="w-full bg-transparent outline-none text-white placeholder:text-slate-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300 block mb-2">Password</label>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <Lock size={18} className="text-blue-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full bg-transparent outline-none text-white placeholder:text-slate-500"
                required
              />
            </div>
          </div>

          {errorMsg && (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold transition"
          >
            {loading ? 'Signing in...' : 'Login as Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
