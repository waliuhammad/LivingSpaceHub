import React, { useState } from 'react';
import { MapPin, Mail, Phone, CheckCircle2 } from 'lucide-react';
import PageTransition, { itemVariants } from '../components/PageTransition';
import { motion } from 'framer-motion';

const CONTACT_ITEMS = [
  {
    Icon: MapPin,
    title: 'Our Studio',
    lines: ['First Floor Office No.04 Humayun Tower university road', 'Peshawar'],
  },
  {
    Icon: Mail,
    title: 'Email Us',
    lines: ['info@livingspaceshub.com'],
  },
  {
    Icon: Phone,
    title: 'Call Us',
    lines: ['03338131393'],
  },
];

export default function Contact() {
  const [formData, setFormData] = useState({ fullName: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PageTransition className="bg-[#F5F2ED] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Column: Heading & Contact Info */}
          <motion.div variants={itemVariants}>
            <h1 className="font-serif font-bold text-4xl md:text-5xl text-[#1a1a1a] mb-6">
              Get in Touch
            </h1>
            <p className="font-sans text-base text-[#555555] leading-relaxed mb-10 max-w-md">
              Have a question about a piece or need design advice? Our team is here to help you curate your perfect space.
            </p>

            <div className="flex flex-col gap-8">
              {CONTACT_ITEMS.map((item) => {
                const Icon = item.Icon;
                return (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-white shadow-xs flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-[#0d6efd]" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-xl text-[#1a1a1a] mb-1">
                        {item.title}
                      </h3>
                      {item.lines.map((line) => (
                        <p key={line} className="font-sans text-sm text-[#666666]">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Column: Send a Message Card */}
          <motion.div variants={itemVariants} className="bg-[#FAF8F5]/80 rounded-2xl p-8 md:p-10 shadow-xs border border-stone-200/60">
            <h2 className="font-serif font-bold text-2xl text-[#1a1a1a] mb-6">
              Send a Message
            </h2>

            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#1a1a1a]">Message Sent!</h3>
                <p className="text-stone-600 text-sm">
                  Thank you for reaching out. We will get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  type="text"
                  required
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white font-sans text-sm text-[#1a1a1a] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:border-[#0d6efd]"
                />
                <input
                  type="email"
                  required
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white font-sans text-sm text-[#1a1a1a] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:border-[#0d6efd]"
                />
                <input
                  type="text"
                  required
                  name="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white font-sans text-sm text-[#1a1a1a] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:border-[#0d6efd]"
                />
                <textarea
                  required
                  name="message"
                  placeholder="Message"
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white font-sans text-sm text-[#1a1a1a] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:border-[#0d6efd] resize-y"
                />
                <button
                  type="submit"
                  className="mt-2 self-start bg-[#0d6efd] hover:bg-[#0b5ed7] text-white font-sans font-semibold text-sm px-7 py-3 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Send Message
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}