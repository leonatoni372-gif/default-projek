// Demo page — copy to app/portfolio-preview/page.tsx untuk preview di workspace ini
// atau ke app/page.tsx di repo portfolio-leonel-liart
import { Navbar } from './components/Navbar';
import { Reveal } from './components/motion/Reveal';
import { ParallaxLayer } from './components/motion/ParallaxLayer';
import { TiltCard } from './components/motion/TiltCard';
import { Marquee } from './components/Marquee';

const projects = [
  { title: 'E-Commerce Web App', tag: 'Tech & Web', year: '2024—', desc: 'Platform e-commerce Next.js + transaksi digital', stack: ['Next.js', 'React', 'Tailwind'] },
  { title: 'Sensor-Based Cane IoT', tag: 'IoT Arduino', year: '2025', desc: 'Tongkat pintar ultrasonik untuk tunanetra', stack: ['Arduino', 'Sensors'] },
  { title: 'AI Fluency Claude API', tag: 'AI', year: '2026', desc: 'Otomasi riset dengan Claude API', stack: ['Claude API', 'Prompt'] },
  { title: 'Seawater Desalination', tag: 'Riset Kimia', year: '2025', desc: 'Desalinasi ramah energi untuk pesisir', stack: ['Desalinasi', 'Sustainability'] },
  { title: 'Megathrust & Coastal Flooding', tag: 'Riset', year: '2026', desc: 'Mitigasi banjir rob Indramayu', stack: ['Mitigasi', 'Pesisir'] },
  { title: 'Biodegradasi Zophobas morio', tag: 'Riset', year: '2024-25', desc: 'Larva pengurai plastik', stack: ['Biodegradasi', 'Polimer'] },
  { title: 'Garlic Extract H1N1', tag: 'Riset', year: '2025', desc: 'Bioaktif Allium sativum untuk influenza', stack: ['Fitokimia', 'Alam'] },
];

