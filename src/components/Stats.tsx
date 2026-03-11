import React, { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'motion/react';

const Counter = ({ value, suffix = "" }: { value: number, suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 50, stiffness: 100 });
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.floor(latest).toLocaleString() + suffix;
      }
    });
  }, [springValue, suffix]);

  return <span ref={ref} />;
};

const stats = [
  { value: 500, suffix: "+", label: "Digital Assets Supported", sub: "Multi-chain interoperability for all major tokens" },
  { value: 100000, suffix: "+", label: "Active Wallets", sub: "Trusted by users globally" },
  { value: 99, suffix: ".9%", label: "Uptime Guarantee", sub: "Distributed node infrastructure" },
  { value: 40, suffix: "+", label: "Countries Served", sub: "Global decentralized access" }
];

const Stats = () => {
  return (
    <section className="py-20 bg-blue-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Institutional-Grade Infrastructure for Global Users</h2>
          <p className="text-blue-200 text-lg">Axcel Private Wallet provides the backbone for secure decentralized asset management.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="text-4xl font-bold text-blue-400 mb-2">
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-lg font-medium text-white mb-1">{stat.label}</div>
              {stat.sub && <div className="text-sm text-blue-200 mt-2">{stat.sub}</div>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
