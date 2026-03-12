import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { ref, onValue, update, push, set } from 'firebase/database';
import {
  ArrowLeftRight,
  Bell,
  Moon,
  Sun,
  Loader2,
  X,
  ArrowUpRight,
  History,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Activity,
  Layers3,
  Sparkles,
  Copy,
  Wallet
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showSwap, setShowSwap] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNotifs, setShowNotifs] = useState(false);

  const [coinData, setCoinData] = useState<any>({});
  const [liveUser, setLiveUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  const [swapFrom, setSwapFrom] = useState('BTC');
  const [swapTo, setSwapTo] = useState('ETH');
  const [swapAmount, setSwapAmount] = useState('');
  const [swapStep, setSwapStep] = useState(1);
  const [swapTimelineStep, setSwapTimelineStep] = useState(0);

  const [wdCoin, setWdCoin] = useState('BTC');
  const [wdAmount, setWdAmount] = useState('');
  const [wdAddress, setWdAddress] = useState('');
  const [wdStep, setWdStep] = useState(1);
  const [wdTimelineStep, setWdTimelineStep] = useState(0);
  const [wdNetwork, setWdNetwork] = useState('');

  const [receiveCoin, setReceiveCoin] = useState('BTC');
  const [copyNotice, setCopyNotice] = useState('');

  const FIXED_FEE = 15.27;
  const SWAP_FEE_RATE = 0.00001;
  const assets = ['BTC', 'ETH', 'USDT'];

  const withdrawNetworks: Record<string, string[]> = {
    ETH: ['Ethereum (ERC-20)', 'Arbitrum', 'Optimism', 'Polygon'],
    BTC: ['Bitcoin', 'Lightning'],
    USDT: ['Ethereum (ERC-20)', 'Tron (TRC-20)', 'BNB Smart Chain (BEP-20)']
  };

  const minimumWithdrawals: Record<string, number> = {
    ETH: 0.02,
    BTC: 0.0005,
    USDT: 5
  };

  const buttonFx =
    "relative overflow-hidden transition-all duration-300 before:content-[''] before:absolute before:w-[140%] before:h-[140%] before:top-[-140%] before:left-[-140%] before:bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.35),transparent)] before:rotate-[25deg] before:transition-all before:duration-700 hover:before:top-[140%] hover:before:left-[140%]";

  useEffect(() => {
    if (!user?.id) return;

    const userRef = ref(db, 'users/' + user.id);
    const unsubUser = onValue(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        setLiveUser((prev: any) => {
          if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
          return data;
        });
      } else {
        setLiveUser(null);
      }
      setLoading(false);
    });

    const txRef = ref(db, 'transactions/' + user.id);
    const unsubTx = onValue(txRef, (snap) => {
      if (snap.exists()) {
        const rows = Object.entries(snap.val()).map(([id, value]) => ({
          id,
          ...(value as any),
        }));
        rows.sort((a: any, b: any) => Number(b.timestamp || 0) - Number(a.timestamp || 0));
        setTransactions(rows);
      } else {
        setTransactions([]);
      }
    });

    const notifRef = ref(db, 'notifications/' + user.id);
    const unsubNotif = onValue(notifRef, (snap) => {
      if (snap.exists()) {
        const rows = Object.entries(snap.val()).map(([nid, value]) => ({
          id: nid,
          ...(value as any),
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
    let intervalId: any;

    const fetchPrices = async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether'
        );
        const data = await res.json();

        if (Array.isArray(data) && data.length >= 3) {
          setCoinData({
            BTC: {
              price: data[0]?.current_price || 0,
              image: data[0]?.image || '',
              change: data[0]?.price_change_percentage_24h || 0
            },
            ETH: {
              price: data[1]?.current_price || 0,
              image: data[1]?.image || '',
              change: data[1]?.price_change_percentage_24h || 0
            },
            USDT: {
              price: data[2]?.current_price || 0,
              image: data[2]?.image || '',
              change: data[2]?.price_change_percentage_24h || 0
            }
          });
        }
      } catch (error) {
        console.error('Price fetch error:', error);
      }
    };

    fetchPrices();
    intervalId = setInterval(fetchPrices, 60000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const list = withdrawNetworks[wdCoin] || [];
    if (!list.includes(wdNetwork)) {
      setWdNetwork(list[0] || '');
    }
  }, [wdCoin, wdNetwork]);

  useEffect(() => {
    if (!copyNotice) return;
    const t = setTimeout(() => setCopyNotice(''), 1800);
    return () => clearTimeout(t);
  }, [copyNotice]);

  const handleLogout = async () => {
    try {
      navigate('/', { state: { logoutSuccess: true } });
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getSwapRate = () => {
    const fromPrice = Number(coinData?.[swapFrom]?.price || 0);
    const toPrice = Number(coinData?.[swapTo]?.price || 0);
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

  const handleSwapFromChange = (coin: string) => {
    setSwapFrom(coin);
    if (coin === swapTo) {
      const alt = assets.find((x) => x !== coin) || 'BTC';
      setSwapTo(alt);
    }
  };

  const handleSwapToChange = (coin: string) => {
    if (coin === swapFrom) return;
    setSwapTo(coin);
  };

  const executeSwap = async () => {
    if (!swapAmount) return;
    if (!coinData[swapFrom]?.price || !coinData[swapTo]?.price) return;
    if (swapInsufficient) return;

    setSwapStep(2);
    setSwapTimelineStep(0);

    setTimeout(() => setSwapTimelineStep(1), 500);
    setTimeout(() => setSwapTimelineStep(2), 1600);
    setTimeout(() => setSwapTimelineStep(3), 2700);

    setTimeout(async () => {
      try {
        const amount = Number(swapAmount);
        const receiveAmount = amount * swapRate * (1 - SWAP_FEE_RATE);

        const updates: any = {};
        updates[`users/${user.id}/wallets/${swapFrom}`] =
          (liveUser?.wallets?.[swapFrom] || 0) - amount;
        updates[`users/${user.id}/wallets/${swapTo}`] =
          (liveUser?.wallets?.[swapTo] || 0) + receiveAmount;

        await update(ref(db), updates);

        const txRef = push(ref(db, 'transactions/' + user.id));
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

        setSwapStep(3);

        setTimeout(() => {
          setShowSwap(false);
          setSwapStep(1);
          setSwapTimelineStep(0);
          setSwapAmount('');
        }, 2200);
      } catch (error) {
        console.error('Swap error:', error);
        setSwapStep(1);
        setSwapTimelineStep(0);
      }
    }, 4000);
  };

  const wdCoinPrice = Number(coinData?.[wdCoin]?.price || 0);
  const wdFeeInCrypto = wdCoinPrice ? FIXED_FEE / wdCoinPrice : 0;
  const wdAvailable = Number(liveUser?.wallets?.[wdCoin] || 0);
  const wdMinimum = minimumWithdrawals[wdCoin] || 0;
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
    if (!coinData[wdCoin]?.price) return;
    if (wdInsufficient) return;
    if (wdBelowMinimum) return;
    if (!wdAddress.trim()) return;

    const totalDeduction = Number(wdAmount) + wdFeeInCrypto;

    setWdStep(2);
    setWdTimelineStep(0);

    setTimeout(() => setWdTimelineStep(1), 900);
    setTimeout(() => setWdTimelineStep(2), 2800);
    setTimeout(() => setWdTimelineStep(3), 5200);
    setTimeout(() => setWdTimelineStep(4), 8200);

    setTimeout(async () => {
      try {
        const txRef = push(ref(db, 'transactions/' + user.id));

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

        const updates: any = {};
        updates[`users/${user.id}/wallets/${wdCoin}`] = wdAvailable - totalDeduction;

        await update(ref(db), updates);

        setWdStep(3);
      } catch (error) {
        console.error('Withdraw error:', error);
        setWdStep(1);
        setWdTimelineStep(0);
      }
    }, 11000);
  };

  const resetWithdrawFlow = () => {
    setWdStep(1);
    setWdTimelineStep(0);
    setWdAmount('');
    setWdAddress('');
  };

  const totalAssetValue = useMemo(() => {
    return assets.reduce((sum, coin) => {
      const amount = Number(liveUser?.wallets?.[coin] || 0);
      const price = Number(coinData?.[coin]?.price || 0);
      return sum + amount * price;
    }, 0);
  }, [liveUser, coinData]);

  const portfolioChange = useMemo(() => {
    const changes = assets.map((coin) => Number(coinData?.[coin]?.change || 0));
    if (!changes.length) return 0;
    return changes.reduce((a, b) => a + b, 0) / changes.length;
  }, [coinData]);

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
    <div
      className={`min-h-screen ${
        isDarkMode ? 'bg-[#030712] text-white' : 'bg-slate-100 text-slate-900'
      } transition-all duration-300`}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-80px] left-[10%] w-[420px] h-[420px] bg-blue-600/6 blur-[80px] rounded-full" />
        <div className="absolute bottom-[-100px] right-[8%] w-[320px] h-[320px] bg-cyan-400/4 blur-[80px] rounded-full" />
      </div>

      <nav
        className={`sticky top-0 z-40 backdrop-blur-xl border-b ${
          isDarkMode ? 'border-white/5 bg-[#030712]/75' : 'border-slate-200 bg-white/75'
        }`}
      >
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
              {isDarkMode ? (
                <Sun size={18} className="opacity-70 relative z-10" />
              ) : (
                <Moon size={18} className="opacity-70 relative z-10" />
              )}
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
            <section
              className={`relative overflow-hidden rounded-[36px] border ${
                isDarkMode
                  ? 'bg-[linear-gradient(135deg,#0b1220_0%,#0d1830_55%,#0b1220_100%)] border-white/6'
                  : 'bg-white border-slate-200'
              } p-7 md:p-9 shadow-[0_12px_40px_rgba(0,0,0,0.22)]`}
            >
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
                      <div
                        className={`text-xl font-semibold ${
                          portfolioChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
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
                  <button
                    onClick={() => setShowSwap(true)}
                    className={`px-7 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 shadow-[0_12px_30px_rgba(37,99,235,0.22)] text-[11px] font-black uppercase tracking-[0.24em] flex items-center gap-3 ${buttonFx}`}
                  >
                    <ArrowLeftRight size={16} className="relative z-10" />
                    <span className="relative z-10">Asset Swap</span>
                  </button>

                  <button
                    onClick={() => setShowWithdraw(true)}
                    className={`px-7 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-[11px] font-black uppercase tracking-[0.24em] flex items-center gap-3 ${buttonFx}`}
                  >
                    <ArrowUpRight size={16} className="relative z-10" />
                    <span className="relative z-10">Withdraw Funds</span>
                  </button>

                  <button
                    onClick={() => setShowReceive(true)}
                    className={`px-7 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-[11px] font-black uppercase tracking-[0.24em] flex items-center gap-3 ${buttonFx}`}
                  >
                    <Wallet size={16} className="relative z-10" />
                    <span className="relative z-10">Receive Funds</span>
                  </button>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {assets.map((coin) => {
                const amount = Number(liveUser?.wallets?.[coin] || 0);
                const price = Number(coinData?.[coin]?.price || 0);
                const change = Number(coinData?.[coin]?.change || 0);
                const usdValue = amount * price;

                return (
                  <div
                    key={coin}
                    className={`rounded-[30px] border ${
                      isDarkMode
                        ? 'bg-[linear-gradient(180deg,#0b1220_0%,#0d1628_100%)] border-white/6'
                        : 'bg-white border-slate-200'
                    } p-6 hover:-translate-y-1 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.16)]`}
                  >
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <img
                          src={coinData?.[coin]?.image}
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
                        <div
                          className={`text-[11px] font-black ${
                            change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
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
            <section
              className={`rounded-[32px] border ${
                isDarkMode
                  ? 'bg-[linear-gradient(180deg,#0b1220_0%,#0d1628_100%)] border-white/6'
                  : 'bg-white border-slate-200'
              } p-6 shadow-[0_10px_30px_rgba(0,0,0,0.16)]`}
            >
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
                  <span className="text-sm font-medium truncate max-w-[180px]">
                    {user?.email || 'N/A'}
                  </span>
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

            <section
              className={`rounded-[32px] border ${
                isDarkMode
                  ? 'bg-[linear-gradient(180deg,#0b1220_0%,#0d1628_100%)] border-white/6'
                  : 'bg-white border-slate-200'
              } p-6 shadow-[0_10px_30px_rgba(0,0,0,0.16)]`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="text-[10px] uppercase tracking-[0.28em] opacity-35 font-black">
                  Activity logs
                </div>
                <History size={16} className="opacity-30" />
              </div>

              <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="rounded-[24px] border border-white/6 bg-black/20 p-4 hover:bg-black/25 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                              tx.status === 'PENDING'
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-emerald-500/10 text-emerald-400'
                            }`}
                          >
                            {tx.type === 'WITHDRAWAL' ? (
                              <ArrowUpRight size={16} />
                            ) : (
                              <ArrowLeftRight size={16} />
                            )}
                          </div>

                          <div>
                            <div className="text-sm font-semibold">
                              {clientTitleForTx(tx)}
                            </div>
                            <div className="text-[12px] opacity-40 mt-1">
                              {typeof tx.timestamp === 'number'
                                ? new Date(tx.timestamp).toLocaleString()
                                : 'Processing...'}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-semibold">
                            {tx.amount} {tx.coin || tx.fromCoin || ''}
                          </div>
                          <div
                            className={`text-[11px] font-black mt-1 ${
                              tx.status === 'PENDING' ? 'text-amber-400' : 'text-emerald-400'
                            }`}
                          >
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

            <section
              className={`rounded-[32px] border ${
                isDarkMode
                  ? 'bg-[linear-gradient(180deg,#0b1220_0%,#0d1628_100%)] border-white/6'
                  : 'bg-white border-slate-200'
              } p-6 shadow-[0_10px_30px_rgba(0,0,0,0.16)]`}
            >
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-[#030712]/92 backdrop-blur-xl" />
          <div className="relative w-full max-w-[560px] bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(255,255,255,0.03))] border border-white/20 rounded-[28px] backdrop-blur-[32px] p-8 shadow-[0_24px_70px_rgba(0,0,0,0.55)] overflow-hidden">
            <div className="absolute top-[-80px] left-[-80px] w-[220px] h-[220px] bg-blue-500/10 blur-[70px] rounded-full" />
            <button onClick={() => setShowSwap(false)} className={`absolute top-5 right-5 w-11 h-11 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center ${buttonFx}`}>
              <X size={18} className="relative z-10" />
            </button>

            {swapStep === 1 ? (
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-7 gap-4">
                  <div className="text-2xl font-semibold">Swap Crypto</div>
                  <div className="text-[13px] text-slate-400">
                    Portfolio Balance: <b className="text-white">{Number(liveUser?.wallets?.[swapFrom] || 0).toFixed(6)} {swapFrom}</b>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-[12px] uppercase tracking-[1px] text-slate-400 mb-2 block">From Asset</span>
                  <div className="flex gap-3">
                    {assets.map((coin) => (
                      <button
                        key={coin}
                        onClick={() => handleSwapFromChange(coin)}
                        className={`flex-1 border rounded-[14px] px-3 py-3 flex items-center gap-3 transition-all relative overflow-hidden ${
                          swapFrom === coin
                            ? 'border-blue-500 bg-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.35)]'
                            : 'border-white/20 bg-[linear-gradient(135deg,rgba(255,255,255,.06),rgba(255,255,255,.01))] hover:border-blue-500 hover:bg-blue-500/10'
                        } ${buttonFx}`}
                      >
                        <img src={coinData?.[coin]?.image} alt={coin} className="w-[22px] h-[22px] relative z-10" />
                        <span className="relative z-10 font-medium">{coin}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <span className="text-[12px] uppercase tracking-[1px] text-slate-400 mb-2 block">Amount</span>
                  <div className="relative">
                    <input
                      value={swapAmount}
                      onChange={(e) => setSwapAmount(e.target.value)}
                      type="number"
                      placeholder="0.00"
                      className="w-full appearance-none bg-[linear-gradient(145deg,rgba(255,255,255,0.22),rgba(255,255,255,0.05))] border border-white/20 rounded-[14px] px-4 py-4 pr-12 text-white text-[15px] backdrop-blur-[18px] focus:outline-none focus:border-blue-500 focus:shadow-[0_0_14px_rgba(59,130,246,0.35)]"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col text-[10px] gap-[2px]">
                      <button type="button" onClick={() => setSwapAmount(String((parseFloat(swapAmount) || 0) + 1))} className="opacity-70 hover:opacity-100 hover:text-blue-400 transition">▲</button>
                      <button type="button" onClick={() => setSwapAmount(String(Math.max(0, (parseFloat(swapAmount) || 0) - 1)))} className="opacity-70 hover:opacity-100 hover:text-blue-400 transition">▼</button>
                    </div>
                  </div>

                  {swapInsufficient && <div className="text-red-500 text-[12px] mt-2">Not enough available balance</div>}
                </div>

                <div className="flex justify-center my-4">
                  <button onClick={handleSwapDirection} className={`w-[42px] h-[42px] rounded-[12px] border border-white/20 bg-[linear-gradient(145deg,rgba(255,255,255,.12),rgba(255,255,255,.02))] hover:bg-blue-500/25 text-white flex items-center justify-center transition-all hover:rotate-180 ${buttonFx}`}>
                    <ArrowLeftRight size={18} className="relative z-10" />
                  </button>
                </div>

                <div className="mb-5">
                  <span className="text-[12px] uppercase tracking-[1px] text-slate-400 mb-2 block">Receive Asset</span>
                  <div className="flex gap-3">
                    {assets.map((coin) => (
                      <button
                        key={coin}
                        onClick={() => handleSwapToChange(coin)}
                        disabled={coin === swapFrom}
                        className={`flex-1 border rounded-[14px] px-3 py-3 flex items-center gap-3 transition-all relative overflow-hidden ${
                          coin === swapTo
                            ? 'border-blue-500 bg-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.35)]'
                            : coin === swapFrom
                            ? 'opacity-35 cursor-not-allowed pointer-events-none border-white/15 bg-white/5'
                            : 'border-white/20 bg-[linear-gradient(135deg,rgba(255,255,255,.06),rgba(255,255,255,.01))] hover:border-blue-500 hover:bg-blue-500/10'
                        } ${buttonFx}`}
                      >
                        <img src={coinData?.[coin]?.image} alt={coin} className="w-[22px] h-[22px] relative z-10" />
                        <span className="relative z-10 font-medium">{coin}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 border-t border-white/15 pt-5 space-y-2">
                  <div className="flex justify-between text-[14px] text-slate-400">
                    <span>Swap Rate</span>
                    <span className="text-white">1 {swapFrom} = {swapRate ? swapRate.toFixed(6) : '0.000000'} {swapTo}</span>
                  </div>
                  <div className="flex justify-between text-[14px] text-slate-400">
                    <span>Swap Fee</span>
                    <span className="text-white">0.001%</span>
                  </div>
                  <div className="flex justify-between text-[17px] mt-3 text-slate-300">
                    <span>Estimated Receive</span>
                    <span className="text-blue-400 font-semibold">{estimatedReceive.toFixed(6)} {swapTo}</span>
                  </div>
                </div>

                <button onClick={executeSwap} disabled={!swapAmount || swapInsufficient} className={`mt-6 w-full py-4 rounded-[14px] font-semibold text-[15px] bg-gradient-to-br from-blue-500 to-blue-700 text-white hover:-translate-y-[2px] hover:shadow-[0_10px_30px_rgba(59,130,246,0.45)] disabled:opacity-40 disabled:pointer-events-none ${buttonFx}`}>
                  <span className="relative z-10">Confirm Swap</span>
                </button>
              </div>
            ) : swapStep === 2 ? (
              <div className="relative z-10 text-center py-6">
                <h2 className="text-2xl font-semibold mb-5">Processing Swap</h2>
                <div className="mt-6 text-left max-w-[300px] mx-auto space-y-3">
                  <div className={`${swapTimelineStep >= 1 ? 'opacity-100' : 'opacity-40'} transition-opacity`}>Checking liquidity</div>
                  <div className={`${swapTimelineStep >= 2 ? 'opacity-100' : 'opacity-40'} transition-opacity`}>Executing internal swap</div>
                  <div className={`${swapTimelineStep >= 3 ? 'opacity-100' : 'opacity-40'} transition-opacity`}>Finalizing transaction</div>
                </div>
                <Loader2 className="mx-auto mt-8 animate-spin text-blue-400" size={42} />
              </div>
            ) : (
              <div className="relative z-10 text-center py-6">
                <h2 className="text-2xl font-semibold mb-6">Processing Swap</h2>
                <div className="w-[70px] h-[70px] rounded-full border-2 border-emerald-500 mx-auto flex items-center justify-center text-emerald-400 text-[36px] animate-[pulse_0.5s_ease]">✓</div>
                <p className="mt-5 text-lg font-medium">Swap Successful</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showWithdraw && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#030712]/92 backdrop-blur-xl" />
          <div className="relative w-full max-w-[540px] bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(255,255,255,0.03))] border border-white/20 rounded-[26px] backdrop-blur-[32px] p-8 shadow-[0_24px_70px_rgba(0,0,0,0.55)] overflow-hidden">
            <div className="absolute top-[-80px] left-[-80px] w-[220px] h-[220px] bg-blue-500/10 blur-[70px] rounded-full" />
            <button onClick={() => { setShowWithdraw(false); setWdStep(1); setWdTimelineStep(0); }} className={`absolute top-5 right-5 w-11 h-11 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center ${buttonFx}`}>
              <X size={18} className="relative z-10" />
            </button>

            {wdStep === 1 ? (
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-7">
                  <div className="text-2xl font-semibold">Withdraw Crypto</div>
                  <div className="text-[13px] text-slate-400">
                    Portfolio Balance: <b className="text-white">{wdAvailable.toFixed(6)} {wdCoin}</b>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-[12px] uppercase tracking-[1px] text-slate-400 mb-2 block">Select Asset</span>
                  <div className="flex gap-3">
                    {assets.map((coin) => (
                      <button
                        key={coin}
                        onClick={() => setWdCoin(coin)}
                        className={`flex-1 border rounded-[14px] px-3 py-3 flex items-center gap-3 transition-all ${
                          wdCoin === coin
                            ? 'border-blue-500 bg-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.35)]'
                            : 'border-white/20 bg-[linear-gradient(135deg,rgba(255,255,255,.06),rgba(255,255,255,.01))] hover:border-blue-500 hover:bg-blue-500/10'
                        } ${buttonFx}`}
                      >
                        <img src={coinData?.[coin]?.image} alt={coin} className="w-[22px] h-[22px] relative z-10" />
                        <span className="relative z-10 font-medium">{coin}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-[12px] uppercase tracking-[1px] text-slate-400 mb-2 block">Network</span>
                  <select value={wdNetwork} onChange={(e) => setWdNetwork(e.target.value)} className="w-full bg-[linear-gradient(145deg,rgba(255,255,255,0.22),rgba(255,255,255,0.05))] border border-white/20 rounded-[14px] px-4 py-4 text-white text-[14px] backdrop-blur-[18px] focus:outline-none focus:border-blue-500 focus:shadow-[0_0_14px_rgba(59,130,246,0.35)]">
                    {(withdrawNetworks[wdCoin] || []).map((network) => (
                      <option key={network} value={network} className="bg-slate-900">{network}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <span className="text-[12px] uppercase tracking-[1px] text-slate-400 mb-2 block">Destination Address</span>
                  <div className="flex gap-3">
                    <input value={wdAddress} onChange={(e) => setWdAddress(e.target.value)} placeholder="0x3f4... wallet address" spellCheck={false} className="flex-1 bg-[linear-gradient(145deg,rgba(255,255,255,0.22),rgba(255,255,255,0.05))] border border-white/20 rounded-[14px] px-4 py-4 text-white text-[14px] backdrop-blur-[18px] focus:outline-none focus:border-blue-500 focus:shadow-[0_0_14px_rgba(59,130,246,0.35)]" />
                    <button onClick={handlePasteAddress} className={`px-4 rounded-[12px] border border-white/20 bg-[linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.02))] hover:border-blue-500 text-white ${buttonFx}`}>
                      <span className="relative z-10">Paste</span>
                    </button>
                  </div>
                </div>

                <div className="mb-5">
                  <span className="text-[12px] uppercase tracking-[1px] text-slate-400 mb-2 block">Amount</span>
                  <div className="relative">
                    <input value={wdAmount} onChange={(e) => setWdAmount(e.target.value)} type="number" step="0.01" placeholder={`0.00 ${wdCoin}`} className="w-full appearance-none bg-[linear-gradient(145deg,rgba(255,255,255,0.22),rgba(255,255,255,0.05))] border border-white/20 rounded-[14px] px-4 py-4 pr-12 text-white text-[15px] backdrop-blur-[18px] focus:outline-none focus:border-blue-500 focus:shadow-[0_0_14px_rgba(59,130,246,0.35)]" />
                    <div className="absolute right-2 top-2 bottom-2 flex flex-col">
                      <button type="button" onClick={() => setWdAmount(String((parseFloat(wdAmount) || 0) + 1))} className="flex-1 w-[26px] text-[10px] rounded-md bg-[linear-gradient(145deg,rgba(255,255,255,.18),rgba(255,255,255,.05))] hover:bg-blue-500/35">▲</button>
                      <button type="button" onClick={() => setWdAmount(String(Math.max(0, (parseFloat(wdAmount) || 0) - 1)))} className="flex-1 w-[26px] text-[10px] mt-[2px] rounded-md bg-[linear-gradient(145deg,rgba(255,255,255,.18),rgba(255,255,255,.05))] hover:bg-blue-500/35">▼</button>
                    </div>
                  </div>

                  <div className="flex justify-between text-[12px] text-slate-400 mt-2">
                    <span>Available: {wdAvailable.toFixed(6)} {wdCoin}</span>
                    <button onClick={() => setWdAmount(String(wdAvailable))} className="text-blue-400 hover:text-blue-300">MAX</button>
                  </div>

                  {wdInsufficient && <div className="text-red-500 text-[12px] mt-2">You do not have enough balance</div>}
                  {wdBelowMinimum && <div className="text-amber-400 text-[12px] mt-2">Minimum withdrawal is {wdMinimum} {wdCoin}</div>}
                </div>

                <div className="mt-5 border-t border-white/15 pt-5 space-y-2">
                  <div className="flex justify-between text-[14px] text-slate-400">
                    <span>Network Fee</span>
                    <span className="text-white">{wdFeeInCrypto.toFixed(6)} {wdCoin}</span>
                  </div>
                  <div className="flex justify-between text-[14px] text-slate-400">
                    <span>Processing by Exchange Time</span>
                    <span className="text-white">~3 Minutes</span>
                  </div>
                  <div className="flex justify-between text-[14px] text-slate-400">
                    <span>Minimum Withdrawal</span>
                    <span className="text-white">{wdMinimum} {wdCoin}</span>
                  </div>
                  <div className="flex justify-between text-[17px] mt-3 text-slate-300">
                    <span>Total to Receive</span>
                    <span className="text-blue-400 font-semibold">{wdReceiveTotal.toFixed(6)} {wdCoin}</span>
                  </div>
                </div>

                <button onClick={executeWithdraw} disabled={!wdAmount || !wdAddress || wdInsufficient || wdBelowMinimum} className={`mt-6 w-full py-4 rounded-[14px] font-semibold text-[15px] bg-gradient-to-br from-blue-500 to-blue-700 text-white hover:-translate-y-[2px] hover:shadow-[0_10px_30px_rgba(59,130,246,0.45)] disabled:opacity-40 disabled:pointer-events-none ${buttonFx}`}>
                  <span className="relative z-10">Confirm Withdrawal</span>
                </button>
              </div>
            ) : wdStep === 2 ? (
              <div className="relative z-10">
                <div className="text-2xl font-semibold mb-7 text-center">Withdrawal Status</div>
                <div className="relative h-[60px] flex items-center justify-between mb-8">
                  <div className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500/20 via-blue-500/60 to-blue-500/20" />
                  <div className={`w-[16px] h-[16px] rounded-full border border-white/20 z-10 transition-all ${wdTimelineStep >= 1 ? 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]' : 'bg-white/10'}`} />
                  <div className={`w-[16px] h-[16px] rounded-full border border-white/20 z-10 transition-all ${wdTimelineStep >= 2 ? 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]' : 'bg-white/10'}`} />
                  <div className={`w-[16px] h-[16px] rounded-full border border-white/20 z-10 transition-all ${wdTimelineStep >= 3 ? 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]' : 'bg-white/10'}`} />
                  <div className={`w-[16px] h-[16px] rounded-full border border-white/20 z-10 transition-all ${wdTimelineStep >= 4 ? 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]' : 'bg-white/10'}`} />
                </div>

                <div className="space-y-3 border-t border-white/15 pt-5">
                  <div className="flex justify-between text-[14px] text-slate-400"><span>Request Submitted</span><span className="text-white">{wdTimelineStep >= 1 ? 'Submitted' : 'Waiting'}</span></div>
                  <div className="flex justify-between text-[14px] text-slate-400"><span>Security Verification</span><span className="text-white">{wdTimelineStep >= 2 ? 'Verified' : 'Waiting'}</span></div>
                  <div className="flex justify-between text-[14px] text-slate-400"><span>Exchange Processing</span><span className="text-white">{wdTimelineStep >= 3 ? 'Processing' : 'Waiting'}</span></div>
                  <div className="flex justify-between text-[14px] text-slate-400"><span>Broadcast to Network</span><span className="text-white">{wdTimelineStep >= 4 ? 'Pending on Blockchain' : 'Waiting'}</span></div>
                </div>
              </div>
            ) : (
              <div className="relative z-10 text-center py-2">
                <div className="w-[70px] h-[70px] rounded-full border-[3px] border-blue-500 mx-auto mb-5 relative animate-[pulse_0.5s_ease]">
                  <div className="absolute w-[18px] h-[34px] border-r-[4px] border-b-[4px] border-blue-500 rotate-45 left-[22px] top-[10px]" />
                </div>
                <h2 className="text-2xl font-semibold mb-3">Transaction Verified</h2>
                <p className="text-slate-400 text-sm">
                  Withdrawal passed verification and is now pending on the blockchain network.
                </p>

                <div className="flex gap-3 mt-6">
                  <button onClick={resetWithdrawFlow} className={`flex-1 py-4 rounded-[14px] font-semibold text-[15px] bg-gradient-to-br from-blue-500 to-blue-700 text-white hover:-translate-y-[2px] hover:shadow-[0_10px_30px_rgba(59,130,246,0.45)] ${buttonFx}`}>
                    <span className="relative z-10">Make Another Transaction</span>
                  </button>
                  <button onClick={() => { setShowWithdraw(false); resetWithdrawFlow(); }} className={`flex-1 py-4 rounded-[14px] font-semibold text-[15px] border border-white/15 bg-[linear-gradient(135deg,#1e293b,#0f172a)] text-white hover:-translate-y-[2px] ${buttonFx}`}>
                    <span className="relative z-10">Return to Dashboard</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showReceive && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#030712]/92 backdrop-blur-xl" />
          <div className="relative w-full max-w-[540px] bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(255,255,255,0.03))] border border-white/20 rounded-[26px] backdrop-blur-[32px] p-8 shadow-[0_24px_70px_rgba(0,0,0,0.55)] overflow-hidden">
            <div className="absolute top-[-80px] left-[-80px] w-[220px] h-[220px] bg-blue-500/10 blur-[70px] rounded-full" />
            <button onClick={() => setShowReceive(false)} className={`absolute top-5 right-5 w-11 h-11 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center ${buttonFx}`}>
              <X size={18} className="relative z-10" />
            </button>

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-7">
                <div className="text-2xl font-semibold">Receive Crypto</div>
                <div className="text-[13px] text-slate-400">Select an asset to receive</div>
              </div>

              <div className="mb-6">
                <span className="text-[12px] uppercase tracking-[1px] text-slate-400 mb-2 block">Select Asset</span>
                <div className="flex gap-3">
                  {assets.map((coin) => (
                    <button
                      key={coin}
                      onClick={() => setReceiveCoin(coin)}
                      className={`flex-1 border rounded-[14px] px-3 py-3 flex items-center gap-3 transition-all ${
                        receiveCoin === coin
                          ? 'border-blue-500 bg-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.35)]'
                          : 'border-white/20 bg-[linear-gradient(135deg,rgba(255,255,255,.06),rgba(255,255,255,.01))] hover:border-blue-500 hover:bg-blue-500/10'
                      } ${buttonFx}`}
                    >
                      <img src={coinData?.[coin]?.image} alt={coin} className="w-[22px] h-[22px] relative z-10" />
                      <span className="relative z-10 font-medium">{coin}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <span className="text-[12px] uppercase tracking-[1px] text-slate-400 mb-2 block">Wallet Address</span>
                <div className="rounded-[16px] border border-white/20 bg-[linear-gradient(145deg,rgba(255,255,255,0.16),rgba(255,255,255,0.04))] px-4 py-4 min-h-[64px] flex items-center justify-between gap-3">
                  <div className="text-[14px] text-slate-300 break-all">
                    {selectedDepositAddress || 'Waiting for address generation'}
                  </div>

                  <button onClick={handleCopyReceiveAddress} className={`px-4 py-3 rounded-[12px] border border-white/15 bg-white/5 hover:bg-white/10 text-white flex items-center gap-2 shrink-0 ${buttonFx}`}>
                    <Copy size={16} className="relative z-10" />
                    <span className="relative z-10">Copy</span>
                  </button>
                </div>

                {copyNotice && <div className="text-[12px] text-blue-400 mt-2">{copyNotice}</div>}
              </div>

              <div className="mb-6">
                <span className="text-[12px] uppercase tracking-[1px] text-slate-400 mb-2 block">QR Code</span>
                <div className="rounded-[20px] border border-white/20 bg-[linear-gradient(145deg,rgba(255,255,255,0.10),rgba(255,255,255,0.03))] p-6 flex flex-col items-center justify-center min-h-[220px]">
                  {waitingForGeneration ? (
                    <>
                      <div className="w-[120px] h-[120px] rounded-[20px] border border-dashed border-white/20 bg-white/5 flex items-center justify-center mb-4">
                        <Wallet size={40} className="opacity-40" />
                      </div>
                      <div className="text-sm font-medium text-slate-300">Waiting for address generation</div>
                      <div className="text-[12px] text-slate-400 mt-2 text-center max-w-[280px]">
                        Once the admin panel is ready, an administrator will be able to assign a deposit address to this account.
                      </div>
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
              </div>

              <div className="rounded-[16px] border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-[12px] text-amber-200 leading-5">
                Only send <b>{receiveCoin}</b> to this deposit address. Sending unsupported assets or wrong networks may result in permanent loss of funds.
              </div>
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
            <button onClick={() => setShowNotifs(false)} className={`w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center ${buttonFx}`}>
              <X size={16} className="relative z-10" />
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
              <>
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                  <div className="text-sm font-semibold mb-1">Portfolio audit completed successfully.</div>
                  <div className="text-[11px] opacity-45">2 mins ago</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <div className="text-sm font-semibold mb-1">
                    New login detected from IP {liveUser?.ip || 'N/A'}
                  </div>
                  <div className="text-[11px] opacity-45">1 hour ago</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
