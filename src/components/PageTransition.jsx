import React from 'react';
import { motion } from 'framer-motion';

// Variants for the page wrapper
const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1, // wait a bit before staggering children
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// Reusable variant for children elements inside the page
export const itemVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  },
};

export default function PageTransition({ children, className = '' }) {
  // Check prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}
