import React, { useState, useEffect, useRef } from 'react';
import useReveal from '../../hooks/useReveal';

const stats = [
  { target: 1500, label: 'Happy Clients', suffix: '+' },
  { target: 250, label: 'Artisans', suffix: '+' },
  { target: 50, label: 'Unique Awards', suffix: '+' },
  { target: 12, label: 'Global Stores', suffix: '' },
];

function SingleStat({ target, label, suffix, animate }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!animate) return;
    let start = 0;
    const duration = 2000;
    const stepTime = 20;
    const totalSteps = duration / stepTime;
    const increment = target / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [animate, target]);

  return (
    <div className="text-center p-6 bg-white rounded-2xl shadow-xs border border-stone-200/60">
      <h3 className="font-serif text-4xl sm:text-5xl font-bold text-stone-900 mb-2">
        {count.toLocaleString()}{suffix}
      </h3>
      <p className="text-xs uppercase tracking-wider font-semibold text-stone-500">{label}</p>
    </div>
  );
}

export default function StatsCounter() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const revealRef = useReveal();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Combine refs
  const combinedRef = (el) => {
    sectionRef.current = el;
    revealRef.current = el;
  };

  return (
    <section ref={combinedRef} className="py-16 bg-white border-y border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((st, i) => (
            <div key={i} className="reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
              <SingleStat {...st} animate={isVisible} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
