# Legado FC

Simulador de vida e carreira de um jogador de futebol. A versão atual combina
partidas híbridas, evolução do atleta, decisões fora de campo e um universo
persistente que continua mudando a cada temporada.

## Versão atual

`0.4.3 — Consequências`

Principais recursos:

- criação de carreira por país, divisão, origem, posição e arquétipo;
- calendário com preparação entre partidas;
- nove tipos de lances interativos com variações próprias por posição;
- doze estilos táticos com forças, vulnerabilidades e adaptações;
- briefing pré-jogo com abordagens disciplinada, equilibrada, agressiva e criativa;
- postura dinâmica conforme placar, minuto, rivalidade e histórico do confronto;
- cartões, suspensões, impedimentos, substituições, lesões e fadiga real;
- relatório com posse, finalizações, chances, xG, faltas e disciplina;
- caderno tático que preserva os últimos 40 relatórios da carreira;
- lesões com tempo real de recuperação e substituições ligadas a nota, energia e placar;
- motor persistente de consequências com duração em partidas e efeitos reais;
- decisões que alteram desempenho, fadiga, lesões, cartões, treinador, elenco, reputação, renda e mercado;
- personalidade dinâmica em cinco eixos, construída pelas escolhas repetidas;
- eventos atrasados que retornam como cobranças médicas, familiares, comerciais e disciplinares;
- central de consequências ativas, histórico de efeitos encerrados e fila narrativa;
- mudanças internacionais com adaptação cultural, idioma e impacto esportivo;
- rodadas, classificações, acessos e rebaixamentos;
- 12 países, 24 divisões e 505 clubes;
- mercado mundial, aposentadorias e novos talentos;
- propostas de carreira, pré-contratos, renovações e histórico de transferências;
- vida pessoal, contratos, patrimônio, imprensa e reputação;
- múltiplos slots de save, importação e exportação da carreira;
- PWA instalável.

## Desenvolvimento

Requisitos: Node.js 22.13 ou superior.

```bash
pnpm install
pnpm dev
pnpm test
```

Comandos de verificação:

```bash
pnpm verify:variation
pnpm verify:world
```

O motor de simulação está em `app/game-engine.ts` e a interface principal em
`app/page.tsx`.
