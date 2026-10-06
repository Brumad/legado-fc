# Legado FC 0.5.0 — Fundação Jogável

## Objetivo

Estabelecer uma base técnica segura para transformar o Legado FC de um simulador
orientado a telas/lances em um jogo de futebol jogável, preservando a carreira e
os saves existentes.

## Principais entregas

- Match Core schema v1 independente de React.
- Runtime headless determinístico em passo fixo de 60 Hz.
- Relógio de dois tempos com pausa, retomada, abandono e limites exatos.
- Estado isolado para jogadores, bola, campo, placar e eventos.
- Módulos separados de regras, física e IA.
- Abstração de input para teclado, touch e gamepad.
- Renderer Canvas desacoplado das regras.
- Shell Canvas usando requestAnimationFrame sem renderização React por frame.
- Bridge carreira -> partida com 22 jogadores e exatamente um atleta controlado.
- Contrato PlayableMatchResult para integração futura com a carreira.
- verify:match-core e verify:match-integration.
- Workflow de validação para branches de feature e PRs.
- Correção dos nomes dos testes existentes para 5.000 partidas e 25 temporadas.

## Compatibilidade

Nenhum novo campo persistente foi adicionado ao save da carreira nesta versão.
Por isso não foi criada uma migração artificial de save.

O motor procedural 0.4.3 e a interface antiga de partida continuam disponíveis
como fallback. Eles serão substituídos progressivamente nas versões 0.5.x.

## Validação

A fundação foi validada com:

- typecheck;
- lint;
- Match Core;
- integração carreira/partida;
- 5.000 partidas procedurais;
- 25 temporadas do mundo;
- build de produção;
- testes de renderização;
- build GitHub Pages.

## Próximo marco

`0.5.1 — Nova interface de carreira`.

A partida 2D jogável completa permanece planejada para `0.5.2`; a 0.5.0 apenas
garante que esse desenvolvimento aconteça sobre uma arquitetura testável e
desacoplada.
