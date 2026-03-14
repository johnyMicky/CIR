import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  FileText,
  Lock,
  Eye,
  Database,
  Globe,
  Mail,
  UserCheck
} from 'lucide-react';

const sections = [
  {
    icon: FileText,
    title: '1. Introduction',
    text: `This Privacy Policy explains how Axcel Private Wallet collects, uses, protects, and manages information provided through the platform, including website access, wallet interface use, account registration, and related client communications.`
  },
  {
    icon: Database,
    title: '2. Information We Collect',
    text: `We may collect personal information such as your name, email address, account identifiers, login activity, device-related access data, and other information voluntarily submitted through account registration, support communication, or platform interaction.`
  },
  {
    icon: UserCheck,
    title: '3. How We Use Information',
    text: `Collected information may be used to provide account access, maintain platform functionality, improve service reliability, support client communication, review security events, and protect the integrity of the Axcel Private Wallet environment.`
  },
  {
    icon: Lock,
    title: '4. Account and Access Security',
    text: `We apply reasonable administrative, technical, and operational safeguards to protect stored and transmitted information. However, no online system, transmission method, or storage layer can be guaranteed to be completely secure at all times.`
  },
  {
    icon: Eye,
    title: '5. Monitoring and Protection',
    text: `We may monitor platform access patterns, login events, session behavior, and operational activity for the purposes of fraud prevention, service protection, risk detection, platform stability, and internal security review.`
  },
  {
    icon: Globe,
    title: '6. Cookies and Technical Data',
    text: `The platform may use cookies, local storage, session tools, and standard technical logging methods to support authentication flow, user experience, interface performance, analytics, and secure platform operation.`
  },
  {
    icon: Shield,
    title: '7. Information Sharing',
    text: `Axcel Private Wallet does not sell personal information. Information may only be shared when reasonably necessary for platform operations, legal compliance, service protection, fraud prevention, or trusted technical support and infrastructure delivery.`
  },
  {
    icon: Database,
    title: '8. Data Retention',
    text: `We may retain relevant information for as long as reasonably necessary to support account administration, legal obligations, dispute handling, fraud prevention, internal audits, and platform security requirements.`
  },
  {
    icon: UserCheck,
    title: '9. User Responsibilities',
    text: `Users are responsible for protecting their own account credentials, ensuring the accuracy of submitted information, and avoiding the disclosure of sensitive access details to unauthorized third parties.`
  },
  {
    icon: FileText,
    title: '10. Third-Party Services',
    text: `Certain platform functions may rely on third-party infrastructure, hosting, analytics, communication, or authentication tools. Use of such integrated services may involve technical data processing consistent with service delivery and operational support.`
  },
  {
    icon: Shield,
    title: '11. Changes to This Policy',
    text: `This Privacy Policy may be updated periodically to reflect legal, operational, technical, or platform changes. Continued use of Axcel Private Wallet after an update becomes effective constitutes acceptance of the revised policy.`
  }
];

const PrivacyPolicy = () => {
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
              Privacy & Data Protection
            </div>

            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Lock className="w-7 h-7" />
              </div>

              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                  Privacy Policy
                </h1>
                <p className="mt-3 text-slate-300 text-base md:text-lg leading-relaxed max-w-3xl">
                  This Privacy Policy describes how Axcel Private Wallet handles personal
                  information, technical data, account-related records, and platform security
                  information in connection with the use of our services.
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
                By using Axcel Private Wallet, you acknowledge that certain information may be
                collected and processed to support secure platform operation, account access,
                client communication, service protection, and legal compliance.
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
                If you have questions regarding this Privacy Policy, personal information handling,
                or account-related data matters, please contact our support team.
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

export default PrivacyPolicy;
