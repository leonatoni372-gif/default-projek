'use client';
import { useInView } from '../../hooks/useInView';
export function Reveal({ children, delay = 0, y = 16, className = '' }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : `translateY(${y}px)`,
        transition: `opacity 600ms ease ${delay}ms, transform 600ms ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
