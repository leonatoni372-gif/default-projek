'use client';
import { useEffect, useState } from 'react';
export function ParallaxLayer({ speed = 0.2, children, className = '' }: { speed?: number; children: React.ReactNode; className?: string }) {
  const [y, setY] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const onScroll = () => setY(window.scrollY * speed * -0.3);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [speed]);
  return (
    <div className={className} style={{ transform: `translateY(${y}px)` }}>
      {children}
    </div>
  );
}
