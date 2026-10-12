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

Saída: **`remotion/out/belle-maria-beauty-pitch.mp4`**. H.264, CRF 18, pixel format yuv420p, 1080p, 30fps. A saída é ignorada pelo controle de versão. O script resolve todos os caminhos a partir de sua própria localização, verifica o formato e informa erros com código de saída não-zero. **Sem áudio:** não foi fornecida narração ou trilha; este projeto não sintetiza nem licencia áudio. Não contém um MP4 pré-renderizado.

## Roteiro e tempos

| Capítulo | Tempo | Frames nominais | Conteúdo |
|---|---|---|---|
| O Problema | 00:00–00:18 | 0–539 | No-shows, taxas e disputas; sem estatísticas inventadas |
| A Solução | 00:18–00:36 | 540–1079 | Marca, proposta e visão Solana Pay / USDC |
| Experiência do Cliente | 00:36–00:54 | 1080–1619 | Camila Silva, Studio Bella, agendamento, Phantom e Solflare |
| A Inovação | 00:54–01:12 | 1620–2159 | Escrow proposto, PIN presencial de quatro dígitos (8392) |
| Recompensas & CTA | 01:12–01:30 | 2160–2699 | BMPTS/SPL propostos, B2B e endereço do protótipo |

`TransitionSeries` faz quatro crossfades de 24 frames (0,8s), terminando em 540, 1080, 1620 e 2160. Para não reduzir o total a 2604 frames, cada cena após a primeira inclui um lead-in de 24 frames: durações de sequência **540, 564, 564, 564, 564**, menos **4 × 24 = 96** frames de sobreposição, totalizando **2700**. O conteúdo das cenas recebidas fica no frame zero durante o lead-in; `contentFrame()` mantém os capítulos alinhados. O CTA permanece estável nos últimos sete segundos.

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

Os testes validam os valores solicitados e a matemática das transições. Para validar quadros localmente: `bunx remotion still src/index.ts main out/scene3.png --frame=1350`. Revise todos os capítulos e as transições no Studio antes de uma publicação; o render completo de 90 segundos deve ser executado localmente.