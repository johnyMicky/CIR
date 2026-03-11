import React from 'react';
import { ShieldCheck, Mail, MapPin, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-white">
              <ShieldCheck className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl tracking-tight">CIR - Cyber Intelligence Reports</span>
            </div>
            <p className="text-sm leading-relaxed">
              The most secure, non-custodial decentralized gateway to manage 500+ digital assets with military-grade encryption. Manage your portfolio with complete privacy and institutional-grade security.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-6">Product</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/#hero" className="hover:text-blue-500 transition-colors">Mobile Wallet</Link></li>
              <li><Link to="/#hero" className="hover:text-blue-500 transition-colors">Browser Extension</Link></li>
              <li><Link to="/dashboard" className="hover:text-blue-500 transition-colors">Exchange</Link></li>
              <li><Link to="/login" className="hover:text-blue-500 transition-colors">Login</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-6">Support</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/faq" className="hover:text-blue-500 transition-colors">Help Center</Link></li>
              <li><Link to="/#services" className="hover:text-blue-500 transition-colors">Asset Status</Link></li>
              <li><Link to="/contact" className="hover:text-blue-500 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-6">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/privacy-policy" className="hover:text-blue-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-blue-500 transition-colors">Terms of Service</Link></li>
              <li><Link to="/company-policy" className="hover:text-blue-500 transition-colors">Security Audit</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>Copyright © 2025 CIR - Cyber Intelligence Reports All Rights Reserved</p>
          <div className="flex gap-6">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</a>
            <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Telegram</a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Discord</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
