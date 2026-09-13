import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="bg-[#f9f8f5] min-h-screen flex flex-col font-sans text-neutral-900">
      <div className="bg-white pt-20 pb-16 text-center border-b border-gray-100">
        <h1 className="text-4xl md:text-[3rem] font-serif font-bold text-[#1a1a1a] mb-4">
          Privacy Policy
        </h1>
        <p className="text-neutral-500">
          Your privacy matters to us at Living Space Hub
        </p>
      </div>

      <main className="flex-grow pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          <section>
            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4">1. Information We Collect</h2>
            <p className="mb-4 text-neutral-700 leading-relaxed">When you browse or shop on our website, we may collect the following information:</p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-700">
              <li><strong>Personal Data:</strong> Name, email, phone number, shipping & billing address</li>
              <li><strong>Account Info:</strong> Login credentials when you create an account</li>
              <li><strong>Order Details:</strong> Products purchased, payment method (securely processed)</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent, device & browser type</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4">2. How We Use Your Data</h2>
            <p className="mb-4 text-neutral-700 leading-relaxed">Your information helps us provide a better experience:</p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-700">
              <li>To process and deliver your orders</li>
              <li>To manage your account and login</li>
              <li>To improve our website UI and product recommendations</li>
              <li>To send updates, offers, and newsletters (only if you subscribe)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4">3. Cookies & Tracking</h2>
            <p className="mb-4 text-neutral-700 leading-relaxed">We use cookies to enhance your browsing experience. This includes:</p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-700">
              <li>Keeping items in your cart</li>
              <li>Saving login sessions</li>
              <li>Analyzing traffic and user behavior</li>
            </ul>
            <p className="mt-4 text-neutral-700 leading-relaxed">You can disable cookies anytime in your browser settings.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4">4. Data Sharing</h2>
            <p className="mb-4 text-neutral-700 leading-relaxed">We respect your privacy and never sell your data. We only share information with:</p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-700">
              <li>Payment gateways for secure transactions</li>
              <li>Delivery partners for shipping orders</li>
              <li>Analytics tools to improve our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4">5. Data Security</h2>
            <p className="text-neutral-700 leading-relaxed">We use secure servers, encryption, and best practices to protect your information. However, no system is completely secure.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4">6. Your Rights</h2>
            <ul className="list-disc pl-5 space-y-2 text-neutral-700">
              <li>Access your personal data</li>
              <li>Request correction or deletion</li>
              <li>Opt-out of marketing emails</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4">7. Third-Party Links</h2>
            <p className="text-neutral-700 leading-relaxed">Our website may include links to external sites. We are not responsible for their privacy policies.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4">8. Updates to Policy</h2>
            <p className="text-neutral-700 leading-relaxed">We may update this policy occasionally. Changes will be posted on this page.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4">9. Contact Us</h2>
            <p className="mb-4 text-neutral-700 leading-relaxed">If you have any questions, feel free to contact us:</p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-700">
              <li>Email: support@livingspacehub.com</li>
              <li>Phone: +92-3335131393</li>
            </ul>
          </section>
        </div>

        <section className="newsletter-section bg-white py-20 mt-20 text-[#1a1a1a] font-sans text-base leading-[26px] font-normal">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-serif font-bold text-[#1a1a1a] mb-4">
              Stay Updated
            </h2>
            <p className="text-[#1a1a1a] mb-8">
              Get updates about policy changes & new arrivals
            </p>
            <div className="max-w-md mx-auto relative flex items-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-[#f9f8f5] border-none rounded-full py-4 pl-6 pr-32 focus:outline-none focus:ring-1 focus:ring-[#5A5A40] text-sm text-[#1a1a1a]"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-[#5A5A40] hover:bg-[#4d4d37] text-white px-6 rounded-md text-sm font-medium transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
