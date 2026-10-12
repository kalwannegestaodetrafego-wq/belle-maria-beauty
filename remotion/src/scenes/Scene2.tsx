import { theme } from '../theme';
import { Copy, Eyebrow, Panel, Pill, Reveal, Scene, Step, Title, useSceneFrame } from '../components/Primitives';

export const Scene2 = () => {
  const f = useSceneFrame(1);
  return <Scene><div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 90 }}>
    <Reveal frame={f}><Eyebrow>A SOLUÇÃO</Eyebrow><Title>Belle Maria<br /><span style={{ color: theme.rose }}>Beauty.</span></Title><Copy>A experiência dos melhores salões,<br />no conforto do seu lar.</Copy><div style={{ display: 'flex', gap: 16, marginTop: 44 }}><Pill>BELEZA & BEM-ESTAR</Pill><Pill color={theme.purple}>VISÃO WEB3</Pill></div><Copy style={{ fontSize: 20, marginTop: 34 }}>Um marketplace que aproxima clientes,<br />profissionais e salões parceiros.</Copy></Reveal>
    <div style={{ paddingTop: 26 }}><Step n="01" title="Descoberta e agendamento" detail="Uma experiência conectada, em casa ou no salão." frame={f} delay={60} /><Step n="02" title="Solana Pay + USDC" detail="Fluxo de pagamento demonstrativo no protótipo." frame={f} delay={165} /><Step n="03" title="Liquidação instantânea" detail="Visão de integração on-chain; não disponível hoje." frame={f} delay={270} /><Reveal frame={f} delay={340}><Panel style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 42 }}><div style={{ fontSize: 28, color: theme.teal }}>SOLANA</div><div style={{ fontSize: 18, color: theme.muted }}>CONCEITO DE INTEGRAÇÃO</div></Panel></Reveal></div>
  </div></Scene>;
};