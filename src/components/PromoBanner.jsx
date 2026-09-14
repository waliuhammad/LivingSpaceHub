import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function PromoBanner() {
  return (
    <section 
      className="relative w-full py-24 bg-cover bg-center flex items-center justify-center overflow-hidden"
      style={{ backgroundImage: `url('/offer_banner_bg.jpg')` }}
    >
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[800px] mx-4 p-[60px] rounded-[24px] text-center"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-900"></span>
          <span className="text-xs uppercase tracking-widest font-bold text-stone-900">
            SPECIAL OFFER
          </span>
        </div>
        
        <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-stone-950 mb-6">
          Summer Essentials Up to 30% Off
        </h2>
        
        <p className="text-stone-900 text-base sm:text-lg font-medium leading-relaxed max-w-lg mx-auto mb-10">
          Transform your space with our curated selection of artisanal decor and mid-century modern pieces, now at exclusive prices.
        </p>
        
        <Link
          to="/shop"
          className="inline-block px-10 py-4 bg-[#3B4D28] hover:bg-[#4d6333] hover:scale-105 hover:shadow-lg text-white font-bold text-sm uppercase tracking-widest rounded-full transition-all duration-300"
        >
          CLAIM OFFER
        </Link>
      </motion.div>
    </section>
  );
}
