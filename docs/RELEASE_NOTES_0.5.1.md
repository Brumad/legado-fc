# Legado FC 0.5.1 — Nova Interface de Carreira

## Objetivo

Transformar a camada de carreira em uma experiência com leitura, navegação e
apresentação de jogo, preservando a simulação e a fundação técnica da 0.5.0.

## Principais entregas

- Career Hub extraído para `app/career-hub.tsx`.
- Resumo imediato de jogador, clube, temporada, overall e condição.
- Energia, moral, forma, saldo e salário visíveis na home.
- Card de próximo jogo com entrada na partida em um passo.
- Navegação clara para Partida, Treino, Vida, Mundo, Mercado e Perfil.
- Calendário visual e treino rápido.
- Central de decisões e eventos.
- Relações, contrato e finanças resumidos na home.
- Vida/Finanças e Mercado/Contrato reorganizados.
- Temporada, Mundo e Perfil harmonizados com o design system 0.5.1.
- Topbar contextual e navegação responsiva.
- Foco visível e suporte à navegação por teclado.
- Gate `verify:career-ui`.
- Testes reais de navegador usando Chromium.

## Responsividade validada

- 360x800: PASS.
- 768x1024: PASS.
- 1440x1000: PASS.
- Navegação por teclado: PASS.

Os testes percorrem Home, Vida, Mercado, Perfil, Temporada e Mundo e verificam
overflow horizontal. A home em 360 px também verifica clipping de textos
essenciais.

## Compatibilidade

A 0.5.1 não altera o schema persistente de carreira. Saves existentes continuam
usando as migrações já presentes.

O Match Core 0.5.0, a simulação procedural e o fluxo legado de partida continuam
preservados.

## Validação

No checkpoint visual `819ee6f9`, workflow `37510730801`:

- typecheck: PASS;
- lint: PASS;
- Match Core: PASS;
- integração carreira/partida: PASS;
- verify:career-ui: PASS;
- 5.000 partidas legadas: PASS;
- 25 temporadas: PASS;
- build de produção: PASS;
- render tests: PASS;
- build GitHub Pages: PASS;
- browser mobile/tablet/desktop: PASS;
- teclado: PASS.

## Próximo marco

`0.5.2 — Partida 2D jogável: vertical slice`.
