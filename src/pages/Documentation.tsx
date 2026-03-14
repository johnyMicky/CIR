import React from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  ShieldCheck,
  BookOpen,
  ChevronRight,
  Layers3,
  Info,
  Lock,
  Coins,
  Eye,
} from "lucide-react";

const docSections = [
  {
    title: "Overview",
    text: "Axcelci is a next-generation non-custodial digital asset management platform designed to provide seamless interaction with blockchain networks. Our mission is to bridge the gap between complex decentralized protocols and user-friendly financial management.",
    icon: <Info size={18} />,
  },
  {
    title: "Architecture",
    text: "Built on a multi-layer security stack, utilizing industry-standard encryption protocols (AES-256) for data protection.",
    icon: <Layers3 size={18} />,
  },
  {
    title: "Asset Support",
    text: "Native integration for Bitcoin (BTC), Ethereum (ETH), and USDT (ERC-20/TRC-20) ecosystems.",
    icon: <Coins size={18} />,
  },
  {
    title: "Security",
    text: "Our infrastructure implements automated smart-contract auditing and real-time transaction monitoring to prevent unauthorized access.",
    icon: <ShieldCheck size={18} />,
  },
  {
    title: "Transparency",
    text: 'Axcelci operates under a strict "No-Log" policy regarding private keys. User keys are encrypted locally, ensuring that the platform never has access to user funds.',
    icon: <Eye size={18} />,
  },
];

const Documentation = () => {
  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-120px] left-[8%] h-[360px] w-[360px] rounded-full bg-blue-600/10 blur-[90px]" />
        <div className="absolute bottom-[-140px] right-[6%] h-[320px] w-[320px] rounded-full bg-cyan-500/10 blur-[90px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="mb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 hover:bg-white/[0.07]"
          >
            <ChevronRight size={14} className="rotate-180" />
            Back to home
          </Link>
        </div>

        <section className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-7 shadow-[0_18px_50px_rgba(0,0,0,0.22)] md:p-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-blue-300">
                <FileText size={14} />
                Documentation
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">
                Axcelci Digital Assets Infrastructure
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-300 md:text-lg">
                This documentation page outlines the Axcelci platform foundation,
                infrastructure design principles, asset support scope, and core
                transparency commitments.
              </p>
            </div>

            <div className="rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 px-5 py-4">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300/80">
                Status
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                <ShieldCheck size={16} />
                Documentation page active
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          {docSections.map((item) => (
            <div
              key={item.title}
              className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,#0b1220_0%,#0d1628_100%)] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
                  {item.icon}
                </div>
                <div className="text-xl font-black tracking-tight">{item.title}</div>
              </div>

              <p className="text-sm leading-relaxed text-slate-400 md:text-base">
                {item.text}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-[32px] border border-white/8 bg-black/20 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.18)] md:p-8">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">
            Core Technology
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
              <div className="mb-3 flex items-center gap-2 text-cyan-300">
                <Layers3 size={16} />
                <span className="text-sm font-semibold">Architecture</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                Multi-layer security stack with AES-256 based protection for sensitive
                platform-side data handling.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
              <div className="mb-3 flex items-center gap-2 text-cyan-300">
                <BookOpen size={16} />
                <span className="text-sm font-semibold">Asset Ecosystems</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                Native support focus across BTC, ETH and USDT environments including
                ERC-20 and TRC-20 compatible transaction visibility.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
              <div className="mb-3 flex items-center gap-2 text-cyan-300">
                <Lock size={16} />
                <span className="text-sm font-semibold">Local Key Protection</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                User keys remain encrypted locally under a transparency-oriented access
                model designed to avoid direct platform control over client funds.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Documentation;
