import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import useReveal from '../../hooks/useReveal';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const sectionRef = useReveal();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section ref={sectionRef} className="py-20 bg-white border-t border-stone-200/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="reveal bg-[#F5F2ED] rounded-3xl p-8 sm:p-14 shadow-sm border border-stone-200/80">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-3">
            Join Our Design Community
          </h2>
          <p className="text-stone-500 text-sm sm:text-base mb-8 max-w-xl mx-auto">
            Subscribe for exclusive early access to drops, design tips, and special offers.
          </p>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl max-w-md mx-auto flex items-center justify-center gap-2 text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Thank you for subscribing to Living Space Hub!
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-5 py-3.5 bg-white border border-stone-200 rounded-full text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/30 focus:border-[#5A5A40]"
              />
              <button
                type="submit"
                className="px-8 py-3.5 bg-[#5A5A40] hover:bg-[#484833] text-white font-semibold text-sm rounded-full shadow-md transition-all shrink-0 cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
