import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Send, 
  MessageCircle,
  Plus,
  X,
  Copy
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [coinData, setCoinData] = useState<Record<string, { price: number; change: number }>>({});
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState('BTC');

  // Withdraw State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawCoin, setWithdrawCoin] = useState('BTC');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Exchange State
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [exchangeFromCoin, setExchangeFromCoin] = useState('BTC');
  const [exchangeToCoin, setExchangeToCoin] = useState('USDT');
  const [exchangeAmount, setExchangeAmount] = useState('');
  const [isExchanging, setIsExchanging] = useState(false);
  const [exchangeMessage, setExchangeMessage] = useState('');

  const refreshData = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/me?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.user && data.user.btc_balance !== undefined) {
          setUserData(data.user);
        }
      }
      
      const txResponse = await fetch(`/api/transactions?userId=${user.id}`);
      if (txResponse.ok) {
        const txData = await txResponse.json();
        setTransactions(txData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,solana&vs_currencies=usd&include_24hr_change=true');
        const data = await response.json();
        setCoinData({
          BTC: { price: data.bitcoin?.usd || 0, change: data.bitcoin?.usd_24h_change || 0 },
          ETH: { price: data.ethereum?.usd || 0, change: data.ethereum?.usd_24h_change || 0 },
          USDT: { price: data.tether?.usd || 0, change: data.tether?.usd_24h_change || 0 },
          SOL: { price: data.solana?.usd || 0, change: data.solana?.usd_24h_change || 0 },
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
        setLoading(false);
      }
    };

    fetchPrices();
    // Refresh every 60 seconds
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const getPriceDisplay = (symbol: string) => {
    if (loading) return { price: 'Loading...', change: 0, changeDisplay: '...' };
    const data = coinData[symbol];
    if (!data) return { price: 'N/A', change: 0, changeDisplay: 'N/A' };
    
    return {
      price: `$${data.price.toLocaleString()}`,
      change: data.change,
      changeDisplay: `${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)}%`
    };
  };

  const btcBalance = userData?.btc_balance || 0;
  const ethBalance = userData?.eth_balance || 0;
  const usdtBalance = userData?.usdt_balance || 0;
  const solBalance = userData?.sol_balance || 0;
  const usdBalance = userData?.usd_balance || 0;

  const btcPrice = coinData['BTC']?.price || 0;
  const ethPrice = coinData['ETH']?.price || 0;
  const usdtPrice = coinData['USDT']?.price || 0;
  const solPrice = coinData['SOL']?.price || 0;

  const totalBalance = (btcBalance * btcPrice) + (ethBalance * ethPrice) + (usdtBalance * usdtPrice) + (solBalance * solPrice) + usdBalance;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !withdrawAmount || !withdrawAddress) return;

    setIsWithdrawing(true);
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount: withdrawAmount,
          currency: withdrawCoin,
          source: withdrawAddress,
          status: 'Pending',
          type: 'Withdrawal',
          created_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        setIsWithdrawModalOpen(false);
        setWithdrawAmount('');
        setWithdrawAddress('');
        refreshData();
        alert('Withdrawal request submitted successfully. It is now pending approval.');
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      alert('An error occurred while submitting the withdrawal.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleExchange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !exchangeAmount || exchangeFromCoin === exchangeToCoin) return;

    setIsExchanging(true);
    setExchangeMessage('ბოდიშს გიხდით მოთმინებისთვის, გადაცვლა პროცესშია...');

    // Simulate 2-minute processing (using 5 seconds for testing purposes or 120000 for 2 mins)
    // The user requested a 2-minute timer or imitation. Let's use 120000ms.
    setTimeout(async () => {
      try {
        // Calculate exchange rate based on current prices
        const fromPrice = coinData[exchangeFromCoin]?.price || 1;
        const toPrice = coinData[exchangeToCoin]?.price || 1;
        const amountInUsd = Number(exchangeAmount) * fromPrice;
        const toAmount = amountInUsd / toPrice;

        // Create the "out" transaction
        await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            amount: exchangeAmount,
            currency: exchangeFromCoin,
            source: `Exchange to ${exchangeToCoin}`,
            status: 'Confirmed',
            type: 'exchange_out',
            created_at: new Date().toISOString()
          })
        });

        // Create the "in" transaction
        await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            amount: toAmount.toFixed(8), // Limit decimals
            currency: exchangeToCoin,
            source: `Exchange from ${exchangeFromCoin}`,
            status: 'Confirmed',
            type: 'exchange_in',
            created_at: new Date().toISOString()
          })
        });

        setIsExchangeModalOpen(false);
        setExchangeAmount('');
        setExchangeMessage('');
        refreshData();
        alert('Exchange completed successfully!');
      } catch (error) {
        console.error('Error processing exchange:', error);
        setExchangeMessage('An error occurred during the exchange.');
      } finally {
        setIsExchanging(false);
      }
    }, 120000); // 2 minutes
  };

  const assets = [
    { 
      name: 'US Dollar', 
      symbol: 'USD', 
      amount: `$${usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
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
      icon: <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=025" alt="BTC" className="w-6 h-6" referrerPolicy="no-referrer" />, 
      color: 'text-orange-500' 
    },
    { 
      name: 'Ethereum', 
      symbol: 'ETH', 
      amount: `${ethBalance.toFixed(4)} ETH`, 
      ...getPriceDisplay('ETH'),
      icon: <img src="https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=025" alt="ETH" className="w-6 h-6" referrerPolicy="no-referrer" />, 
      color: 'text-blue-500' 
    },
    { 
      name: 'Tether', 
      symbol: 'USDT', 
      amount: `${usdtBalance.toFixed(2)} USDT`, 
      ...getPriceDisplay('USDT'),
      icon: <img src="https://cryptologos.cc/logos/tether-usdt-logo.svg?v=025" alt="USDT" className="w-6 h-6" referrerPolicy="no-referrer" />, 
      color: 'text-green-500' 
    },
    { 
      name: 'Solana', 
      symbol: 'SOL', 
      amount: `${solBalance.toFixed(4)} SOL`, 
      ...getPriceDisplay('SOL'),
      icon: '◎', 
      color: 'text-purple-500' 
    },
  ];

  if (loading || !userData) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-2">Welcome back, {user?.name || 'User'}. Here's your wallet overview.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-lg">
          <h3 className="text-lg font-medium opacity-90 mb-2">Total Wallet Balance</h3>
          <div className="text-5xl font-bold mb-2">
            ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        {/* Wallet Balance Analytics - Updated Step 2 */}
          <div className="flex items-center gap-2 text-sm font-medium bg-white/10 w-fit px-3 py-1 rounded-full animate-pulse shadow-[0_0_10px_rgba(110,231,183,0.2)]">
            <span className="text-emerald-300 font-bold">+12.4%</span>
            <span className="text-white/40 font-light">|</span>
            <span className="text-emerald-300">+$1,520.00 today</span>
        </div>
        </div>

        {/* Crypto Wallets Cards */}
        <div className="grid grid-cols-3 gap-4">
          {['BTC', 'ETH', 'USDT'].map((coin) => {
            let address = '';
            let colorClass = '';
            if (coin === 'BTC') { address = userData?.btc_address; colorClass = 'text-orange-500 bg-orange-500/10 border-orange-500/20'; }
            else if (coin === 'ETH') { address = userData?.eth_address; colorClass = 'text-blue-500 bg-blue-500/10 border-blue-500/20'; }
            else if (coin === 'USDT') { address = userData?.usdt_address; colorClass = 'text-green-500 bg-green-500/10 border-green-500/20'; }

            return (
              <div key={coin} className={`rounded-2xl p-4 border flex flex-col items-center justify-center text-center ${colorClass}`}>
                <div className="font-bold mb-2">{coin} Wallet</div>
                {address ? (
                  <>
                    <div className="bg-white p-2 rounded-lg mb-2">
                      <QRCodeSVG value={address} size={80} level="L" />
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

      {/* Action Buttons */}
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
        <button 
          className="bg-[#1a1b1e] hover:bg-[#25262b] border border-slate-800 rounded-xl p-4 flex items-center justify-center gap-3 text-white transition-all group hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
        >
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
        {/* Assets List */}
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

        {/* Transaction History */}
        <div className="lg:col-span-2 bg-[#1a1b1e] rounded-2xl border border-slate-800 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Transaction History</h3>
            <button 
              onClick={() => {
                const fetchUserData = async () => {
                  if (!user) return;
                  try {
                    const txResponse = await fetch(`/api/transactions?userId=${user.id}`);
                    if (txResponse.ok) {
                      const txData = await txResponse.json();
                      setTransactions(txData);
                    }
                  } catch (error) {
                    console.error('Error fetching transactions:', error);
                  }
                };
                fetchUserData();
              }}
              className="text-slate-400 hover:text-white transition-colors"
              title="Refresh Transactions"
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
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            tx.type === 'deposit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {tx.type === 'deposit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                          </div>
                          <span className="capitalize">{tx.type}</span>
                        </div>
                      </td>
                      <td className="py-4 font-medium">
                        {tx.type === 'deposit' ? '+' : '-'}{tx.amount} {tx.currency}
                      </td>
                      <td className="py-4 text-slate-400">{tx.source || '-'}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tx.status === 'Confirmed' ? 'bg-green-500/10 text-green-500' :
                          tx.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-4 text-right text-slate-400 text-sm">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Chat Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105">
        <MessageCircle size={28} fill="currentColor" />
      </button>

      {/* Receive Modal */}
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
                  let address = '';
                  if (selectedCoin === 'BTC') address = userData?.btc_address;
                  else if (selectedCoin === 'ETH') address = userData?.eth_address;
                  else if (selectedCoin === 'USDT') address = userData?.usdt_address;

                  if (!address) {
                    return <div className="text-slate-500 text-center py-8">No {selectedCoin} address configured. Please contact support.</div>;
                  }

                  return (
                    <>
                      <QRCodeSVG value={address} size={200} level="H" includeMargin={true} />
                      <p className="mt-4 text-slate-900 font-mono text-sm break-all text-center">
                        {address}
                      </p>
                    </>
                  );
                })()}
              </div>

              {(() => {
                let address = '';
                if (selectedCoin === 'BTC') address = userData?.btc_address;
                else if (selectedCoin === 'ETH') address = userData?.eth_address;
                else if (selectedCoin === 'USDT') address = userData?.usdt_address;

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

      {/* Withdraw Modal */}
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
                <label className="block text-sm font-medium text-slate-400 mb-2">Amount ({withdrawCoin})</label>
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

      {/* Exchange Modal */}
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
                <label className="block text-sm font-medium text-slate-400 mb-2">Amount ({exchangeFromCoin})</label>
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

              {exchangeAmount && !isNaN(Number(exchangeAmount)) && exchangeFromCoin !== exchangeToCoin && (
                <div className="mb-6 p-4 bg-slate-800 rounded-xl text-sm">
                  <div className="flex justify-between text-slate-400 mb-2">
                    <span>Exchange Rate</span>
                    <span>1 {exchangeFromCoin} ≈ {((coinData[exchangeFromCoin]?.price || 1) / (coinData[exchangeToCoin]?.price || 1)).toFixed(6)} {exchangeToCoin}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 mb-2">
                    <span>Fee (0.001%)</span>
                    <span>{(Number(exchangeAmount) * 0.00001).toFixed(8)} {exchangeFromCoin}</span>
                  </div>
                  <div className="flex justify-between text-white font-medium pt-2 border-t border-slate-700">
                    <span>You will receive</span>
                    <span>{((Number(exchangeAmount) * 0.99999) * ((coinData[exchangeFromCoin]?.price || 1) / (coinData[exchangeToCoin]?.price || 1))).toFixed(8)} {exchangeToCoin}</span>
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
    </div>
  );
};

export default Dashboard;
