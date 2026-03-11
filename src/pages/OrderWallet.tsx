import React from 'react';
import { Wallet, ShoppingBag, Truck, CheckCircle } from 'lucide-react';

const OrderWallet = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Order Trezor Wallet</h1>
        <p className="text-slate-400 mt-2">Secure your assets with the world's most trusted hardware wallet.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#1a1b1e] rounded-2xl border border-slate-800 overflow-hidden">
          <div className="h-64 bg-slate-800 flex items-center justify-center">
            <Wallet size={120} className="text-slate-600" />
          </div>
          <div className="p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white">Trezor Safe 3</h3>
                <p className="text-slate-400">The next-generation hardware wallet.</p>
              </div>
              <div className="text-2xl font-bold text-white">$79</div>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-slate-300">
                <CheckCircle size={18} className="text-green-500" />
                <span>Secure Element (EAL6+)</span>
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <CheckCircle size={18} className="text-green-500" />
                <span>Open-source design</span>
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <CheckCircle size={18} className="text-green-500" />
                <span>Device entry passphrase</span>
              </li>
            </ul>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2">
              <ShoppingBag size={20} />
              Add to Cart
            </button>
          </div>
        </div>

        <div className="bg-[#1a1b1e] rounded-2xl border border-slate-800 overflow-hidden">
          <div className="h-64 bg-slate-800 flex items-center justify-center">
            <Wallet size={120} className="text-slate-600" />
          </div>
          <div className="p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white">Trezor Model T</h3>
                <p className="text-slate-400">The premium choice for crypto security.</p>
              </div>
              <div className="text-2xl font-bold text-white">$179</div>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-slate-300">
                <CheckCircle size={18} className="text-green-500" />
                <span>Large color touchscreen</span>
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <CheckCircle size={18} className="text-green-500" />
                <span>Shamir Backup</span>
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <CheckCircle size={18} className="text-green-500" />
                <span>FIDO2 authentication</span>
              </li>
            </ul>

            <button className="w-full bg-white hover:bg-slate-100 text-slate-900 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2">
              <ShoppingBag size={20} />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderWallet;
