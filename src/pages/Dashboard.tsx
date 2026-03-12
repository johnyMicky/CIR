import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { onValue, push, ref, set, update } from 'firebase/database';
import {
  Activity,
  ArrowLeftRight,
  ArrowUpRight,
  Bell,
  ChevronRight,
  Copy,
  History,
  Layers3,
  Loader2,
  LogOut,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  Wallet,
  X
} from 'lucide-react';

type CoinKey = 'BTC' | 'ETH' | 'USDT';

type CoinDataMap = Record<
  CoinKey,
  {
    price: number;
    image: string;
    change: number;
  }
>;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth() as any;

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showSwap, setShowSwap] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [loading, setLoading] = useState(true);

  const [liveUser, setLiveUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [coinData, setCoinData] = useState<CoinDataMap>({
    BTC: { price: 0, image: '', change: 0 },
    ETH: { price: 0, image: '', change: 0 },
    USDT: { price: 0, image: '', change: 0 }
  });

  const [swapFrom, setSwapFrom] = useState<CoinKey>('BTC');
  const [swapTo, setSwapTo] = useState<CoinKey>('ETH');
  const [swapAmount, setSwapAmount] = useState('');
  const [swapStep, setSwapStep] = useState(1);

  const [wdCoin, setWdCoin] = useState<CoinKey>('BTC');
  const [wdAmount, setWdAmount] = useState('');
  const [wdAddress, setWdAddress] = useState('');
  const [wdNetwork, setWdNetwork] = useState('');
  const [wdStep, setWdStep] = useState(1);

  const [receiveCoin, setReceiveCoin] = useState<CoinKey>('BTC');
  const [copyNotice, setCopyNotice] = useState('');

  const assets: CoinKey[] = ['BTC', 'ETH', 'USDT'];
  const FIXED_FEE = 15.27;
  const SWAP_FEE_RATE = 0.00001;

  const withdrawNetworks: Record<CoinKey, string[]> = {
    BTC: ['Bitcoin', 'Lightning'],
    ETH: ['Ethereum (ERC-20)', 'Arbitrum', 'Optimism', 'Polygon'],
    USDT: ['Ethereum (ERC-20)', 'Tron (TRC-20)', 'BNB Smart Chain (BEP-20)']
  };

  const minimumWithdrawals: Record<CoinKey, number> = {
    BTC: 0.0005,
    ETH: 0.02,
    USDT: 5
  };

  const buttonFx =
    "relative overflow-hidden transition-all duration-300 before:content-[''] before:absolute before:w-[140%] before:h-[140%] before:top-[-140%] before:left-[-140%] before:bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.35),transparent)] before:rotate-[25deg] before:transition-all before:duration-700 hover:before:top-[140%] hover:before:left-[140%]";

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const userRef = ref(db, `users/${user.id}`);
    const txRef = ref(db, `transactions/${user.id}`);
    const notifRef = ref(db, `notifications/${user.id}`);

    const unsubUser = onValue(userRef, (snap) => {
      if (snap.exists()) {
        setLiveUser(snap.val());
      } else {
        setLiveUser(null);
      }
      setLoading(false);
    });

    const unsubTx = onValue(txRef, (snap) => {
      if (snap.exists()) {
        const rows = Object.entries(snap.val()).map(([id, value]) => ({
          id,
          ...(value as any)
        }));
        rows.sort((a: any, b: any) => Number(b.timestamp || 0) - Number(a.timestamp || 0));
        setTransactions(rows);
      } else {
        setTransactions([]);
      }
    });

    const unsubNotif = onValue(notifRef, (snap) => {
      if (snap.exists()) {
        const rows = Object.entries(snap.val()).map(([id, value]) => ({
          id,
          ...(value as any)
        }));
        rows.sort((a: any, b: any) => Number(b.timestamp || 0) - Number(a.timestamp || 0));
        setNotifications(rows);
      } else {
        setNotifications([]);
      }
    });

    return () => {
      unsubUser();
      unsubTx();
      unsubNotif();
    };
  }, [user?.id]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether'
        );
        const data = await res.json();

        if (Array.isArray(data) && data.length >= 3) {
          setCoinData({
            BTC: {
              price: Number(data[0]?.current_price || 0),
              image: String(data[0]?.image || ''),
              change: Number(data[0]?.price_change_percentage_24h || 0)
            },
            ETH: {
              price: Number(data[1]?.current_price || 0),
              image: String(data[1]?.image || ''),
              change: Number(data[1]?.price_change_percentage_24h || 0)
            },
            USDT: {
              price: Number(data[2]?.current_price || 0),
              image: String(data[2]?.image || ''),
              change: Number(data[2]?.price_change_percentage_24h || 0)
            }
          });
        }
      } catch (error) {
        console.error('Price fetch error:', error);
      }
    };

    fetchPrices();
    const intervalId = setInterval(fetchPrices, 60000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const list = withdrawNetworks[wdCoin];
    if (!list.includes(wdNetwork)) {
      setWdNetwork(list[0]);
    }
  }, [wdCoin, wdNetwork]);

  useEffect(() => {
    if (!copyNotice) return;
    const t = setTimeout(() => setCopyNotice(''), 1800);
    return () => clearTimeout(t);
  }, [copyNotice]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getSwapRate = () => {
    const fromPrice = Number(coinData[swapFrom]?.price || 0);
    const toPrice = Number(coinData[swapTo]?.price || 0);
    if (!fromPrice || !toPrice) return 0;
    return fromPrice / toPrice;
  };

  const swapRate = getSwapRate();

  const estimatedReceive = useMemo(() => {
    const amount = Number(swapAmount || 0);
    if (!amount || !swapRate) return 0;
    return amount * swapRate * (1 - SWAP_FEE_RATE);
  }, [swapAmount, swapRate]);

  const swapInsufficient =
    Number(swapAmount || 0) > Number(liveUser?.wallets?.[swapFrom] || 0);

  const handleSwapDirection = () => {
    const oldFrom = swapFrom;
    setSwapFrom(swapTo);
    setSwapTo(oldFrom);
  };

  const executeSwap = async () => {
    if (!user?.id || !swapAmount || swapInsufficient) return;
    if (!coinData[swapFrom]?.price || !coinData[swapTo]?.price) return;

    try {
      setSwapStep(2);

      const amount = Number(swapAmount);
      const receiveAmount = amount * swapRate * (1 - SWAP_FEE_RATE);

      const updates: Record<string, any> = {};
      updates[`users/${user.id}/wallets/${swapFrom}`] =
        Number(liveUser?.wallets?.[swapFrom] || 0) - amount;
      updates[`users/${user.id}/wallets/${swapTo}`] =
        Number(liveUser?.wallets?.[swapTo] || 0) + receiveAmount;

      await update(ref(db), updates);

      const txRef = push(ref(db, `transactions/${user.id}`));
      await set(txRef, {
        type: 'SWAP',
        fromCoin: swapFrom,
        toCoin: swapTo,
        coin: swapFrom,
        amount,
        receiveAmount,
        feePercent: 0.001,
        status: 'COMPLETED',
        timestamp: Date.now()
      });

      setTimeout(() => {
        setSwapStep(1);
        setSwapAmount('');
        setShowSwap(false);
      }, 1200);
    } catch (error) {
      console.error('Swap error:', error);
      setSwapStep(1);
    }
  };

  const wdCoinPrice = Number(coinData[wdCoin]?.price || 0);
  const wdFeeInCrypto = wdCoinPrice ? FIXED_FEE / wdCoinPrice : 0;
  const wdAvailable = Number(liveUser?.wallets?.[wdCoin] || 0);
  const wdMinimum = minimumWithdrawals[wdCoin];
  const wdReceiveTotal = Math.max(Number(wdAmount || 0) - wdFeeInCrypto, 0);
  const wdInsufficient = Number(wdAmount || 0) + wdFeeInCrypto > wdAvailable;
  const wdBelowMinimum = Number(wdAmount || 0) > 0 && Number(wdAmount || 0) < wdMinimum;

  const handlePasteAddress = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setWdAddress(text);
    } catch (error) {
      console.error('Paste failed:', error);
    }
  };

  const executeWithdraw = async () => {
    if (!user?.id) return;
    if (!coinData[wdCoin]?.price) return;
    if (wdInsufficient || wdBelowMinimum || !wdAddress.trim()) return;

    try {
      setWdStep(2);

      const txRef = push(ref(db, `transactions/${user.id}`));

      await set(txRef, {
        type: 'WITHDRAWAL',
        coin: wdCoin,
        amount: Number(wdAmount),
        fee: FIXED_FEE,
        address: wdAddress,
        network: wdNetwork,
        status: 'PENDING',
        timestamp: Date.now()
      });

      const totalDeduction = Number(wdAmount) + wdFeeInCrypto;
      const updates: Record<string, any> = {};
      updates[`users/${user.id}/wallets/${wdCoin}`] = wdAvailable - totalDeduction;
      await update(ref(db), updates);

      setTimeout(() => {
        setWdStep(1);
        setWdAmount('');
        setWdAddress('');
        setShowWithdraw(false);
      }, 1200);
    } catch (error) {
      console.error('Withdraw error:', error);
      setWdStep(1);
    }
  };

  const totalAssetValue = useMemo(() => {
    return assets.reduce((sum, coin) => {
      const amount = Number(liveUser?.wallets?.[coin] || 0);
      const price = Number(coinData[coin]?.price || 0);
      return sum + amount * price;
    }, 0);
  }, [assets, liveUser, coinData]);

  const portfolioChange = useMemo(() => {
    const changes = assets.map((coin) => Number(coinData[coin]?.change || 0));
    if (!changes.length) return 0;
    return changes.reduce((a, b) => a + b, 0) / changes.length;
  }, [assets, coinData]);

  const firstName = liveUser?.firstName?.trim() || '';
  const lastName = liveUser?.lastName?.trim() || '';
  const welcomeName = firstName || 'User';
  const profileFullName = `${firstName} ${lastName}`.trim() || 'N/A';
  const profileCountry = liveUser?.country?.trim() || 'N/A';
  const profilePhone = liveUser?.phone?.trim() || 'N/A';

  const depositAddresses = liveUser?.depositAddresses || {};
  const selectedDepositAddress = depositAddresses?.[receiveCoin] || '';
  const waitingForGeneration = !selectedDepositAddress;

  const handleCopyReceiveAddress = async () => {
    if (!selectedDepositAddress) {
      setCopyNotice('Waiting for address generation');
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedDepositAddress);
      setCopyNotice('Address copied');
    } catch (error) {
      console.error('Copy failed:', error);
      setCopyNotice('Copy failed');
    }
  };

  const qrUrl = selectedDepositAddress
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
        selectedDepositAddress
      )}`
    : '';

  const clientTitleForTx = (tx: any) => {
    if (tx.reason?.trim()) return tx.reason.trim();
    if (tx.clientTitle?.trim()) return tx.clientTitle.trim();
    if (tx.type === 'DEPOSIT') return 'Deposit';
    if (tx.type === 'BONUS') return 'Bonus';
    if (tx.type === 'ADMIN_ADJUSTMENT') return 'Balance updated';
    if (tx.type === 'WITHDRAWAL') return 'Withdrawal';
    if (tx.type === 'SWAP') return 'Swap';
    return tx.type || 'Transaction';
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#030712] flex flex-col items-center justify-center font-mono text-blue-500">
        <Loader2 className="animate-spin mb-4" size={40} />
        <span className="tracking-[0.4em] animate-pulse text-[11px] uppercase">
          Initializing secure environment...
        </span>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#030712] text-white' : 'bg-slate-100 text-slate-900'} transition-all duration-300`}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-80px] left-[10%] w-[420px] h-[420px] bg-blue-600/6 blur-[80px] rounded-full" />
        <div className="absolute bottom-[-100px] right-[8%] w-[320px] h-[320px] bg-cyan-400/4 blur-[80px] rounded-full" />
      </div>

      <nav className={`sticky top-0 z-40 backdrop-blur-xl border-b ${isDarkMode ? 'border-white/5 bg-[#030712]/75' : 'border-slate-200 bg-white/75'}`}>
        <div className="max-w-[1600px] mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.18)]">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight italic">Axcel Wallet</div>
              <div className="text-[10px] uppercase tracking-[0.35em] opacity-35 font-bold">
                your private wallet
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.25em] opacity-40">
            <span>Market_Live</span>
            <span>Security_Audit</span>
            <span>Terminal_v4.2</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className={`w-11 h-11 rounded-2xl border border-white/8 bg-white/5 hover:bg-white/10 flex items-center justify-center relative ${buttonFx}`}
            >
              <Bell size={18} className="opacity-70 relative z-10" />
              {notifications.length > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-blue-500" />
              )}
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-11 h-11 rounded-2xl border border-white/8 bg-white/5 hover:bg-white/10 flex items-center justify-center ${buttonFx}`}
            >
              {isDarkMode ? <Sun size={18} className="opacity-70 relative z-10" /> : <Moon size={18} className="opacity-70 relative z-10" />}
            </button>

            <button
              onClick={handleLogout}
              className={`px-5 h-11 rounded-2xl border border-rose-500/20 bg-rose-500/8 text-rose-400 hover:bg-rose-500 hover:text-white flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] ${buttonFx}`}
            >
              <LogOut size={16} className="relative z-10" />
              <span className="relative z-10">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="relative max-w-[1600px] mx-auto px-6 md:px-8 py-8 md:py-10">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 space-y-8">
            <section className={`relative overflow-hidden rounded-[36px] border ${isDarkMode ? 'bg-[linear-gradient(135deg,#0b1220_0%,#0d1830_55%,#0b1220_100%)] border-white/6' : 'bg-white border-slate-200'} p-7 md:p-9 shadow-[0_12px_40px_rgba(0,0,0,0.22)]`}>
              <div className="relative z-10 flex flex-col gap-8">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                      <span className="text-[10px] uppercase tracking-[0.35em] opacity-40 font-black">
                        Active portfolio liquidity
                      </span>
                    </div>

                    <div className="text-[12px] uppercase tracking-[0.22em] opacity-40 font-bold mb-3">
                      Welcome back, {welcomeName}
                    </div>

                    <h1 className="text-5xl md:text-7xl font-light tracking-tight text-blue-500 leading-none">
                      ${Number(liveUser?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h1>
                  </div>

                  <div className="grid grid-cols-2 gap-4 min-w-[280px]">
                    <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                      <div className="text-[10px] uppercase tracking-[0.2em] opacity-35 font-black mb-2">
                        Holdings value
                      </div>
                      <div className="text-xl font-semibold">
                        ${totalAssetValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                      <div className="text-[10px] uppercase tracking-[0.2em] opacity-35 font-black mb-2">
                        24h composite
                      </div>
                      <div className={`text-xl font-semibold ${portfolioChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {portfolioChange >= 0 ? '+' : ''}
                        {portfolioChange.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="rounded-[26px] border border-white/8 bg-black/20 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Layers3 size={16} className="text-blue-400" />
                      <span className="text-[10px] font-black uppercase tracking-[0.22em] opacity-40">
                        Wallet status
                      </span>
                    </div>
                    <div className="text-sm font-semibold">Secure multi-asset storage online</div>
                  </div>

                  <div className="rounded-[26px] border border-white/8 bg-black/20 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Activity size={16} className="text-emerald-400" />
                      <span className="text-[10px] font-black uppercase tracking-[0.22em] opacity-40">
                        Node status
                      </span>
                    </div>
                    <div className="text-sm font-semibold">Synchronization stable across network</div>
                  </div>

                  <div className="rounded-[26px] border border-white/8 bg-black/20 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Sparkles size={16} className="text-cyan-400" />
                      <span className="text-[10px] font-black uppercase tracking-[0.22em] opacity-40">
                        Access tier
                      </span>
                    </div>
                    <div className="text-sm font-semibold">Private operator clearance enabled</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button onClick={() => setShowSwap(true)} className={`px-7 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-[11px] font-black uppercase tracking-[0.24em] flex items-center gap-3 ${buttonFx}`}>
                    <ArrowLeftRight size={16} className="relative z-10" />
                    <span className="relative z-10">Asset Swap</span>
                  </button>

                  <button onClick={() => setShowWithdraw(true)} className={`px-7 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-[11px] font-black uppercase tracking-[0.24em] flex items-center gap-3 ${buttonFx}`}>
                    <ArrowUpRight size={16} className="relative z-10" />
                    <span className="relative z-10">Withdraw Funds</span>
                  </button>

                  <button onClick={() => setShowReceive(true)} className={`px-7 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-[11px] font-black uppercase tracking-[0.24em] flex items-center gap-3 ${buttonFx}`}>
                    <Wallet size={16} className="relative z-10" />
                    <span className="relative z-10">Receive Funds</span>
                  </button>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {assets.map((coin) => {
                const amount = Number(liveUser?.wallets?.[coin] || 0);
                const price = Number(coinData[coin]?.price || 0);
                const change = Number(coinData[coin]?.change || 0);
                const usdValue = amount * price;

                return (
                  <div
                    key={coin}
                    className={`rounded-[30px] border ${
                      isDarkMode
                        ? 'bg-[linear-gradient(180deg,#0b1220_0%,#0d1628_100%)] border-white/6'
                        : 'bg-white border-slate-200'
                    } p-6`}
                  >
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <img
                          src={coinData[coin]?.image}
                          alt={coin}
                          className="w-11 h-11 rounded-full object-contain shadow-lg"
                        />
                        <div>
                          <div className="text-lg font-bold tracking-tight">{coin}</div>
                          <div className="text-[10px] uppercase tracking-[0.24em] opacity-30 font-black">
                            Storage node
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[12px] font-semibold text-emerald-400">
                          ${price.toLocaleString()}
                        </div>
                        <div className={`text-[11px] font-black ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {change >= 0 ? '+' : ''}
                          {change.toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    <div className="text-4xl font-light tracking-tight mb-2">
                      {amount.toFixed(6)}
                    </div>
                    <div className="text-[11px] uppercase tracking-[0.18em] opacity-30 font-black mb-5">
                      {coin} available
                    </div>

                    <div className="h-2 rounded-full bg-white/5 overflow-hidden mb-4">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                        style={{
                          width: coin === 'BTC' ? '74%' : coin === 'ETH' ? '58%' : '39%'
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[12px]">
                      <span className="opacity-45">Estimated value</span>
                      <span className="font-semibold">
                        ${usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </section>
          </div>

          <div className="xl:col-span-4 space-y-5">
            <section className={`rounded-[32px] border ${isDarkMode ? 'bg-[linear-gradient(180deg,#0b1220_0%,#0d1628_100%)] border-white/6' : 'bg-white border-slate-200'} p-6`}>
              <div className="flex items-start justify-between mb-5 gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.28em] opacity-35 font-black mb-2">
                    Operator profile
                  </div>
                  <div className="text-xl font-semibold">{profileFullName}</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0">
                  {(firstName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                </div>
              </div>

              <div className="rounded-[24px] border border-emerald-500/10 bg-emerald-500/[0.04] px-5 py-4 mb-5">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold mb-2">
                  Session Status
                </div>
                <div className="text-emerald-400 text-2xl font-semibold">
                  Protected
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl bg-black/20 border border-white/6 px-4 py-3 flex items-center justify-between">
                  <span className="text-sm opacity-55">Email</span>
                  <span className="text-sm font-medium truncate max-w-[180px]">{user?.email || 'N/A'}</span>
                </div>
                <div className="rounded-2xl bg-black/20 border border-white/6 px-4 py-3 flex items-center justify-between">
                  <span className="text-sm opacity-55">Country</span>
                  <span className="text-sm font-medium">{profileCountry}</span>
                </div>
                <div className="rounded-2xl bg-black/20 border border-white/6 px-4 py-3 flex items-center justify-between">
                  <span className="text-sm opacity-55">Phone</span>
                  <span className="text-sm font-medium">{profilePhone}</span>
                </div>
              </div>
            </section>

            <section className={`rounded-[32px] border ${isDarkMode ? 'bg-[linear-gradient(180deg,#0b1220_0%,#0d1628_100%)] border-white/6' : 'bg-white border-slate-200'} p-6`}>
              <div className="flex items-center justify-between mb-6">
                <div className="text-[10px] uppercase tracking-[0.28em] opacity-35 font-black">
                  Activity logs
                </div>
                <History size={16} className="opacity-30" />
              </div>

              <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1 scroll-dark">
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <div key={tx.id} className="rounded-[24px] border border-white/6 bg-black/20 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${tx.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {tx.type === 'WITHDRAWAL' ? <ArrowUpRight size={16} /> : <ArrowLeftRight size={16} />}
                          </div>

                          <div>
                            <div className="text-sm font-semibold">{clientTitleForTx(tx)}</div>
                            <div className="text-[12px] opacity-40 mt-1">
                              {typeof tx.timestamp === 'number' ? new Date(tx.timestamp).toLocaleString() : 'Processing...'}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-semibold">
                            {tx.amount} {tx.coin || tx.fromCoin || ''}
                          </div>
                          <div className={`text-[11px] font-black mt-1 ${tx.status === 'PENDING' ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {tx.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[28px] border border-white/6 bg-black/20 py-16 px-6 text-center">
                    <History size={34} className="mx-auto mb-4 opacity-20" />
                    <div className="text-sm font-semibold mb-2">No recent activity</div>
                    <div className="text-[12px] opacity-40">
                      Your transaction stream will appear here once activity is detected.
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className={`rounded-[32px] border ${isDarkMode ? 'bg-[linear-gradient(180deg,#0b1220_0%,#0d1628_100%)] border-white/6' : 'bg-white border-slate-200'} p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.28em] opacity-35 font-black mb-2">
                    Secure routing
                  </div>
                  <div className="text-base font-semibold">Network integrity verified</div>
                </div>
                <ChevronRight size={18} className="opacity-30" />
              </div>
            </section>
          </div>
        </div>
      </main>
            {showSwap && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#030712]/92 backdrop-blur-xl" />
          <div className="relative w-full max-w-[540px] rounded-[28px] border border-white/20 bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(255,255,255,0.03))] backdrop-blur-[32px] p-6 md:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.55)]">
            <button onClick={() => setShowSwap(false)} className={`absolute top-5 right-5 w-11 h-11 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center ${buttonFx}`}>
              <X size={18} />
            </button>

            {swapStep === 1 ? (
              <>
                <div className="text-2xl font-semibold mb-6">Swap Crypto</div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  {assets.map((coin) => (
                    <button
                      key={coin}
                      onClick={() => setSwapFrom(coin)}
                      className={`border rounded-[14px] px-3 py-3 flex items-center justify-center gap-2 ${
                        swapFrom === coin ? 'border-blue-500 bg-blue-500/20' : 'border-white/20 bg-white/5'
                      }`}
                    >
                      <img src={coinData[coin]?.image} alt={coin} className="w-5 h-5" />
                      <span>{coin}</span>
                    </button>
                  ))}
                </div>

                <input
                  value={swapAmount}
                  onChange={(e) => setSwapAmount(e.target.value)}
                  type="number"
                  placeholder="0.00"
                  className="clean-number w-full rounded-[14px] px-4 py-4 bg-white/10 border border-white/20 text-white mb-5"
                />

                <div className="flex justify-center mb-5">
                  <button onClick={handleSwapDirection} className="w-11 h-11 rounded-xl border border-white/20 bg-white/5 flex items-center justify-center">
                    <ArrowLeftRight size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  {assets.map((coin) => (
                    <button
                      key={coin}
                      disabled={coin === swapFrom}
                      onClick={() => setSwapTo(coin)}
                      className={`border rounded-[14px] px-3 py-3 flex items-center justify-center gap-2 ${
                        coin === swapTo ? 'border-blue-500 bg-blue-500/20' : 'border-white/20 bg-white/5'
                      } ${coin === swapFrom ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      <img src={coinData[coin]?.image} alt={coin} className="w-5 h-5" />
                      <span>{coin}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-2 text-sm text-slate-300 mb-5">
                  <div className="flex justify-between">
                    <span>Rate</span>
                    <span>1 {swapFrom} = {swapRate ? swapRate.toFixed(6) : '0.000000'} {swapTo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated receive</span>
                    <span>{estimatedReceive.toFixed(6)} {swapTo}</span>
                  </div>
                </div>

                <button
                  onClick={executeSwap}
                  disabled={!swapAmount || swapInsufficient}
                  className="w-full py-4 rounded-[14px] bg-blue-600 hover:bg-blue-500 disabled:opacity-40"
                >
                  Confirm Swap
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <Loader2 className="mx-auto mb-4 animate-spin text-blue-400" size={42} />
                <div className="text-lg font-semibold">Processing swap...</div>
              </div>
            )}
          </div>
        </div>
      )}

      {showWithdraw && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#030712]/92 backdrop-blur-xl" />
          <div className="relative w-full max-w-[540px] rounded-[26px] border border-white/20 bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(255,255,255,0.03))] backdrop-blur-[32px] p-6 md:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.55)]">
            <button onClick={() => setShowWithdraw(false)} className={`absolute top-5 right-5 w-11 h-11 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center ${buttonFx}`}>
              <X size={18} />
            </button>

            {wdStep === 1 ? (
              <>
                <div className="text-2xl font-semibold mb-6">Withdraw Crypto</div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  {assets.map((coin) => (
                    <button
                      key={coin}
                      onClick={() => setWdCoin(coin)}
                      className={`border rounded-[14px] px-3 py-3 flex items-center justify-center gap-2 ${
                        wdCoin === coin ? 'border-blue-500 bg-blue-500/20' : 'border-white/20 bg-white/5'
                      }`}
                    >
                      <img src={coinData[coin]?.image} alt={coin} className="w-5 h-5" />
                      <span>{coin}</span>
                    </button>
                  ))}
                </div>

                <select
                  value={wdNetwork}
                  onChange={(e) => setWdNetwork(e.target.value)}
                  className="w-full rounded-[14px] px-4 py-4 bg-white/10 border border-white/20 text-white mb-5"
                >
                  {withdrawNetworks[wdCoin].map((network) => (
                    <option key={network} value={network} className="bg-slate-900">
                      {network}
                    </option>
                  ))}
                </select>

                <div className="flex gap-3 mb-5">
                  <input
                    value={wdAddress}
                    onChange={(e) => setWdAddress(e.target.value)}
                    placeholder="Wallet address"
                    className="flex-1 rounded-[14px] px-4 py-4 bg-white/10 border border-white/20 text-white"
                  />
                  <button onClick={handlePasteAddress} className="px-4 rounded-[12px] border border-white/20 bg-white/5">
                    Paste
                  </button>
                </div>

                <input
                  value={wdAmount}
                  onChange={(e) => setWdAmount(e.target.value)}
                  type="number"
                  placeholder={`0.00 ${wdCoin}`}
                  className="clean-number w-full rounded-[14px] px-4 py-4 bg-white/10 border border-white/20 text-white mb-3"
                />

                <div className="flex justify-between text-xs text-slate-400 mb-3">
                  <span>Available: {wdAvailable.toFixed(6)} {wdCoin}</span>
                  <button onClick={() => setWdAmount(String(wdAvailable))} className="text-blue-400">
                    MAX
                  </button>
                </div>

                {wdInsufficient && <div className="text-red-400 text-xs mb-2">Not enough balance</div>}
                {wdBelowMinimum && <div className="text-amber-400 text-xs mb-2">Minimum withdrawal is {wdMinimum} {wdCoin}</div>}

                <div className="space-y-2 text-sm text-slate-300 mb-5">
                  <div className="flex justify-between">
                    <span>Network Fee</span>
                    <span>{wdFeeInCrypto.toFixed(6)} {wdCoin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total to Receive</span>
                    <span>{wdReceiveTotal.toFixed(6)} {wdCoin}</span>
                  </div>
                </div>

                <button
                  onClick={executeWithdraw}
                  disabled={!wdAmount || !wdAddress || wdInsufficient || wdBelowMinimum}
                  className="w-full py-4 rounded-[14px] bg-blue-600 hover:bg-blue-500 disabled:opacity-40"
                >
                  Confirm Withdrawal
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <Loader2 className="mx-auto mb-4 animate-spin text-blue-400" size={42} />
                <div className="text-lg font-semibold">Processing withdrawal...</div>
              </div>
            )}
          </div>
        </div>
      )}

      {showReceive && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#030712]/92 backdrop-blur-xl" />
          <div className="relative w-full max-w-[540px] rounded-[26px] border border-white/20 bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(255,255,255,0.03))] backdrop-blur-[32px] p-6 md:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.55)]">
            <button onClick={() => setShowReceive(false)} className={`absolute top-5 right-5 w-11 h-11 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center ${buttonFx}`}>
              <X size={18} />
            </button>

            <div className="text-2xl font-semibold mb-6">Receive Crypto</div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {assets.map((coin) => (
                <button
                  key={coin}
                  onClick={() => setReceiveCoin(coin)}
                  className={`border rounded-[14px] px-3 py-3 flex items-center justify-center gap-2 ${
                    receiveCoin === coin ? 'border-blue-500 bg-blue-500/20' : 'border-white/20 bg-white/5'
                  }`}
                >
                  <img src={coinData[coin]?.image} alt={coin} className="w-5 h-5" />
                  <span>{coin}</span>
                </button>
              ))}
            </div>

            <div className="rounded-[16px] border border-white/20 bg-white/10 px-4 py-4 min-h-[64px] flex items-center justify-between gap-3 mb-4">
              <div className="text-[14px] text-slate-300 break-all">
                {selectedDepositAddress || 'Waiting for address generation'}
              </div>

              <button onClick={handleCopyReceiveAddress} className="px-4 py-3 rounded-[12px] border border-white/15 bg-white/5 flex items-center gap-2 shrink-0">
                <Copy size={16} />
                <span>Copy</span>
              </button>
            </div>

            {copyNotice && <div className="text-[12px] text-blue-400 mb-4">{copyNotice}</div>}

            <div className="rounded-[20px] border border-white/20 bg-white/10 p-6 flex flex-col items-center justify-center min-h-[220px] mb-4">
              {waitingForGeneration ? (
                <>
                  <div className="w-[120px] h-[120px] rounded-[20px] border border-dashed border-white/20 bg-white/5 flex items-center justify-center mb-4">
                    <Wallet size={40} className="opacity-40" />
                  </div>
                  <div className="text-sm font-medium text-slate-300">Waiting for address generation</div>
                </>
              ) : (
                <>
                  <div className="w-[220px] h-[220px] rounded-[20px] bg-white p-3 grid place-items-center mb-4">
                    <img src={qrUrl} alt="QR Code" className="w-full h-full object-contain rounded-[14px]" />
                  </div>
                  <div className="text-sm text-slate-300">Scan to receive {receiveCoin}</div>
                </>
              )}
            </div>

            <div className="rounded-[16px] border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-[12px] text-amber-200 leading-5">
              Only send <b>{receiveCoin}</b> to this deposit address.
            </div>
          </div>
        </div>
      )}

      {showNotifs && (
        <div className="fixed top-24 right-6 w-full max-w-[360px] z-[60] rounded-[28px] border border-white/10 bg-[#0b1220]/95 backdrop-blur-xl p-5 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
          <div className="flex items-center justify-between mb-5">
            <div className="text-[10px] uppercase tracking-[0.28em] opacity-35 font-black">
              System alerts
            </div>
            <button onClick={() => setShowNotifs(false)} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3">
            {notifications.length > 0 ? (
              notifications.slice(0, 8).map((n) => (
                <div key={n.id} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <div className="text-sm font-semibold mb-1">{n.title || 'Notification'}</div>
                  <div className="text-[12px] opacity-55">{n.message || ''}</div>
                  <div className="text-[11px] opacity-40 mt-2">
                    {n.timestamp ? new Date(n.timestamp).toLocaleString() : ''}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                <div className="text-sm font-semibold mb-1">No new notifications</div>
                <div className="text-[11px] opacity-45">System is stable</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
