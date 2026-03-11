import React, { useState } from 'react';
import { Menu, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === '/';

  return (
    <nav className="bg-white shadow-sm fixed w-full z-50 top-0 left-0 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <ShieldCheck className="h-8 w-8 text-blue-700" />
            <span className="font-bold text-xl text-slate-900 tracking-tight">CIR - Cyber Intelligence Reports</span>
          </Link>
          
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="text-slate-600 hover:text-blue-700 font-medium transition-colors">Home</Link>
            {isHome ? (
              <>
                <a href="#about" className="text-slate-600 hover:text-blue-700 font-medium transition-colors">About Us</a>
                <a href="#services" className="text-slate-600 hover:text-blue-700 font-medium transition-colors">Services</a>
                <Link to="/faq" className="text-slate-600 hover:text-blue-700 font-medium transition-colors">FAQ</Link>
                <a href="#contact" className="text-slate-600 hover:text-blue-700 font-medium transition-colors">Contact Us</a>
              </>
            ) : (
              <>
                <Link to="/#about" className="text-slate-600 hover:text-blue-700 font-medium transition-colors">About Us</Link>
                <Link to="/#services" className="text-slate-600 hover:text-blue-700 font-medium transition-colors">Services</Link>
                <Link to="/faq" className="text-slate-600 hover:text-blue-700 font-medium transition-colors">FAQ</Link>
                <Link to="/#contact" className="text-slate-600 hover:text-blue-700 font-medium transition-colors">Contact Us</Link>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="text-slate-600 hover:text-blue-700 font-medium transition-colors">Login</Link>
            <Link to="/register" className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md">
              Register
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 hover:text-slate-900 p-2">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-blue-700 hover:bg-slate-50" onClick={() => setIsOpen(false)}>Home</Link>
              <a href="/#about" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-blue-700 hover:bg-slate-50" onClick={() => setIsOpen(false)}>About Us</a>
              <a href="/#services" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-blue-700 hover:bg-slate-50" onClick={() => setIsOpen(false)}>Services</a>
              <Link to="/faq" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-blue-700 hover:bg-slate-50" onClick={() => setIsOpen(false)}>FAQ</Link>
              <a href="/#contact" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-blue-700 hover:bg-slate-50" onClick={() => setIsOpen(false)}>Contact Us</a>
              <div className="pt-4 border-t border-slate-100 mt-4 flex flex-col space-y-3">
                <Link to="/login" className="block w-full text-center px-4 py-2 text-slate-700 font-medium border border-slate-200 rounded-lg hover:bg-slate-50" onClick={() => setIsOpen(false)}>Login</Link>
                <Link to="/register" className="block w-full text-center px-4 py-2 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 shadow-sm" onClick={() => setIsOpen(false)}>Register</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
