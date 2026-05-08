import { Composition } from 'remotion';
import { HeroBackground, HERO_W, HERO_H, HERO_FPS, HERO_DURATION_FRAMES } from './HeroBackground';

export function Root() {
  return (
    <>
      <Composition
        id="HeroBackground"
        component={HeroBackground}
        durationInFrames={HERO_DURATION_FRAMES}
        fps={HERO_FPS}
        width={HERO_W}
        height={HERO_H}
      />
    </>
  );
}
