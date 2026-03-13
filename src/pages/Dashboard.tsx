import React, { useEffect, useMemo, useState } from 'react';
import { ref, onValue, push, set } from 'firebase/database';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  MessageCircle,
  X,
  Copy,
  Wallet,
  ShieldCheck,
  Bitcoin,
  Coins,
  Landmark,
  Wifi,
  WifiOff,
  Clock3,
  Mail,
  Phone,
  Globe,
  MapPin
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

type UserData = {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  stateRegion?: string;
  city?: string;
  online?: boolean;
  last_seen?: number | string;
  lastSeen?: string;

  btc_balance?: number;
  eth_balance?: number;
  usdt_balance?: number;
  usd_balance?: number;
  balance?: string | number;

  btc_address?: string;
  eth_address?: string;
  usdt_address?: string;
};

type ActivityItem = {
  id: string;
  type?: string;
  page?: string;
  created_at?: number | string;
  details?: any;
};

const COIN_PRICES = {
  BTC: 65000,
  ETH: 3500,
  USDT: 1
};

const buttonFx =
  "relative overflow-hidden transition-all duration-300 before:content-[''] before:absolute before:w-[140%] before:h-[140%] before:top-[-140%] before:left-[-140%] before:bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.25),transparent)] before:rotate-[25deg] before:transition-all before:duration-700 hover:before:top-[140%] hover:before:left-[140%]";

