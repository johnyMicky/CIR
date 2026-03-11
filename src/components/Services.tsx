import React from 'react';
import { ShieldAlert, SearchCheck, FileSearch, FileText } from 'lucide-react';
import { motion } from 'motion/react';

const services = [
  {
    title: "Multi-chain Interoperability",
    description: "Seamlessly manage assets across multiple blockchains including Ethereum, Binance Smart Chain, and Polygon with a single decentralized interface.",
    icon: ShieldAlert,
    color: "text-red-500",
    bg: "bg-red-50"
  },
  {
    title: "Hardware Wallet Support",
    description: "Integrate your Ledger or Trezor hardware wallets for an extra layer of security, combining cold storage with our intuitive interface.",
    icon: SearchCheck,
    color: "text-blue-500",
    bg: "bg-blue-50"
  },
  {
    title: "Distributed Node Infrastructure",
    description: "Our wallet connects directly to a distributed network of nodes, ensuring high availability and censorship resistance for all your transactions.",
    icon: FileSearch,
    color: "text-indigo-500",
    bg: "bg-indigo-50"
  },
  {
    title: "Institutional-Grade Security",
    description: "Benefit from military-grade AES-256 encryption and local key storage, providing the highest level of protection for your digital asset portfolio.",
    icon: FileText,
    color: "text-green-500",
    bg: "bg-green-50"
  }
];

const Services = () => {
  return (
    <section id="services" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
          >
            Our Core Services
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Comprehensive solutions for navigating the complexities of digital assets and blockchain transactions.
          </motion.p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-8 border border-slate-100"
            >
              <div className={`w-14 h-14 rounded-lg ${service.bg} flex items-center justify-center mb-6`}>
                <service.icon className={`w-7 h-7 ${service.color}`} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
