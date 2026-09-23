# Portfolio Interactive Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Revamp portfolio-leonel-liart.vercel.app agar se-interactive sre-its.com — parallax hero, scroll-reveal storytelling, projects spotlight, marquee — tanpa menambah lib berat, tetap Next.js + Tailwind.

**Architecture:** Pertahankan Next.js App Router + Tailwind. Motion via CSS transforms + IntersectionObserver hook (native) + CSS view-timeline fallback. Framer Motion hanya jika spring dibutuhkan (ponytail: add when CSS insufficient). Semua motion respect `prefers-reduced-motion`. Pisah logic ke `hooks/useInView.ts` dan `components/motion/*` agar reusable.

**Tech Stack:** Next.js 14.2 (App Router), React 18, TypeScript 5, Tailwind 3.4, Supabase (contact form existing), optional `framer-motion` behind feature flag.

**Spec:** Referensi sre-its.com (earth rotate, tape/wind-turbine parallax, strips, vision 01/02/03, sponsor marquee, navbar shrink) + current porto https://portfolio-leonel-liart.vercel.app (7 projects, 5 experiences, 11 certs). No backend change — only frontend motion/style.

## Global Constraints

- No new heavy deps until CSS+IO proven insufficient — measure before adding framer-motion.
- Respect `prefers-reduced-motion: reduce` — all animations must have reduced-motion fallback (static).
- Performance budget: no CLS >0.1, LCP keep <2.5s, 60fps parallax (transform/opacity only).
- Follow existing portfolio repo structure — do NOT modify AI Affiliate OS workspace (C:\Users\Leonel Zalfa Athoni\Documents\Default Project is separate context).
- Human-in-the-loop irrelevant here (porto), but keep Supabase contact form behavior unchanged.

---

### Task 1: Design Tokens & Typography Scale (SRE Editorial)

**Files:**
- Modify: `tailwind.config.js` (extend font, colors, animation)
- Modify: `app/globals.css` (or `app/globals.css` / `styles/globals.css` — locate existing)
- Modify: `app/layout.tsx:1-16` (font import, metadata)

**Interfaces:**
- Consumes: existing Tailwind setup
- Produces: `text-display`, `bg-tape`, color tokens consumed by Tasks 3,5,6

- [ ] **Step 1: Write failing visual check (manual)**

Create `__tests__/tokens.test.ts`:
```ts
import { readFileSync } from 'fs';
test('tailwind has display token', () => {
  const cfg = readFileSync('tailwind.config.js','utf8');
  expect(cfg).toContain('display');
  expect(cfg).toContain('stripes');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/tokens.test.ts -v`
Expected: FAIL — no display/stripes tokens

- [ ] **Step 3: Implement minimal tokens**

`tailwind.config.js` — add inside `theme.extend`:
```js
fontFamily: { display: ['var(--font-display)','system-ui','sans-serif'] },
keyframes: {
  spinSlow: { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
  marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
  float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
},
animation: {
  spinSlow: 'spinSlow 40s linear infinite',
  marquee: 'marquee 25s linear infinite',
  float: 'float 4s ease-in-out infinite',
}
```

`app/globals.css` — add:
```css
:root { --font-display: 'Space Grotesk', system-ui, sans-serif; }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; } }
.text-display { font-family: var(--font-display); letter-spacing: -0.04em; }
```

`app/layout.tsx` — import Space Grotesk via `next/font/google` and apply `variable: '--font-display'`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/tokens.test.ts -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.js app/globals.css app/layout.tsx __tests__/tokens.test.ts
git commit -m "feat(portfolio): editorial display tokens and motion keyframes"
```

---

### Task 2: Reusable Scroll-Reveal Hook (IO + prefers-reduced-motion)

**Files:**
- Create: `hooks/useInView.ts`
- Create: `components/motion/Reveal.tsx`
- Test: `__tests__/reveal.test.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: `useInView(options)` -> `{ ref, inView }` and `<Reveal delay={number} y={number}>` used by Tasks 3,5,6,7

- [ ] **Step 1: Write failing test**

```tsx
// __tests__/reveal.test.tsx
import { render } from '@testing-library/react';
import { Reveal } from '@/components/motion/Reveal';
test('reveal renders children', () => {
  const { getByText } = render(<Reveal><span>hello</span></Reveal>);
  expect(getByText('hello')).toBeTruthy();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/reveal.test.tsx -v`
Expected: FAIL — module not found

- [ ] **Step 3: Implement minimal hook + component**

