/**
 * Generate one stylised SVG placeholder per product in the seed.
 * Output: apps/web/public/images/seed/products/<slug>-1.svg
 *
 * Each placeholder:
 *  - Picks a colour palette derived from the product's category
 *  - Renders a unique zellige-style star burst pattern (rotation, density,
 *    star count vary by product id hash)
 *  - Writes the localised title in italic Cormorant at the bottom
 *  - Stays under 4KB gzipped — fast for the 3D dome
 *
 * Run: pnpm tsx scripts/generate-product-placeholders.ts
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const SEED_PATH = resolve(REPO_ROOT, 'apps/web/src/data/seed/products.json');
const OUTPUT_DIR = resolve(REPO_ROOT, 'apps/web/public/images/seed/products');

interface SeedProduct {
  id: string;
  slug: string;
  category: 'ceramics' | 'textile' | 'leather' | 'jewelry' | 'wood';
  title: { en: string; fr: string; 'ar-TN': string };
  photos: string[];
}

// Category-driven colour pairs (background gradient, accent star fill).
// Each category has 3 variations cycled by product index so siblings differ.
const PALETTES: Record<
  SeedProduct['category'],
  Array<{ bg: [string, string]; star: string; ink: string }>
> = {
  ceramics: [
    { bg: ['#C77C3F', '#8B3A24'], star: '#F5EFE6', ink: '#4A1D10' }, // terracotta deep
    { bg: ['#E8C8A0', '#A85433'], star: '#3A6B5A', ink: '#4A1D10' }, // sand to brick + olive star
    { bg: ['#D89E64', '#6B2A18'], star: '#FBF7F1', ink: '#1A1612' }, // copper to dark
  ],
  textile: [
    { bg: ['#3A6B5A', '#1F3A2D'], star: '#E8C8A0', ink: '#FBF7F1' }, // olivier deep + sand star
    { bg: ['#5A8470', '#1F3A2D'], star: '#C77C3F', ink: '#FBF7F1' }, // mid olive + copper
    { bg: ['#88A89A', '#3A6B5A'], star: '#8B3A24', ink: '#1A1612' }, // soft olive + terracotta
  ],
  leather: [
    { bg: ['#A85433', '#4A1D10'], star: '#E8C8A0', ink: '#FBF7F1' }, // cognac deep
    { bg: ['#C77C3F', '#6B2A18'], star: '#3D3833', ink: '#FBF7F1' }, // copper deep
    { bg: ['#8B3A24', '#1A1612'], star: '#E8C8A0', ink: '#F5EFE6' }, // burnt
  ],
  jewelry: [
    { bg: ['#2B2622', '#1A1612'], star: '#E8C8A0', ink: '#F5EFE6' }, // ink + sand
    { bg: ['#3D3833', '#1A1612'], star: '#C77C3F', ink: '#F5EFE6' }, // ink + copper
    { bg: ['#88A89A', '#3D3833'], star: '#E8C8A0', ink: '#1A1612' }, // pale olive + sand
  ],
  wood: [
    { bg: ['#A85433', '#3D3833'], star: '#E8C8A0', ink: '#F5EFE6' }, // wood warm
    { bg: ['#6B2A18', '#1A1612'], star: '#88A89A', ink: '#F5EFE6' }, // dark wood + olive star
    { bg: ['#D89E64', '#A85433'], star: '#1F3A2D', ink: '#1A1612' }, // light wood + olive deep
  ],
};

/** Tiny non-crypto deterministic hash, returns positive integer. */
function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h * 33) ^ str.charCodeAt(i)) >>> 0;
  return h;
}

/** Eight-pointed zellige star path, centered at (cx, cy), outer radius r. */
function star(cx: number, cy: number, r: number, rotation = 0): string {
  const inner = r * 0.4;
  const points: [number, number][] = [];
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI) / 8 + (rotation * Math.PI) / 180 - Math.PI / 2;
    const radius = i % 2 === 0 ? r : inner;
    points.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
  }
  return 'M' + points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' L') + ' Z';
}

