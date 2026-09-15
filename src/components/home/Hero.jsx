import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../context/StoreContext';
import { optimizeImage } from '../../lib/cloudinary';

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

  const { settings } = useStore();
  const slide = current === 0 && settings.heroImage
    ? { ...slides[0], image: optimizeImage(settings.heroImage, 1920) }
    : slides[current];

  return (
    <section className="relative h-[85vh] min-h-[550px] w-full overflow-hidden bg-black text-white">
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full max-w-[1600px] mx-auto px-4 sm:px-8 flex items-center justify-center text-center">
        <motion.div
          key={`content-${current}`}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.24, 0.6, 0.35, 1] }}
          className="w-full max-w-[900px] px-[40px] py-[24px] sm:py-[28px] rounded-[30px] flex flex-col items-center justify-center relative z-10 text-center text-white"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          <span className="inline-block text-sm sm:text-base uppercase tracking-[0.3em] text-stone-200 font-semibold mb-3">
            {slide.subtitle1}
          </span>

          <h1 className="mx-auto max-w-[1200px] font-serif text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-4 text-white">
            {slide.title}
          </h1>

          <p className="text-stone-200 text-sm sm:text-base lg:text-lg uppercase tracking-[0.2em] font-light mb-6">
            {slide.subtitle2}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link
              to={slide.btn1.to}
              className="w-full sm:w-auto px-10 py-4 bg-[#5A5A40] hover:bg-white text-white hover:text-black font-bold text-sm uppercase tracking-wider rounded-full shadow-lg transition-colors duration-300 transform"
            >
              {slide.btn1.label}
            </Link>

            {slide.btn2.to ? (
              <Link
                to={slide.btn2.to}
                className="w-full sm:w-auto px-10 py-4 bg-white/15 hover:bg-white text-white hover:text-black border border-white/10 font-bold text-sm uppercase tracking-wider rounded-full backdrop-blur-sm transition-all duration-300 transform"
              >
                {slide.btn2.label}
              </Link>
            ) : (
              <a
                href={slide.btn2.href}
                onClick={handleScrollDown}
                className="w-full sm:w-auto px-10 py-4 bg-white/15 hover:bg-white text-white hover:text-black border border-white/10 font-bold text-sm uppercase tracking-wider rounded-full backdrop-blur-sm transition-all duration-300 transform"
              >
                {slide.btn2.label}
              </a>
            )}
          </div>

          <button
            onClick={handleScrollDown}
            className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors group cursor-pointer mt-1"
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
        </motion.div>
      </div>

      <button
        onClick={prev}
        className="absolute left-6 sm:left-16 top-1/2 -translate-y-1/2 z-20 text-white/80 hover:text-white transition-colors cursor-pointer"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      <button
        onClick={next}
        className="absolute right-6 sm:right-16 top-1/2 -translate-y-1/2 z-20 text-white/80 hover:text-white transition-colors cursor-pointer"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-8 h-8" />
      </button>
    </section>
  );
}