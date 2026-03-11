import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

const faqsLeft = [
  {
    question: "Who are we?",
    answer: "CIR - Cyber Intelligence Reports is an American financial consultancy firm serving clients across North and South America, Europe, Africa, Asia, Canada, and Oceania. Our work focuses on digital asset analysis and complex payment-related assessments, helping individuals and organizations gain clarity in situations involving online transactions and blockchain activity."
  },
  {
    question: "What is our mission?",
    answer: "Our goal is to support individuals who experienced issues with online purchases by providing clear guidance and well-structured strategies for navigating complex payment situations. Our guiding principle: Helping you make informed financial decisions with confidence. Our mission: Delivering expertise in evaluating and understanding challenging digital or payment-related scenarios from the consumer’s perspective."
  },
  {
    question: "How can I be sure CIR - Cyber Intelligence Reports operates responsibly?",
    answer: "CIR - Cyber Intelligence Reports maintains respected industry affiliations and collaborates only with reputable financial institutions. Our work has been referenced by well-known international media outlets covering finance and technology, reflecting the trust placed in our expertise. We value transparency and client satisfaction, and we’re always glad to connect prospective clients with individuals who have previously worked with us."
  },
  {
    question: "Does CIR - Cyber Intelligence Reports share any client information?",
    answer: "No, we don't provide our account holder's information to any third-party organization."
  },
  {
    question: "How does CIR - Cyber Intelligence Reports support clients facing digital asset issues?",
    answer: "The blockchain operates differently from traditional payment systems, and resolving issues related to digital asset transfers can be challenging without the right expertise. Because wallet ownership and transaction flows are often difficult to interpret, many individuals require professional assistance to better understand what happened in a given case. Our CryptoTrace reports provide structured analysis and detailed insights into blockchain activity, using advanced analytical tools to help clarify transaction pathways and identify relevant points of interest within the digital asset flow."
  }
];

const faqsRight = [
  {
    question: "What makes CIR - Cyber Intelligence Reports a trusted name in digital asset analysis?",
    answer: "A CryptoTrace report provides a structured overview of digital asset activity and helps clarify how a specific transaction moved across the blockchain. By analyzing relevant patterns, wallet interactions, and transactional pathways, the report can offer valuable insights for understanding the broader context of a case. Once completed, the report can be shared with the appropriate authorities or organizations if you choose to seek further review through official channels. These entities may use the information to evaluate the situation and determine any next steps based on their internal procedures and regulations."
  },
  {
    question: "Will this process affect my relationship with my financial institution?",
    answer: "Not at all. Financial institutions have dedicated teams that review and evaluate situations involving unexpected or unclear transactions. When a review is completed and a resolution is reached, the outcome is handled through the standard processes used between the involved institutions."
  },
  {
    question: "What can I realistically expect from working with CIR - Cyber Intelligence Reports?",
    answer: "We offer an initial, no-obligation review to help you understand the situation clearly. After examining the details, we provide a professional assessment outlining the factors that may influence the next steps. Every situation is unique, and our guidance is tailored accordingly. Feel free to contact us if you’d like us to take a closer look."
  },
  {
    question: "Can moving forward with this be a good use of my time and resources?",
    answer: "If a situation is not suitable for our services, we’ll let you know immediately and explain the reasoning clearly. With just a few clarifying questions, we can determine whether our guidance is the right fit for your needs. We treat every conversation with care and handle all inquiries with the highest level of discretion."
  },
  {
    question: "How do we begin?",
    answer: (
      <div className="space-y-4">
        <div>
          <strong className="block text-slate-900 mb-1">Step 1: Prepare Your Documentation</strong>
          <p>To ensure smooth handling of your situation, it's important to organize all relevant records. CIR - Cyber Intelligence Reports will begin by reviewing the materials you provide and helping you structure them clearly for the appropriate channels.</p>
        </div>
        <div>
          <strong className="block text-slate-900 mb-1">Step 2: Provide Accurate Information</strong>
          <p>Our ability to offer effective guidance depends on receiving complete and precise details. Before we proceed, we will share a brief questionnaire to help us understand the situation. Your accurate responses enable us to prepare the most suitable approach for you.</p>
        </div>
        <div>
          <strong className="block text-slate-900 mb-1">Step 3: Respond in a Timely Manner</strong>
          <p>Certain payment-related procedures involve specific timeframes. For that reason, it’s important to act promptly after the original transaction and to respond quickly to any follow-up communication. This helps keep the process efficient and prevents unnecessary delays.</p>
        </div>
      </div>
    )
  }
];

interface FAQItemProps {
  question: string;
  answer: React.ReactNode;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-blue-500 rounded-lg overflow-hidden bg-blue-50/50 mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-blue-50 transition-colors"
      >
        <span className="font-medium text-slate-900 pr-8">{question}</span>
        <ChevronDown 
          className={`w-5 h-5 text-slate-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4 text-slate-600 leading-relaxed border-t border-blue-500/20 pt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQSection = () => {
  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            We’re happy to answer whatever specific questions you might have in a chat or over the phone. In the meantime, here are some answers to those that are the most frequently asked.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
          <div className="space-y-4">
            {faqsLeft.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
          <div className="space-y-4">
            {faqsRight.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