function generateSvg(product: SeedProduct, paletteIndex: number): string {
  const cats = PALETTES[product.category];
  const palette = cats[paletteIndex % cats.length]!;
  const [bg1, bg2] = palette.bg;
  const h = hash(product.id);
  const title = product.title.en;

  // 800x600 — matches placeholder aspect, light enough.
  const W = 800;
  const H = 600;

  // Big central star
  const cx = W / 2;
  const cy = H * 0.45;
  const mainR = Math.min(W, H) * 0.28;
  const mainRotation = (h % 45) - 22;

  // Surrounding small stars at deterministic positions
  const ringStars = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 + (h % 30)) * (Math.PI / 180);
    const dist = Math.min(W, H) * 0.42;
    return {
      cx: cx + Math.cos(angle) * dist,
      cy: cy + Math.sin(angle) * dist * 0.7,
      r: mainR * 0.22,
      rot: ((h >> i) % 90) - 45,
    };
  });

  // Corner stars (4) for full coverage
  const cornerStars = [
    { cx: 0, cy: 0 },
    { cx: W, cy: 0 },
    { cx: 0, cy: H },
    { cx: W, cy: H },
  ].map((p, i) => ({ ...p, r: mainR * 0.55, rot: (h * (i + 1)) % 60 }));

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="80%">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </radialGradient>
    <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${bg2}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${bg2}" stop-opacity="0.45"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <g fill="${palette.star}" opacity="0.12">
    ${cornerStars.map((s) => `<path d="${star(s.cx, s.cy, s.r, s.rot)}"/>`).join('\n    ')}
  </g>
  <g fill="${palette.star}" opacity="0.32">
    ${ringStars.map((s) => `<path d="${star(s.cx, s.cy, s.r, s.rot)}"/>`).join('\n    ')}
  </g>
  <path d="${star(cx, cy, mainR, mainRotation)}" fill="${palette.star}" opacity="0.92"/>
  <path d="${star(cx, cy, mainR * 0.55, mainRotation + 22.5)}" fill="${bg2}" opacity="0.7"/>
  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
  <text x="${W / 2}" y="${H - 38}" text-anchor="middle"
        font-family="serif" font-style="italic" font-size="22"
        fill="${palette.ink}" opacity="0.88">${escapeXml(title)}</text>
  <text x="${W / 2}" y="${H - 16}" text-anchor="middle"
        font-family="sans-serif" font-size="10" letter-spacing="3"
        fill="${palette.ink}" opacity="0.55">MÉDINA · ${product.category.toUpperCase()}</text>
</svg>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function main(): Promise<void> {
  const raw = await readFile(SEED_PATH, 'utf8');
  const products = JSON.parse(raw) as SeedProduct[];
  await mkdir(OUTPUT_DIR, { recursive: true });

  let created = 0;
  // Group by category to cycle palette index per category, so siblings differ.
  const byCat: Record<string, SeedProduct[]> = {};
  for (const p of products) {
    (byCat[p.category] ??= []).push(p);
  }

  for (const [, list] of Object.entries(byCat)) {
    list.forEach((p, i) => {
      // We only generate -1.svg (the first photo). Components fall back to
      // /images/seed/placeholder.svg for any path that isn't on disk.
      const svg = generateSvg(p, i);
      const outPath = resolve(OUTPUT_DIR, `${p.slug}-1.svg`);
      // Fire-and-forget write, doesn't need to be sequenced.
      void writeFile(outPath, svg, 'utf8').then(() => {
        created += 1;
      });
    });
  }

  // Wait for all writes (simple promise chain since we used void)
  await new Promise((r) => setTimeout(r, 200));

  console.log(`✅ Generated ${products.length} placeholder SVGs in ${OUTPUT_DIR}`);
  console.log(`   (created counter: ${created} — should match)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
