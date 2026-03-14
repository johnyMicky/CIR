import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  FileSearch,
  BadgeCheck,
  AlertTriangle,
  Lock,
  Eye,
  Scale,
  Mail
} from 'lucide-react';

const sections = [
  {
    icon: Shield,
    title: '1. Policy Purpose',
    text: `This AML / KYC Policy outlines the principles used by Axcel Private Wallet to help prevent misuse of the platform for unlawful activity, fraud, money laundering, terrorist financing, sanctions evasion, and other prohibited conduct.`
  },
  {
    icon: BadgeCheck,
    title: '2. Identity Verification',
    text: `Axcel Private Wallet may require account holders or clients to provide verification information, supporting identification materials, and other relevant records when necessary to establish user legitimacy, platform trust, and operational integrity.`
  },
  {
    icon: FileSearch,
    title: '3. Customer Review Measures',
    text: `We may apply reasonable onboarding review measures, account checks, activity screening, and internal verification procedures to assess user profiles, transaction context, access patterns, and platform behavior where appropriate.`
  },
  {
    icon: Eye,
    title: '4. Ongoing Monitoring',
    text: `The platform may monitor account activity, login behavior, transaction-related actions, interface usage patterns, and other operational indicators to identify suspicious behavior, unusual access attempts, or elevated risk scenarios.`
  },
  {
    icon: AlertTriangle,
    title: '5. Suspicious Activity',
    text: `Accounts or activities considered suspicious, high-risk, misleading, abusive, or inconsistent with expected lawful use may be subject to review, temporary restrictions, enhanced verification, internal escalation, or service limitation measures.`
  },
  {
    icon: Scale,
    title: '6. Compliance Standards',
    text: `Axcel Private Wallet reserves the right to apply internal compliance controls and risk-based review standards in support of lawful operation, service integrity, fraud prevention, and responsible platform management.`
  },
  {
    icon: Lock,
    title: '7. Record Retention',
    text: `Relevant account records, verification-related submissions, support interactions, and internal compliance materials may be retained for a reasonable period where necessary for operational review, legal obligations, platform security, dispute handling, or fraud prevention.`
  },
  {
    icon: Shield,
    title: '8. Restricted or Prohibited Use',
    text: `Use of the platform for fraudulent activity, identity misuse, deceptive conduct, unlawful transfers, sanctions evasion, money laundering, terrorist financing, or attempts to conceal harmful activity is strictly prohibited.`
  },
  {
    icon: FileSearch,
    title: '9. Enhanced Review Rights',
    text: `Axcel Private Wallet may request additional information, supporting materials, or clarification from users where risk indicators, inconsistent information, or unusual operational behavior make enhanced review reasonably necessary.`
  },
  {
    icon: AlertTriangle,
    title: '10. Account Restriction and Termination',
    text: `We reserve the right to restrict, suspend, or terminate access to the platform when a user fails internal review, declines reasonable verification requests, presents elevated compliance concerns, or engages in prohibited conduct.`
  },
  {
    icon: Scale,
    title: '11. Policy Updates',
    text: `This AML / KYC Policy may be updated periodically to reflect operational, legal, security, or regulatory developments. Continued use of Axcel Private Wallet after updates become effective constitutes acceptance of the revised policy.`
  }
];

const AmlKycPolicy = () => {
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
              Compliance Policy
            </div>

            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <FileSearch className="w-7 h-7" />
              </div>

              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                  AML / KYC Policy
                </h1>
                <p className="mt-3 text-slate-300 text-base md:text-lg leading-relaxed max-w-3xl">
                  This policy describes the internal compliance, review, verification, and
                  platform protection measures that may be applied by Axcel Private Wallet to
                  support lawful use and responsible service operation.
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
                Axcel Private Wallet is committed to maintaining a controlled platform environment.
                To support trust, service integrity, and lawful operation, internal review and
                verification measures may be applied where appropriate.
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
                If you have questions regarding this AML / KYC Policy, compliance-related review,
                or account verification matters, please contact our support team.
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

export default AmlKycPolicy;
