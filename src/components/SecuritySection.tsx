import React from 'react';
import { Shield, Lock, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

const SecuritySection = () => {
  const securityFeatures = [
    {
      icon: <Lock className="w-8 h-8 text-blue-500" />,
      title: "AES-256 Encryption",
      description: "Your private keys are encrypted with military-grade AES-256 standards, ensuring that only you can access your funds."
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-500" />,
      title: "Local Key Storage",
      description: "Axcel never stores your keys on any server. Everything is stored locally on your device, giving you 100% control."
    },
    {
      icon: <EyeOff className="w-8 h-8 text-blue-500" />,
      title: "No KYC Policy",
      description: "We believe in true decentralization. No personal data, no ID verification, and no tracking of your transactions."
    }
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Security First Architecture</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Our non-custodial infrastructure is built on the principles of privacy, security, and user sovereignty.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="mb-6 bg-blue-50 w-16 h-16 rounded-xl flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
