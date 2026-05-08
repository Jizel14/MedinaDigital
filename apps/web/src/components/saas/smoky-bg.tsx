/**
 * Olive-toned smoky background. Three layered SVG noise/blob filters give a
 * soft, organic feel without bitmap textures. Palette pulled from the brand
 * olive + clay tokens so the SaaS / auth surfaces feel of a piece with the
 * marketplace.
 */
export function SmokyBg() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base wash: olive-100 → clay-50 vertical fade */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, var(--color-olive-100) 0%, var(--color-clay-50) 55%, var(--color-clay-100) 100%)',
        }}
      />

      {/* Soft olive smoke blob, top-left */}
      <div
        className="absolute -left-32 -top-40 h-[60vmax] w-[60vmax] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, var(--color-olive-300) 0%, transparent 60%)',
        }}
      />

      {/* Warmer clay smoke, bottom-right */}
      <div
        className="absolute -bottom-48 -right-32 h-[55vmax] w-[55vmax] rounded-full opacity-50 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 70% 70%, var(--color-clay-300) 0%, transparent 65%)',
        }}
      />

      {/* Olive depth on the right edge */}
      <div
        className="absolute right-0 top-1/3 h-[40vmax] w-[40vmax] rounded-full opacity-30 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 60% 50%, var(--color-olive-500) 0%, transparent 60%)',
        }}
      />

      {/* SVG fractal noise grain layered on top — gives the smoky texture */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.08] mix-blend-multiply"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="medina-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#medina-noise)" />
      </svg>
    </div>
  );
}
