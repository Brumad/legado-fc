# Legado FC 0.5.2 — Partida 2D Jogável

## Objetivo

Entregar o primeiro vertical slice de futebol realmente jogável integrado à
carreira.

## Gameplay entregue

- 22 jogadores;
- somente o atleta da carreira é controlado pelo usuário;
- movimento em múltiplas direções;
- aceleração e desaceleração;
- sprint e stamina;
- posse e primeiro toque;
- passe curto;
- passe em profundidade;
- chute;
- desarme;
- faltas;
- bola livre com atrito;
- gols com cruzamento completo da linha;
- lateral;
- tiro de meta;
- escanteio 2D;
- reinício após gol;
- placar, relógio, pausa e intervalo;
- câmera seguindo o atleta.

## Controles

Teclado, touch e gamepad estão integrados. A interface touch aparece em
dispositivos com ponteiro coarse ou telas compactas.

## Integração com carreira

A entrada normal em "Partida" abre o novo campo 2D.

O modo de partidas/lances da 0.4.x continua disponível pelo botão
`MODO RÁPIDO`.

Ao terminar a partida jogável, placar, gols, assistências, nota, energia e
estatísticas entram no contrato de resultado já consumido pela carreira.

## Validação

Checkpoint verde: `a2756444`  
Workflow: `37516851694`

Todos os gates passaram, incluindo:

- typecheck;
- lint;
- Match Core;
- integração carreira/partida;
- interface 0.5.1;
- partida 2D 0.5.2;
- 5.000 partidas legadas;
- 25 temporadas;
- build produção;
- render tests;
- GitHub Pages;
- browser tests da carreira;
- browser tests da partida.

Browser tests 0.5.2:

- teclado joga, pausa, retoma e conclui a partida;
- touch movimenta e conclui a partida;
- modo rápido legado permanece acessível.

O teste headless conclui dez partidas completas consecutivas sem soft lock e
valida coordenadas finitas durante a execução.

## Compatibilidade

A 0.5.2 não adiciona novo campo obrigatório ao save. A carreira 0.5.1 e saves
anteriores continuam passando pelas migrações existentes.

## Próximo passo

A próxima evolução deve transformar a fundação jogável em futebol mais
convincente: goleiros, comportamento coletivo, disputa física, qualidade de
passe/chute, animações e polimento do ritmo antes da implementação 3D de faltas
e escanteios.
