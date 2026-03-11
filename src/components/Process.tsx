import React from 'react';
import { UserPlus, MailCheck, FileSearch, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const steps = [
  {
    title: "Create Secure Wallet",
    description: "Initialize your non-custodial wallet with AES-256 encryption.",
    icon: UserPlus,
    color: "bg-blue-500"
  },
  {
    title: "Secure Your Keys",
    description: "Verify your local storage and backup your recovery phrase.",
    icon: MailCheck,
    color: "bg-indigo-500"
  },
  {
    title: "Node Synchronization",
    description: "Connect to our distributed node infrastructure for real-time data.",
    icon: FileSearch,
    color: "bg-purple-500"
  },
  {
    title: "Manage Assets",
    description: "Start managing your multi-chain portfolio with institutional security.",
    icon: CheckCircle2,
    color: "bg-green-500"
  }
];

const Process = () => {
  return (
    <section id="contact" className="py-24 bg-slate-900 text-white relative overflow-hidden scroll-mt-20">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2232&auto=format&fit=crop')] bg-cover bg-center opacity-5"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Streamlined Onboarding Process
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 max-w-2xl mx-auto"
          >
            A secure and efficient way to initialize your decentralized asset management gateway.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-slate-700 -z-10 transform -translate-y-1/2"></div>

          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative flex flex-col items-center text-center group"
            >
              <div className={`w-24 h-24 rounded-full ${step.color} flex items-center justify-center mb-6 shadow-lg shadow-blue-900/20 group-hover:scale-110 transition-transform duration-300 border-4 border-slate-800`}>
                <step.icon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed px-4">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 text-center"
        >
          <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all duration-200">
            Start Your Journey Now
            <svg className="w-5 h-5 ml-2 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Process;
