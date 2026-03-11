import React from 'react';
import { motion } from 'motion/react';
import { Hourglass } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image Section */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" 
                alt="CIR Team" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-blue-900/10"></div>
            </div>
            {/* Decorative pattern */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-100 rounded-full -z-10 blur-3xl"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-100 rounded-full -z-10 blur-3xl"></div>
          </motion.div>

          {/* Content Section */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-1 w-8 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-medium tracking-wide uppercase text-sm">Welcome to Axcel Private Wallet</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                Empowering users with distributed node infrastructure and multi-chain interoperability.
              </h2>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-green-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                  <Hourglass className="w-7 h-7" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-slate-900">Excellence in Decentralized Infrastructure</h3>
                <p className="text-slate-600 leading-relaxed">
                  Axcel Private Wallet develops advanced methodologies for secure asset management and hardware wallet integration support. Our goal is to promote transparency, responsible practices, and clarity within the digital asset environment by applying modern analytical tools and industry knowledge.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  We assist individuals and institutions through structured non-custodial solutions, ensuring that your digital interactions are protected by military-grade encryption and local key storage.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
