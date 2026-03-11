import React from 'react';
import { motion } from 'motion/react';
import Stats from '../components/Stats';

const faqs = [
  {
    question: "Who are we?",
    answer: "CIR - Cyber Intelligence Reports is American financial consultancy firm serving clients across North and South America, Europe, Africa, Asia, Canada, and Oceania. Our work focuses on digital asset analysis and complex payment-related assessments, helping individuals and organizations gain clarity in situations involving online transactions and blockchain activity."
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
  },
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
  }
];

const steps = [
  {
    title: "Step 1: Prepare Your Documentation",
    desc: "To ensure smooth handling of your situation, it's important to organize all relevant records. CIR - Cyber Intelligence Reports will begin by reviewing the materials you provide and helping you structure them clearly for the appropriate channels."
  },
  {
    title: "Step 2: Provide Accurate Information",
    desc: "Our ability to offer effective guidance depends on receiving complete and precise details. Before we proceed, we will share a brief questionnaire to help us understand the situation. Your accurate responses enable us to prepare the most suitable approach for you."
  },
  {
    title: "Step 3: Respond in a Timely Manner",
    desc: "Certain payment-related procedures involve specific timeframes. For that reason, it’s important to act promptly after the original transaction and to respond quickly to any follow-up communication. This helps keep the process efficient and prevents unnecessary delays."
  }
];

const FAQ = () => {
  return (
    <div className="bg-slate-50">
      <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            We’re happy to answer whatever specific questions you might have in a chat or over the phone. In the meantime, here are some answers to those that are the most frequently asked.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-slate-100 p-6"
              >
                <h3 className="text-xl font-bold text-slate-900 mb-3">{faq.question}</h3>
                <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-blue-900 text-white rounded-2xl p-8 sticky top-24">
              <h3 className="text-2xl font-bold mb-6">How do we begin?</h3>
              <div className="space-y-8">
                {steps.map((step, index) => (
                  <div key={index} className="relative pl-6 border-l-2 border-blue-500/30">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-blue-900"></div>
                    <h4 className="font-bold text-lg mb-2">{step.title}</h4>
                    <p className="text-blue-100 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Stats />
    </div>
  );
};

export default FAQ;
