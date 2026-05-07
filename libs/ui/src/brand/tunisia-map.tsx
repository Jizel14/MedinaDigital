import type { SVGProps } from 'react';
import { cn } from '../lib/cn';

export interface TunisiaMapProps extends SVGProps<SVGSVGElement> {
  /** Width hint; height stays proportional. */
  width?: number | string;
  /** Stroke thickness for the silhouette. */
  strokeWidth?: number;
}

/**
 * Stylised silhouette of Tunisia — heavily abstracted (not a topographic map).
 * Used as the canvas under the Zellige Constellation hero piece, and on the
 * regions strip on the home page.
 *
 * Coordinates use a 1600x900 viewBox so child markers (e.g. region stars)
 * can be positioned with `region.mapCoords` (% of viewport).
 */
export function TunisiaMap({
  width = 800,
  strokeWidth = 1.5,
  className,
  ...rest
}: TunisiaMapProps) {
  return (
    <svg
      viewBox="0 0 1600 900"
      width={width}
      aria-hidden
      focusable={false}
      className={cn('inline-block', className)}
      {...rest}
    >
      {/* Highly stylised outline — not a real geographic projection.
          Designed to read as "Tunisia" by silhouette: long vertical body,
          northern coast bay, southern desert taper. */}
      <path
        d="M740 60
           Q780 70 820 90
           Q900 110 950 160
           Q990 200 1010 260
           Q1020 300 1010 340
           Q1000 380 1020 420
           Q1040 460 1030 510
           Q1015 560 1025 600
           Q1035 640 1010 680
           Q970 730 920 770
           Q860 810 800 830
           Q740 845 700 830
           Q670 815 660 780
           Q650 750 670 720
           Q700 670 690 620
           Q670 580 660 540
           Q650 500 660 460
           Q670 420 660 380
           Q640 340 640 300
           Q650 260 670 220
           Q690 180 700 140
           Q710 100 720 80
           Q730 65 740 60 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        opacity="0.7"
      />
    </svg>
  );
}
