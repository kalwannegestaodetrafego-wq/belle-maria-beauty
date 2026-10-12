import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { contentFrame } from '../timing';
import { theme } from '../theme';

export const useSceneFrame = (index: number) => contentFrame(useCurrentFrame(), index);
export const entrance = (frame: number, delay = 0) => spring({ frame: frame - delay, fps: 30, config: { damping: 22, stiffness: 100, mass: 1 } });
export const Reveal = ({ children, frame, delay = 0, style }: { children: ReactNode; frame: number; delay?: number; style?: CSSProperties }) => {
  const progress = entrance(frame, delay);
  return <div style={{ opacity: progress, transform: `translateY(${(1 - progress) * 36}px)`, ...style }}>{children}</div>;
};
export const Scene = ({ children }: { children: ReactNode }) => <AbsoluteFill style={{ padding: '174px 120px 140px', fontFamily: theme.font, color: theme.text }}>{children}</AbsoluteFill>;
export const Eyebrow = ({ children, color = theme.teal }: { children: ReactNode; color?: string }) => <div style={{ fontSize: 19, fontWeight: 700, color, marginBottom: 24 }}>{children}</div>;
export const Title = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => <h1 style={{ fontSize: 82, lineHeight: 1.08, fontWeight: 700, margin: '0 0 26px', letterSpacing: 0, ...style }}>{children}</h1>;
export const Copy = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => <div style={{ fontSize: 28, lineHeight: 1.5, color: theme.muted, ...style }}>{children}</div>;
export const Panel = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => <div style={{ background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: 8, padding: 30, boxShadow: theme.shadow, ...style }}>{children}</div>;
export const Pill = ({ children, color = theme.teal }: { children: ReactNode; color?: string }) => <span style={{ display: 'inline-block', fontSize: 18, padding: '10px 16px', border: `1px solid ${color}`, borderRadius: 6, color }}>{children}</span>;
export const Step = ({ n, title, detail, frame, delay }: { n: string; title: string; detail: string; frame: number; delay: number }) => <Reveal frame={frame} delay={delay} style={{ display: 'flex', gap: 26, marginBottom: 34, alignItems: 'center' }}><div style={{ width: 66, height: 66, display: 'grid', placeItems: 'center', flexShrink: 0, border: `1px solid ${theme.teal}`, color: theme.teal, borderRadius: 8, fontSize: 28 }}>{n}</div><div><div style={{ fontSize: 30, marginBottom: 8 }}>{title}</div><Copy style={{ fontSize: 22 }}>{detail}</Copy></div></Reveal>;
export const Counter = ({ frame, from, to, end, suffix = '' }: { frame: number; from: number; to: number; end: number; suffix?: string }) => <>{Math.round(interpolate(frame, [from, to], [0, end], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))}{suffix}</>;