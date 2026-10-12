import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputLocation = path.join(root, 'out', 'belle-maria-beauty-pitch.mp4');

try {
  await mkdir(path.dirname(outputLocation), { recursive: true });
  console.log('Preparando Belle Maria Beauty • 90s • 1080p • 30fps');
  const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public') });
  const composition = await selectComposition({ serveUrl, id: 'main' });
  if (composition.durationInFrames !== 2700 || composition.fps !== 30 || composition.width !== 1920 || composition.height !== 1080) {
    throw new Error('A composição main deve ter 2700 frames, 30fps e 1920x1080.');
  }
  await renderMedia({
    composition, serveUrl, codec: 'h264', pixelFormat: 'yuv420p', crf: 18,
    outputLocation, overwrite: true,
    onProgress: ({ progress }) => process.stdout.write(`\rRenderização: ${Math.round(progress * 100)}%`),
  });
  console.log(`\nMP4 salvo em: ${outputLocation}\nVídeo sem áudio: nenhuma narração ou trilha foi fornecida.`);
} catch (error) {
  console.error('\nFalha na renderização:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
}