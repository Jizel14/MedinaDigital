/**
 * Looped MP4 background for the hero. Source authored in apps/video with
 * Remotion (palette-Médina gradients + zellige stars + editorial taglines)
 * and rendered to apps/web/public/video/hero.mp4.
 *
 * Re-render after editing apps/video/src/HeroBackground.tsx:
 *   pnpm --filter @medina/video build
 *
 * Renders inert: no controls, no audio, autoplay+muted+loop+playsInline so
 * iOS Safari plays it without user gesture. Falls back to the static poster
 * image while the video buffers.
 */
export function HeroVideoBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={['absolute inset-0 -z-10 overflow-hidden', className].filter(Boolean).join(' ')}
    >
      <video
        className="h-full w-full object-cover"
        src="/video/hero.mp4"
        poster="/video/hero-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        // Hide controls + ignore right-click; this is decorative chrome, not
        // user-facing content.
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
      />
      {/* Lightening overlay so foreground text/CTA stay readable. clay-100
          at 50% in the middle vertical band, slightly less on the edges. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(245,239,230,0.55) 0%, rgba(245,239,230,0.35) 30%, rgba(245,239,230,0.4) 70%, rgba(245,239,230,0.7) 100%)',
        }}
      />
    </div>
  );
}
