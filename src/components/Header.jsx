import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { FaBagShopping } from 'react-icons/fa6';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const baseNavLinks = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count } = useCart();
  const { user } = useAuth();
  const navLinks = [...baseNavLinks, user ? { label: 'Account', to: '/account' } : { label: 'Login', to: '/login' }];
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      id="main-header"
      className={`${isHome ? 'fixed top-0 left-0 right-0' : 'sticky top-0'} z-[1000] transition-all duration-300 py-[12.8px] ${
        isHome && !scrolled
          ? 'bg-transparent border-b border-transparent'
          : 'bg-[#fff2ed] shadow-sm border-b border-stone-200/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo / Brand Name */}
          <Link to="/" className="flex-shrink-0" id="header-logo">
            <h1 className="font-serif font-bold text-lg sm:text-xl tracking-[0.08em] text-stone-900">
              LIVING SPACE HUB
            </h1>
          </Link>

          {/* Desktop Right Nav (Home | Shop | About | Contact | Login | FaBagShopping Icon) */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-9" id="desktop-nav">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `relative text-[16px] leading-[26px] transition-colors duration-200 group z-10 ${
                    isActive ? 'text-[#5A5A40] font-semibold' : 'text-[#1a1a1a] font-normal hover:text-[#5A5A40]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Radial Glow */}
                    <span
                      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-[200%] bg-[radial-gradient(circle,rgba(212,163,115,0.2)_0%,transparent_60%)] rounded-full -z-10 transition-opacity duration-300 ${
                        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    />
                    
                    {/* Link Text */}
                    {link.label}
                    
                    {/* Animated Underline */}
                    <span
                      className={`absolute -bottom-1 left-0 right-0 h-[2px] bg-[#5A5A40] rounded-full origin-left transition-transform duration-300 ease-out ${
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}

            {/* FaBagShopping Icon with Badge */}
            <Link
              to="/cart"
              aria-label="Cart"
              className="relative text-stone-900 hover:text-[#5A5A40] transition-colors p-1 ml-3 sm:ml-5 lg:ml-7"
              id="header-cart"
            >
              <FaBagShopping className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile Right Actions */}
          <div className="flex md:hidden items-center gap-4">
            <Link to="/cart" className="relative text-stone-900 p-1" id="header-cart-mobile">
              <FaBagShopping className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 text-stone-800 hover:text-[#5A5A40] transition-colors"
              aria-label="Toggle menu"
              id="hamburger-btn"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-xs"
              onClick={() => setIsOpen(false)}
            />
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-[#F9F5F0] z-50 shadow-2xl md:hidden flex flex-col"
              id="mobile-drawer"
            >
              <div className="flex items-center justify-between p-6 border-b border-stone-200">
                <span className="font-serif font-bold text-base tracking-wider text-stone-900">
                  LIVING SPACE HUB
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-stone-600 hover:text-stone-900"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col gap-2 p-6 flex-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`text-base font-medium px-4 py-3 rounded-xl transition-colors ${
                      location.pathname === link.to
                        ? 'bg-[#5A5A40] text-white'
                        : 'text-stone-800 hover:bg-stone-200/60'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
