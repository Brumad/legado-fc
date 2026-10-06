# Legado FC

Simulador de vida e carreira de um jogador de futebol. A série 0.5 transforma o
projeto em um jogo de futebol jogável sem descartar carreira, mundo persistente
e sistemas construídos na 0.4.x.

## Versão atual

`0.5.2 — Partida 2D Jogável`

A 0.5.2 é o primeiro grande marco de gameplay da série 0.5: a carreira agora
entra em um campo 2D realmente jogável. O usuário controla somente seu atleta,
enquanto os outros 21 jogadores são comandados pela IA.

### Partida 2D

- campo superior com câmera acompanhando o atleta;
- 22 jogadores em campo;
- aceleração, desaceleração e sprint;
- stamina ligada ao sprint;
- bola livre com velocidade e desaceleração;
- posse, domínio e recepção;
- passe curto e profundidade;
- chute e gol;
- desarme e disputa de posse;
- faltas e reinício em cobrança 2D;
- lateral, tiro de meta e escanteio;
- reinício após gol;
- placar, cronômetro, pausa e intervalo;
- teclado, touch e gamepad;
- resultado integrado à progressão da carreira;
- modo rápido legado preservado como fallback.

### Controles de teclado

```text
WASD / setas  movimentação
Shift         sprint
J             passe
K             profundidade
L             chute
Espaço        desarme
Esc           pausa
```

### Validação do campo

O gate `verify:playable-match` executa testes headless do vertical slice e dez
partidas completas consecutivas. O CI também abre Chromium e conclui partidas
reais com teclado e touch.

### Interface de carreira preservada

A 0.5.1 continua disponível integralmente:

- Career Hub;
- Temporada;
- Mundo;
- Perfil;
- Vida e Finanças;
- Mercado e Contrato;
- layouts mobile, tablet e desktop.

### Fundação técnica

- Match Core independente de React;
- simulação em passo fixo;
- regras, física, IA e renderer desacoplados;
- bridge carreira -> partida -> resultado;
- modo rápido legado preservado.

## Desenvolvimento

Requisitos: Node.js 22.13 ou superior.

```bash
pnpm install
pnpm dev
pnpm test
```

Gates principais:

```bash
pnpm typecheck
pnpm lint
pnpm verify:match-core
pnpm verify:match-integration
pnpm verify:career-ui
pnpm verify:playable-match
pnpm verify:variation
pnpm verify:world
pnpm test:render
pnpm build:github
```

O roadmap e os critérios de aceite vivem em `TASKS.md`.
