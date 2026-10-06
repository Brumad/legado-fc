# Legado FC

Simulador de vida e carreira de um jogador de futebol. A série 0.5 está
transformando o projeto em um jogo de futebol realmente jogável sem descartar a
carreira, o mundo persistente e os sistemas construídos na 0.4.x.

## Versão atual

`0.5.1 — Nova Interface de Carreira`

A 0.5.1 reorganiza a experiência fora de campo em uma interface de jogo
responsiva. A fundação do Match Core criada na 0.5.0 permanece intacta e a
partida 0.4.3 continua disponível como fallback até o vertical slice 2D da
0.5.2.

### Interface 0.5.1

- Career Hub separado de `page.tsx`;
- perfil compacto com clube, posição, idade, overall e temporada;
- energia, moral, forma e condição em leitura imediata;
- saldo, salário, contrato e valor de mercado;
- card de próximo jogo com acesso em um passo;
- atalhos para Partida, Treino, Vida, Mundo, Mercado e Perfil;
- calendário e treino rápido;
- central de decisões e consequências;
- relações, finanças e patrimônio;
- mercado, propostas e renovação;
- Temporada, Mundo, Perfil, Vida e Mercado harmonizados;
- navegação desktop e mobile com foco visível;
- layout validado em 360x800, 768x1024 e 1440x1000.

### Fundação jogável preservada

- Match Core independente do React;
- estado próprio para campo, bola, jogadores, placar e eventos;
- passo fixo de 60 Hz independente do FPS;
- relógio determinístico, pausa, retomada e abandono seguro;
- módulos separados de regras, física e IA;
- inputs normalizados para teclado, touch e gamepad;
- renderer Canvas desacoplado;
- bridge carreira -> partida com 22 jogadores e um atleta controlado;
- testes headless do core e da integração.

### Base de carreira preservada

- 12 países, 24 divisões e 505 clubes;
- calendário, contratos, mercado e transferências;
- consequências persistentes e personalidade dinâmica;
- mundo persistente, aposentadorias e novos talentos;
- múltiplos slots, importação/exportação e migração de saves;
- PWA e GitHub Pages.

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
pnpm verify:variation
pnpm verify:world
pnpm test:render
pnpm build:github
```

O CI da série 0.5.1 também executa testes de navegador em Chromium para mobile,
tablet e desktop.

O roadmap e os critérios de aceite vivem em `TASKS.md`.
