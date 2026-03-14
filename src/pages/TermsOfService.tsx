import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, AlertTriangle, Lock, Scale, Mail } from 'lucide-react';

const sections = [
  {
    icon: FileText,
    title: '1. Acceptance of Terms',
    text: `By accessing or using Axcel Private Wallet, you confirm that you are at least 18 years old and agree to comply with all applicable laws, regulations, and platform requirements. If you do not agree with these Terms, you must not use the platform.`
  },
  {
    icon: Shield,
    title: '2. Description of Services',
    text: `Axcel Private Wallet provides a secure digital environment for private wallet access, balance visibility, internal routing interfaces, and protected client-facing asset management features.`
  },
  {
    icon: Lock,
    title: '3. User Responsibilities',
    text: `You are responsible for maintaining the confidentiality of your account credentials, providing accurate account information, and ensuring that your use of the platform remains lawful, authorized, and compliant with these Terms.`
  },
  {
    icon: AlertTriangle,
    title: '4. Risk Disclosure',
    text: `Digital asset activity involves volatility, network risk, pricing fluctuations, technical interruptions, and irreversible blockchain operations. Users remain solely responsible for reviewing wallet addresses, transaction details, and transfer decisions before taking action.`
  },
  {
    icon: Scale,
    title: '5. Prohibited Activities',
    text: `You may not use the platform for fraud, money laundering, sanctions evasion, unauthorized access attempts, abusive conduct, illegal transfers, or any activity intended to disrupt, manipulate, or exploit the service environment.`
  },
  {
    icon: Shield,
    title: '6. Compliance and Monitoring',
    text: `Axcel Private Wallet reserves the right to apply internal monitoring, account review procedures, and access limitations where needed to maintain service integrity, platform security, and regulatory alignment.`
  },
  {
    icon: FileText,
    title: '7. Service Availability',
    text: `We aim to maintain stable service availability, but uninterrupted access is not guaranteed. Maintenance, infrastructure updates, network events, third-party dependencies, or security reviews may affect platform access from time to time.`
  },
  {
    icon: Scale,
    title: '8. Limitation of Liability',
    text: `Axcel Private Wallet shall not be liable for indirect, incidental, special, or consequential damages, including losses related to user error, credential compromise, third-party outages, blockchain network issues, or external service disruptions.`
  },
  {
    icon: FileText,
    title: '9. Intellectual Property',
    text: `All branding, interface design, visual materials, platform structure, software components, and related content are the property of Axcel Private Wallet unless otherwise stated and may not be copied or redistributed without permission.`
  },
  {
    icon: Shield,
    title: '10. Account Restriction or Termination',
    text: `We reserve the right to suspend, restrict, or terminate access to accounts that violate these Terms, fail internal review, present elevated risk, or engage in suspicious or prohibited activity.`
  },
  {
    icon: FileText,
    title: '11. Changes to These Terms',
    text: `These Terms of Service may be updated periodically. Continued use of the platform after changes become effective constitutes acceptance of the revised version.`
  }
];

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-[#030712] text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-120px] left-[8%] w-[360px] h-[360px] bg-blue-600/10 blur-[90px] rounded-full" />
        <div className="absolute bottom-[-140px] right-[6%] w-[320px] h-[320px] bg-cyan-500/10 blur-[90px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:42px_42px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-10 md:py-16">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] px-5 py-3 text-sm font-semibold text-slate-200 transition-all"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(13,23,42,0.92),rgba(7,12,24,0.94))] shadow-[0_24px_80px_rgba(0,0,0,0.45)] overflow-hidden">
          <div className="px-6 md:px-10 pt-8 md:pt-10 pb-8 border-b border-white/8">
            <div className="inline-flex items-center gap-3 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-blue-300 mb-6">
              <Shield size={16} />
              Legal Terms
            </div>

            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <FileText className="w-7 h-7" />
              </div>

              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                  Terms of Service
                </h1>
                <p className="mt-3 text-slate-300 text-base md:text-lg leading-relaxed max-w-3xl">
                  These Terms of Service govern access to and use of Axcel Private Wallet,
                  including the website, wallet interface, client access environment, and related
                  digital asset services.
                </p>
                <div className="mt-4 text-sm text-slate-400">
                  <span className="font-semibold text-slate-300">Last Updated:</span> March 15, 2026
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 md:px-10 py-8 md:py-10">
            <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-6 mb-8">
              <p className="text-slate-300 leading-relaxed">
                By accessing or using Axcel Private Wallet, you agree to be bound by these Terms of
                Service. These terms are intended to establish the rules, responsibilities, and
                limitations applicable to all users of the platform.
              </p>
            </div>

            <div className="grid gap-5">
              {sections.map((section, index) => {
                const Icon = section.icon;

                return (
                  <div
                    key={index}
                    className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 md:p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-11 w-11 rounded-2xl bg-blue-600/15 border border-blue-500/15 flex items-center justify-center text-blue-400 shrink-0">
                        <Icon size={20} />
                      </div>

                      <div>
                        <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">
                          {section.title}
                        </h2>
                        <p className="mt-3 text-slate-300 leading-relaxed text-sm md:text-base">
                          {section.text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 rounded-[26px] border border-white/8 bg-black/20 p-6">
              <h2 className="text-xl font-bold tracking-tight mb-4">12. Contact Information</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                If you have questions regarding these Terms of Service, platform use, or account-related
                legal matters, please contact our support team.
              </p>

              <div className="flex items-center gap-3 text-slate-200">
                <div className="h-10 w-10 rounded-xl bg-blue-600/15 border border-blue-500/15 flex items-center justify-center text-blue-400">
                  <Mail size={18} />
                </div>
                <div>
                  <div className="text-sm text-slate-400">Support Email</div>
                  <div className="font-semibold">support@axcelci.com</div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-[0_12px_30px_rgba(37,99,235,0.30)]"
              >
                <ArrowLeft size={17} />
                Back to Home
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center justify-center px-6 py-4 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold transition-all"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