export default function DemoPortfolio() {
  return (
    <div className="min-h-screen bg-[#fafaf8] text-zinc-900">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden px-6 py-16 md:py-24 max-w-6xl mx-auto">
        <ParallaxLayer speed={0.1} className="absolute inset-0 -z-10">
          <div className="absolute right-6 top-10 w-72 h-72 rounded-full opacity-10 animate-[spinSlow_40s_linear_infinite]" style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)' }} />
        </ParallaxLayer>
        <ParallaxLayer speed={0.25} className="absolute -right-10 top-20 opacity-60">
          <span className="block w-32 h-4 bg-yellow-200 rotate-3 shadow-sm text-[9px] text-center">tape — SRE style</span>
        </ParallaxLayer>
        <ParallaxLayer speed={0.15} className="absolute left-10 bottom-10 opacity-20">
          <span className="block w-2 h-2 bg-black rounded-full" /> <span className="block w-2 h-2 bg-black rounded-full mt-2 ml-4" />
        </ParallaxLayer>

        <Reveal>
          <p className="text-xs tracking-widest uppercase">Teknik Kimia ITS &apos;26 — Founder INTEGRITEEN</p>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="text-display text-5xl md:text-7xl font-black leading-none mt-3">
            Leonel Zalfa
            <br />
            Athoni
          </h1>
        </Reveal>
        <Reveal delay={160} y={12}>
          <p className="mt-4 max-w-2xl text-zinc-600">Menghubungkan metodologi riset proses ilmiah dengan arsitektur web modern yang estetis, cepat, dan fungsional.</p>
        </Reveal>
        <Reveal delay={240}>
          <div className="flex gap-3 mt-6">
            <a href="#projects" className="px-5 py-2 bg-black text-white rounded-full text-sm">
              Jelajahi Proyek & Riset
            </a>
            <a href="#contact" className="px-5 py-2 border rounded-full text-sm">
              Hubungi Saya
            </a>
          </div>
        </Reveal>
      </section>

      <Marquee items={['Next.js', 'TypeScript', 'Tailwind', 'Claude API', 'ISO 14001', 'Circular Economy', 'Arduino', 'Desalinasi', 'Leadership']} />

      {/* ABOUT — sticky numbered */}
      <section id="about" className="max-w-6xl mx-auto px-6 py-16">
        <Reveal>
          <h2 className="text-display text-4xl font-bold">Konvergensi Riset & Rekayasa Web</h2>
        </Reveal>
        {[
          { n: '01', title: 'Fokus Studi', desc: 'Teknik Kimia ITS — NRP 5008261122 — pemodelan aliran & reaksi' },
          { n: '02', title: 'Kepemimpinan', desc: 'Founder INTEGRITEEN & Duta Integritas Jabar — kampanye karakter' },
          { n: '03', title: 'Riset & Prestasi', desc: '10+ penghargaan — desalinasi, megathrust, biodegradasi, IASO India' },
        ].map((it, i) => (
          <Reveal key={it.n} delay={i * 80}>
            <div className="grid md:grid-cols-[120px_1fr] gap-6 py-8 border-b">
              <span className="text-6xl font-black opacity-10 sticky top-20 h-fit">{it.n}</span>
              <div>
                <h3 className="font-bold">{it.title}</h3>
                <p className="text-sm text-zinc-600">{it.desc}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* PROJECTS — snap + tilt */}
      <section id="projects" className="max-w-6xl mx-auto px-6 py-16">
        <Reveal>
          <h2 className="text-display text-3xl font-bold">Portofolio Terpilih — 7 Projects</h2>
          <p className="text-sm text-zinc-600 mt-2">Horizontal snap di mobile (ala SRE spotlight), grid di desktop, hover tilt.</p>
        </Reveal>
        <div className="mt-6 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 md:grid md:grid-cols-3 md:overflow-visible scrollbar-hide">
          {projects.map((p) => (
            <div key={p.title} className="min-w-[280px] snap-center">
              <TiltCard>
                <div className="relative bg-white rounded-xl p-4 border shadow-sm h-full">
                  <span className="absolute -top-2 -right-2 w-16 h-4 bg-yellow-200 rotate-3 text-[8px] flex items-center justify-center opacity-80">tape</span>
                  <p className="text-[11px] tracking-widest uppercase text-zinc-500">
                    {p.tag} — {p.year}
                  </p>
                  <h3 className="font-bold mt-1">{p.title}</h3>
                  <p className="text-sm text-zinc-600 mt-1">{p.desc}</p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {p.stack.map((s) => (
                      <span key={s} className="text-[11px] px-2 py-1 bg-zinc-100 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </TiltCard>
            </div>
          ))}
        </div>
      </section>

      {/* EXPERIENCE */}
      <section id="experience" className="max-w-6xl mx-auto px-6 py-12">
        <Reveal>
          <h2 className="text-display text-2xl font-bold">Organisasi & Kepemimpinan</h2>
        </Reveal>
        {[
          ['01', 'INTEGRITEEN — Founder & Chairman'],
          ['02', 'West Java Integrity Ambassador'],
          ['03', 'TERRABYTE — Vice Chairman'],
          ['04', 'Green Generation — Planning Division'],
          ['05', 'English Club SASI — Planning Division'],
        ].map(([n, t], i) => (
          <Reveal key={n} delay={i * 60}>
            <div className="flex gap-6 py-4 border-b">
              <span className="font-black opacity-10">{n}</span>
              <span className="text-sm">{t}</span>
            </div>
          </Reveal>
        ))}
      </section>

      <section id="contact" className="max-w-6xl mx-auto px-6 py-16">
        <Reveal>
          <div className="rounded-2xl bg-black text-white p-8 md:p-12 text-center">
            <h2 className="text-display text-3xl">Mari Terhubung</h2>
            <p className="text-sm opacity-70 mt-2">leonatoni372@gmail.com — 085285979908</p>
            <a href="mailto:leonatoni372@gmail.com" className="inline-block mt-4 px-6 py-2 bg-white text-black rounded-full text-sm">
              Kirim Email
            </a>
          </div>
        </Reveal>
      </section>

      <style>{`@keyframes spinSlow{0%{transform:rotate(0)}100%{transform:rotate(360deg)}} @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
    </div>
  );
}
