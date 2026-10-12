import { Img, staticFile } from 'remotion';
import { theme } from '../theme';
import { Copy, Eyebrow, Panel, Pill, Reveal, Scene, Title, useSceneFrame } from '../components/Primitives';

export const Scene3 = () => {
  const f = useSceneFrame(2);
  return <Scene><Reveal frame={f}><Eyebrow>EXPERIÊNCIA DO CLIENTE</Eyebrow><Title style={{ fontSize: 68 }}>Descobrir. Agendar. Conectar.</Title><Copy>Da escolha do atendimento à carteira, um fluxo simples.</Copy></Reveal>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.95fr', gap: 28, marginTop: 46 }}>
      {[{ name: 'Camila Silva', role: 'Maquiagem & beleza', image: 'camila.jpg' }, { name: 'Studio Bella', role: 'Salão parceiro • Agronômica', image: 'studio-bella.jpg' }].map((p, i) => <Reveal key={p.name} frame={f} delay={60 + i * 85}><Panel style={{ padding: 0, overflow: 'hidden' }}><Img src={staticFile(`images/${p.image}`)} style={{ width: '100%', height: 225, objectFit: 'cover' }} /><div style={{ padding: 26 }}><Pill color={theme.rose}>PERFIL DEMONSTRATIVO</Pill><h2 style={{ fontSize: 32, margin: '20px 0 12px' }}>{p.name}</h2><Copy style={{ fontSize: 21 }}>{p.role}</Copy><div style={{ marginTop: 24, fontSize: 22, color: theme.teal }}>Agendar →</div></div></Panel></Reveal>)}
      <div><Reveal frame={f} delay={210}><Panel><Eyebrow>CARTEIRAS</Eyebrow><div style={{ fontSize: 32 }}>Conexão em 1 clique</div><div style={{ margin: '28px 0', display: 'grid', gap: 14 }}><Pill color={theme.purple}>Phantom</Pill><Pill>Solflare</Pill></div><Copy style={{ fontSize: 22 }}>Interação ilustrativa.<br />Sem transação real.</Copy></Panel></Reveal><Reveal frame={f} delay={340}><Copy style={{ fontSize: 21, marginTop: 26 }}>Objetivo: descobrir profissionais verificados. A verificação depende de evidências reais.</Copy></Reveal></div>
    </div>
  </Scene>;
};