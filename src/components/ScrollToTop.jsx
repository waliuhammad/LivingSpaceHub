import React, { useState, useEffect } from 'react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollUp = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <button
      onClick={scrollUp}
      aria-label="Back to top"
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: '#6B7252',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9998,
        boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.85)',
        transition: 'opacity 0.3s ease, transform 0.3s ease, background-color 0.2s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#575e40')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6B7252')}
    >
      {/* Arrow with stem + chevron head */}
      <svg
        width="16"
        height="18"
        viewBox="0 0 16 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* vertical stem */}
        <line x1="8" y1="17" x2="8" y2="5" stroke="white" strokeWidth="2" strokeLinecap="round" />
        {/* arrowhead */}
        <polyline points="3,9 8,3 13,9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </button>
  );
}
