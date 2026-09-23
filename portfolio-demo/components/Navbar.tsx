'use client';
import { useEffect, useState } from 'react';
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <nav className={`sticky top-0 z-50 transition-all ${scrolled ? 'py-2 bg-white/80 backdrop-blur border-b' : 'py-4 bg-transparent'}`}>
      <div className="mx-auto max-w-6xl px-6 flex justify-between items-center">
        <a href="#" className="font-black text-display text-lg">
          LZ
        </a>
        <div className="flex gap-4 text-sm">
          <a href="#about">About</a>
          <a href="#projects">Projects</a>
          <a href="#experience">Experience</a>
          <a href="#certificates">Certificates</a>
          <a href="#contact">Contact</a>
        </div>
      </div>
    </nav>
  );
}
