# Legado FC 0.5.4 — Visual Retrô e Apresentação da Partida

## Objetivo

Dar identidade visual própria ao futebol 2D sem alterar o Match Core validado na
0.5.3.

## Entregas

### Sprites e animações

- sprites procedurais originais;
- proporções arcade próprias;
- corrida;
- passe;
- chute;
- desarme/carrinho;
- goleiro;
- comemoração;
- sombras;
- indicador do jogador controlado.

### Uniformes

- variante de casa;
- variante de visitante;
- variante de goleiro;
- cores de clube integradas ao renderer.

### Campo e estádio

- gramado e textura;
- marcações completas;
- redes;
- arquibancada;
- torcida procedural;
- bola retrô;
- efeitos de velocidade e gol.

### HUD

- HUD arcade com atleta;
- camisa e posição;
- stamina;
- posse e chutes;
- placar/tempo preservados;
- tática e dificuldade rival;
- controles visuais.

### Câmeras e desempenho

- Seguir;
- TV;
- Aberta;
- qualidade baixa/média/alta;
- torcida reduzida/desativada em qualidade baixa;
- efeitos desligáveis.

Nenhuma opção visual reinicia o runtime.

### Replay

Um buffer visual mantém os estados recentes do Match Core para replay curto
após gol. O replay congela apenas a apresentação enquanto reproduz os frames
armazenados e pode ser desligado.

## Validação

Checkpoint funcional verde: `e8a584cd`.

Gates:

- Typecheck ✅
- Lint ✅
- Match Core ✅
- Integração ✅
- Career UI ✅
- Partida 0.5.2+ ✅
- Gameplay/UX 0.5.3 ✅
- Apresentação 0.5.4 ✅
- 5.000 partidas legadas ✅
- 25 temporadas ✅
- Build produção ✅
- Render tests ✅
- Build Pages ✅
- Career UI Playwright ✅
- Creator Playwright ✅
- Partida real Playwright ✅
- Apresentação 0.5.4 Playwright ✅

## Compatibilidade

- nenhum campo obrigatório novo no save;
- Match Core permanece independente do renderer;
- efeitos desligados continuam jogáveis;
- qualidade reduzida não altera resultados;
- modo rápido legado permanece disponível.

## Próximo marco

A 0.5.5 continua reservada para **faltas e escanteios em 3D**, seguindo a
direção definida para bolas paradas sem transformar a partida inteira em 3D.
