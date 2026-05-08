import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';

export const HERO_W = 1920;
export const HERO_H = 1080;
export const HERO_FPS = 30;
export const HERO_DURATION_FRAMES = 6 * HERO_FPS; // 6s loop

const PALETTE = {
  clay100: '#F5EFE6',
  clay300: '#E8C8A0',
  clay500: '#C77C3F',
  clay700: '#8B3A24',
  clay900: '#4A1D10',
  ink900: '#2B2622',
  olive500: '#5A8470',
  olive700: '#3A6B5A',
  gold: '#D4A24C', // accent or
};

/** 8-pointed zellige star path centered at origin, radius 1, scaled at draw. */
const STAR_PATH = (() => {
  const r = 1;
  const i = 0.4;
  const m = 0.142;
  return `M0,${-r} L${m},${-i / 1.17} L${i},${-i} L${i / 1.17},${-m} L${r},0 L${i / 1.17},${m} L${i},${i} L${m},${i / 1.17} L0,${r} L${-m},${i / 1.17} L${-i},${i} L${-i / 1.17},${m} L${-r},0 L${-i / 1.17},${-m} L${-i},${-i} L${-m},${-i / 1.17} Z`;
})();

const ease = Easing.bezier(0.32, 0.08, 0.24, 1);

/** A periodic value 0→1→0 (sine half-wave) used for breathing pulses. */
function pulse(frame: number, period: number, phase = 0) {
  const t = ((frame + phase) % period) / period;
  return 0.5 - 0.5 * Math.cos(t * Math.PI * 2);
}

/** Linear loop 0→1, useful for traveling elements. */
function loopFrac(frame: number, period: number, phase = 0) {
  return ((frame + phase) % period) / period;
}