const formatLastSeen = (value?: number | string, legacy?: string) => {
  if (legacy && typeof legacy === 'string') return legacy;
  if (!value) return 'No recent activity';

  const timestamp = typeof value === 'string' ? Number(value) : value;
  if (!timestamp) return 'No recent activity';

  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour ago`;
  return `${days} day ago`;
};

const formatActivityTime = (value?: number | string) => {
  if (!value) return '-';
  const timestamp = typeof value === 'string' ? Number(value) : value;
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleString();
};

const getActivityTitle = (item: ActivityItem) => {
  if (item.details?.message) return item.details.message;

  switch (item.type) {
    case 'deposit_notice_created':
      return 'Deposit notice submitted';
    case 'withdraw_request_created':
      return 'Withdrawal request submitted';
    case 'swap_request_created':
      return 'Swap request submitted';
    case 'wallet_addresses_updated':
      return 'Wallet addresses updated';
    case 'balances_updated':
      return 'Balances updated';
    case 'balance_conversion_applied':
      return 'Balance conversion applied';
    default:
      return item.type || 'Activity';
  }
};

const Dashboard = () => {
  const { user, logout } = useAuth() as any;

  const [userData, setUserData] = useState<UserData | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [copied, setCopied] = useState('');
  const [toast, setToast] = useState('');

  const [receiveOpen, setReceiveOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [exchangeOpen, setExchangeOpen] = useState(false);

  const [receiveCoin, setReceiveCoin] = useState<'BTC' | 'ETH' | 'USDT'>('BTC');

  const [depositNotice, setDepositNotice] = useState({
    coin: 'BTC',
    amount: '',
    txid: '',
    note: ''
  });

  const [withdrawForm, setWithdrawForm] = useState({
    coin: 'BTC',
    amount: '',
    address: '',
    note: ''
  });

  const [exchangeForm, setExchangeForm] = useState({
    fromCoin: 'BTC',
    toCoin: 'USDT',
    fromAmount: '',
    note: ''
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const userRef = ref(db, `users/${user.id}`);
    const activityRef = ref(db, `activity_logs/${user.id}`);

    const unsubUser = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserData(snapshot.val());
      } else {
        setUserData(null);
      }
    });

    const unsubActivity = onValue(activityRef, (snapshot) => {
      if (!snapshot.exists()) {
        setActivities([]);
        return;
      }

      const data = snapshot.val();
      const rows = Object.entries(data).map(([activityId, value]) => ({
        id: activityId,
        ...(value as any)
      })) as ActivityItem[];

      rows.sort((a, b) => Number(b.created_at || 0) - Number(a.created_at || 0));
      setActivities(rows.slice(0, 10));
    });

    return () => {
      unsubUser();
      unsubActivity();
    };
  }, [user?.id]);

  const balances = useMemo(() => {
    const btc = Number(userData?.btc_balance || 0);
    const eth = Number(userData?.eth_balance || 0);
    const usdt = Number(userData?.usdt_balance || 0);
    const usd =
      userData?.usd_balance !== undefined
        ? Number(userData.usd_balance || 0)
        : Number(userData?.balance || 0);

    return { btc, eth, usdt, usd };
  }, [userData]);

  const fullName =
    userData?.fullName ||
    `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() ||
    userData?.name ||
    user?.email ||
    'User';

  const locationText = [userData?.city, userData?.stateRegion, userData?.country]
    .filter(Boolean)
    .join(', ');

  const selectedReceiveAddress =
    receiveCoin === 'BTC'
      ? userData?.btc_address || ''
      : receiveCoin === 'ETH'
      ? userData?.eth_address || ''
      : userData?.usdt_address || '';

  const exchangePreview = useMemo(() => {
    const amount = Number(exchangeForm.fromAmount || 0);
    if (!amount || exchangeForm.fromCoin === exchangeForm.toCoin) return '0.00';

    const fromPrice = COIN_PRICES[exchangeForm.fromCoin as keyof typeof COIN_PRICES] || 1;
    const toPrice = COIN_PRICES[exchangeForm.toCoin as keyof typeof COIN_PRICES] || 1;
    const result = (amount * fromPrice) / toPrice;

    return exchangeForm.toCoin === 'USDT' ? result.toFixed(2) : result.toFixed(8);
  }, [exchangeForm]);

  const handleCopy = async (value: string, key: string) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(''), 1500);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  };

  const addActivityLog = async (type: string, details: any = {}) => {
    if (!user?.id) return;

    const logRef = push(ref(db, `activity_logs/${user.id}`));
    await set(logRef, {
      type,
      page: '/dashboard',
      details,
      created_at: Date.now()
    });
  };

  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(''), 2200);
  };

  const submitDepositNotice = async () => {
    if (!user?.id) return;
    if (!depositNotice.amount.trim()) {
      showToast('Enter deposit amount.');
      return;
    }

    setSubmitting(true);
    try {
      const requestRef = push(ref(db, 'deposit_requests'));
      await set(requestRef, {
        userId: user.id,
        fullName,
        email: userData?.email || user?.email || '',
        coin: depositNotice.coin,
        amount: depositNotice.amount.trim(),
        txid: depositNotice.txid.trim(),
        note: depositNotice.note.trim(),
        address:
          depositNotice.coin === 'BTC'
            ? userData?.btc_address || ''
            : depositNotice.coin === 'ETH'
            ? userData?.eth_address || ''
            : userData?.usdt_address || '',
        status: 'pending',
        created_at: Date.now()
      });

      await addActivityLog('deposit_notice_created', {
        message: `Deposit notice submitted for ${depositNotice.coin}`,
        coin: depositNotice.coin,
        amount: depositNotice.amount.trim(),
        txid: depositNotice.txid.trim(),
        status: 'pending'
      });

      setDepositNotice({
        coin: 'BTC',
        amount: '',
        txid: '',
        note: ''
      });
      setReceiveOpen(false);
      showToast('Deposit request sent to admin.');
    } catch (e) {
      console.error(e);
      showToast('Failed to submit deposit request.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitWithdrawRequest = async () => {
    if (!user?.id) return;
    if (!withdrawForm.amount.trim() || !withdrawForm.address.trim()) {
      showToast('Fill amount and destination address.');
      return;
    }

    setSubmitting(true);
    try {
      const requestRef = push(ref(db, 'transactions'));
      await set(requestRef, {
        userId: user.id,
        fullName,
        email: userData?.email || user?.email || '',
        type: 'withdraw',
        currency: withdrawForm.coin,
        amount: withdrawForm.amount.trim(),
        address: withdrawForm.address.trim(),
        note: withdrawForm.note.trim(),
        status: 'pending',
        created_at: Date.now()
      });

      await addActivityLog('withdraw_request_created', {
        message: `Withdrawal request submitted for ${withdrawForm.coin}`,
        currency: withdrawForm.coin,
        amount: withdrawForm.amount.trim(),
        address: withdrawForm.address.trim(),
        status: 'pending'
      });

      setWithdrawForm({
        coin: 'BTC',
        amount: '',
        address: '',
        note: ''
      });
      setWithdrawOpen(false);
      showToast('Withdrawal request sent to admin.');
    } catch (e) {
      console.error(e);
      showToast('Failed to submit withdrawal request.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitExchangeRequest = async () => {
    if (!user?.id) return;
    if (!exchangeForm.fromAmount.trim()) {
      showToast('Enter exchange amount.');
      return;
    }
    if (exchangeForm.fromCoin === exchangeForm.toCoin) {
      showToast('Choose different assets.');
      return;
    }

    setSubmitting(true);
    try {
      const requestRef = push(ref(db, 'swap_requests'));
      await set(requestRef, {
        userId: user.id,
        fullName,
        email: userData?.email || user?.email || '',
        fromCoin: exchangeForm.fromCoin,
        toCoin: exchangeForm.toCoin,
        fromAmount: exchangeForm.fromAmount.trim(),
        estimatedToAmount: exchangePreview,
        note: exchangeForm.note.trim(),
        status: 'pending',
        created_at: Date.now()
      });

      await addActivityLog('swap_request_created', {
        message: `Swap request submitted: ${exchangeForm.fromCoin} → ${exchangeForm.toCoin}`,
        fromCoin: exchangeForm.fromCoin,
        toCoin: exchangeForm.toCoin,
        fromAmount: exchangeForm.fromAmount.trim(),
        estimatedToAmount: exchangePreview,
        status: 'pending'
      });

      setExchangeForm({
        fromCoin: 'BTC',
        toCoin: 'USDT',
        fromAmount: '',
        note: ''
      });
      setExchangeOpen(false);
      showToast('Swap request sent to admin.');
    } catch (e) {
      console.error(e);
      showToast('Failed to submit swap request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || !userData) return null;
    return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-120px] left-[10%] w-[340px] h-[340px] bg-blue-600/10 blur-[100px] rounded-full" />
        <div className="absolute top-[20%] right-[8%] w-[280px] h-[280px] bg-cyan-500/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-140px] left-[25%] w-[360px] h-[360px] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(6,12,28,0.96),rgba(5,10,22,0.96))] shadow-[0_24px_80px_rgba(0,0,0,0.38)] overflow-hidden">
          <div className="px-5 md:px-8 py-6 border-b border-white/8">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-blue-300 mb-4">
                  <ShieldCheck size={14} />
                  Secure Client Dashboard
                </div>

                <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none">
                  Welcome, {fullName}
                </h1>
                <p className="text-slate-400 mt-4 text-base md:text-lg">
                  Premium multi-asset wallet overview with live Firebase sync.
                </p>
              </div>

              <div className="flex gap-3 flex-wrap">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm ${
                    userData.online
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                      : 'border-white/10 bg-white/[0.04] text-slate-300'
                  }`}
                >
                  {userData.online ? <Wifi size={16} /> : <WifiOff size={16} />}
                  <span>{userData.online ? 'Online' : 'Offline'}</span>
                </div>

                <button
                  onClick={logout}
                  className={`px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all shadow-[0_10px_30px_rgba(37,99,235,0.25)] hover:scale-[1.02] ${buttonFx}`}
                >
                  <span className="relative z-10">Logout</span>
                </button>
              </div>
            </div>
          </div>

          <div className="px-5 md:px-8 py-6 md:py-8 space-y-6">
            <div className="grid xl:grid-cols-[1.15fr_0.85fr] gap-6">
              <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 md:p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-2">
                      Portfolio Overview
                    </div>
                    <div className="text-3xl md:text-4xl font-black tracking-tight">
                      ${balances.usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="text-sm text-slate-400">
                    Last seen: {formatLastSeen(userData.last_seen, userData.lastSeen)}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4">
                  <div className="rounded-[24px] border border-white/8 bg-black/20 p-5 min-w-0 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/20 flex items-center justify-center text-amber-300 shrink-0">
                        <Bitcoin size={18} />
                      </div>
                      <div className="text-sm text-slate-400 leading-tight">BTC Balance</div>
                    </div>
                    <div className="text-3xl font-black tracking-tight break-all">
                      {balances.btc.toFixed(8)}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/8 bg-black/20 p-5 min-w-0 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-500/15 border border-slate-400/20 flex items-center justify-center text-slate-300 shrink-0">
                        <Coins size={18} />
                      </div>
                      <div className="text-sm text-slate-400 leading-tight">ETH Balance</div>
                    </div>
                    <div className="text-3xl font-black tracking-tight break-all">
                      {balances.eth.toFixed(8)}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/8 bg-black/20 p-5 min-w-0 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center text-emerald-300 shrink-0">
                        <Wallet size={18} />
                      </div>
                      <div className="text-sm text-slate-400 leading-tight">USDT Balance</div>
                    </div>
                    <div className="text-3xl font-black tracking-tight break-all">
                      {balances.usdt.toFixed(2)}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/8 bg-black/20 p-5 min-w-0 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-400/20 flex items-center justify-center text-blue-300 shrink-0">
                        <Landmark size={18} />
                      </div>
                      <div className="text-sm text-slate-400 leading-tight">USD Balance</div>
                    </div>
                    <div className="text-3xl font-black tracking-tight break-all">
                      ${balances.usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mt-5">
                  <button
                    onClick={() => setReceiveOpen(true)}
                    className={`bg-[#1a1b1e] hover:bg-[#25262b] border border-slate-800 rounded-2xl p-4 flex items-center justify-center gap-3 text-white transition-all group hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] ${buttonFx}`}
                  >
                    <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors relative z-10">
                      <ArrowDownLeft className="text-green-500" size={20} />
                    </div>
                    <span className="font-medium relative z-10">Receive</span>
                  </button>

                  <button
                    onClick={() => setWithdrawOpen(true)}
                    className={`bg-[#1a1b1e] hover:bg-[#25262b] border border-slate-800 rounded-2xl p-4 flex items-center justify-center gap-3 text-white transition-all group hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] ${buttonFx}`}
                  >
                    <div className="p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors relative z-10">
                      <ArrowUpRight className="text-red-500" size={20} />
                    </div>
                    <span className="font-medium relative z-10">Withdraw</span>
                  </button>

                  <button
                    onClick={() => setExchangeOpen(true)}
                    className={`bg-[#1a1b1e] hover:bg-[#25262b] border border-slate-800 rounded-2xl p-4 flex items-center justify-center gap-3 text-white transition-all group hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] ${buttonFx}`}
                  >
                    <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors relative z-10">
                      <RefreshCw className="text-purple-500" size={20} />
                    </div>
                    <span className="font-medium relative z-10">Exchange</span>
                  </button>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.02))] p-5 md:p-6">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-5">
                  Client Profile
                </div>

                <div className="space-y-3">
                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4 flex items-start gap-3">
                    <Mail size={16} className="text-blue-300 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm text-slate-400">Email</div>
                      <div className="font-medium break-all">{userData.email || user.email || '-'}</div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4 flex items-start gap-3">
                    <Phone size={16} className="text-blue-300 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm text-slate-400">Phone</div>
                      <div className="font-medium">{userData.phone || '-'}</div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4 flex items-start gap-3">
                    <Globe size={16} className="text-blue-300 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm text-slate-400">Country / Region</div>
                      <div className="font-medium">
                        {userData.country || '-'}{userData.stateRegion ? ` / ${userData.stateRegion}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4 flex items-start gap-3">
                    <MapPin size={16} className="text-blue-300 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm text-slate-400">Location</div>
                      <div className="font-medium">{locationText || '-'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
                        <div className="grid xl:grid-cols-3 gap-4">
              {[
                { key: 'btc', title: 'BTC Address', value: userData.btc_address || '' },
                { key: 'eth', title: 'ETH Address', value: userData.eth_address || '' },
                { key: 'usdt', title: 'USDT Address', value: userData.usdt_address || '' }
              ].map((item) => (
                <div
                  key={item.key}
                  className="rounded-[24px] border border-white/8 bg-black/20 p-5 min-w-0"
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold">
                      {item.title}
                    </div>

                    {item.value && (
                      <button
                        onClick={() => handleCopy(item.value, item.key)}
                        className="inline-flex items-center gap-2 text-xs text-blue-300 hover:text-blue-200 shrink-0"
                      >
                        {copied === item.key ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                        <span>{copied === item.key ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>

                  <div className="text-sm text-slate-300 break-all leading-relaxed">
                    {item.value || `No ${item.title} assigned yet`}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.02))] p-5 md:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-400/20 flex items-center justify-center text-violet-300">
                  <Activity size={18} />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-1">
                    Activity
                  </div>
                  <div className="text-2xl font-black tracking-tight">Recent Client Log</div>
                </div>
              </div>

              {activities.length === 0 ? (
                <div className="rounded-2xl border border-white/8 bg-black/20 p-5 text-slate-400">
                  No recent activity found for this account yet.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {activities.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[24px] border border-white/8 bg-black/20 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-semibold text-white leading-relaxed">
                          {getActivityTitle(item)}
                        </div>
                        <div className="text-xs text-slate-500 shrink-0">
                          {formatActivityTime(item.created_at)}
                        </div>
                      </div>

                      <div className="text-sm text-slate-500 mt-2">
                        {item.page || '/dashboard'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] px-4 py-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
          {toast}
        </div>
      )}

      {receiveOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,28,0.98),rgba(5,10,20,0.98))] shadow-[0_24px_80px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="px-6 py-5 border-b border-white/8 flex items-center justify-between">
              <div className="text-xl font-black">Receive Crypto</div>
              <button onClick={() => setReceiveOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-3 gap-3">
                {['BTC', 'ETH', 'USDT'].map((coin) => (
                  <button
                    key={coin}
                    onClick={() => setReceiveCoin(coin as 'BTC' | 'ETH' | 'USDT')}
                    className={`rounded-2xl px-4 py-3 border transition-all ${
                      receiveCoin === coin
                        ? 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                        : 'border-white/10 bg-white/[0.03] text-slate-300'
                    }`}
                  >
                    {coin}
                  </button>
                ))}
              </div>

              <div className="rounded-[24px] border border-white/8 bg-black/20 p-5">
                <div className="text-sm font-medium mb-3">{receiveCoin} Deposit Address</div>
                <div className="rounded-2xl bg-white/[0.03] border border-white/8 p-4 text-sm break-all text-slate-200">
                  {selectedReceiveAddress || `No ${receiveCoin} address assigned yet`}
                </div>
              </div>

              <input
                value={depositNotice.amount}
                onChange={(e) => setDepositNotice((p) => ({ ...p, amount: e.target.value, coin: receiveCoin }))}
                className={inputClass}
                placeholder={`Amount sent in ${receiveCoin}`}
              />

              <input
                value={depositNotice.txid}
                onChange={(e) => setDepositNotice((p) => ({ ...p, txid: e.target.value, coin: receiveCoin }))}
                className={inputClass}
                placeholder="Transaction hash / TXID (optional)"
              />

              <input
                value={depositNotice.note}
                onChange={(e) => setDepositNotice((p) => ({ ...p, note: e.target.value, coin: receiveCoin }))}
                className={inputClass}
                placeholder="Note for admin (optional)"
              />

              <button
                onClick={submitDepositNotice}
                disabled={submitting}
                className="w-full rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-5 py-3.5 font-semibold"
              >
                {submitting ? 'Submitting...' : 'Notify Admin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {withdrawOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,28,0.98),rgba(5,10,20,0.98))] shadow-[0_24px_80px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="px-6 py-5 border-b border-white/8 flex items-center justify-between">
              <div className="text-xl font-black">Withdraw Request</div>
              <button onClick={() => setWithdrawOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <select
                value={withdrawForm.coin}
                onChange={(e) => setWithdrawForm((p) => ({ ...p, coin: e.target.value }))}
                className={inputClass}
              >
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
                <option value="USDT">USDT</option>
              </select>

              <input
                value={withdrawForm.amount}
                onChange={(e) => setWithdrawForm((p) => ({ ...p, amount: e.target.value }))}
                className={inputClass}
                placeholder="Amount"
              />

              <input
                value={withdrawForm.address}
                onChange={(e) => setWithdrawForm((p) => ({ ...p, address: e.target.value }))}
                className={inputClass}
                placeholder="Destination wallet address"
              />

              <input
                value={withdrawForm.note}
                onChange={(e) => setWithdrawForm((p) => ({ ...p, note: e.target.value }))}
                className={inputClass}
                placeholder="Note for admin"
              />

              <button
                onClick={submitWithdrawRequest}
                disabled={submitting}
                className="w-full rounded-2xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 px-5 py-3.5 font-semibold"
              >
                {submitting ? 'Submitting...' : 'Submit Withdrawal Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {exchangeOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,28,0.98),rgba(5,10,20,0.98))] shadow-[0_24px_80px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="px-6 py-5 border-b border-white/8 flex items-center justify-between">
              <div className="text-xl font-black">Exchange Request</div>
              <button onClick={() => setExchangeOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={exchangeForm.fromCoin}
                  onChange={(e) => setExchangeForm((p) => ({ ...p, fromCoin: e.target.value }))}
                  className={inputClass}
                >
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="USDT">USDT</option>
                </select>

                <select
                  value={exchangeForm.toCoin}
                  onChange={(e) => setExchangeForm((p) => ({ ...p, toCoin: e.target.value }))}
                  className={inputClass}
                >
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="USDT">USDT</option>
                </select>
              </div>

              <input
                value={exchangeForm.fromAmount}
                onChange={(e) => setExchangeForm((p) => ({ ...p, fromAmount: e.target.value }))}
                className={inputClass}
                placeholder={`Amount in ${exchangeForm.fromCoin}`}
              />

              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="text-sm text-slate-400 mb-2">Estimated receive</div>
                <div className="text-2xl font-black">
                  {exchangePreview} {exchangeForm.toCoin}
                </div>
              </div>

              <input
                value={exchangeForm.note}
                onChange={(e) => setExchangeForm((p) => ({ ...p, note: e.target.value }))}
                className={inputClass}
                placeholder="Note for admin"
              />

              <button
                onClick={submitExchangeRequest}
                disabled={submitting}
                className="w-full rounded-2xl bg-amber-500 hover:bg-amber-400 text-black disabled:opacity-50 px-5 py-3.5 font-semibold"
              >
                {submitting ? 'Submitting...' : 'Submit Exchange Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
