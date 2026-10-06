# Legado FC

Simulador de vida e carreira de um jogador de futebol. A série 0.5 inicia a
transformação da experiência em um jogo de futebol realmente jogável sem
descartar a carreira, o mundo persistente e os sistemas construídos na 0.4.x.

## Versão atual

`0.5.0 — Fundação Jogável`

A 0.5.0 é uma versão de arquitetura e compatibilidade. O fluxo de partida 0.4.3
continua disponível como fallback enquanto o novo campo jogável é desenvolvido
nas próximas versões.

### Base preservada

- criação de carreira por país, divisão, origem, posição e arquétipo;
- calendário, preparação, contratos, mercado e transferências;
- consequências persistentes e personalidade dinâmica;
- 12 países, 24 divisões e 505 clubes;
- mundo persistente, aposentadorias e novos talentos;
- partidas procedurais e modo rápido legado;
- múltiplos slots, importação/exportação e migração de saves;
- PWA e GitHub Pages.

### Nova fundação 0.5.0

- Match Core independente do React;
- estado próprio para campo, bola, jogadores, placar e eventos;
- passo fixo de 60 Hz independente do FPS;
- relógio determinístico, pausa, retomada e abandono seguro;
- módulos separados de regras, física e IA;
- inputs normalizados para teclado, touch e gamepad;
- renderer Canvas desacoplado;
- shell visual que usa `requestAnimationFrame` sem atualizar React a cada frame;
- bridge da carreira para uma partida com 22 jogadores e exatamente um atleta controlado;
- contrato de resultado da nova partida;
- testes headless do core e da integração;
- regressão de 5.000 partidas e 25 temporadas no CI.

## Desenvolvimento

Requisitos: Node.js 22.13 ou superior.

```bash
pnpm install
pnpm dev
pnpm test
```

Comandos principais de verificação:

```bash
pnpm typecheck
pnpm lint
pnpm verify:match-core
pnpm verify:match-integration
pnpm verify:variation
pnpm verify:world
pnpm test:render
```

A simulação de carreira legada continua em `app/game-engine.ts`.
A nova gameplay deve ser construída em `app/match-core/*`, com a integração de
carreira em `app/gameplay-integration.ts` e renderização independente do domínio.

O roadmap e os critérios de aceite vivem em `TASKS.md`.
