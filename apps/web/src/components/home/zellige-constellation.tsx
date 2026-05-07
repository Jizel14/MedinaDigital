'use client';

import { useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { Locale, Region, CategorySlug } from '@medina/shared-types';
import { TunisiaMap, easeMedina, durations, cn } from '@medina/ui';

export interface ZelligeConstellationProps {
  regions: Region[];
  locale: Locale;
  /** Total products available — shown in the headline overlay if provided. */
  productCount?: number;
  className?: string;
}

const VIEWBOX_W = 1600;
const VIEWBOX_H = 900;

// Eight-pointed zellige star path. Coordinates are at the final px size so
// Framer Motion can animate scale/rotate via style transform without fighting
// an SVG `transform` attribute (the two paths conflict and the SVG one loses).
const STAR_RADIUS = 32;
const STAR_PATH = (() => {
  const r = STAR_RADIUS;
  const i = r * 0.4; // inner radius for star points
  const m = r * 0.142; // midpoint inflection
  return [
    `M0 ${-r}`,
    `L${m} ${-i / 1.17}`,
    `L${i} ${-i}`,
    `L${i / 1.17} ${-m}`,
    `L${r} 0`,
    `L${i / 1.17} ${m}`,
    `L${i} ${i}`,
    `L${m} ${i / 1.17}`,
    `L0 ${r}`,
    `L${-m} ${i / 1.17}`,
    `L${-i} ${i}`,
    `L${-i / 1.17} ${m}`,
    `L${-r} 0`,
    `L${-i / 1.17} ${-m}`,
    `L${-i} ${-i}`,
    `L${-m} ${-i / 1.17}`,
    'Z',
  ].join(' ');
})();

const CATEGORY_LABEL: Record<Locale, Record<CategorySlug, string>> = {
  en: {
    ceramics: 'Ceramics',
    textile: 'Textile',
    leather: 'Leather',
    jewelry: 'Jewelry',
    wood: 'Wood',
  },
  fr: {
    ceramics: 'Céramique',
    textile: 'Textile',
    leather: 'Cuir',
    jewelry: 'Bijoux',
    wood: 'Bois',
  },
  'ar-TN': {
    ceramics: 'الخزف',
    textile: 'النسيج',
    leather: 'الجلد',
    jewelry: 'المجوهرات',
    wood: 'الخشب',
  },
};

/**
 * Hero piece: 8 zellige stars positioned at region coordinates over a stylised
 * Tunisia silhouette, connected by dotted lines that draw on mount. Hover a
 * star → its region pulses + a tooltip appears. Respects reduced-motion.
 *
 * Region coordinates come from `region.mapCoords` (% of viewport, 0-100).
 * The stars are large enough to read on desktop and shrink with the SVG on mobile.
 */
export function ZelligeConstellation({
  regions,
  locale,
  productCount,
  className,
}: ZelligeConstellationProps) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Convert mapCoords (0-100 %) to absolute viewBox px.
  const points = useMemo(
    () =>
      regions.map((r) => ({
        slug: r.slug,
        name: r.name[locale],
        knownFor: r.knownFor,
        x: (r.mapCoords.x / 100) * VIEWBOX_W,
        y: (r.mapCoords.y / 100) * VIEWBOX_H,
      })),
    [regions, locale],
  );

  // Build the chain of dotted lines: connect each star to the next one (closed loop).
  const lines = useMemo(() => {
    if (points.length < 2) return [];
    return points
      .map((p, i) => {
        const next = points[(i + 1) % points.length];
        if (!next) return null;
        return { from: p, to: next, key: `${p.slug}-${next.slug}` };
      })
      .filter((l): l is NonNullable<typeof l> => l !== null);
  }, [points]);

  return (
    <div
      className={cn(
        'relative h-full w-full overflow-hidden',
        // The bounding box scales with the parent — let the SVG fill it.
        className,
      )}
      aria-hidden={reduced ? false : true}
    >
      <motion.svg
        ref={svgRef}
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        className="h-full w-full"
        initial={reduced ? false : 'hidden'}
        animate="visible"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Tunisia silhouette underneath, very faint. */}
        <g className="text-[color:var(--color-clay-700)]" opacity={0.18}>
          <TunisiaMap width="100%" strokeWidth={1.2} />
        </g>

        {/* Lines: stroke-dashed, drawn on mount via pathLength. */}
        <g strokeWidth={2} strokeDasharray="6 10" fill="none">
          {lines.map((l, i) => (
            <motion.line
              key={l.key}
              x1={l.from.x}
              y1={l.from.y}
              x2={l.to.x}
              y2={l.to.y}
              stroke={i % 2 === 0 ? 'var(--color-clay-600)' : 'var(--color-olive-500)'}
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: {
                  pathLength: 1,
                  opacity: 0.7,
                  transition: {
                    delay: 0.4 + i * 0.08,
                    duration: durations.slow,
                    ease: [...easeMedina],
                  },
                },
              }}
            />
          ))}
        </g>

        {/* Stars + region markers. */}
        {points.map((p, i) => {
          const isHovered = hovered === p.slug;
          return (
            <motion.g
              key={p.slug}
              onMouseEnter={() => setHovered(p.slug)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(p.slug)}
              onBlur={() => setHovered(null)}
              tabIndex={0}
              role="button"
              aria-label={`${p.name} · ${p.knownFor.map((k) => CATEGORY_LABEL[locale][k]).join(', ')}`}
              className="cursor-pointer outline-none"
              // Position via SVG transform attr — motion only animates the inner star,
              // not the group's translation. Group lives in SVG userspace coords.
              style={{ transformOrigin: `${p.x}px ${p.y}px` }}
              transform={`translate(${p.x}, ${p.y})`}
            >
              {/* Halo ring on hover. */}
              <motion.circle
                cx={0}
                cy={0}
                r={STAR_RADIUS * 1.8}
                fill="var(--color-olive-500)"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 0.25 : 0 }}
                transition={{ duration: durations.fast, ease: [...easeMedina] }}
              />

              {/* Star itself. STAR_PATH already at final px radius (32),
                  so we only animate opacity + rotation here. The 'scale' fade-in
                  is replaced by an opacity + slight rotate intro that won't
                  collide with SVG transform attrs. */}
              <motion.path
                d={STAR_PATH}
                fill={i % 2 === 0 ? 'var(--color-clay-700)' : 'var(--color-olive-700)'}
                stroke="var(--color-clay-100)"
                strokeWidth={isHovered ? 2 : 0}
                initial={reduced ? false : { opacity: 0, rotate: -30 }}
                variants={{
                  hidden: { opacity: 0, rotate: -30 },
                  visible: {
                    opacity: 1,
                    rotate: 0,
                    transition: {
                      delay: 0.8 + i * 0.12,
                      duration: durations.base * 1.5,
                      ease: [...easeMedina],
                    },
                  },
                }}
                animate={
                  reduced
                    ? { opacity: 1, rotate: 0 }
                    : isHovered
                      ? { rotate: 22.5, opacity: 1 }
                      : undefined
                }
                style={{ originX: '0px', originY: '0px', transformBox: 'fill-box' }}
              />
            </motion.g>
          );
        })}
      </motion.svg>

      {/* Tooltip (positioned over the SVG using pointer-events-none + absolute). */}
      {hovered && (
        <Tooltip point={points.find((p) => p.slug === hovered)!} locale={locale} svgRef={svgRef} />
      )}

      {/* Subtle counter pill at the bottom right, only if productCount given. */}
      {productCount != null && (
        <p className="pointer-events-none absolute bottom-3 right-4 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
          {regions.length} {locale === 'fr' ? 'régions' : locale === 'en' ? 'regions' : 'جهات'} ·{' '}
          {productCount} {locale === 'fr' ? 'pièces' : locale === 'en' ? 'pieces' : 'قطعة'}
        </p>
      )}
    </div>
  );
}

