'use client';
import { useEffect, useRef, useState } from 'react';
export function useInView<T extends HTMLElement>(opts: IntersectionObserverInit = { threshold: 0.15 }) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInView(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setInView(true);
        io.unobserve(e.target);
      }
    }, opts);
    io.observe(el);
    return () => io.disconnect();
  }, [opts.threshold]);
  return { ref, inView } as const;
}
