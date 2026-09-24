# Checklist final do MVP BM

## Resultado da auditoria

- **Já funcional — Cliente:** seletor Em Domicílio/No Salão, escolha de data e horário, checklist obrigatório, pagamento protegido em custódia e acompanhamento com PIN 8392.
- **Já funcional — Profissional:** chamado conectado ao pedido, progressão Aceitar → A Caminho → Cheguei ao Local, validação do PIN e saque PIX simulado.
- **A ajustar:** o cabeçalho ainda repete a marca e mostra uma frase junto dela; ficará somente “BM”.
- **A corrigir:** a carteira usa taxa de 15%; será atualizada para 18%, com líquido de R$ 123,00 sobre R$ 150,00.
- **A incluir:** Central de Segurança e FAQ expansível.

## Implementação

1. Simplificar o topo para uma única assinatura visual “BM”, mantendo o slogan apenas no conteúdo principal.
2. Atualizar o cálculo e a discriminação da carteira para taxa BM de 18%: bruto R$ 150,00, taxa R$ 27,00 e saldo líquido R$ 123,00.
3. Adicionar uma Central de Segurança acessível pelo menu, em modal, com accordions independentes para:
   - Termos de Uso
   - Política de Custódia
   - Segurança
   - Privacidade e LGPD
4. Preservar todos os fluxos e estados locais existentes, sem reescrever os trechos já funcionais.
5. Validar em celular os dois modos, o bloqueio do checklist, a mensagem de custódia, o PIN, a progressão profissional, a carteira e todos os accordions.

## Detalhes técnicos

- Manter TanStack Start, Lucide, componentes e tokens visuais atuais.
- Usar botões acessíveis com estados expandidos nos accordions e fechamento funcional do modal.
- Confirmar build sem erros e ausência de regressões no fluxo completo.
