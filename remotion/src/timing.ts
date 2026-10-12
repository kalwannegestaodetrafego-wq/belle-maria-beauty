export const VIDEO = { id: 'main', fps: 30, width: 1920, height: 1080, durationInFrames: 2700 } as const;
export const CHAPTER_FRAMES = 540;
export const TRANSITION_FRAMES = 24;
export const CHAPTERS = [
  { label: 'O Problema', start: 0 },
  { label: 'A Solução', start: 540 },
  { label: 'Experiência do Cliente', start: 1080 },
  { label: 'A Inovação', start: 1620 },
  { label: 'Recompensas & CTA', start: 2160 },
] as const;
// Incoming scenes include a 24-frame lead-in. Overlaps do not shorten the pitch.
export const sequenceDuration = (index: number) => CHAPTER_FRAMES + (index === 0 ? 0 : TRANSITION_FRAMES);
export const contentFrame = (localFrame: number, index: number) => Math.max(0, localFrame - (index === 0 ? 0 : TRANSITION_FRAMES));
export const totalDuration = () => CHAPTERS.reduce((sum, _, index) => sum + sequenceDuration(index), 0) - TRANSITION_FRAMES * (CHAPTERS.length - 1);