import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { theme } from '../theme';

export const PersistentBackground = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 2700], [0, 80]);
  return <AbsoluteFill style={{ background: theme.background, overflow: 'hidden' }}>
    <AbsoluteFill style={{ backgroundImage: `linear-gradient(${theme.grid} 1px, transparent 1px), linear-gradient(90deg, ${theme.grid} 1px, transparent 1px)`, backgroundSize: '96px 96px', transform: `translateY(${drift}px)`, top: -96, bottom: -96 }} />
    <AbsoluteFill style={{ background: `linear-gradient(115deg, ${theme.purpleLight}, transparent 44%, ${theme.tealLight})` }} />
    <div style={{ position: 'absolute', left: 78, top: 134, bottom: 120, width: 2, background: theme.border }} />
  </AbsoluteFill>;
};