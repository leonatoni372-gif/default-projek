'use client';
export function TiltCard({ children }: { children: React.ReactNode }) {
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    e.currentTarget.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
  };
  const onLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'perspective(800px) rotateY(0) rotateX(0)';
  };
  return (
    <div onMouseMove={onMove} onMouseLeave={onLeave} className="transition-transform duration-200 will-change-transform">
      {children}
    </div>
  );
}
