import { useEffect, useRef } from 'react';

/**
 * Custom hook that adds scroll-triggered reveal animations.
 * Elements start invisible (opacity: 0, translateY(60px)) and
 * fade-up smoothly when scrolled into the viewport.
 *
 * @param {Object} options
 * @param {number} options.threshold - Intersection threshold (0-1). Default 0.15
 * @returns {React.RefObject} ref to attach to the container element
 */
export default function useReveal({ threshold = 0.15 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Find all .reveal children (and self if it has .reveal)
    const revealElements = el.querySelectorAll('.reveal');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold, rootMargin: '0px 0px -150px 0px' }
    );

    revealElements.forEach((revealEl) => observer.observe(revealEl));

    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
