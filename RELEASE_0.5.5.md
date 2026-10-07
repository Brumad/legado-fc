# Legado FC 0.5.5 — Faltas e Escanteios em 3D

## Objetivo

Adicionar momentos especiais em 3D real para bolas paradas sem transformar a
partida inteira em 3D e sem criar um segundo motor de placar.

## Arquitetura

A 0.5.5 adiciona o módulo `app/set-piece-3d`:

- `types.ts`: contratos da cena, gesto e resultado;
- `physics.ts`: lançamento e física XYZ;
- `simulation.ts`: goleiro, barreira, duelos e resolução;
- `integration.ts`: bridge Match Core ↔ 3D;
- `scene.ts`: cena Three.js procedural;
- `set-piece-3d-screen.tsx`: input e apresentação;
- `index.ts`: superfície pública do módulo.

Three.js está pinado em `0.185.1` e `@types/three` usa a mesma versão.

## Gameplay entregue

### Falta direta
- origem real da infração;
- câmera atrás do cobrador;
- barreira dinâmica de 2–5 jogadores;
- goleiro físico;
- direção, força, altura e curva;
- gol, defesa, bloqueio e saída derivados da trajetória.

### Falta levantada
- trajetória aérea para a área;
- atacantes e defensores;
- duelo aéreo;
- cabeçada, corte, defesa, rebote ou gol.

### Escanteio
- lado do campo preservado;
- câmera específica da bandeirinha;
- cruzamento com curva;
- jogadores na área;
- segunda bola/rebote.

## Controles

- mouse por gesto;
- touch por gesto;
- gamepad com analógicos, gatilhos e botão A.

O gamepad é amostrado fora do frame loop WebGL para não perder cliques em
hardware lento ou SwiftShader.

## Física

A bola possui gravidade, drag, Magnus, spin, quique, atrito e erro técnico por
atributo.

O goleiro reage à trajetória real. `goalkeeping` altera tempo de reação,
velocidade útil, compromisso com a trajetória e alcance.

## Visual

A cena Three.js usa objetos procedurais originais para gramado, gol, rede,
barreira, jogadores, goleiro, bola, iluminação, sombras e torcida.

O avatar da carreira reaproveita tom de pele, cabelo, cor de cabelo, barba,
formato de rosto, número e uniforme.

Nenhum asset ou interface de Score! Hero ou outro jogo foi copiado.

## Compatibilidade e carregamento

- WebGL indisponível não bloqueia a partida;
- existe retorno ao 2D tradicional;
- existe modo de compatibilidade usando a física sem apresentação 3D;
- a tela Three.js é carregada por `React.lazy`;
- o build mantém a cena em chunk separado e o navegador reutiliza o módulo após
  o primeiro carregamento.

## Integração 2D ↔ 3D

O resultado volta para a mesma instância do Match Core.

São preservados relógio, placar, cartões, stamina, lesões, jogadores e estado da
bola. Gol gera kickoff normal; defesa entrega a posse ao goleiro; bola para fora
gera tiro de meta; cortes e rebotes retornam posição, velocidade e último toque
ao campo 2D.

## Validação

Checkpoint funcional: `46e906dd0007a7f87400b078862d3788c8880a60`  
Workflow funcional: `37649068050` — **PASS**

### Headless
- física finita;
- curva/altura/potência alteram a trajetória;
- gol produzido pela física real;
- goleiro segue a trajetória;
- barreira;
- falta levantada;
- escanteio;
- duelo aéreo/rebote;
- retorno ao Match Core;
- preservação de relógio, cartões e stamina.

### Navegador real
- falta direta + mouse ✅
- escanteio + touch ✅
- falta levantada + gamepad ✅
- fallback sem WebGL ✅

### Regressão
- Typecheck ✅
- Lint ✅
- Match Core ✅
- 0.5.2 ✅
- 0.5.3 ✅
- 0.5.4 ✅
- 5.000 partidas legadas ✅
- 25 temporadas ✅
- Build de produção ✅
- Build GitHub Pages ✅
- Playwright regressivo ✅

A tecnologia fica pronta para futuras extensões como pênaltis, mantendo o 3D
como uma camada especial sobre o Match Core.
