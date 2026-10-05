# Belle Maria Beauty

Crie uma aplicação web mobile-first de alta fidelidade para "BM" (Belle Maria / Alice no País da Beleza), marketplace premium de beleza e bem-estar em domicílio e salão.

Design System & Estética:

- Estilo: Editorial de beleza chic, jovem e sofisticado.

- Cores: Fundo Soft Blush (#F5EBEB), Dourado Champagne (#D4AF37), Tipografia Grafite (#1C1C1C), Cards Branco Puro (#FFFFFF) e Verde Esmeralda (#2E7D32) para selos de segurança.

- Tipografia: Serifada nos títulos (estilo Playfair Display) e sans-serif limpa no corpo (estilo Plus Jakarta Sans).

- Elementos: Cards com efeito glassmorphism suave, bordas douradas sutis e fotos em destaque.

Navegação e Cabeçalho:

- Logo "BM" com subtítulo "Alice no País da Beleza".

- Seletor de localização: "Florianópolis, SC - Centro".

- Selo de confiança: "Garantia BM & Verificação MEI".

- Switch de visão no topo: [Cliente] e [Profissional MEI].

Interface do Cliente (Foco principal interativo):

- Filtros por categoria: Maquiagem, Cabelo, Unhas, Massagem, Sobrancelhas e Combos VIP.

- Toggle de atendimento: "Em Domicílio" e "No Salão".

- Perfis mockados realistas:

  1. Camila Silva (Maquiadora & Hair, 4.9 ★, 1.8 km, MEI Verificado, Maquiagem Social R$ 150).

  2. Studio Bella (Salão Parceiro, 4.8 ★, Centro, Unha em Gel R$ 90).

  3. Juliana Costa (Massoterapeuta, 5.0 ★, 3.2 km, Massagem Relaxante R$ 180).

- Modal de perfil completo com biografia, portfólio de fotos e menu de serviços.

- Fluxo interativo de agendamento e garantia:

  1. Escolha de serviço, data e horário.

  2. Checklist obrigatório de regras da casa (tomada/luz adequada, respeito aos insumos).

  3. Tela de pagamento retido (Escrow): aviso de que o valor só é liberado com o PIN, com opções de PIX Copia e Cola e Cartão.

  4. Tela de acompanhamento do status do pedido com barra de progresso e código PIN de 4 dígitos em destaque (ex: 8392).

Deixe todos os modais, botões e filtros funcionando com estado local e use ícones da Lucide.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1394fd33-28d1-4ca1-94d8-2eee1671eb22).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
