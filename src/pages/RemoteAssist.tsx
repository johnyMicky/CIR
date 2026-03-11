import React from 'react';
import { Monitor, ShieldCheck, Headphones } from 'lucide-react';

const RemoteAssist = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Expert Remote Assist</h1>
        <p className="text-slate-400 mt-2">Get real-time help with your wallet setup and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#1a1b1e] rounded-xl border border-slate-800 p-6">
          <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
            <ShieldCheck className="text-blue-500" size={24} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Security Audit</h3>
          <p className="text-slate-400 mb-4">
            Let our experts review your security settings and wallet configuration to ensure maximum protection.
          </p>
          <button className="text-blue-500 font-medium hover:text-blue-400 transition-colors">
            Request Audit &rarr;
          </button>
        </div>

        <div className="bg-[#1a1b1e] rounded-xl border border-slate-800 p-6">
          <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
            <Headphones className="text-purple-500" size={24} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Live Support</h3>
          <p className="text-slate-400 mb-4">
            Connect with a support agent for immediate assistance with transactions or technical issues.
          </p>
          <button className="text-purple-500 font-medium hover:text-purple-400 transition-colors">
            Start Chat &rarr;
          </button>
        </div>
      </div>

      <div className="bg-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-4">Need urgent help?</h2>
          <p className="text-blue-100 mb-6 max-w-xl">
            Our remote assistance team is available 24/7 to help you resolve critical issues securely.
          </p>
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors">
            Connect Now
          </button>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
          <Monitor size={300} />
        </div>
      </div>
    </div>
  );
};

export default RemoteAssist;