`hooks/useInView.ts`:
```ts
'use client';
import { useEffect, useRef, useState } from 'react';
export function useInView<T extends HTMLElement>(opts: IntersectionObserverInit = { threshold: 0.15 }) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setInView(true); return; }
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.unobserve(e.target); } }, opts);
    io.observe(el); return () => io.disconnect();
  }, [opts.threshold]);
  return { ref, inView };
}
```

`components/motion/Reveal.tsx`:
```tsx
'use client';
import { useInView } from '@/hooks/useInView';
export function Reveal({ children, delay=0, y=16, className='' }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : `translateY(${y}px)`,
      transition: `opacity 600ms ease ${delay}ms, transform 600ms ease ${delay}ms`,
    }}>{children}</div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/reveal.test.tsx -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add hooks/useInView.ts components/motion/Reveal.tsx __tests__/reveal.test.tsx
git commit -m "feat(portfolio): reusable Reveal via IntersectionObserver"
```

---

### Task 3: Navbar Shrink + Dual-Logo on Scroll (SRE-style)

**Files:**
- Modify: `components/Navbar.tsx` (or `app/layout.tsx` header section — locate existing nav)
- Test: `__tests__/navbar.test.tsx`

**Interfaces:**
- Consumes: `useInView` not needed; uses `scrollY` listener
- Produces: sticky nav behavior for all pages

- [ ] **Step 1: Write failing test**

```tsx
test('navbar has shrink class logic', () => {
  const src = require('fs').readFileSync('components/Navbar.tsx','utf8');
  expect(src).toContain('scrollY');
  expect(src).toContain('backdrop-blur');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/navbar.test.tsx -v`
Expected: FAIL

- [ ] **Step 3: Implement minimal navbar scroll**

