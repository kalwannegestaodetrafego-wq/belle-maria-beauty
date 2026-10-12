import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { CHAPTERS, VIDEO } from '../timing';
import { theme } from '../theme';

export const PersistentAccents = () => {
  const frame = useCurrentFrame();
  const chapter = Math.min(4, Math.floor(frame / 540));
  const finalFade = interpolate(frame, [2430, 2475], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ pointerEvents: 'none', fontFamily: theme.font, color: theme.muted }}>
    <div style={{ position: 'absolute', top: 50, left: 80, color: theme.text, fontSize: 26, fontWeight: 700 }}>BM <span style={{ marginLeft: 20, fontSize: 16, color: theme.muted, fontWeight: 400 }}>BELLE MARIA BEAUTY</span></div>
    <div style={{ position: 'absolute', top: 56, right: 80, fontSize: 16 }}>PITCH • VISÃO DE PRODUTO</div>
    <div style={{ position: 'absolute', left: 80, bottom: 52, fontSize: 18, opacity: finalFade }}>{String(chapter + 1).padStart(2, '0')} / 05 <span style={{ marginLeft: 20 }}>{CHAPTERS[chapter]?.label}</span></div>
    <div style={{ position: 'absolute', right: 80, bottom: 52, fontSize: 15, opacity: finalFade }}>PROTÓTIPO • WEB3 E PERFIS DEMONSTRATIVOS</div>
    <div style={{ position: 'absolute', bottom: 0, height: 4, width: `${100 * (frame + 1) / VIDEO.durationInFrames}%`, background: theme.teal }} />
  </AbsoluteFill>;
};