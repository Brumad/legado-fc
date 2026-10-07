# Legado FC

Simulador de vida e carreira de um jogador de futebol. A série 0.5 transforma o
projeto em um jogo de futebol jogável sem descartar carreira, mundo persistente
e sistemas construídos na 0.4.x.

## Versão atual

`0.5.4 — Visual Retrô e Apresentação da Partida`

A 0.5.4 dá identidade visual própria à partida 2D. O Match Core e as regras
consolidadas na 0.5.3 continuam independentes da apresentação: trocar câmera,
qualidade, efeitos ou replay não reinicia nem altera o resultado da simulação.

### Linguagem visual original

Os jogadores deixaram de ser círculos e passaram a ser sprites procedurais
originais desenhados pelo próprio renderer:

- corpo, cabeça, braços e pernas;
- proporções arcade próprias;
- animação visual de corrida;
- pose de passe;
- pose de chute;
- pose de desarme/carrinho;
- comportamento visual específico do goleiro;
- comemoração após gol;
- sombra de contato;
- indicador destacado do atleta controlado;
- posse legível em zoom reduzido.

Nenhum sprite ou asset de outro jogo foi copiado.

### Uniformes

O renderer gera variantes procedurais:

- uniforme de casa com faixa central;
- uniforme visitante com faixa diagonal;
- goleiro com painel e contorno próprios;
- cores dos clubes são usadas diretamente na partida;
- pequenos detalhes mantêm os lados distinguíveis em câmeras abertas.

### Campo e estádio

- gramado em faixas;
- textura adicional em qualidade alta;
- todas as marcações do campo;
- áreas e círculo central;
- redes simples nos gols;
- arquibancada estilizada;
- torcida procedural;
- sombras;
- bola retrô com rotação visual;
- trilha visual da bola em alta velocidade;
- efeito de gol.

### HUD e feedback

A partida ganhou uma apresentação arcade própria:

- placar e relógio;
- HUD inferior com jogador, camisa e posição;
- stamina;
- posse;
- chutes;
- dificuldade/tática rival;
- acréscimos;
- feedback visual de passe, profundidade, chute e desarme;
- controles rápidos de câmera e efeitos no mobile.

### Câmeras

Há três opções que podem ser trocadas durante a partida sem reiniciar o runtime:

- **Seguir** — foco no atleta controlado com leve antecipação da bola;
- **TV** — visão intermediária mais aberta;
- **Aberta** — mostra grande parte do campo.

### Qualidade visual

O renderer possui três níveis:

- baixa;
- média;
- alta.

Qualidade baixa reduz detalhes visuais e torcida. Efeitos também podem ser
desligados separadamente. Nenhuma dessas opções modifica a física, IA, relógio
ou resultado da partida.

### Replay

Após um gol, o canvas usa um buffer somente de apresentação para reproduzir
alguns segundos anteriores. Enquanto o replay é mostrado, o Match Core não é
recriado e não recebe lógica visual.

O replay pode ser desligado.

### Fundação de gameplay preservada

A 0.5.4 mantém tudo que já estava validado na 0.5.3:

- joystick analógico mobile;
- teclado e gamepad;
- partidas 3/6/10 min;
- dificuldade Promessa/Profissional/Lenda;
- 12 estilos táticos;
- formações e postura dinâmica;
- atributos influenciando gameplay;
- impedimento;
- vantagem;
- cartões;
- lesões;
- substituições;
- acréscimos;
- creator redesenhado com 12 países acessíveis;
- modo rápido legado.

### Validação da 0.5.4

O gate `verify:0.5.4` confirma:

- renderer procedural original;
- três câmeras com enquadramentos diferentes;
- qualidade baixa/média/alta;
- efeitos desligáveis;
- replay;
- HUD arcade;
- ausência de dependência do renderer dentro da simulação;
- opções visuais fora das dependências que criam o runtime.

O Playwright real valida:

- trocar câmera não reseta posição do jogador;
- mudar qualidade não reseta a partida;
- desligar efeitos mantém o jogo funcional;
- renderer continua produzindo imagem legível;
- HUD arcade aparece no desktop;
- controles rápidos aparecem no mobile;
- mobile não cria overflow horizontal;
- replay pode ser ligado/desligado;
- joystick continua disponível.

O pipeline completo também mantém verdes:

- typecheck e lint;
- Match Core;
- integração carreira ↔ partida;
- `verify:0.5.3`;
- 100 partidas IA x IA;
- 5.000 partidas legadas;
- 25 temporadas;
- build de produção;
- build GitHub Pages;
- Career UI real;
- creator real;
- partida real em desktop/mobile.

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
pnpm verify:variation
pnpm verify:world
pnpm test:render
pnpm build:github
```

O roadmap e os critérios de aceite vivem em `TASKS.md`.
