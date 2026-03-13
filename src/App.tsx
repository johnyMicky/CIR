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
import MyWallets from './pages/MyWallets'; // <-- ახალი იმპორტი

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

const LandingPage = () => {
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
  }, []);

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

      setStatsAnimated({ users, assets, countries, uptime });

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

  const sliderWindow = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => reviews[(activeReview + i) % reviews.length]);
  }, [activeReview]);

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-120px] left-[8%] w-[380px] h-[380px] bg-blue-600/10 blur-[90px] rounded-full" />
        <div className="absolute bottom-[-140px] right-[6%] w-[320px] h-[320px] bg-cyan-500/10 blur-[90px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:42px_42px]" />
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

          <div className="flex gap-3 items-center">
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
                    <div
                      className={`text-3xl font-light tracking-tight ${
                        marketData.BTC.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
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
                      <div className="h-full w-[74%] bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" />
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

              <div className="absolute -top-10 -right-12 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-12 -left-12 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl -z-10" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-16">
            <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
              <div className="flex items-center gap-3 mb-4">
                <Users size={18} className="text-blue-400" />
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold">Clients</div>
              </div>
              <div className="text-3xl font-black tracking-tight text-white">
                {(statsAnimated.users / 1000000).toFixed(1)}M+
              </div>
              <div className="text-sm text-slate-400 mt-2">Private clients using the wallet environment worldwide</div>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 size={18} className="text-emerald-400" />
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold">Assets Managed</div>
              </div>
              <div className="text-3xl font-black tracking-tight text-white">
                ${(statsAnimated.assets / 1000000000).toFixed(1)}B
              </div>
              <div className="text-sm text-slate-400 mt-2">Structured digital asset visibility across secure interfaces</div>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
              <div className="flex items-center gap-3 mb-4">
                <Globe size={18} className="text-cyan-400" />
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold">Countries</div>
              </div>
              <div className="text-3xl font-black tracking-tight text-white">{statsAnimated.countries}+</div>
              <div className="text-sm text-slate-400 mt-2">Global private client reach with multi-region access flow</div>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
              <div className="flex items-center gap-3 mb-4">
                <Activity size={18} className="text-blue-400" />
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold">Uptime</div>
              </div>
              <div className="text-3xl font-black tracking-tight text-white">{statsAnimated.uptime.toFixed(2)}%</div>
              <div className="text-sm text-slate-400 mt-2">Stable private wallet experience and protected routing layer</div>
            </div>
          </div>

          <div className="mt-10 rounded-[28px] border border-white/8 bg-black/20 px-6 py-6 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
            <div className="flex items-center gap-3 mb-6">
              <Quote size={18} className="text-blue-400" />
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/35 font-bold mb-1">
                  Trusted by Private Clients Worldwide
                </div>
                <div className="text-lg font-semibold text-white">Client reviews from premium wallet users</div>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1.08fr_0.92fr] gap-6 items-start">
              <div className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 min-h-[290px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: reviews[activeReview].rating }).map((_, index) => (
                      <Star key={index} size={15} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>

                  <p className="text-lg leading-relaxed text-slate-200 min-h-[110px]">
                    “{reviews[activeReview].text}”
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-white/8 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">{reviews[activeReview].name}</div>
                    <div className="text-sm text-slate-400 flex items-center gap-2">
                      <span>{flagMap[reviews[activeReview].country]}</span>
                      <span>{reviews[activeReview].city}, {reviews[activeReview].country}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-white/30 font-bold">Private Client</div>
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-4 h-[290px] overflow-hidden">
                <div className="relative h-full overflow-hidden">
                  <div className="absolute inset-0 flex flex-col gap-3">
                    {sliderWindow.map((review, index) => {
                      const realIndex = (activeReview + index) % reviews.length;
                      const isCurrent = realIndex === activeReview;

                      return (
                        <button
                          key={`${review.name}-${realIndex}`}
                          onClick={() => setActiveReview(realIndex)}
                          className={`w-full text-left rounded-2xl border px-4 py-4 transition-all shrink-0 ${
                            isCurrent
                              ? 'border-blue-500/30 bg-blue-500/10 shadow-[0_0_18px_rgba(37,99,235,0.12)]'
                              : 'border-white/8 bg-white/[0.03] hover:bg-white/[0.05]'
                          } ${buttonFx}`}
                        >
                          <div className="relative z-10 flex items-start justify-between gap-4">
                            <div>
                              <div className="font-semibold text-white">{review.name}</div>
                              <div className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                                <span>{flagMap[review.country]}</span>
                                <span>{review.country}</span>
                              </div>
                            </div>

                            {isCurrent && (
                              <div className="text-[10px] uppercase tracking-[0.18em] text-blue-300 font-bold">Active</div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#030712] to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#030712] to-transparent" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-[28px] border border-white/8 bg-black/20 px-6 py-5 shadow-[0_12px_30px_rgba(0,0,0,0.12)] overflow-hidden">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/35 font-bold mb-4">Live Activity Feed</div>

            <div className="overflow-hidden">
              <div className="flex gap-4 min-w-max animate-[ticker_42s_linear_infinite]">
                {[...activityItems, ...activityItems].map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="rounded-full border border-white/8 bg-white/[0.04] px-5 py-3 text-sm text-slate-300 whitespace-nowrap"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <style>{`
              @keyframes ticker {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
            `}</style>
          </div>

          <div className="mt-10 rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-6 py-6 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
            <div className="grid lg:grid-cols-[1fr_auto] gap-5 items-center">
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/35 font-bold mb-2">Subscribe for Updates</div>
                <div className="text-xl font-semibold text-white mb-2">Receive platform news, updates and private release notices</div>
                <div className="text-sm text-slate-400">Enter your email to receive future wallet platform announcements.</div>
              </div>

              <div className="w-full lg:w-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={subscribeEmail}
                    onChange={(e) => setSubscribeEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="min-w-[280px] px-5 py-4 rounded-2xl bg-black/20 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleSubscribe}
                    className={`px-7 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl transition-all inline-flex items-center justify-center gap-3 ${buttonFx}`}
                  >
                    <Mail size={16} className="relative z-10" />
                    <span className="relative z-10">Subscribe</span>
                  </button>
                </div>

                {subscribeMessage && <div className="text-sm text-blue-400 mt-3">{subscribeMessage}</div>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
            <div className="rounded-[28px] border border-white/8 bg-white/[0.04] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck size={18} className="text-blue-400" />
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold">Protected</div>
              </div>
              <div className="text-lg font-semibold mb-2">Client access layer</div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Structured secure access for premium wallet onboarding and controlled client sessions.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-white/[0.04] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
              <div className="flex items-center gap-3 mb-4">
                <Database size={18} className="text-cyan-400" />
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold">Managed</div>
              </div>
              <div className="text-lg font-semibold mb-2">Wallet visibility</div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Premium presentation for balance visibility, deposit controls and private client operations.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-white/[0.04] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles size={18} className="text-emerald-400" />
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold">Premium</div>
              </div>
              <div className="text-lg font-semibold mb-2">Refined client experience</div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Elegant visuals, improved trust language and a cleaner premium cyber-fintech atmosphere.
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
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-4">Navigation</div>
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
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-4">Support</div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Mail size={15} className="text-blue-400" />
                  support@axcelci.com
                </div>
                <div className="text-sm text-slate-400">Private client communication and platform assistance.</div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-sm text-slate-500">© 2026 Axcel Private Wallet. All rights reserved.</div>
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

      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
      <Route path="/my-wallets" element={user ? <MyWallets /> : <Navigate to="/login" replace />} />
      
      <Route path="/history" element={user ? <History /> : <Navigate to="/login" replace />} />

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
