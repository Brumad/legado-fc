# Legado FC

Simulador de vida e carreira de um jogador de futebol. A série 0.5 transforma o
projeto em um jogo de futebol jogável sem descartar carreira, mundo persistente
e sistemas construídos na 0.4.x.

## Versão atual

`0.5.3 — Futebol, Controles e Criação de Atleta`

A 0.5.3 transforma o vertical slice da 0.5.2 em uma experiência muito mais
próxima de um jogo: controles mobile analógicos, duração configurável, dificuldade
real, IA tática, regras derivadas do estado físico da partida e um creator
totalmente redesenhado.

### Gameplay 2D

- 22 jogadores em campo;
- controle de um único atleta da carreira;
- joystick analógico virtual no mobile;
- teclado e gamepad preservados;
- passe, profundidade, chute, sprint e desarme;
- passe e chute influenciados pelos atributos;
- pace, drible, físico e stamina alteram comportamento real;
- impedimento calculado pela posição da bola e segunda linha defensiva;
- faltas originadas de disputas reais;
- vantagem;
- cartões amarelos, segundo amarelo e vermelho;
- lesões leves e moderadas;
- substituições automáticas por lesão/fadiga;
- acréscimos derivados de paralisações;
- laterais, tiros de meta, escanteios, faltas e reinícios;
- modo rápido legado preservado como fallback.

### IA e tática

Os 12 estilos táticos existentes agora alimentam o Match Core. Formação,
pressão, linha defensiva, amplitude, agressividade, risco e ritmo modificam o
comportamento em campo.

A postura também muda durante a partida:

- time perdendo no trecho final aumenta pressão, ritmo, linha e risco;
- time vencendo pode baixar bloco e reduzir risco;
- rivalidade aumenta agressividade;
- histórico contra o adversário continua influenciando a escolha tática;
- dificuldade altera reação, alcance de pressão, decisões e precisão técnica da IA;
- dificuldade não adiciona gols nem força vitória/derrota.

### Duração da partida

A física continua em passo fixo e o relógio visual possui ritmos configuráveis:

- **Curta:** aproximadamente 3 minutos;
- **Padrão:** aproximadamente 6 minutos;
- **Longa:** aproximadamente 10 minutos.

Dois tempos, intervalo e acréscimos continuam representando uma partida de 90
minutos dentro do jogo.

### Controles mobile

- joystick analógico com zona morta;
- intensidade contínua de direção;
- pointer capture durante arrasto;
- sprint segurado;
- áreas de toque ampliadas;
- feedback de botão pressionado;
- opção P/M/G para tamanho;
- opacidade 55/75/100%;
- opção de inverter joystick e botões;
- bloqueio de seleção/scroll acidental na área de controles.

### Criação de atleta

O creator foi separado do monólito principal e redesenhado:

- preview maior e mais legível;
- rosto com formatos diferentes;
- seis tons de pele;
- novos estilos de cabelo;
- cores de cabelo;
- barba curta, bigode ou sem barba;
- camisa e clube inicial;
- atributos iniciais exibidos visualmente;
- posição em cards;
- descrição de arquétipos;
- explicação dos níveis de dificuldade;
- seleção de país/divisão/origem reorganizada;
- todos os **12 países** acessíveis em mobile;
- scroll interno específico para a grade de países;
- botão final alcançável em 360×800, 390×844 e landscape.

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

### Validação da 0.5.3

O gate `verify:0.5.3` valida:

- 12 perfis táticos;
- dificuldade comportamental;
- formações com posicionamento diferente;
- postura adaptativa pelo placar/minuto;
- influência de atributos;
- impedimento real;
- cartões;
- lesões;
- substituições;
- acréscimos;
- **100 partidas IA x IA** sem soft lock;
- distribuição segura de gols.

O CI também mantém verdes:

- 5.000 partidas legadas;
- 25 temporadas do mundo;
- Match Core;
- integração carreira ↔ partida;
- build de produção;
- build GitHub Pages;
- testes de renderização;
- Career UI em 360 px, tablet e desktop;
- partida real em Chromium com teclado e touch;
- creator em 360×800, 390×844, tablet, desktop e landscape.

### Fundação técnica preservada

- Match Core independente de React;
- simulação em passo fixo;
- regras, física, IA e renderer desacoplados;
- bridge carreira → partida → resultado;
- Career Hub 0.5.1 preservado;
- modo rápido legado preservado;
- saves anteriores continuam migrando.

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
pnpm verify:0.5.3
pnpm verify:variation
pnpm verify:world
pnpm test:render
pnpm build:github
```

O roadmap e os critérios de aceite vivem em `TASKS.md`.
