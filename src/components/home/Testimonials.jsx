import React, { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';
import useReveal from '../../hooks/useReveal';

const testimonials = [
  {
    quote: "The piece I ordered is absolutely stunning. It has transformed my living room into a sophisticated space I love spending time in.",
    author: "Sarah Jenkins",
    role: "Verified Customer"
  },
  {
    quote: "Impeccable quality and fast delivery. The customer service team was so helpful in helping me choose the right lighting.",
    author: "Michael Ross",
    role: "Verified Customer"
  }
];

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const sectionRef = useReveal();

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const current = testimonials[active];

  return (
    <section ref={sectionRef} className="py-20 bg-[#F5F2ED]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="reveal font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-12">
          Customer Stories
        </h2>

        <div className="reveal bg-white rounded-3xl p-8 sm:p-14 shadow-sm border border-stone-200/80 relative min-h-[220px] flex flex-col justify-between" style={{ transitionDelay: '0.2s' }}>
          <Quote className="w-10 h-10 text-[#5A5A40]/30 mx-auto mb-4" />
          
          <p className="font-serif text-lg sm:text-2xl text-stone-800 italic leading-relaxed mb-6 max-w-2xl mx-auto">
            "{current.quote}"
          </p>

          <div>
            <h4 className="font-serif font-bold text-stone-900 text-base sm:text-lg">— {current.author}</h4>
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">{current.role}</p>
          </div>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActive(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                active === idx ? 'bg-[#5A5A40] w-8' : 'bg-stone-300 hover:bg-stone-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
