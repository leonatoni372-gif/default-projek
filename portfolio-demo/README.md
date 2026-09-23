# Portfolio Interactive Revamp — Demo (Isolated from AI Affiliate OS)

Isolasi: folder `portfolio-demo/` tidak menyentuh `app/` AI Affiliate OS.
Copy-paste file ini ke repo `portfolio-leonel-liart` (Next.js + Tailwind) untuk hasil sama.

## Cara pakai di repo porto asli

1. Patch `tailwind.config.js` — copy `tailwind.extend.patch.js` ke `theme.extend`
2. Copy `globals.patch.css` ke `app/globals.css`
3. Copy `hooks/useInView.ts`, `components/motion/*`, `components/Navbar.tsx`, `components/Hero.tsx`, `components/Marquee.tsx` ke repo porto
4. Ganti hero/about/projects di `app/page.tsx` dengan potongan dari `demo-page.tsx`

## Preview demo isolasi

Demo ini self-contained: buka `demo-page.tsx` sebagai referensi visual. Untuk preview live tanpa setup baru, copy `demo-page.tsx` jadi `app/portfolio-preview/page.tsx` di workspace ini lalu `npm run dev` → http://localhost:3000/portfolio-preview

Skipped: framer-motion/gsap/lenis — add when CSS+IO terbukti kurang.
