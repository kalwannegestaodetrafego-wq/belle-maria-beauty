import { theme } from '../theme';
import { Copy, Eyebrow, Panel, Reveal, Scene, Title, useSceneFrame } from '../components/Primitives';

export const Scene1 = () => {
  const f = useSceneFrame(0);
  const problems = [
    { n: '01', title: 'No-shows', text: 'Uma agenda vazia. Um dia perdido.', delay: 70 },
    { n: '02', title: 'Taxas que pesam', text: 'Menos margem para quem realiza o serviço.', delay: 170 },
    { n: '03', title: 'Disputas sem clareza', text: 'Cliente e profissional precisam de confiança.', delay: 270 },
  ];
  return <Scene><Reveal frame={f}><Eyebrow color={theme.rose}>O PROBLEMA</Eyebrow><Title>Talento não deveria<br />ficar à espera.</Title><Copy>Faltas, taxas percebidas como abusivas e disputas<br />tornam a experiência de beleza mais difícil.</Copy></Reveal>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 26, marginTop: 68 }}>{problems.map(p => <Reveal key={p.n} frame={f} delay={p.delay}><Panel style={{ height: 246 }}><div style={{ display: 'flex', justifyContent: 'space-between', color: theme.rose, fontSize: 23 }}><span>{p.n}</span><span>△</span></div><h2 style={{ fontSize: 34, margin: '30px 0 18px' }}>{p.title}</h2><Copy style={{ fontSize: 25 }}>{p.text}</Copy></Panel></Reveal>)}</div>
  </Scene>;
};