import React, { useEffect, useMemo, useState } from 'react';
import { ref, onValue, push, set, update } from 'firebase/database';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  MessageCircle,
  X,
  Copy
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth() as any;

  const [coinData, setCoinData] = useState<Record<string, { price: number; change: number }>>({});
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState('BTC');

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawCoin, setWithdrawCoin] = useState('BTC');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [exchangeFromCoin, setExchangeFromCoin] = useState('BTC');
  const [exchangeToCoin, setExchangeToCoin] = useState('USDT');
  const [exchangeAmount, setExchangeAmount] = useState('');
  const [isExchanging, setIsExchanging] = useState(false);
  const [exchangeMessage, setExchangeMessage] = useState('');

  const getQrUrl = (value: string) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(value)}`;

  useEffect(() => {
    if (!user?.id) return;

    const userRef = ref(db, `users/${user.id}`);
    const unsubscribeUser = onValue(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setUserData(snapshot.val());
        } else {
          setUserData(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('User read error:', error);
        setLoading(false);
      }
    );

    const txRef = ref(db, `transactions/${user.id}`);
    const unsubscribeTx = onValue(
      txRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const rows = Object.entries(snapshot.val()).map(([id, value]) => ({
            id,
            ...(value as any)
          }));

          rows.sort(
            (a: any, b: any) =>
              new Date(b.created_at || b.timestamp || 0).getTime() -
              new Date(a.created_at || a.timestamp || 0).getTime()
          );

          setTransactions(rows);
        } else {
          setTransactions([]);
        }
      },
      (error) => {
        console.error('Transactions read error:', error);
        setTransactions([]);
      }
    );

    return () => {
      unsubscribeUser();
      unsubscribeTx();
    };
  }, [user?.id]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,solana&vs_currencies=usd&include_24hr_change=true'
        );
        const data = await response.json();

        setCoinData({
          BTC: { price: data.bitcoin?.usd || 0, change: data.bitcoin?.usd_24h_change || 0 },
          ETH: { price: data.ethereum?.usd || 0, change: data.ethereum?.usd_24h_change || 0 },
          USDT: { price: data.tether?.usd || 0, change: data.tether?.usd_24h_change || 0 },
          SOL: { price: data.solana?.usd || 0, change: data.solana?.usd_24h_change || 0 }
        });
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const getPriceDisplay = (symbol: string) => {
    const data = coinData[symbol];
    if (!data) return { price: 'N/A', change: 0, changeDisplay: 'N/A' };

    return {
      price: `$${data.price.toLocaleString()}`,
      change: data.change,
      changeDisplay: `${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)}%`
    };
  };

  const getAddressByCoin = (coin: string) => {
    const addresses = userData?.depositAddresses || {};
    return addresses?.[coin] || '';
  };

  const wallets = userData?.wallets || {};

  const btcBalance = Number(wallets?.BTC || 0);
  const ethBalance = Number(wallets?.ETH || 0);
  const usdtBalance = Number(wallets?.USDT || 0);
  const solBalance = Number(wallets?.SOL || 0);
  const usdBalance = Number(userData?.balance || 0);

  const btcPrice = Number(coinData['BTC']?.price || 0);
  const ethPrice = Number(coinData['ETH']?.price || 0);
  const usdtPrice = Number(coinData['USDT']?.price || 0);
  const solPrice = Number(coinData['SOL']?.price || 0);

  const totalBalance = useMemo(() => {
    return (
      btcBalance * btcPrice +
      ethBalance * ethPrice +
      usdtBalance * usdtPrice +
      solBalance * solPrice +
      usdBalance
    );
  }, [btcBalance, ethBalance, usdtBalance, solBalance, btcPrice, ethPrice, usdtPrice, solPrice, usdBalance]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !withdrawAmount || !withdrawAddress) return;

    setIsWithdrawing(true);

    try {
      const txRef = push(ref(db, `transactions/${user.id}`));

      await set(txRef, {
        amount: withdrawAmount,
        currency: withdrawCoin,
        source: withdrawAddress,
        status: 'Pending',
        type: 'withdrawal',
        created_at: new Date().toISOString(),
        timestamp: Date.now()
      });

      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
      setWithdrawAddress('');
      alert('Withdrawal request submitted successfully. It is now pending approval.');
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      alert('An error occurred while submitting the withdrawal.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleExchange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !exchangeAmount || exchangeFromCoin === exchangeToCoin || !userData) return;

    setIsExchanging(true);
    setExchangeMessage('ბოდიშს გიხდით მოთმინებისთვის, გადაცვლა პროცესშია...');

    setTimeout(async () => {
      try {
        const fromPrice = coinData[exchangeFromCoin]?.price || 1;
        const toPrice = coinData[exchangeToCoin]?.price || 1;
        const amountNum = Number(exchangeAmount || 0);

        if (!amountNum) {
          throw new Error('Invalid exchange amount');
        }

        const amountInUsd = amountNum * fromPrice;
        const toAmount = amountInUsd / toPrice;
        const finalToAmount = Number((toAmount * 0.99999).toFixed(8));

        const currentFromBalance = Number(userData?.wallets?.[exchangeFromCoin] || 0);
        const currentToBalance = Number(userData?.wallets?.[exchangeToCoin] || 0);

        if (currentFromBalance < amountNum) {
          alert('Insufficient balance for exchange.');
          setIsExchanging(false);
          setExchangeMessage('');
          return;
        }

        const updates: any = {};
        updates[`users/${user.id}/wallets/${exchangeFromCoin}`] = currentFromBalance - amountNum;
        updates[`users/${user.id}/wallets/${exchangeToCoin}`] = currentToBalance + finalToAmount;

        await update(ref(db), updates);

        const txOutRef = push(ref(db, `transactions/${user.id}`));
        await set(txOutRef, {
          amount: amountNum,
          currency: exchangeFromCoin,
          source: `Exchange to ${exchangeToCoin}`,
          status: 'Confirmed',
          type: 'exchange_out',
          created_at: new Date().toISOString(),
          timestamp: Date.now()
        });

        const txInRef = push(ref(db, `transactions/${user.id}`));
        await set(txInRef, {
          amount: finalToAmount,
          currency: exchangeToCoin,
          source: `Exchange from ${exchangeFromCoin}`,
          status: 'Confirmed',
          type: 'exchange_in',
          created_at: new Date().toISOString(),
          timestamp: Date.now()
        });

        setIsExchangeModalOpen(false);
        setExchangeAmount('');
        setExchangeMessage('');
        alert('Exchange completed successfully!');
      } catch (error) {
        console.error('Error processing exchange:', error);
        setExchangeMessage('An error occurred during the exchange.');
      } finally {
        setIsExchanging(false);
      }
    }, 4000);
  };

  const assets = [
    {
      name: 'US Dollar',
      symbol: 'USD',
      amount: `$${usdBalance.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`,
      price: '$1.00',
      change: 0,
      changeDisplay: '0.00%',
      icon: '$',
      color: 'text-green-600'
    },
    {
      name: 'Bitcoin',
      symbol: 'BTC',
      amount: `${btcBalance.toFixed(8)} BTC`,
      ...getPriceDisplay('BTC'),
      icon: (
        <img
          src="https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=025"
          alt="BTC"
          className="w-6 h-6"
          referrerPolicy="no-referrer"
        />
      ),
      color: 'text-orange-500'
    },
    {
      name: 'Ethereum',
      symbol: 'ETH',
      amount: `${ethBalance.toFixed(4)} ETH`,
      ...getPriceDisplay('ETH'),
      icon: (
        <img
          src="https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=025"
          alt="ETH"
          className="w-6 h-6"
          referrerPolicy="no-referrer"
        />
      ),
      color: 'text-blue-500'
    },
    {
      name: 'Tether',
      symbol: 'USDT',
      amount: `${usdtBalance.toFixed(2)} USDT`,
      ...getPriceDisplay('USDT'),
      icon: (
        <img
          src="https://cryptologos.cc/logos/tether-usdt-logo.svg?v=025"
          alt="USDT"
          className="w-6 h-6"
          referrerPolicy="no-referrer"
        />
      ),
      color: 'text-green-500'
    },
    {
      name: 'Solana',
      symbol: 'SOL',
      amount: `${solBalance.toFixed(4)} SOL`,
      ...getPriceDisplay('SOL'),
      icon: '◎',
      color: 'text-purple-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="bg-[#1a1b1e] border border-slate-800 rounded-2xl p-8 text-center max-w-lg w-full">
          <h2 className="text-2xl font-bold text-white mb-3">User profile not found</h2>
          <p className="text-slate-400 mb-6">
            Authentication worked, but no matching user record was found in Realtime Database.
          </p>
          <div className="text-slate-500 text-sm break-all">{user?.email || user?.id}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-2">
          Welcome back, {userData?.firstName || user?.name || user?.email || 'User'}. Here's your wallet overview.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-lg">
          <h3 className="text-lg font-medium opacity-90 mb-2">Total Wallet Balance</h3>
          <div className="text-5xl font-bold mb-2">
            ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>

          <div className="flex items-center gap-2 text-sm font-medium bg-white/10 w-fit px-3 py-1 rounded-full animate-pulse shadow-[0_0_10px_rgba(110,231,183,0.2)]">
            <span className="text-emerald-300 font-bold">+12.4%</span>
            <span className="text-white/40 font-light">|</span>
            <span className="text-emerald-300">+$1,520.00 today</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {['BTC', 'ETH', 'USDT'].map((coin) => {
            const address = getAddressByCoin(coin);

            let colorClass = '';
            if (coin === 'BTC') colorClass = 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            else if (coin === 'ETH') colorClass = 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            else if (coin === 'USDT') colorClass = 'text-green-500 bg-green-500/10 border-green-500/20';

            return (
              <div
                key={coin}
                className={`rounded-2xl p-4 border flex flex-col items-center justify-center text-center ${colorClass}`}
              >
                <div className="font-bold mb-2">{coin} Wallet</div>

                {address ? (
                  <>
                    <div className="bg-white p-2 rounded-lg mb-2">
                      <img src={getQrUrl(address)} alt={`${coin} QR`} className="w-20 h-20 rounded" />
                    </div>
                    <div className="text-[10px] font-mono break-all opacity-80 w-full px-1">
                      {address}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-xs opacity-70 italic">Address pending...</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setIsWithdrawModalOpen(true)}
          className="bg-[#1a1b1e] hover:bg-[#25262b] border border-slate-800 rounded-xl p-4 flex items-center justify-center gap-3 text-white transition-all group hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
        >
          <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
            <CreditCard className="text-blue-500" size={20} />
          </div>
          <span className="font-medium">Withdraw</span>
        </button>

        <button className="bg-[#1a1b1e] hover:bg-[#25262b] border border-slate-800 rounded-xl p-4 flex items-center justify-center gap-3 text-white transition-all group hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]">
          <div className="p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
            <ArrowUpRight className="text-red-500" size={20} />
          </div>
          <span className="font-medium">Send</span>
        </button>

        <button
          onClick={() => setIsReceiveModalOpen(true)}
          className="bg-[#1a1b1e] hover:bg-[#25262b] border border-slate-800 rounded-xl p-4 flex items-center justify-center gap-3 text-white transition-all group hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]"
        >
          <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
            <ArrowDownLeft className="text-green-500" size={20} />
          </div>
          <span className="font-medium">Receive</span>
        </button>

        <button
          onClick={() => setIsExchangeModalOpen(true)}
          className="bg-[#1a1b1e] hover:bg-[#25262b] border border-slate-800 rounded-xl p-4 flex items-center justify-center gap-3 text-white transition-all group hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
        >
          <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
            <RefreshCw className="text-purple-500" size={20} />
          </div>
          <span className="font-medium">Exchange</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-[#1a1b1e] rounded-2xl border border-slate-800 p-6">
          <h3 className="text-lg font-bold text-white mb-6">Your Assets</h3>
          <div className="space-y-6">
            {assets.map((asset) => (
              <div key={asset.symbol} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg font-bold ${asset.color}`}>
                    {asset.icon}
                  </div>
                  <div>
                    <div className="font-medium text-white">{asset.name}</div>
                    <div className="text-sm text-slate-500">{asset.amount}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-medium text-white">{asset.price}</div>
                  <div className={`text-sm ${asset.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {asset.changeDisplay}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#1a1b1e] rounded-2xl border border-slate-800 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Transaction History</h3>
            <button
              onClick={() => {}}
              className="text-slate-400 hover:text-white transition-colors"
              title="Transactions auto-refresh from Firebase"
            >
              <RefreshCw size={18} />
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 py-12">
              No transactions yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-sm border-b border-slate-800">
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Source</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="text-white">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-slate-800/50 last:border-0">
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              tx.type === 'deposit' || tx.type === 'exchange_in'
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-red-500/10 text-red-500'
                            }`}
                          >
                            {tx.type === 'deposit' || tx.type === 'exchange_in' ? (
                              <ArrowDownLeft size={16} />
                            ) : (
                              <ArrowUpRight size={16} />
                            )}
                          </div>
                          <span className="capitalize">{tx.type}</span>
                        </div>
                      </td>

                      <td className="py-4 font-medium">
                        {tx.type === 'deposit' || tx.type === 'exchange_in' ? '+' : '-'}
                        {tx.amount} {tx.currency}
                      </td>

                      <td className="py-4 text-slate-400">{tx.source || '-'}</td>

                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tx.status === 'Confirmed'
                              ? 'bg-green-500/10 text-green-500'
                              : tx.status === 'Pending'
                              ? 'bg-yellow-500/10 text-yellow-500'
                              : 'bg-red-500/10 text-red-500'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>

                      <td className="py-4 text-right text-slate-400 text-sm">
                        {tx.created_at
                          ? new Date(tx.created_at).toLocaleDateString()
                          : tx.timestamp
                          ? new Date(tx.timestamp).toLocaleDateString()
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <button className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105">
        <MessageCircle size={28} fill="currentColor" />
      </button>

      {isReceiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1b1e] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">Receive Crypto</h3>
              <button
                onClick={() => setIsReceiveModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['BTC', 'ETH', 'USDT'].map((coin) => (
                  <button
                    key={coin}
                    onClick={() => setSelectedCoin(coin)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                      selectedCoin === coin
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {coin}
                  </button>
                ))}
              </div>

              <div className="flex flex-col items-center justify-center bg-white p-6 rounded-xl mb-6">
                {(() => {
                  const address = getAddressByCoin(selectedCoin);

                  if (!address) {
                    return (
                      <div className="text-slate-500 text-center py-8">
                        No {selectedCoin} address configured. Please contact support.
                      </div>
                    );
                  }

                  return (
                    <>
                      <img src={getQrUrl(address)} alt={`${selectedCoin} QR`} className="w-[200px] h-[200px] rounded" />
                      <p className="mt-4 text-slate-900 font-mono text-sm break-all text-center">
                        {address}
                      </p>
                    </>
                  );
                })()}
              </div>

              {(() => {
                const address = getAddressByCoin(selectedCoin);

                if (address) {
                  return (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(address);
                        alert('Address copied to clipboard!');
                      }}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Copy size={18} />
                      Copy Address
                    </button>
                  );
                }

                return null;
              })()}

              <p className="text-center text-slate-500 text-sm mt-4">
                Send only {selectedCoin} to this address. Sending any other coins may result in permanent loss.
              </p>
            </div>
          </div>
        </div>
      )}

      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1b1e] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">Withdraw Crypto</h3>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
                disabled={isWithdrawing}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-2">Select Asset</label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {['BTC', 'ETH', 'USDT'].map((coin) => (
                    <button
                      key={coin}
                      type="button"
                      onClick={() => setWithdrawCoin(coin)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                        withdrawCoin === coin
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {coin}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Amount ({withdrawCoin})
                </label>
                <input
                  type="number"
                  step="any"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-400 mb-2">Destination Address</label>
                <input
                  type="text"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder={`Enter ${withdrawCoin} address`}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isWithdrawing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-colors"
              >
                {isWithdrawing ? 'Submitting...' : 'Submit Withdrawal'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isExchangeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1b1e] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">Exchange Crypto</h3>
              <button
                onClick={() => {
                  if (!isExchanging) setIsExchangeModalOpen(false);
                }}
                className="text-slate-400 hover:text-white transition-colors"
                disabled={isExchanging}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleExchange} className="p-6">
              {exchangeMessage && (
                <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-sm text-center">
                  {exchangeMessage}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-2">From</label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {['BTC', 'ETH', 'USDT'].map((coin) => (
                    <button
                      key={coin}
                      type="button"
                      onClick={() => setExchangeFromCoin(coin)}
                      disabled={isExchanging}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                        exchangeFromCoin === coin
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {coin}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Amount ({exchangeFromCoin})
                </label>
                <input
                  type="number"
                  step="any"
                  value={exchangeAmount}
                  onChange={(e) => setExchangeAmount(e.target.value)}
                  disabled={isExchanging}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-400 mb-2">To</label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {['BTC', 'ETH', 'USDT'].map((coin) => (
                    <button
                      key={coin}
                      type="button"
                      onClick={() => setExchangeToCoin(coin)}
                      disabled={isExchanging}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                        exchangeToCoin === coin
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {coin}
                    </button>
                  ))}
                </div>
              </div>

              {exchangeAmount &&
                !isNaN(Number(exchangeAmount)) &&
                exchangeFromCoin !== exchangeToCoin && (
                  <div className="mb-6 p-4 bg-slate-800 rounded-xl text-sm">
                    <div className="flex justify-between text-slate-400 mb-2">
                      <span>Exchange Rate</span>
                      <span>
                        1 {exchangeFromCoin} ≈{' '}
                        {(
                          (coinData[exchangeFromCoin]?.price || 1) /
                          (coinData[exchangeToCoin]?.price || 1)
                        ).toFixed(6)}{' '}
                        {exchangeToCoin}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-400 mb-2">
                      <span>Fee (0.001%)</span>
                      <span>{(Number(exchangeAmount) * 0.00001).toFixed(8)} {exchangeFromCoin}</span>
                    </div>

                    <div className="flex justify-between text-white font-medium pt-2 border-t border-slate-700">
                      <span>You will receive</span>
                      <span>
                        {(
                          Number(exchangeAmount) *
                          0.99999 *
                          ((coinData[exchangeFromCoin]?.price || 1) /
                            (coinData[exchangeToCoin]?.price || 1))
                        ).toFixed(8)}{' '}
                        {exchangeToCoin}
                      </span>
                    </div>
                  </div>
                )}

              <button
                type="submit"
                disabled={isExchanging || exchangeFromCoin === exchangeToCoin}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-colors"
              >
                {isExchanging ? 'Processing...' : 'Exchange'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="pt-4">
        <Link to="/" className="text-slate-400 hover:text-white transition-colors text-sm">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
