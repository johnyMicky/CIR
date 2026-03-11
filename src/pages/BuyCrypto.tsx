import React, { useState } from 'react';
import { Bitcoin, CreditCard, ArrowRight } from 'lucide-react';

const BuyCrypto = () => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [crypto, setCrypto] = useState('BTC');

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Buy Crypto</h1>
        <p className="text-slate-400 mt-2">Purchase cryptocurrency instantly with your card or bank transfer.</p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="bg-[#1a1b1e] rounded-2xl border border-slate-800 p-8 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white">Buy</h2>
            <div className="flex bg-[#25262b] rounded-lg p-1">
              <button className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md font-medium shadow-sm">Buy</button>
              <button className="px-4 py-1.5 text-sm text-slate-400 font-medium hover:text-white">Sell</button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">You Pay</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#25262b] border border-slate-700 rounded-xl px-4 py-4 text-white text-lg focus:outline-none focus:border-blue-500"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <select 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-transparent text-white font-bold focus:outline-none"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                <ArrowRight className="text-slate-400 transform rotate-90" size={20} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">You Receive</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount ? (parseFloat(amount) / 65000).toFixed(8) : ''}
                  readOnly
                  placeholder="0.00"
                  className="w-full bg-[#25262b] border border-slate-700 rounded-xl px-4 py-4 text-white text-lg focus:outline-none focus:border-blue-500"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  <Bitcoin className="text-orange-500" size={20} />
                  <select 
                    value={crypto}
                    onChange={(e) => setCrypto(e.target.value)}
                    className="bg-transparent text-white font-bold focus:outline-none"
                  >
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                    <option value="SOL">SOL</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>Payment Method</span>
                <span className="text-white flex items-center gap-1">
                  <CreditCard size={14} />
                  Visa ending in 4242
                </span>
              </div>
              <div className="flex justify-between text-sm text-slate-400 mb-6">
                <span>Fees</span>
                <span className="text-white">$0.00</span>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-blue-900/20">
                Buy Bitcoin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyCrypto;
