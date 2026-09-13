import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  {
    subtitle1: 'Curated Lifestyle',
    title: 'Transform Your Living Space',
    subtitle2: 'Elegant Decor for Modern Homes',
    btn1: { label: 'Shop Now', to: '/shop' },
    btn2: { label: 'Explore Collection', href: '#featured-categories' },
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1920&h=1080',
  },
  {
    subtitle1: 'Minimalist Living',
    title: 'Discover Sustainable Style',
    subtitle2: 'Artisanal Craftsmanship for Every Room',
    btn1: { label: 'View Shop', to: '/shop' },
    btn2: { label: 'Our Story', to: '/about' },
    image: 'https://images.unsplash.com/photo-1616489953149-8b224f114c67?auto=format&fit=crop&q=80&w=1920&h=1080',
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    const timer = setInterval(next, 7000);
    return () => clearInterval(timer);
  }, [next]);

  const handleScrollDown = (e) => {
    e.preventDefault();
    const target = document.getElementById('featured-categories');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const slide = slides[current];

  return (
    <section className="relative h-screen min-h-[600px] w-full overflow-hidden bg-black text-white">
      {/* Background Image Carousel with Ken Burns zoom */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 w-full h-full"
        >
          <div
            className="w-full h-full bg-cover bg-center animate-kenburns"
            style={{ backgroundImage: `url('${slide.image}')` }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />
        </motion.div>
      </AnimatePresence>

      {/* Hero Glassmorphism Content Box */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center text-center">
        <motion.div
          key={`content-${current}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-4xl px-8 py-14 sm:px-16 sm:py-20 rounded-[30px] border shadow-2xl"
          style={{
            background: 'rgba(26, 26, 26, 0.35)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderColor: 'rgba(255, 255, 255, 0.15)',
          }}
        >
          <span className="inline-block text-sm sm:text-base uppercase tracking-[0.3em] text-[#D4A373] font-semibold mb-5">
            {slide.subtitle1}
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 text-white">
            {slide.title}
          </h1>
          <p className="text-stone-200 text-sm sm:text-base uppercase tracking-[0.2em] font-light mb-10">
            {slide.subtitle2}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={slide.btn1.to}
              className="w-full sm:w-auto px-10 py-4 bg-[#5A5A40] hover:bg-white text-white hover:text-black font-bold text-sm uppercase tracking-wider rounded-full shadow-lg transition-colors duration-300 transform"
            >
              {slide.btn1.label}
            </Link>

            {slide.btn2.to ? (
              <Link
                to={slide.btn2.to}
                className="w-full sm:w-auto px-10 py-4 bg-transparent hover:bg-white text-white hover:text-black border border-white font-bold text-sm uppercase tracking-wider rounded-full backdrop-blur-sm transition-all duration-300 transform"
              >
                {slide.btn2.label}
              </Link>
            ) : (
              <a
                href={slide.btn2.href}
                onClick={handleScrollDown}
                className="w-full sm:w-auto px-10 py-4 bg-transparent hover:bg-white text-white hover:text-black border border-white font-bold text-sm uppercase tracking-wider rounded-full backdrop-blur-sm transition-all duration-300 transform"
              >
                {slide.btn2.label}
              </a>
            )}
          </div>
        </motion.div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Scroll Down Indicator */}
      <button
        onClick={handleScrollDown}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors group cursor-pointer"
        aria-label="Scroll Down"
      >
        <div className="relative">
          <div className="absolute -inset-4 bg-[#D4A373]/30 rounded-full blur-md opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300" />
          <div className="mouse-scroll">
            <div className="wheel" />
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-[0.3em] font-medium mt-1">Scroll Down</span>
      </button>
    </section>
  );
}
