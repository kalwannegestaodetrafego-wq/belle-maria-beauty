import { describe, expect, test } from 'bun:test';
import { CHAPTERS, CHAPTER_FRAMES, contentFrame, sequenceDuration, totalDuration, TRANSITION_FRAMES, VIDEO } from './timing';

describe('Formato solicitado para o pitch', () => {
  test('90 segundos a 30fps equivalem a 2700 frames', () => {
    expect(VIDEO.fps).toBe(30);
    expect(VIDEO.durationInFrames).toBe(2700);
    expect(VIDEO.durationInFrames / VIDEO.fps).toBe(90);
  });
  test('widescreen 1080p', () => {
    expect([VIDEO.width, VIDEO.height]).toEqual([1920, 1080]);
    expect(VIDEO.width / VIDEO.height).toBe(16 / 9);
  });
  test('cinco capítulos de 18 segundos nos frames solicitados', () => {
    expect(CHAPTER_FRAMES).toBe(540);
    expect(CHAPTERS.map(c => c.start)).toEqual([0, 540, 1080, 1620, 2160]);
    expect(CHAPTERS).toHaveLength(5);
  });
  test('TransitionSeries mantém 2700 frames depois das quatro sobreposições', () => {
    expect(totalDuration()).toBe(2700);
  });
  test('lead-ins terminam exatamente no início nominal de cada capítulo', () => {
    let accumulated = 0;
    CHAPTERS.forEach((chapter, index) => {
      const start = accumulated - index * TRANSITION_FRAMES;
      expect(start + (index === 0 ? 0 : TRANSITION_FRAMES)).toBe(chapter.start);
      expect(contentFrame(index === 0 ? 0 : TRANSITION_FRAMES, index)).toBe(0);
      accumulated += sequenceDuration(index);
    });
  });
});