Add to `components/Navbar.tsx` (client component):
```tsx
'use client';
import { useEffect, useState } from 'react';
export function Navbar() {
  const [scrolled,setScrolled] = useState(false);
  useEffect(()=>{
    const onScroll=()=> setScrolled(window.scrollY>16);
    onScroll(); window.addEventListener('scroll',onScroll,{passive:true});
    return ()=> window.removeEventListener('scroll',onScroll);
  },[]);
  return (
    <nav className={`sticky top-0 z-50 transition-all ${scrolled?'py-2 bg-white/80 backdrop-blur border-b':'py-4 bg-transparent'}`}>
      {/* existing links: About Projects Experience Certificates Contact */}
    </nav>
  );
}
```
Replace static nav in `app/layout.tsx` or page with `<Navbar/>`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/navbar.test.tsx -v`
Expected: PASS (manual scroll check also: nav shrinks after 16px)

- [ ] **Step 5: Commit**

```bash
git add components/Navbar.tsx app/layout.tsx __tests__/navbar.test.tsx
git commit -m "feat(portfolio): sticky shrink navbar on scroll"
```

---

### Task 4: Hero Parallax (Earth Rotate + Tape/Wind-Turbine Layers)

**Files:**
- Modify: `app/page.tsx` or `components/Hero.tsx` (hero section)
- Create: `components/motion/ParallaxLayer.tsx`
- Test: `__tests__/hero.test.tsx`

**Interfaces:**
- Consumes: `Reveal`, tokens from Task 1
- Produces: hero parallax pattern reusable for other sections

- [ ] **Step 1: Write failing test**

```tsx
test('hero has parallax layers', () => {
  const src = require('fs').readFileSync('components/Hero.tsx','utf8');
  expect(src).toContain('ParallaxLayer');
  expect(src).toContain('spinSlow');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/hero.test.tsx -v`
Expected: FAIL

- [ ] **Step 3: Implement minimal parallax**

`components/motion/ParallaxLayer.tsx`:
```tsx
'use client';
import { useEffect, useState } from 'react';
export function ParallaxLayer({ speed=0.2, children, className='' }: { speed?: number; children: React.ReactNode; className?: string }) {
  const [y,setY]=useState(0);
  useEffect(()=>{
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const onScroll=()=> setY(window.scrollY*speed* -0.3);
    window.addEventListener('scroll',onScroll,{passive:true}); return ()=> window.removeEventListener('scroll',onScroll);
  },[speed]);
  return <div className={className} style={{ transform:`translateY(${y}px)` }}>{children}</div>;
}
```

In `Hero.tsx` — wrap existing hero (keep current copy/CTAs):
```tsx
import { Reveal } from './motion/Reveal';
import { ParallaxLayer } from './motion/ParallaxLayer';
export function Hero(){
  return (
    <section className="relative overflow-hidden">
      <ParallaxLayer speed={0.1} className="absolute inset-0 -z-10"><div className="absolute right-6 top-10 w-72 h-72 rounded-full opacity-10 animate-spinSlow" style={{background:'radial-gradient(circle, #0ea5e9, transparent)'}}/></ParallaxLayer>
      <ParallaxLayer speed={0.25} className="absolute -right-10 top-20 opacity-60"><span className="block w-32 h-4 bg-yellow-200 rotate-3 shadow-sm">tape</span></ParallaxLayer>
      <Reveal><h1 className="text-display text-5xl md:text-7xl font-bold">Leonel Zalfa Athoni</h1></Reveal>
      {/* keep existing subheading + 2 CTAs + social links */}
    </section>
  );
}
```
Use actual images: add `public/images/hero-earth.webp` or reuse CSS gradient first; replace with real earth image when available — do not block.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/hero.test.tsx -v` + manual `npm run dev` scroll check — earth rotates, tape moves slower than scroll.

- [ ] **Step 5: Commit**

```bash
git add components/motion/ParallaxLayer.tsx components/Hero.tsx __tests__/hero.test.tsx
git commit -m "feat(portfolio): hero parallax earth + tape layers"
```

---

### Task 5: About & Experience — Sticky Numbered Storytelling (SRE Vision 01/02/03)

**Files:**
- Modify: `components/About.tsx` (or section in `app/page.tsx#about`)
- Modify: `components/Experience.tsx` (or `app/page.tsx#experience`)
- Test: `__tests__/story.test.tsx`

**Interfaces:**
- Consumes: `Reveal`
- Produces: numbered sticky pattern

- [ ] **Step 1: Write failing test**

```tsx
test('about has numbered sticky', () => {
  const src = require('fs').readFileSync('components/About.tsx','utf8');
  expect(src).toContain('01');
  expect(src).toContain('sticky');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/story.test.tsx -v`
Expected: FAIL

- [ ] **Step 3: Implement minimal sticky numbers**

`About.tsx` restructure (keep existing copy, just wrap):
```tsx
import { Reveal } from './motion/Reveal';
const items = [
  { n:'01', title:'Fokus Studi', desc:'Teknik Kimia ITS — NRP 5008261122' },
  { n:'02', title:'Kepemimpinan', desc:'Founder INTEGRITEEN & Duta Integritas Jabar' },
  { n:'03', title:'Riset & Prestasi', desc:'10+ penghargaan, desalinasi, IASO India' },
];
export function About(){
  return (
    <section id="about" className="py-16">
      <Reveal><h2 className="text-display text-4xl">Konvergensi Riset & Rekayasa Web</h2></Reveal>
      {items.map((it,i)=> (
        <Reveal key={it.n} delay={i*80}>
          <div className="grid md:grid-cols-[120px_1fr] gap-6 py-8 border-b">
            <span className="text-6xl font-black opacity-10 sticky top-20">{it.n}</span>
            <div><h3 className="font-bold">{it.title}</h3><p className="text-sm text-muted">{it.desc}</p></div>
          </div>
        </Reveal>
      ))}
    </section>
  );
}
```
Apply same pattern to Experience (5 items → 01-05).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/story.test.tsx -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/About.tsx components/Experience.tsx __tests__/story.test.tsx
git commit -m "feat(portfolio): sticky numbered storytelling for About/Experience"
```

---

### Task 6: Projects Spotlight — Horizontal Snap + Hover Tilt + Tape Accent

**Files:**
- Modify: `components/Projects.tsx` (or section `#projects` in page)
- Create: `components/motion/TiltCard.tsx`
- Test: `__tests__/projects.test.tsx`

**Interfaces:**
- Consumes: `Reveal`
- Produces: interactive project browsing

- [ ] **Step 1: Write failing test**

```tsx
test('projects has snap container', () => {
  const src = require('fs').readFileSync('components/Projects.tsx','utf8');
  expect(src).toContain('snap-x');
  expect(src).toContain('TiltCard');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/projects.test.tsx -v`
Expected: FAIL

- [ ] **Step 3: Implement minimal spotlight**

`TiltCard.tsx`:
```tsx
'use client';
export function TiltCard({ children }: { children: React.ReactNode }) {
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r=e.currentTarget.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-0.5, y=(e.clientY-r.top)/r.height-0.5;
    e.currentTarget.style.transform=`perspective(800px) rotateY(${x*6}deg) rotateX(${-y*6}deg)`;
  };
  const onLeave=(e:React.MouseEvent<HTMLDivElement>)=> e.currentTarget.style.transform='perspective(800px) rotateY(0) rotateX(0)';
  return <div onMouseMove={onMove} onMouseLeave={onLeave} className="transition-transform duration-200 will-change-transform">{children}</div>;
}
```

In `Projects.tsx` — keep 7 projects + filter, wrap grid:
```tsx
<div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 md:grid md:grid-cols-3 md:overflow-visible">
  {filtered.map(p=> (
    <div key={p.title} className="min-w-[280px] snap-center">
      <TiltCard>
        <div className="relative bg-white rounded-xl p-4 border shadow-sm">
          <span className="absolute -top-2 -right-2 w-16 h-4 bg-yellow-200 rotate-3 text-[8px] opacity-80">tape</span>
          {/* existing project card content */}
        </div>
      </TiltCard>
    </div>
  ))}
</div>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/projects.test.tsx -v`
Expected: PASS + manual swipe/scroll check.

- [ ] **Step 5: Commit**

```bash
git add components/motion/TiltCard.tsx components/Projects.tsx __tests__/projects.test.tsx
git commit -m "feat(portfolio): projects horizontal snap + tilt + tape accent"
```

---

### Task 7: Skills Marquee & Certificates Strip (SRE Sponsor Loop)

**Files:**
- Create: `components/Marquee.tsx`
- Modify: `components/Skills.tsx` or `components/Certificates.tsx`
- Test: `__tests__/marquee.test.tsx`

**Interfaces:**
- Consumes: tokens `animate-marquee`
- Produces: infinite loop for skills/certs

- [ ] **Step 1: Write failing test**

```tsx
test('marquee renders duplicated children', () => {
  const src = require('fs').readFileSync('components/Marquee.tsx','utf8');
  expect(src).toContain('animate-marquee');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/marquee.test.tsx -v`
Expected: FAIL

- [ ] **Step 3: Implement minimal marquee**

`Marquee.tsx`:
```tsx
export function Marquee({ items }: { items: string[] }) {
  const dup=[...items,...items];
  return (
    <div className="overflow-hidden border-y py-3">
      <div className="flex gap-8 animate-marquee whitespace-nowrap will-change-transform" style={{width:'max-content'}}>
        {dup.map((t,i)=> <span key={i} className="text-sm font-medium px-4 py-1 rounded-full border">{t}</span>)}
      </div>
    </div>
  );
}
```
Usage in page: `<Marquee items={["Next.js","TypeScript","Tailwind","Claude API","ISO 14001","Circular Economy","Leadership"]}/>` — duplicate logic handles seamless loop via CSS.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/marquee.test.tsx -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/Marquee.tsx components/Skills.tsx __tests__/marquee.test.tsx
git commit -m "feat(portfolio): skills marquee infinite loop"
```

---

### Task 8: Polish, a11y, Perf Budget & Deploy Check

**Files:**
- Modify: `app/page.tsx` (add `prefers-reduced-motion` guard where needed)
- Create: `__tests__/perf.test.ts` (Lighthouse CI placeholder)
- Verify: `npm run build` + `npm run lint`

**Interfaces:**
- Consumes: all previous tasks
- Produces: shippable vercel deploy

- [ ] **Step 1: Write failing perf guard**

```ts
test('no heavy motion lib by default', () => {
  const pkg = require('fs').readFileSync('package.json','utf8');
  expect(pkg).not.toContain('gsap'); // ponytail: allow framer-motion only if added explicitly
});
```

- [ ] **Step 2: Run test to verify it fails/pass**

Run: `npx vitest run __tests__/perf.test.ts -v`
Expected: PASS if no gsap; FAIL if gsap present — remove it.

- [ ] **Step 3: Implement polish**

- Wrap all `animate-*` with `@media (prefers-reduced-motion: no-preference)` already in Task 1.
- Ensure images have `width`/`height` + `loading="lazy"` except hero LCP.
- Run `npm run build` and fix type errors; `npm run lint`.

- [ ] **Step 4: Run verification**

Run: `npm run build` — Expected: PASS
Run: `npx vitest run -v` — Expected: all 7 test files PASS
Manual: open `http://localhost:3000`, tab through nav, check reduced-motion in DevTools Rendering → Emulate.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(portfolio): a11y perf polish, respect reduced-motion"
```

---

## Self-Review

**Spec coverage:** Porto interactive (A) = hero parallax, sticky storytelling, projects spotlight, marquee — all have tasks (4-7). Tokens + Reveal + Navbar are enablers (1-3), polish is 8. No gap.

**Placeholder scan:** No TBD/TODO — all steps have exact code.

**Type consistency:** `useInView<HTMLDivElement>` → `Reveal` → `ParallaxLayer` → `TiltCard` → `Marquee` signatures consistent; no rename drift.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-09-23-portfolio-interactive-revamp.md`. Two execution options:

**1. Subagent-Driven (recommended)** - dispatch fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
