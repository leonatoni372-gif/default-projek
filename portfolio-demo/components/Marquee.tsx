export function Marquee({ items }: { items: string[] }) {
  const dup = [...items, ...items];
  return (
    <div className="overflow-hidden border-y py-3 bg-white/50">
      <div className="flex gap-8 animate-[marquee_25s_linear_infinite] whitespace-nowrap will-change-transform" style={{ width: 'max-content' }}>
        {dup.map((t, i) => (
          <span key={i} className="text-sm font-medium px-4 py-1 rounded-full border bg-white">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
