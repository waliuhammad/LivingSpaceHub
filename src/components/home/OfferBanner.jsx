import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export default function OfferBanner() {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Toggles both ways: fades in when it enters, resets when it leaves,
        // so it plays again every time you scroll up or down past it.
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-cover bg-center min-h-[500px] flex items-center justify-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1920&h=800')",
      }}
    >
      {/* Static overlay — image never moves, zooms, or shifts */}
      <div className="absolute inset-0 bg-black/20" />

      <div
        ref={cardRef}
        className={`relative z-10 w-full max-w-3xl rounded-[2rem] p-10 sm:p-16 text-center shadow-2xl border border-white/20 transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="max-w-2xl mx-auto space-y-5">
          <span className="inline-block text-[11px] uppercase tracking-[0.2em] font-bold text-stone-800">
            Special Offer
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold leading-tight text-stone-900">
            Summer Essentials Up to 30% Off
          </h2>
          <p className="text-stone-800 text-sm sm:text-base font-medium leading-relaxed max-w-xl mx-auto">
            Discover our curated selection of summer essentials and artisanal decor pieces at exclusive prices.
          </p>
          <div className="pt-6">
            <Link
              to="/shop"
              className="inline-block px-10 py-3.5 bg-[#5A5A40] hover:bg-[#484833] text-white font-bold text-xs uppercase tracking-widest rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Claim Offer
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}