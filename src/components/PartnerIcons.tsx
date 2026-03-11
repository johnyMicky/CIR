import React from 'react';
import { Wallet, Globe, Zap, Layers } from 'lucide-react';

const PartnerIcons = () => {
  const partners = [
    { name: "Binance Smart Chain", icon: <Zap className="w-6 h-6 text-yellow-500" /> },
    { name: "Ethereum", icon: <Globe className="w-6 h-6 text-blue-500" /> },
    { name: "Polygon", icon: <Layers className="w-6 h-6 text-purple-500" /> },
    { name: "WalletConnect", icon: <Wallet className="w-6 h-6 text-blue-400" /> }
  ];

  return (
    <div className="bg-white py-12 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all">
          {partners.map((partner, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-lg">
                {partner.icon}
              </div>
              <span className="font-bold text-slate-900 tracking-tight text-lg">{partner.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartnerIcons;
