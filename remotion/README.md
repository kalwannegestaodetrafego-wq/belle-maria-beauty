# Belle Maria Beauty — pitch de 90 segundos

Projeto Remotion independente. Não altera o site nem suas dependências. A composição `main` tem **1920×1080**, **30fps**, **2700 frames** e cinco capítulos de 18 segundos. Texto do pitch em português, independentemente do idioma escolhido no aplicativo.

## Instalação e prévia

Pré-requisitos: Node.js 22 ou superior e Bun ou npm. Entre no diretório `remotion/` antes de executar os comandos. A primeira renderização pode baixar o Chrome Headless Shell; é necessária conexão com a internet e, no Linux, as bibliotecas de sistema do Chromium. Consulte https://www.remotion.dev/docs/renderer para requisitos de ambiente e https://www.remotion.dev/license para verificar a licença aplicável ao uso comercial.

```bash
cd remotion
bun install
bun run studio
```

Alternativa com npm: `npm install` e `npm run studio`. A prévia abre no Remotion Studio; selecione `main`. Imagens são locais em `public/images/`. A fonte usa Arial/Helvetica/sans-serif do ambiente, sem dependência de serviços externos. O pacote de fontes Google está instalado para futuras personalizações; não há download de fontes durante o vídeo.

## Renderizar MP4 localmente

```bash
# Dentro de remotion/
bun run render
# ou
npm run render
```

Saída: **`remotion/out/belle-maria-beauty-pitch.mp4`**. H.264, CRF 18, pixel format yuv420p, 1080p, 30fps, com narração TTSMaker e sem trilha adicional. A saída é ignorada pelo controle de versão. O script resolve todos os caminhos a partir de sua própria localização, verifica o formato e informa erros com código de saída não-zero. Não contém um MP4 pré-renderizado.

## Narração anexada

Os dois arquivos originais estão em `public/audio/part-1.mp3` e `part-2.mp3`. `voiceover.mp3` é a faixa contínua utilizada por `<Audio src={staticFile('audio/voiceover.mp3')} />` fora do `TransitionSeries`: começa no frame zero e não reinicia nem sofre crossfade nas trocas de cena. O áudio está em inglês, como fornecido; os textos visuais permanecem em português.

As durações de contêiner dos originais são 57,128s e 33,200s (90,328s, incluindo padding MP3). A faixa contínua foi ajustada de forma uniforme para 90s de amostras decodificadas com `atempo`, preservando altura da voz, sem cortar palavras. O encoder MP3 pode indicar duração de contêiner ligeiramente maior devido a padding, mas a composição e o áudio decodificado terminam em 90s. Os originais são preservados para revisão.

**Limitação editorial:** a narração não segue cinco blocos de 18s: aborda escrow/PIN antes do capítulo visual de inovação e validação de campo no capítulo final. As cenas conservam os intervalos explicitamente solicitados; a faixa está sincronizada com a linha do tempo, mas a correspondência frase a frase exige aprovação para redistribuir capítulos ou trocar o roteiro de voz. A narração fornecida afirma métricas (80%, US$120, 10 criadores, 15 testes DevNet), taxa 90/10 e operação on-chain; esses dados não foram verificados e não descrevem o estado comprovado do aplicativo, cuja taxa simulada é 18%. Nenhuma dessas afirmações foi acrescentada como fato aos textos visuais. Revise as alegações e a compatibilidade do roteiro antes de usar o pitch externamente.

## Roteiro e tempos

| Capítulo | Tempo | Frames nominais | Conteúdo |
|---|---|---|---|
| O Problema | 00:00–00:18 | 0–539 | No-shows, taxas e disputas; sem estatísticas inventadas |
| A Solução | 00:18–00:36 | 540–1079 | Marca, proposta e visão Solana Pay / USDC |
| Experiência do Cliente | 00:36–00:54 | 1080–1619 | Camila Silva, Studio Bella, agendamento, Phantom e Solflare |
| A Inovação | 00:54–01:12 | 1620–2159 | Escrow proposto, PIN presencial de quatro dígitos (8392) |
| Recompensas & CTA | 01:12–01:30 | 2160–2699 | BMPTS/SPL propostos, B2B e endereço do protótipo |

`TransitionSeries` faz quatro crossfades de 24 frames (0,8s), terminando em 540, 1080, 1620 e 2160. Para não reduzir o total a 2604 frames, cada cena após a primeira inclui um lead-in de 24 frames: durações de sequência **540, 564, 564, 564, 564**, menos **4 × 24 = 96** frames de sobreposição, totalizando **2700**. As entradas animadas começam durante o lead-in para evitar uma cena vazia ao final do crossfade. O CTA permanece estável nos últimos sete segundos.

## Arquitetura

- `src/index.ts`: registro do root.
- `src/Root.tsx`: composição `main`.
- `src/MainVideo.tsx`: cinco cenas e transições.
- `src/components/PersistentBackground.tsx`: iluminação e grid contínuos.
- `src/components/PersistentAccents.tsx`: marca, capítulo, indicação de protótipo e progresso global.
- `src/scenes/Scene1.tsx` a `Scene5.tsx`: roteiro visual.
- `src/theme.ts`: tokens Deep Slate `#0B0E17`, Teal `#14F195`, Purple `#9945FF`, Rose Gold `#B76E79` e cores auxiliares.
- `src/timing.ts`: duração e compensação das sobreposições.
- `scripts/render.mjs`: bundle, seleção e exportação local.

Todas as animações são determinísticas, baseadas em `useCurrentFrame()`, `interpolate()` e `spring()`. Não há timers, transições CSS, aleatoriedade, chamadas ao backend ou conexão real de carteiras. O fundo e os acentos ficam fora das cenas, preservando continuidade.

## Transparência de produto

Pagamentos, retenção, recompensas e operações B2B do aplicativo atual são simulações. Solana Pay, liquidação instantânea em USDC, smart contract escrow e BMPTS como tokens SPL aparecem **como visão de integração**, não como infraestrutura já implantada. As fotografias locais são demonstrativas; não provam autoria profissional nem verificação de identidade. Os perfis estão identificados como demonstrativos. Nenhuma chave, documento pessoal ou dado de usuário é incluído. A liberação por PIN é ilustrativa e não estabelece segurança de um contrato real.

## Verificações

```bash
bun run test
bun run typecheck
```

Os testes validam os valores solicitados e a matemática das transições. Para validar quadros localmente: `bunx remotion still src/index.ts main out/scene3.png --frame=1350`. Foram conferidos 14 quadros das cinco cenas/transições e uma exportação completa H.264 1920×1080/30fps com áudio AAC: vídeo com 90,000s, contêiner com 90,048s devido ao padding AAC. O áudio fonte decodificado possui exatamente 4.320.000 amostras a 48kHz (90s). Revise a compatibilidade editorial da narração antes de publicar.