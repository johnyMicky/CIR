import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp, TrendingDown, Search } from 'lucide-react';

const CryptoAssets = () => {
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<any[]>([]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false');
        const data = await response.json();
        setAssets(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching crypto assets:', error);
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Crypto Assets</h1>
        <p className="text-slate-400 mt-2">Track market prices and manage your portfolio.</p>
      </div>

      <div className="bg-[#1a1b1e] rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Market Overview</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search assets..." 
              className="bg-[#25262b] border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-sm border-b border-slate-800 bg-[#25262b]">
                  <th className="px-6 py-4 font-medium">Asset</th>
                  <th className="px-6 py-4 font-medium text-right">Price</th>
                  <th className="px-6 py-4 font-medium text-right">24h Change</th>
                  <th className="px-6 py-4 font-medium text-right">Market Cap</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {assets.map((asset) => (
                  <tr key={asset.id} className="border-b border-slate-800 hover:bg-[#25262b] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={asset.image} alt={asset.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <div className="font-medium">{asset.name}</div>
                          <div className="text-xs text-slate-500 uppercase">{asset.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      ${asset.current_price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`flex items-center justify-end gap-1 ${asset.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {asset.price_change_percentage_24h >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {Math.abs(asset.price_change_percentage_24h).toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-400">
                      ${(asset.market_cap / 1000000000).toFixed(2)}B
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-500 hover:text-blue-400 font-medium text-sm">Trade</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoAssets;
