import React from 'react';
import { Link } from 'react-router-dom';
import useReveal from '../../hooks/useReveal';

export default function OfferBanner() {
  const sectionRef = useReveal();

  return (
    <section 
      ref={sectionRef} 
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-cover bg-center min-h-[500px] flex items-center justify-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1920&h=800')" }}
    >
      {/* Background Overlay for better readability if needed, though glass handles it */}
      <div className="absolute inset-0 bg-black/20" />

      <div className="reveal relative z-10 w-full max-w-3xl rounded-[2rem] p-10 sm:p-16 text-center shadow-2xl border border-white/20"
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
