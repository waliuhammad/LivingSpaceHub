import React, { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Disable on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    let mouseX = -200;
    let mouseY = -200;
    let ringX = -200;
    let ringY = -200;
    let rafId;
    let hovered = false;
    let clicked = false;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Move dot instantly
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;

      if (!isVisible) setIsVisible(true);

      // Check if hovering interactive element
      const target = e.target;
      const interactive = target?.closest('a, button, input, select, textarea, [role="button"]');
      if (interactive !== hovered) {
        hovered = !!interactive;
        applyRingStyle();
      }
    };

    const applyRingStyle = () => {
      if (!ring || !dot) return;
      if (clicked) {
        ring.style.width = '36px';
        ring.style.height = '36px';
        ring.style.borderColor = 'rgba(212,163,115,0.8)'; // Accent color
        ring.style.backgroundColor = 'rgba(212,163,115,0.15)';
        ring.style.opacity = '0.9';
        dot.style.width = '6px';
        dot.style.height = '6px';
        dot.style.backgroundColor = '#D4A373';
      } else if (hovered) {
        ring.style.width = '48px';
        ring.style.height = '48px';
        ring.style.borderColor = 'rgba(212,163,115,0.5)';
        ring.style.backgroundColor = 'rgba(212,163,115,0.1)';
        ring.style.opacity = '1';
        ring.style.boxShadow = '0 0 15px rgba(212,163,115,0.2)';
        dot.style.width = '8px';
        dot.style.height = '8px';
        dot.style.backgroundColor = '#D4A373';
      } else {
        ring.style.width = '26px';
        ring.style.height = '26px';
        ring.style.borderColor = 'rgba(90,90,64,0.8)'; // Primary color
        ring.style.backgroundColor = 'transparent';
        ring.style.opacity = '1';
        ring.style.boxShadow = 'none';
        dot.style.width = '4px';
        dot.style.height = '4px';
        dot.style.backgroundColor = '#5A5A40';
      }
    };

    const onMouseDown = () => {
      clicked = true;
      applyRingStyle();
    };
    const onMouseUp = () => {
      clicked = false;
      applyRingStyle();
    };
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // Smooth lerp loop — ONLY moves position, no size/color conflicts
    const render = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(rafId);
    };
  }, []); // run once only — no deps

  return (
    <>
      {/* Outer ring — lerp follows mouse */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          border: '1.5px solid rgba(90,90,64,0.8)',
          backgroundColor: 'transparent',
          pointerEvents: 'none',
          zIndex: 99999,
          opacity: isVisible ? 1 : 0,
          transition: 'width 0.25s ease, height 0.25s ease, background-color 0.25s ease, border-color 0.25s ease, opacity 0.3s ease, box-shadow 0.25s ease',
          willChange: 'transform',
        }}
      />

      {/* Inner dot — follows mouse instantly */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          backgroundColor: '#5A5A40',
          pointerEvents: 'none',
          zIndex: 99999,
          opacity: isVisible ? 1 : 0,
          transition: 'width 0.25s ease, height 0.25s ease, background-color 0.25s ease, opacity 0.3s ease',
          willChange: 'transform',
        }}
      />
    </>
  );
}
