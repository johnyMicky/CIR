import { ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

const Hero = () => {
  return (
    <section className="relative bg-slate-900 text-white pt-32 pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-slate-900/90 z-0"></div>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 z-0"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Secure Your Future with <span className="text-blue-400">Axcel Private Wallet</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl">
              Axcel Private Wallet provides a distributed node infrastructure and multi-chain interoperability, delivering institutional-grade security for your digital assets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a href="#contact" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all text-center">
                Get Started
              </a>
              <a href="#services" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-all text-center backdrop-blur-sm">
                Our Services
              </a>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden md:block relative"
          >
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-md p-8"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4 border-b border-slate-700 pb-4">
                  <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xl">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Secure Operations</h3>
                    <p className="text-sm text-slate-400">Advanced Digital Asset Protection</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Risk Assessment</span>
                    <span className="text-green-400 font-medium">Completed</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-full rounded-full"></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm pt-2">
                    <span className="text-slate-400">Compliance Check</span>
                    <span className="text-blue-400 font-medium">In Progress</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-3/4 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -z-10"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
