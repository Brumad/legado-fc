# Legado FC

Simulador de vida e carreira de um jogador de futebol. A série 0.5 transforma o
projeto em um jogo de futebol jogável sem descartar carreira, mundo persistente
e sistemas construídos na 0.4.x.

## Versão atual

`0.5.5 — Faltas e Escanteios em 3D`

A 0.5.5 mantém a partida normal em 2D e transforma bolas paradas selecionadas em
momentos especiais em 3D real.

```text
PARTIDA 2D
   ↓
FALTA / ESCANTEIO
   ↓
CENA THREE.JS 3D
   ↓
RESULTADO FÍSICO
   ↓
MATCH CORE
   ↓
PARTIDA 2D
```

A cena 3D não possui placar paralelo nem resultado roteirizado. A bola é lançada,
simulada e devolvida ao Match Core.

### Situações 3D

A fundação cobre:

- falta direta;
- falta levantada/cruzada;
- escanteio.

A posição da cobrança nasce exatamente do `restart.position` da partida 2D.
Escanteios preservam o lado correto do campo.

### Física da bola

O módulo `app/set-piece-3d` é independente do React e simula:

- posição XYZ;
- velocidade XYZ;
- gravidade;
- drag;
- spin;
- efeito Magnus;
- quique;
- atrito com o gramado;
- potência;
- altura;
- curva.

O gate headless exige que a própria trajetória física consiga produzir um gol.
Nenhum teste injeta um resultado de gol para validar a cobrança.

### Goleiro

O goleiro reage à trajetória real depois de um tempo de reação.

`goalkeeping` influencia:

- atraso de reação;
- compromisso com a trajetória;
- velocidade útil;
- alcance.

Isso permite defesas reais sem transformar o goleiro em um espelho perfeito da
bola.

### Barreira e área

Faltas diretas criam barreira entre a origem e o gol. O número de jogadores varia
com a distância.

Faltas levantadas e escanteios criam atacantes e defensores na área. Cruzamentos
podem terminar em cabeçada, corte, defesa, rebote, bola viva, gol ou saída.

### Controles

**Mouse:** arraste na cena para definir direção, altura, potência e curva.

**Touch:** o mesmo gesto funciona na superfície 3D, com pointer capture.

**Gamepad:**
- analógico esquerdo: direção/altura;
- analógico direito: curva;
- gatilhos: potência;
- A: executar cobrança.

A amostragem do gamepad é independente do FPS do WebGL, evitando perda de
botões em GPUs lentas ou SwiftShader.

### Atributos da carreira

O atleta controlado leva para a cena:

- chute;
- passe;
- drible/técnica;
- físico;
- pé dominante;
- tom de pele;
- cabelo e cor do cabelo;
- barba;
- formato de rosto;
- número da camisa.

Os atributos alteram erro, potência e capacidade de curva.

### Visual Three.js

A cena usa Three.js com modelos procedurais originais:

- gramado e marcações;
- gol e rede;
- goleiro;
- barreira;
- jogadores na área;
- bola;
- iluminação e sombras;
- torcida estilizada;
- avatar da carreira.

Nenhum asset ou interface de Score! Hero ou outro jogo é copiado.

### Carregamento

Three.js e a tela de bola parada são carregados por `React.lazy` somente quando
a cena 3D é necessária. O build mantém a cena em chunk separado; após o primeiro
carregamento, o módulo permanece no cache normal do navegador.

### Retorno ao Match Core

O resultado 3D volta para a mesma partida.

São preservados:

- minuto e período;
- placar;
- cartões;
- stamina;
- lesões;
- jogadores;
- último toque;
- posição da bola.

Um gol gera saída de bola normal. Defesa entrega a bola ao goleiro. Bola para
fora gera tiro de meta. Cortes e rebotes retornam posição, velocidade e último
toque reais ao 2D.

### Fallback

Se WebGL não estiver disponível:

- o usuário pode voltar para a cobrança 2D original;
- ou executar a mesma física em modo de compatibilidade sem apresentação 3D.

O fallback não reabre a cena em loop e permite que a partida continue.

### Fundação preservada

A 0.5.5 mantém tudo que já estava validado:

- Match Core independente;
- joystick analógico mobile;
- teclado e gamepad;
- duração 3/6/10 min;
- dificuldade real;
- 12 estilos táticos;
- regras, cartões, lesões, impedimento e acréscimos;
- creator com 12 países;
- sprites retrô da 0.5.4;
- câmeras, replay e HUD arcade;
- modo rápido legado.

## Validação da 0.5.5

`verify:set-pieces-3d` valida headless:

- gesto reto e curvo;
- falta direta e barreira;
- curva, altura e potência;
- gol produzido pela física real;
- reação física do goleiro;
- falta levantada;
- escanteio e lado correto;
- duelo aéreo/rebote;
- retorno de gol, defesa, bloqueio e bola viva ao Match Core;
- preservação de relógio, cartões e stamina.

O Playwright real valida:

- falta direta WebGL com mouse;
- escanteio WebGL com touch em 390×844;
- falta levantada WebGL com gamepad;
- fallback sem WebGL;
- retorno para a mesma partida 2D.

Checkpoint funcional: `46e906dd`  
Workflow funcional: `37649068050` — **PASS**.

O pipeline também mantém verdes:

- typecheck;
- lint;
- Match Core;
- integração carreira ↔ partida;
- 0.5.2;
- 0.5.3;
- 0.5.4;
- 5.000 partidas legadas;
- 25 temporadas;
- build de produção;
- render tests;
- build GitHub Pages;
- Career UI;
- creator;
- partida real desktop/mobile.

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
pnpm verify:0.5.4
pnpm verify:set-pieces-3d
pnpm verify:variation
pnpm verify:world
pnpm test:render
pnpm build:github
```

O roadmap e os critérios de aceite vivem em `TASKS.md`.
