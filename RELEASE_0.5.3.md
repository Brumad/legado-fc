# Legado FC 0.5.3 — Futebol, Controles e Criação de Atleta

## Objetivo

Fechar o primeiro grande overhaul de jogabilidade da série 0.5, baseado nos
problemas observados no GitHub Pages após a 0.5.2.

## Entregue

### Controles

- D-pad removido do runtime mobile.
- Joystick analógico virtual com zona morta.
- Intensidade de movimento contínua.
- Pointer capture durante arrasto.
- Sprint segurado.
- Botões reposicionados e áreas de toque ampliadas.
- Tamanho, opacidade e lado configuráveis.
- Teclado e gamepad preservados.

### Tempo e dificuldade

- Partidas de aproximadamente 3, 6 ou 10 minutos.
- Relógio desacoplado do passo fixo de física.
- Intervalo e dois tempos preservados.
- Acréscimos derivados de paralisações.
- Dificuldade Promessa/Profissional/Lenda alterável na carreira.
- Dificuldade afeta IA e execução técnica; não injeta placar.

### Futebol

- 12 estilos táticos ligados ao Match Core.
- Formações possuem shapes diferentes.
- Com e sem posse possuem comportamentos diferentes.
- Pressão, recomposição, apoio e corridas em profundidade.
- Postura dinâmica por placar/minuto.
- Rivalidade e histórico influenciam o plano.
- Goleiro possui comportamento específico.
- Passe/chute/desarme/sprint respondem a atributos.
- Impedimento pela posição real.
- Faltas por disputa.
- Vantagem.
- Cartões.
- Lesões.
- Substituições.
- Acréscimos.

### Creator

- Arquitetura extraída para `career-creator.tsx`.
- Avatar extraído para `player-avatar.tsx`.
- Novo rosto/corpo CSS original.
- Formato de rosto, tons de pele, cabelo, cor de cabelo e barba.
- Preview de atributos.
- Cards de posição e arquétipo.
- Explicação de dificuldade.
- Correção da grade dos 12 países.
- Scroll interno mobile.
- CTA final sticky e alcançável.

## Validação

- `verify:0.5.3`: PASS.
- 100 partidas IA x IA: PASS.
- 5.000 partidas legadas: PASS.
- 25 temporadas do mundo: PASS.
- Typecheck: PASS.
- Lint: PASS.
- Build de produção: PASS.
- Build GitHub Pages: PASS.
- Career UI 360/tablet/desktop: PASS.
- Partida real Chromium teclado/touch: PASS.
- Creator 360×800 / 390×844 / tablet / desktop / landscape: PASS.

## Próximo marco

A 0.5.4 permanece focada no **visual retrô original e apresentação da partida**.
A 0.5.5 continua reservada para **faltas e escanteios em 3D**.
