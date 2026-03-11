import React from 'react';
import { CreditCard, Compass, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

const Features = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
          >
            Advanced Features for the Modern Crypto Economy
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            CIR - Cyber Intelligence Reports is designed to provide institutional-grade security and multi-chain interoperability for all users.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              title: "Distributed Node Infrastructure",
              desc: "Our wallet connects directly to a distributed network of nodes, ensuring high availability and censorship resistance for all your transactions.",
              icon: CreditCard,
              color: "text-blue-600",
              bg: "bg-blue-100"
            },
            {
              title: "Hardware Wallet Integration",
              desc: "Seamlessly integrate with Ledger and Trezor hardware wallets to combine the convenience of a hot wallet with the security of cold storage.",
              icon: Compass,
              color: "text-indigo-600",
              bg: "bg-indigo-100"
            },
            {
              title: "Multi-chain Interoperability",
              desc: "Manage assets across Ethereum, BSC, Polygon, and more with a single, unified interface that prioritizes speed and security.",
              icon: Clock,
              color: "text-green-600",
              bg: "bg-green-100"
            }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-slate-50 rounded-2xl p-8 hover:bg-slate-100 transition-colors border border-slate-100"
            >
              <div className={`w-12 h-12 ${feature.bg} rounded-lg flex items-center justify-center mb-6 ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <div id="about" className="mt-24 grid md:grid-cols-2 gap-12 items-center scroll-mt-28">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-20 blur-lg"></div>
            <img 
              src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2070&auto=format&fit=crop" 
              alt="Blockchain security" 
              className="relative rounded-2xl shadow-xl w-full object-cover h-96"
            />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h3 className="text-3xl font-bold text-slate-900">
              Institutional-grade security for everyone.
            </h3>
            <div className="space-y-6">
              {[
                { title: "AES-256 Encryption", desc: "Military-grade encryption for all local data storage." },
                { title: "Local Key Management", desc: "Your private keys never leave your device, ensuring total sovereignty." },
                { title: "No KYC Required", desc: "Maintain your privacy with our strict no-KYC policy for all decentralized operations." },
                { title: "Open Source Core", desc: "Our core infrastructure is open for audit, ensuring transparency and trust." }
              ].map((item, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + (idx * 0.1) }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">{item.title}</h4>
                    <p className="text-slate-600">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Features;