interface TooltipProps {
  point: { slug: string; name: string; knownFor: CategorySlug[]; x: number; y: number };
  locale: Locale;
  svgRef: React.RefObject<SVGSVGElement | null>;
}

function Tooltip({ point, locale, svgRef }: TooltipProps) {
  const svg = svgRef.current;
  if (!svg) return null;

  // Convert SVG userspace coords to client px relative to the parent.
  const rect = svg.getBoundingClientRect();
  const scaleX = rect.width / VIEWBOX_W;
  const scaleY = rect.height / VIEWBOX_H;
  const left = point.x * scaleX;
  const top = point.y * scaleY;

  const cats = point.knownFor.map((k) => CATEGORY_LABEL[locale][k]).join(' · ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: durations.fast, ease: [...easeMedina] }}
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-[calc(100%+1.5rem)] whitespace-nowrap"
      style={{ left, top }}
    >
      <div className="bg-[color:var(--color-ink-900)] px-3 py-2 text-[color:var(--color-clay-100)] shadow-lg">
        <p className="italic [font-family:var(--font-display)] font-semibold text-sm leading-tight">
          {point.name}
        </p>
        <p className="text-[10px] uppercase tracking-[var(--tracking-label)] opacity-70 mt-0.5">
          {cats}
        </p>
      </div>
    </motion.div>
  );
}