export function HeroBackground() {
  const frame = useCurrentFrame();
  const total = HERO_DURATION_FRAMES;
  // Use a wrapped frame so first/last frames match (perfect loop).
  const f = frame % total;

  // ── 1. Animated gradient background — slow drift + hue shift via stops ──
  // Two overlapping radial gradients moving at different speeds.
  const g1x = 30 + Math.sin((f / total) * Math.PI * 2) * 12; // %
  const g1y = 35 + Math.cos((f / total) * Math.PI * 2) * 8;
  const g2x = 70 - Math.sin((f / total) * Math.PI * 2 + Math.PI / 3) * 14;
  const g2y = 65 + Math.cos((f / total) * Math.PI * 2 + Math.PI / 3) * 10;

  // ── 2. Big floating zellige stars ──
  const bigStars = [
    { x: 0.18, y: 0.32, r: 220, period: 90, phase: 0, color: PALETTE.clay700 },
    { x: 0.78, y: 0.22, r: 180, period: 110, phase: 30, color: PALETTE.gold },
    { x: 0.62, y: 0.78, r: 240, period: 130, phase: 60, color: PALETTE.olive700 },
  ];

  // ── 3. Constellation of small stars (deterministic positions) ──
  const smallStars = Array.from({ length: 14 }, (_, i) => ({
    x: ((i * 7919) % 100) / 100,
    y: ((i * 3271 + 37) % 100) / 100,
    r: 22 + ((i * 13) % 16),
    period: 50 + ((i * 7) % 30),
    phase: (i * 11) % 60,
    color: i % 3 === 0 ? PALETTE.gold : i % 3 === 1 ? PALETTE.clay500 : PALETTE.olive500,
  }));

  // ── 4. Diagonal traveling threads (3 dotted lines) ──
  const threads = Array.from({ length: 3 }, (_, i) => {
    const offset = loopFrac(f, total, i * 60);
    return {
      // Thread travels from (-200, top - i*200) to (W+200, top + i*100)
      x1: -200 + offset * (HERO_W + 600),
      y1: 200 + i * 250,
      x2: -100 + offset * (HERO_W + 600),
      y2: 280 + i * 250,
      color: i % 2 === 0 ? PALETTE.gold : PALETTE.olive500,
      opacity: 0.18 + 0.12 * pulse(f, 60, i * 20),
    };
  });

  // ── 5. Editorial microtypos cycling — at most one visible at a time ──
  const taglines = [
    { en: 'Hand-thrown · Nabeul', start: 10, end: 60 },
    { en: 'Verified at the source', start: 60, end: 110 },
    { en: 'Olive wood · Tozeur', start: 110, end: 160 },
    { en: 'Made by hand', start: 160, end: HERO_DURATION_FRAMES },
  ];
  const activeTagline = taglines.find((t) => f >= t.start && f < t.end);

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.clay100 }}>
      {/* Base gradient layer — clay-100 → clay-300 → clay-500, drifts */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 60% at ${g1x}% ${g1y}%, ${PALETTE.clay300} 0%, transparent 60%),
                       radial-gradient(ellipse 60% 50% at ${g2x}% ${g2y}%, ${PALETTE.clay500}aa 0%, transparent 65%),
                       linear-gradient(180deg, ${PALETTE.clay100} 0%, ${PALETTE.clay300} 100%)`,
        }}
      />

      {/* Grain texture (subtle radial pattern) */}
      <AbsoluteFill
        style={{
          opacity: 0.08,
          backgroundImage: `radial-gradient(${PALETTE.ink900} 0.7px, transparent 1px)`,
          backgroundSize: '4px 4px',
        }}
      />

      {/* SVG layer with stars + threads */}
      <svg
        width={HERO_W}
        height={HERO_H}
        viewBox={`0 0 ${HERO_W} ${HERO_H}`}
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Diagonal traveling threads */}
        {threads.map((t, i) => (
          <line
            key={`thread-${i}`}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.color}
            strokeWidth={2}
            strokeDasharray="6 12"
            opacity={t.opacity}
          />
        ))}

        {/* Big floating zellige stars (slow rotation + scale pulse) */}
        {bigStars.map((s, i) => {
          const cx = s.x * HERO_W;
          const cy = s.y * HERO_H;
          const scale = s.r * (0.85 + 0.15 * pulse(f, s.period, s.phase));
          const rotation = (f / total) * 360 * (i % 2 === 0 ? 0.5 : -0.4);
          const opacity = 0.18 + 0.1 * pulse(f, s.period, s.phase);
          return (
            <g
              key={`big-${i}`}
              transform={`translate(${cx}, ${cy}) rotate(${rotation}) scale(${scale})`}
              opacity={opacity}
            >
              <path d={STAR_PATH} fill={s.color} />
            </g>
          );
        })}

        {/* Small stars constellation — gentle pulse */}
        {smallStars.map((s, i) => {
          const cx = s.x * HERO_W;
          const cy = s.y * HERO_H;
          const scale = s.r * (0.7 + 0.4 * pulse(f, s.period, s.phase));
          const opacity = 0.3 + 0.4 * pulse(f, s.period, s.phase);
          return (
            <g
              key={`small-${i}`}
              transform={`translate(${cx}, ${cy}) scale(${scale})`}
              opacity={opacity}
            >
              <path d={STAR_PATH} fill={s.color} />
            </g>
          );
        })}

        {/* Centerpiece glow — oversized soft star, very low opacity, never fully fades */}
        <g
          transform={`translate(${HERO_W / 2}, ${HERO_H / 2}) rotate(${(f / total) * 22.5}) scale(${
            420 * (0.95 + 0.05 * pulse(f, total))
          })`}
          opacity={0.06}
        >
          <path d={STAR_PATH} fill={PALETTE.gold} />
        </g>
      </svg>

      {/* Editorial microtypo */}
      {activeTagline && (
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: 120,
          }}
        >
          <Tagline
            frame={f}
            start={activeTagline.start}
            end={activeTagline.end}
            text={activeTagline.en}
          />
        </AbsoluteFill>
      )}

      {/* Top + bottom soft fades for legibility against text overlays */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${PALETTE.clay100}aa 0%, transparent 25%, transparent 75%, ${PALETTE.clay300}88 100%)`,
        }}
      />
    </AbsoluteFill>
  );
}

function Tagline({
  frame,
  start,
  end,
  text,
}: {
  frame: number;
  start: number;
  end: number;
  text: string;
}) {
  const len = end - start;
  const local = frame - start;
  // Fade in over 12 frames, hold, fade out over 18 frames.
  const inOpacity = interpolate(local, [0, 12], [0, 1], {
    extrapolateRight: 'clamp',
    easing: ease,
  });
  const outOpacity = interpolate(local, [len - 18, len], [1, 0], {
    extrapolateLeft: 'clamp',
    easing: ease,
  });
  const opacity = Math.min(inOpacity, outOpacity);
  const y = interpolate(local, [0, 18], [16, 0], { extrapolateRight: 'clamp', easing: ease });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontStyle: 'italic',
        fontWeight: 600,
        fontSize: 64,
        color: PALETTE.ink900,
        letterSpacing: '-0.01em',
        textShadow: '0 2px 24px rgba(245, 239, 230, 0.8)',
      }}
    >
      <span style={{ color: PALETTE.clay700, marginInlineEnd: 16 }}>✦</span>
      {text}
    </div>
  );
}
