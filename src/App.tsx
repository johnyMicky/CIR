import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { ref, get } from 'firebase/database';
import { useAuth } from './context/AuthContext';
import {
  Shield,
  UserPlus,
  ArrowRight,
  Lock,
  Wallet,
  TrendingUp,
  Layers3,
  ShieldCheck,
  Mail,
  ChevronRight,
  Activity,
  Database,
  Globe,
  Users,
  Star,
  Quote,
  BarChart3
} from 'lucide-react';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

import AdminRoute from './components/AdminRoute';
import AdminLayout from './admin/components/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminLogin from './admin/pages/AdminLogin';

const LandingPage = () => {
  const location = useLocation();
  const logoutSuccess = (location.state as any)?.logoutSuccess;

  const buttonFx =
    "relative overflow-hidden transition-all duration-300 before:content-[''] before:absolute before:w-[140%] before:h-[140%] before:top-[-140%] before:left-[-140%] before:bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.35),transparent)] before:rotate-[25deg] before:transition-all before:duration-700 hover:before:top-[140%] hover:before:left-[140%]";

  const [marketData, setMarketData] = useState({
    BTC: { price: 68223, change: 2.84 },
    ETH: { price: 3214, change: 1.62 },
    USDT: { price: 1.0, change: 0 }
  });

  const [activeReview, setActiveReview] = useState(0);
  const [statsAnimated, setStatsAnimated] = useState({
    users: 0,
    assets: 0,
    countries: 0,
    uptime: 0
  });
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeMessage, setSubscribeMessage] = useState('');

  const reviews = [
    {
      name: 'Michael Anderson',
      country: 'United States',
      city: 'New York',
      text: 'The platform feels premium from the first login. Private wallet access, clean balance visibility and strong visual trust.',
      rating: 5
    },
    {
      name: 'Emily Carter',
      country: 'Australia',
      city: 'Sydney',
      text: 'Fast, elegant and secure. It looks more like an institutional wallet interface than a standard retail crypto panel.',
      rating: 5
    },
    {
      name: 'James Walker',
      country: 'United Kingdom',
      city: 'London',
      text: 'Excellent client-facing experience. The dashboard is clear, premium and reassuring for private asset management.',
      rating: 5
    },
    {
      name: 'Olivia Bennett',
      country: 'Canada',
      city: 'Toronto',
      text: 'Smooth onboarding, polished layout and a protected atmosphere throughout the platform. Very well structured.',
      rating: 5
    },
    {
      name: 'Lukas Schneider',
      country: 'Germany',
      city: 'Berlin',
      text: 'The level of visual control and the secure wallet presentation give the platform a strong professional feel.',
      rating: 5
    },
    {
      name: 'Claire Dubois',
      country: 'France',
      city: 'Paris',
      text: 'A refined private wallet interface with premium design language. It feels trustworthy and highly controlled.',
      rating: 5
    },
    {
      name: 'Noah Meier',
      country: 'Switzerland',
      city: 'Zurich',
      text: 'Very strong private-client presentation. The secure access flow and dashboard structure are both impressive.',
      rating: 5
    }
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

  useEffect(() => {
    let mounted = true;

    const fetchMarket = async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether'
        );
        const data = await res.json();

        if (!mounted || !Array.isArray(data) || data.length < 3) return;

        setMarketData({
          BTC: {
            price: Number(data[0]?.current_price || 68223),
            change: Number(data[0]?.price_change_percentage_24h || 0)
          },
          ETH: {
            price: Number(data[1]?.current_price || 3214),
            change: Number(data[1]?.price_change_percentage_24h || 0)
          },
          USDT: {
            price: Number(data[2]?.current_price || 1),
            change: Number(data[2]?.price_change_percentage_24h || 0)
          }
        });
      } catch (error) {
        console.error('Landing market fetch error:', error);
      }
    };

    fetchMarket();
    const interval = setInterval(fetchMarket, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveReview((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [reviews.length]);

  useEffect(() => {
    let users = 0;
    let assets = 0;
    let countries = 0;
    let uptime = 0;

    const target = {
      users: 6200000,
      assets: 4800000000,
      countries: 184,
      uptime: 99.98
    };

    const interval = setInterval(() => {
      users = Math.min(users + 124000, target.users);
      assets = Math.min(assets + 96000000, target.assets);
      countries = Math.min(countries + 4, target.countries);
      uptime = Math.min(Number((uptime + 2.04).toFixed(2)), target.uptime);

      setStatsAnimated({
        users,
        assets,
        countries,
        uptime
      });

      if (
        users >= target.users &&
        assets >= target.assets &&
        countries >= target.countries &&
        uptime >= target.uptime
      ) {
        clearInterval(interval);
      }
    }, 45);

    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = () => {
    const email = subscribeEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      setSubscribeMessage('Please enter your email.');
      return;
    }

    if (!emailRegex.test(email)) {
      setSubscribeMessage('Please enter a valid email address.');
      return;
    }

    setSubscribeMessage('Subscription request received.');
    setSubscribeEmail('');
  };

  const sliderWindow = Array.from({ length: 5 }, (_, i) => {
    const index = (activeReview + i) % reviews.length;
    return reviews[index];
  });

  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans selection:bg-blue-500/30 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-120px] left-[8%] w-[380px] h-[380px] bg-blue-600/10 blur-[90px] rounded-full"></div>
        <div className="absolute bottom-[-140px] right-[6%] w-[320px] h-[320px] bg-cyan-500/10 blur-[90px] rounded-full"></div>
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:42px_42px]"></div>
      </div>

      <nav className="relative border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-[0_0_25px_rgba(37,99,235,0.18)]">
              <Shield size={24} fill="white" />
            </div>

            <div>
              <div className="text-2xl font-black tracking-tight text-white">
                Axcel <span className="text-blue-500 font-medium">Private Wallet</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.32em] text-white/30 font-bold mt-1">
                Your Private Wallet
              </div>
            </div>
          </Link>

          <div className="flex gap-4 items-center">
            <Link
              to="/login"
              className="text-sm font-bold opacity-70 hover:opacity-100 hover:text-blue-500 transition-all px-4"
            >
              Login
            </Link>

            <Link
              to="/register"
              className={`bg-blue-600 hover:bg-blue-500 px-7 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.22em] transition-all shadow-[0_10px_30px_rgba(37,99,235,0.25)] inline-flex items-center justify-center ${buttonFx}`}
            >
              <span className="relative z-10">Register</span>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {logoutSuccess && (
            <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 shadow-[0_8px_30px_rgba(16,185,129,0.08)]">
              <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-300/80 font-bold mb-1">
                Session Update
              </div>
              <div className="text-emerald-400 font-semibold">Successfully logged out</div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.25em] text-blue-300">
                <ShieldCheck className="w-4 h-4" />
                Private Digital Asset Access
              </div>

              <div className="space-y-5">
                <h1 className="text-5xl md:text-6xl xl:text-7xl font-black leading-[0.95] tracking-tight">
                  Secure Wallet
                  <span className="block text-blue-500 italic">Control, Built Private.</span>
                </h1>

                <p className="max-w-2xl text-lg md:text-xl text-slate-300/90 leading-relaxed">
                  Axcel Private Wallet provides secure access to digital assets through a private,
                  premium wallet environment designed for controlled balance management, protected
                  routing, and trusted client access.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className={`px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl shadow-[0_12px_30px_rgba(37,99,235,0.30)] transition-all inline-flex items-center justify-center gap-3 ${buttonFx}`}
                >
                  <UserPlus size={18} className="relative z-10" />
                  <span className="relative z-10">Create Account</span>
                  <ArrowRight size={16} className="relative z-10" />
                </Link>

                <Link
                  to="/login"
                  className={`px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl border border-white/10 transition-all inline-flex items-center justify-center gap-3 backdrop-blur-sm ${buttonFx}`}
                >
                  <Lock size={16} className="relative z-10" />
                  <span className="relative z-10">Login</span>
                </Link>
              </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
                <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-5 py-4">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/35 font-bold mb-2">
                    Secure Access
                  </div>
                  <div className="text-sm font-semibold text-white">
                    Private wallet login environment
                  </div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-5 py-4">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/35 font-bold mb-2">
                    Asset Support
                  </div>
                  <div className="text-sm font-semibold text-white">
                    BTC, ETH and USDT management
                  </div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-5 py-4">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/35 font-bold mb-2">
                    Protected Flow
                  </div>
                  <div className="text-sm font-semibold text-white">
                    Internal routing and control layer
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 rounded-[2rem] overflow-hidden border border-white/10 bg-[linear-gradient(180deg,rgba(13,23,42,0.95),rgba(7,12,24,0.92))] shadow-[0_24px_80px_rgba(0,0,0,0.45)] p-7">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl">Axcel Private Wallet</h3>
                      <p className="text-sm text-slate-400">Premium secure asset environment</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-white/35 font-bold">
                      Session Status
                    </div>
                    <div className="text-emerald-400 text-sm font-semibold mt-1">Protected</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                    <div className="flex items-center gap-2 mb-2 text-blue-400">
                      <Wallet className="w-4 h-4" />
                      <span className="text-[11px] uppercase tracking-[0.18em] text-white/40 font-bold">
                        Wallet Value
                      </span>
                    </div>
                    <div className="text-3xl font-light tracking-tight">
                      ${marketData.BTC.price.toLocaleString()}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                    <div className="flex items-center gap-2 mb-2 text-emerald-400">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-[11px] uppercase tracking-[0.18em] text-white/40 font-bold">
                        24H Composite
                      </span>
                    </div>
                    <div className={`text-3xl font-light tracking-tight ${marketData.BTC.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {marketData.BTC.change >= 0 ? '+' : ''}
                      {marketData.BTC.change.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Layers3 className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-semibold">BTC Storage Node</span>
                      </div>
                      <span className="text-sm text-emerald-400 font-semibold">
                        ${marketData.BTC.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-4xl font-light tracking-tight mb-2">1.000000</div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[74%] bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-white/35 font-bold mb-2">
                        Access Tier
                      </div>
                      <div className="text-sm font-semibold">Private Operator</div>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-white/35 font-bold mb-2">
                        Routing
                      </div>
                      <div className="text-sm font-semibold">Integrity Verified</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-10 -right-12 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -bottom-12 -left-12 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-16">
            <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
              <div className="flex items-center gap-3 mb-4">
                <Users size={18} className="text-blue-400" />
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold">
                  Clients
                </div>
              </div>
              <div className="text-3xl font-black tracking-tight text-white">
                {(statsAnimated.users / 1000000).toFixed(1)}M+
              </div>
              <div className="text-sm text-slate-400 mt-2">
                Private clients using the wallet environment worldwide
              </div>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 size={18} className="text-emerald-400" />
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold">
                  Assets Managed
                </div>
              </div>
              <div className="text-3xl font-black tracking-tight text-white">
                ${(statsAnimated.assets / 1000000000).toFixed(1)}B
              </div>
              <div className="text-sm text-slate-400 mt-2">
                Structured digital asset visibility across secure interfaces
              </div>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
              <div className="flex items-center gap-3 mb-4">
                <Globe size={18} className="text-cyan-400" />
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold">
                  Countries
                </div>
              </div>
              <div className="text-3xl font-black tracking-tight text-white">
                {statsAnimated.countries}+
              </div>
              <div className="text-sm text-slate-400 mt-2">
                Global private client reach with multi-region access flow
              </div>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
              <div className="flex items-center gap-3 mb-4">
                <Activity size={18} className="text-blue-400" />
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold">
                  Uptime
                </div>
              </div>
              <div className="text-3xl font-black tracking-tight text-white">
                {statsAnimated.uptime.toFixed(2)}%
              </div>
              <div className="text-sm text-slate-400 mt-2">
                Stable private wallet experience and protected routing layer
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-16">
            <div className="rounded-[28px] border border-white/8 bg-white/[0.04] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-3">
                Secure Wallet Layer
              </div>
              <div className="text-lg font-semibold mb-2">Protected digital asset environment</div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Built for clients who require a clean, private and secure wallet access layer
                with controlled balance visibility.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-white/[0.04] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-3">
                Asset Management
              </div>
              <div className="text-lg font-semibold mb-2">BTC, ETH and USDT support</div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Access a premium interface designed for private asset tracking, deposit address
                assignment and managed wallet visibility.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-white/[0.04] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-3">
                Internal Routing
              </div>
              <div className="text-lg font-semibold mb-2">Controlled transfer architecture</div>
              <p className="text-sm text-slate-400 leading-relaxed">
                A premium cyber-fintech interface with structured access, secure routing logic
                and consistent private client experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-white/5 mt-6">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid md:grid-cols-3 gap-8 items-start">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 p-2 rounded-xl shadow-[0_0_18px_rgba(37,99,235,0.18)]">
                  <Shield size={20} fill="white" />
                </div>
                <div>
                  <div className="text-lg font-black tracking-tight">
                    Axcel <span className="text-blue-500 font-medium">Private Wallet</span>
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.28em] text-white/30 font-bold mt-1">
                    Secure Asset Access
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                A premium cyber-fintech interface designed for private wallet access,
                structured balance control and protected digital asset visibility.
              </p>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-4">
                Navigation
              </div>
              <div className="space-y-3">
                <Link to="/" className="flex items-center gap-2 text-sm text-slate-300 hover:text-blue-400 transition-colors">
                  <ChevronRight size={14} />
                  Home
                </Link>
                <Link to="/login" className="flex items-center gap-2 text-sm text-slate-300 hover:text-blue-400 transition-colors">
                  <ChevronRight size={14} />
                  Login
                </Link>
                <Link to="/register" className="flex items-center gap-2 text-sm text-slate-300 hover:text-blue-400 transition-colors">
                  <ChevronRight size={14} />
                  Register
                </Link>
              </div>
            </div>
                        <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-4">
                Support
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Mail size={15} className="text-blue-400" />
                  support@axcelci.com
                </div>
                <div className="text-sm text-slate-400">
                  Private client communication and platform assistance.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-sm text-slate-500">
              © 2026 Axcel Private Wallet. All rights reserved.
            </div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/25 font-bold">
              Premium Private Wallet Interface
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  const { setUser, user } = useAuth() as any;
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userRef = ref(db, `users/${firebaseUser.uid}`);
          const snapshot = await get(userRef);

          if (snapshot.exists()) {
            const dbUser = snapshot.val();

            const nextUser = {
              ...dbUser,
              id: firebaseUser.uid,
              email: firebaseUser.email
            };

            setUser((prev: any) => {
              if (JSON.stringify(prev) === JSON.stringify(nextUser)) {
                return prev;
              }
              return nextUser;
            });
          } else {
            const nextUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email
            };

            setUser((prev: any) => {
              if (JSON.stringify(prev) === JSON.stringify(nextUser)) {
                return prev;
              }
              return nextUser;
            });
          }
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error('Auth sync error:', e);
      } finally {
        setInitializing(false);
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  if (initializing) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-blue-500 font-mono">
        Loading secure session...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />

      <Route
        path="/admin/login"
        element={user?.role === 'admin' ? <Navigate to="/admin" replace /> : <AdminLogin />}
      />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
