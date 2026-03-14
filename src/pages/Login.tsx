import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { auth, db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const buttonFx =
    "relative overflow-hidden transition-all duration-300 before:content-[''] before:absolute before:w-[140%] before:h-[140%] before:top-[-140%] before:left-[-140%] before:bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.35),transparent)] before:rotate-[25deg] before:transition-all before:duration-700 hover:before:top-[140%] hover:before:left-[140%]";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const uid = cred.user.uid;

      const userRef = ref(db, `users/${uid}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        await signOut(auth);
        throw new Error('User record not found.');
      }

      const dbUser = snapshot.val() || {};
      const accountStatus = String(dbUser.accountStatus || dbUser.status || 'active').toLowerCase();

      if (accountStatus === 'suspended') {
        await signOut(auth);
        throw new Error('Your account is suspended. Please contact support.');
      }

      if (accountStatus === 'blocked') {
        await signOut(auth);
        throw new Error('Your account has been blocked.');
      }

      setUser({
        ...dbUser,
        id: uid,
        email: cred.user.email,
      });

      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);

      const message =
        err?.message === 'Your account is suspended. Please contact support.'
          ? err.message
          : err?.message === 'Your account has been blocked.'
          ? err.message
          : err?.message === 'User record not found.'
          ? err.message
          : 'Invalid email or password.';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center px-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-120px] left-[8%] w-[380px] h-[380px] bg-blue-600/10 blur-[90px] rounded-full"></div>
        <div className="absolute bottom-[-140px] right-[6%] w-[320px] h-[320px] bg-cyan-500/10 blur-[90px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-md rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-8 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
            <ShieldCheck size={30} />
          </div>

          <h1 className="text-3xl font-black tracking-tight mb-2">
            Welcome back
          </h1>
          <p className="text-slate-400">
            Sign in to access your private wallet dashboard
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 flex items-center gap-3 text-rose-300">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 px-6 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-2xl shadow-[0_12px_30px_rgba(37,99,235,0.30)] ${buttonFx}`}
          >
            <span className="relative z-10">
              {loading ? 'Signing in...' : 'Sign In'}
            </span>
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-slate-500 hover:text-slate-300">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
