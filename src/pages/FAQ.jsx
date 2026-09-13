import React, { useState } from 'react';

const faqData = [
  {
    question: 'How long does delivery take?',
    answer: 'Delivery usually takes 3–7 working days depending on your location.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'Currently, we only offer Cash on Delivery (COD). You can pay in cash when your order is delivered to your doorstep.'
  },
  {
    question: 'Can I return or exchange a product?',
    answer: 'Yes, you can request a return or exchange within 7 days of delivery, provided the item is unused and in original packaging.'
  },
  {
    question: 'Do you offer handmade or custom products?',
    answer: 'Yes! Many of our home decor items are handcrafted. Custom orders may take additional time.'
  },
  {
    question: 'How can I track my order?',
    answer: 'Once your order is confirmed, our team will contact you and provide updates regarding delivery.'
  },
  {
    question: 'Is Cash on Delivery available in all areas?',
    answer: 'COD is available in most cities. However, availability may vary depending on your location.'
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-[#f9f8f5] min-h-screen flex flex-col font-sans text-neutral-900 pb-16">
      <main className="flex-grow pt-16 md:pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-[3rem] font-serif font-bold text-[#1a1a1a] mb-4 leading-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-base md:text-lg text-neutral-500">
              Everything you need to know about shopping with us
            </p>
          </div>



          <div className="space-y-4 mb-24">
            {faqData.map((faq, index) => (
              <div
                key={index}
                className="bg-white overflow-hidden transition-all duration-200"
              >
                <button
                  className={`w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none ${openIndex === index ? 'bg-[#f7f0e8] text-[#1a1a1a]' : 'bg-white text-[#1a1a1a]'}`}
                  onClick={() => toggleAccordion(index)}
                >
                  <span className={`font-serif font-bold text-lg ${openIndex === index ? 'text-[#1a1a1a]' : 'text-[#1a1a1a]'}`}>{faq.question}</span>
                  <span className="text-neutral-500">
                    <svg className={`w-5 h-5 transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </span>
                </button>
                {openIndex === index && (
                  <div className="px-6 py-5 bg-white animate-fade-in-down border-t border-gray-100">
                    <p className="text-sm md:text-base text-neutral-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mb-24">
            <h2 className="text-3xl font-serif font-bold text-[#1a1a1a] mb-4">
              Still have questions?
            </h2>
            <p className="text-neutral-500 mb-8">
              Our support team is here to help you
            </p>
            <button className="bg-[#5A5A40] hover:bg-[#4d4d37] text-white font-medium px-8 py-3 rounded-full transition-colors duration-300 tracking-wide uppercase text-sm">
              Contact Us
            </button>

          </div>

          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-[#1a1a1a] mb-4">
              Join Our Design Community
            </h2>
            <p className="text-neutral-500 mb-8">
              Get updates & exclusive offers
            </p>
            <div className="max-w-md mx-auto relative flex items-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-[#f9f8f5] border-none rounded-full py-4 pl-6 pr-32 focus:outline-none focus:ring-1 focus:ring-[#5A5A40] text-sm"
              />
              <button className="absolute right-1 top-1 bottom-1 bg-[#5A5A40] hover:bg-[#4d4d37] text-white px-6 rounded-full text-sm font-medium transition-colors">
                Subscribe
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default FAQ;
