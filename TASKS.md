# Legado FC - Roadmap e Implementações

Este arquivo é a fonte principal de planejamento do Legado FC.

O objetivo é impedir versões vagas, preservar o que já funciona e garantir que cada versão entregue funcionalidades, testes, critérios de aceite, documentação e um checkpoint reproduzível.

## Visão do produto

O Legado FC é um jogo de vida e carreira de um jogador de futebol.

A partir da série `0.5.x`, o projeto deixa de depender principalmente de telas e lances abstratos para se transformar em um jogo de futebol jogável, mantendo toda a profundidade de carreira já criada.

Referências de direção, sem copiar identidade visual, código, assets ou interface:

- **New Star Soccer**: referência para fluxo da carreira, menus, vida fora de campo, progressão rápida e leitura simples das informações.
- **Super Soccer Champs**: referência para partida 2D vista de cima, ritmo arcade, controles diretos, leitura do campo e direção visual retrô.
- **Score! Hero / referência descrita como "Soccer Hero"**: referência apenas para a ideia de cobranças de falta e escanteio em uma apresentação 3D com trajetória controlada pelo jogador.

Todo visual, sprite, HUD, nome, ícone, animação, modelo 3D, som e código do Legado FC deve ser original ou possuir licença compatível.

---

# Convenção de versões

- `0.X.0` = novo marco funcional importante.
- `0.X.1`, `0.X.2`, `0.X.3`... = implementação progressiva, refinamento, estabilidade e fechamento do marco `0.X`.
- `1.0.0` = primeira versão considerada completa e estável para uso normal.

Uma versão só pode ser marcada como concluída após:

1. planejamento;
2. desenvolvimento;
3. revisão de código;
4. build;
5. testes automatizados;
6. testes funcionais;
7. correção de bugs;
8. regressão da carreira existente;
9. validação de saves e migrações;
10. validação de desempenho;
11. revisão de dependências e licenças;
12. documentação;
13. release notes;
14. release.

---

# Regras obrigatórias a partir da 0.5

Cada versão deve possuir:

- objetivo definido;
- escopo definido;
- tarefas marcáveis;
- critérios de aceite;
- testes automatizados aplicáveis;
- roteiro de teste manual quando necessário;
- validação de compatibilidade de save;
- validação de regressão do mundo;
- validação da partida;
- avaliação de desempenho;
- avaliação de propriedade intelectual/licenciamento;
- documentação atualizada;
- build reproduzível;
- release notes.

Nenhuma funcionalidade nova pode quebrar silenciosamente uma carreira criada na `0.4.3`.

---

# Checkpoint congelado - 0.4.3 Consequências

Status: **BASELINE VALIDADO**

Branch: `main`  
Checkpoint: `ddd2cb6f`  
Versão do pacote: `0.4.3`

O último workflow publicado para esse checkpoint concluiu com sucesso.

## Sistemas existentes confirmados

### Carreira e jogador

- [x] Criação de carreira por país, divisão, origem, posição e arquétipo.
- [x] Evolução de atributos.
- [x] Energia, fadiga e preparação.
- [x] Reputação.
- [x] Confiança do treinador.
- [x] Relação com elenco.
- [x] Disciplina.
- [x] Personalidade dinâmica em cinco eixos.
- [x] Histórico da carreira.
- [x] Contratos.
- [x] Renovação.
- [x] Pré-contrato.
- [x] Propostas de transferência.
- [x] Mercado para o jogador da carreira.
- [x] Histórico de transferências.

### Mundo

- [x] 12 países.
- [x] 24 divisões.
- [x] 505 clubes.
- [x] Classificações.
- [x] Turno e returno.
- [x] Acessos e rebaixamentos.
- [x] Mundo persistente de jogadores.
- [x] Nacionalidades.
- [x] Evolução e envelhecimento.
- [x] Aposentadorias.
- [x] Geração de novos talentos.
- [x] Mercado mundial.
- [x] Ranking mundial.
- [x] Histórico de temporadas.

### Partidas 0.4.x

- [x] Geração procedural de partidas.
- [x] Nove tipos de lances.
- [x] Lances por posição.
- [x] 12 estilos táticos.
- [x] Forças e vulnerabilidades táticas.
- [x] Adaptação ao histórico do confronto.
- [x] Rivalidade.
- [x] Cartões amarelos.
- [x] Cartões vermelhos.
- [x] Impedimentos.
- [x] Substituições.
- [x] Lesões.
- [x] Suspensões.
- [x] Fadiga.
- [x] Posse.
- [x] Finalizações.
- [x] Finalizações no alvo.
- [x] Chances.
- [x] xG.
- [x] Relatório pós-jogo.
- [x] Histórico tático.

### Vida e consequências

- [x] Finanças.
- [x] Patrimônio.
- [x] Despesas.
- [x] Investimentos.
- [x] Dívidas.
- [x] Fundo de aposentadoria.
- [x] Patrocínios.
- [x] Relações pessoais.
- [x] Família.
- [x] Redes sociais.
- [x] Consequências persistentes.
- [x] Efeitos com duração em partidas.
- [x] Eventos atrasados.
- [x] Impacto das decisões em carreira, mercado, rendimento e relações.

### Save e plataforma

- [x] Múltiplos slots.
- [x] Migração de saves antigos.
- [x] Importação de carreira.
- [x] Exportação de carreira.
- [x] PWA.
- [x] GitHub Pages.
- [x] CI de publicação.

---

# Baseline de testes existente

## verify:variation

O script atual executa **5.000 partidas**, apesar do nome da etapa no workflow ainda dizer "1.000 partidas".

Ele verifica, entre outros pontos:

- assinaturas de partida;
- variedade de padrões;
- variedade de placares;
- taxas de vitória, empate e derrota;
- média de gols;
- distribuição dos 12 estilos táticos;
- cartões;
- expulsões;
- lesões;
- lances posicionais;
- cinco grupos de posição;
- integridade de 12 países, 24 divisões e 505 clubes;
- calendário;
- turno e returno;
- rodada completa;
- classificação;
- suspensão;
- lesão;
- adaptação tática.

## verify:world

O script atual executa uma carreira simulada de **25 temporadas**, apesar do nome da etapa no workflow ainda dizer "15 temporadas".

Ele verifica, entre outros pontos:

- população mundial;
- jogadores duplicados;
- idade, potencial e nacionalidade;
- hierarquia de força entre clubes;
- migração de saves;
- consequências persistentes;
- ranking mundial;
- mercado do jogador;
- renovação;
- transferências;
- 36 transferências por janela simulada;
- campeões dos 12 países;
- aposentadorias;
- regeneração de jogadores;
- limites de histórico;
- tamanho do save.

## Teste de renderização

Existe teste de HTML que confirma a aplicação `0.4.3` e a presença dos principais sistemas no source.

## Dívidas do CI atual

- [ ] Corrigir os nomes "1.000 partidas" e "15 temporadas" no workflow.
- [ ] Executar `pnpm lint` no CI.
- [ ] Executar o conjunto completo de testes de renderização no CI.
- [ ] Tornar `pnpm test` ou uma suíte equivalente parte obrigatória do gate.
- [ ] Adicionar testes específicos do novo motor jogável a partir da `0.5`.

---

# 0.5.x - De simulador para jogo

## Objetivo do marco

Transformar o Legado FC em uma experiência jogável de futebol sem perder a simulação de carreira construída até a `0.4.3`.

A partida do jogador deixa de ser essencialmente uma sequência de decisões abstratas e passa a possuir campo, atletas, bola, movimentação, controles, IA e ações em tempo real.

A identidade desejada é:

**carreira e interface acessível + futebol 2D retrô/arcade + momentos especiais em 3D.**

## Regra central de design

O Legado FC continua sendo uma **carreira de jogador**.

Por padrão, o usuário controla o atleta da própria carreira durante a partida. Os demais jogadores são controlados pela IA. Controle livre de todo o time não faz parte do escopo inicial da `0.5.x`.

O modo atual de lances não será destruído imediatamente. Ele deve permanecer disponível como modo rápido/fallback enquanto o novo motor é validado.

---

# 0.5.0 - Fundação do novo jogo

Status: **COMPLETE**

Checkpoint de implementação: branch `feat/v0.5.0-gameplay-foundation`.

A 0.5.0 foi fechada como uma **fundação paralela e segura**. Ela não remove a gameplay 0.4.3 nem força o novo renderer na carreira atual. O objetivo desta versão é criar fronteiras técnicas para que as próximas versões possam substituir a partida progressivamente sem arriscar carreira, saves e mundo persistente.

## Objetivo

Criar a arquitetura necessária para a nova gameplay sem alterar o resultado funcional da carreira existente.

## Tarefas

- [x] Criar branch dedicada da série `0.5.x`.
- [x] Separar o novo domínio de partida do monólito de carreira/mundo/mercado.
- [x] Impedir que a nova gameplay aumente a responsabilidade de `app/game-engine.ts`.
- [x] Impedir que o loop de frame da nova gameplay fique dentro de `app/page.tsx`.
- [x] Criar módulo próprio para estado da partida.
- [x] Criar módulo próprio para regras da partida.
- [x] Criar módulo próprio para IA.
- [x] Criar módulo próprio para física/movimento da bola.
- [x] Criar camada de integração carreira <-> partida.
- [x] Criar contrato único de resultado de partida.
- [x] Preservar o gerador de partidas atual para simulação do restante do mundo.
- [x] Preservar o modo rápido de lances como fallback.
- [x] Definir loop de simulação em passo fixo independente do FPS de renderização.
- [x] Criar abstração de input para teclado, toque e gamepad.
- [x] Criar shell de Canvas para partida.
- [x] Preparar suporte a pausa, retomada e abandono seguro da partida.
- [x] Definir schema do Match Core antes de qualquer persistência nova.
- [x] Não criar migração desnecessária: a 0.5.0 não adiciona campos persistentes ao save da carreira.
- [x] Atualizar CI.
- [x] Corrigir nomes das etapas de 5.000 partidas e 25 temporadas.

### Decisão arquitetural

A extração completa de todo o código legado de carreira, mundo e mercado de `game-engine.ts`, assim como a desmontagem completa da antiga `MatchScreen` de `page.tsx`, **não faz parte do fechamento da 0.5.0**. Fazer isso antes de a nova partida substituir o fluxo antigo aumentaria risco sem benefício funcional imediato.

A partir daqui, toda gameplay nova deve entrar por `app/match-core/*`, `app/gameplay-integration.ts` e renderers próprios. O legado será reduzido progressivamente nas versões seguintes conforme cada fluxo for substituído e validado.

## Entregas técnicas

- [x] `app/match-core/types.ts` — contrato de estado e schema v1.
- [x] `app/match-core/state.ts` — criação e validação do estado.
- [x] `app/match-core/clock.ts` — relógio determinístico com limites exatos.
- [x] `app/match-core/input.ts` — teclado, touch e gamepad.
- [x] `app/match-core/rules.ts` — regras geométricas/bordas e base de gol/saída.
- [x] `app/match-core/physics.ts` — movimento de jogador e bola.
- [x] `app/match-core/ai.ts` — fundação de IA independente.
- [x] `app/match-core/simulation.ts` — runtime headless em passo fixo.
- [x] `app/match-core/renderer.ts` — renderer Canvas desacoplado.
- [x] `app/playable-match-canvas.tsx` — shell visual sem React por frame.
- [x] `app/gameplay-integration.ts` — bridge carreira -> 22 jogadores -> resultado.
- [x] `scripts/verify-match-core.mjs`.
- [x] `scripts/verify-match-integration.mjs`.
- [x] workflow dedicado `.github/workflows/validation.yml`.

## Critérios de aceite

- [x] Uma carreira `0.4.3` abre sem perda de dados, coberta pelas migrações/regressões existentes.
- [x] O mundo antigo continua produzindo os mesmos invariantes.
- [x] `verify:variation` continua passando com 5.000 partidas.
- [x] `verify:world` continua passando com 25 temporadas.
- [x] `verify:match-core` passa.
- [x] `verify:match-integration` passa.
- [x] Build de produção passa.
- [x] Build do GitHub Pages passa.
- [x] Typecheck passa.
- [x] Lint passa.
- [x] Teste de renderização passa.
- [x] Nenhuma regra do novo Match Core depende do renderer.
- [x] O loop da partida roda headless para testes.
- [x] React não precisa renderizar cada frame da nova partida.
- [x] O modo 0.4.3 permanece disponível enquanto a gameplay nova não está pronta para substituí-lo.

## Evidência de fechamento

Pipeline da branch validado com sucesso em:

- typecheck;
- lint;
- Match Core;
- integração carreira/partida;
- 5.000 partidas legadas;
- 25 temporadas do mundo;
- build de produção;
- testes de renderização;
- build GitHub Pages.

---

# 0.5.1 - Nova interface de carreira

Status: **COMPLETE**

Branch: `feat/v0.5.1-career-interface`

Checkpoint visual validado: `819ee6f9`  
Workflow: `37510730801`

## Objetivo

Transformar a navegação da carreira em uma interface que pareça um jogo, mantendo inspiração apenas estrutural em jogos de carreira de futebol e identidade visual própria do Legado FC.

## Entregas

- [x] Criar home/hub principal da carreira.
- [x] Criar cabeçalho compacto do jogador.
- [x] Mostrar idade, posição, overall, clube e temporada.
- [x] Mostrar energia, moral, forma e condição física.
- [x] Mostrar dinheiro e salário.
- [x] Criar card do próximo jogo.
- [x] Permitir chegar à partida em um passo a partir da home.
- [x] Criar navegação entre Partida, Treino, Vida, Mundo, Mercado e Perfil.
- [x] Criar central de eventos e decisões.
- [x] Criar calendário visual.
- [x] Reorganizar treino em fluxo rápido.
- [x] Reorganizar relações em cards simples.
- [x] Reorganizar finanças e patrimônio.
- [x] Reorganizar mercado e contrato.
- [x] Harmonizar Temporada, Mundo, Perfil, Vida e Mercado com o design system 0.5.1.
- [x] Adaptar interface para celular, tablet e desktop.
- [x] Garantir navegação por teclado e foco visível.
- [x] Garantir alvos de toque adequados na navegação principal.
- [x] Criar design system próprio do Career Hub.
- [x] Remover a nova home do componente gigante de `page.tsx`.
- [x] Criar `verify:career-ui`.
- [x] Criar validação real de navegador com Chromium/Playwright.
- [x] Validar 360x800.
- [x] Validar 768x1024.
- [x] Validar 1440x1000.
- [x] Validar ausência de overflow horizontal nas telas principais.
- [x] Validar que textos essenciais da home não ficam cortados em 360 px.
- [x] Atualizar metadata, manifest, README e release notes.
- [x] Preservar schema e compatibilidade de save.

## Telas alinhadas ao padrão 0.5.1

- [x] Início / Career Hub.
- [x] Temporada.
- [x] Mundo.
- [x] Perfil.
- [x] Vida e Finanças.
- [x] Mercado e Contrato.
- [x] Navegação lateral/mobile.
- [x] Topbar contextual.

## Critérios de aceite

- [x] O usuário chega à próxima partida em um passo a partir da home.
- [x] As funções existentes da 0.4.3 continuam acessíveis.
- [x] Interface validada em mobile, tablet e desktop em navegador real.
- [x] Nenhum overflow horizontal detectado nos viewports validados.
- [x] Textos essenciais da home não ficam cortados em 360 px no fixture de validação.
- [x] Navegação principal funciona sem mouse.
- [x] Nenhum asset ou layout foi copiado diretamente das referências.
- [x] Save antigo continua compatível; a 0.5.1 não altera o schema persistente.
- [x] Match Core e integração da 0.5.0 continuam verdes.
- [x] Regressão de 5.000 partidas continua verde.
- [x] Regressão de 25 temporadas continua verde.
- [x] Build de produção e GitHub Pages continuam verdes.

## Evidência de fechamento visual

O workflow `37510730801` executou quatro testes reais em Chromium:

- `mobile-360` — PASS;
- `tablet` — PASS;
- `desktop` — PASS;
- navegação por teclado — PASS.

O teste verifica Home, Vida, Mercado, Perfil, Temporada e Mundo, além de overflow horizontal e legibilidade essencial da home em 360 px.

## Próximo marco

`0.5.2 — Partida 2D jogável: vertical slice`.

A partir daqui o foco volta ao campo: jogador controlável, bola, passe, chute, desarme, câmera, reinícios e conclusão de uma partida completa usando o Match Core criado na 0.5.0.

---

# 0.5.2 - Partida 2D jogável: vertical slice

Status: **COMPLETE**

Branch: `feat/v0.5.2-playable-match`

Checkpoint completo validado: `a2756444`  
Workflow: `37516851694`

## Objetivo

Entregar a primeira partida realmente jogável do Legado FC, usando o Match Core criado na 0.5.0 e entrando nela a partir da carreira construída na 0.5.1.

## Direção de gameplay

Campo 2D superior com leitura rápida e controles arcade. O usuário controla somente o atleta da carreira; companheiros e adversários são controlados pela IA.

O modo rápido legado foi preservado como fallback e pode ser acessado diretamente da nova tela de partida.

## Tarefas

- [x] Criar campo 2D.
- [x] Criar bola com posição, velocidade e desaceleração.
- [x] Criar 22 entidades de jogador.
- [x] Criar jogador controlável.
- [x] Criar movimentação em oito ou mais direções.
- [x] Criar aceleração e desaceleração.
- [x] Criar sprint.
- [x] Ligar sprint à stamina.
- [x] Criar passe curto.
- [x] Criar passe forte/profundidade.
- [x] Criar chute.
- [x] Criar domínio/primeiro toque.
- [x] Criar desarme.
- [x] Criar disputa de bola.
- [x] Criar recepção de passe.
- [x] Criar posse.
- [x] Criar câmera que acompanha o atleta controlado.
- [x] Criar placar e cronômetro.
- [x] Criar pausa e retomada.
- [x] Criar intervalo e início do segundo tempo.
- [x] Criar reinício após gol.
- [x] Criar lateral.
- [x] Criar tiro de meta.
- [x] Criar escanteio 2D temporário antes da versão 3D.
- [x] Criar falta 2D temporária antes da versão 3D.
- [x] Criar controles para teclado.
- [x] Criar controles por toque.
- [x] Preparar e integrar gamepad.
- [x] Criar modo de teste headless sem interface da carreira.
- [x] Integrar resultado jogável à tela de resultado e progressão da carreira.
- [x] Preservar modo rápido legado como fallback.
- [x] Criar testes reais de navegador para desktop e mobile.

## Controles

### Teclado

- WASD / setas: movimentação;
- Shift: sprint;
- J: passe curto;
- K: profundidade;
- L: chute;
- Espaço: desarme;
- Esc: pausa/retomada.

### Toque

- direcional virtual;
- sprint;
- passe;
- profundidade;
- chute;
- bote/desarme.

### Gamepad

- analógico esquerdo: movimentação;
- A: passe;
- B: chute;
- X: bote;
- Y: profundidade;
- LB/RB: sprint.

## Critérios de aceite

- [x] É possível iniciar e terminar uma partida de 90 minutos.
- [x] O jogador consegue andar, correr, passar, chutar e desarmar.
- [x] A bola é validada continuamente contra NaN/Infinity.
- [x] Jogadores permanecem dentro dos limites do campo.
- [x] Gol só é validado depois que a bola cruza completamente a linha.
- [x] O relógio não trava após pausa, intervalo ou troca de estado.
- [x] Dez partidas completas consecutivas terminam sem soft lock.
- [x] Teclado consegue concluir uma partida real no navegador.
- [x] Toque consegue concluir uma partida real no navegador.
- [x] A partida pode ser simulada headless para testes.
- [x] O modo rápido 0.4.x continua acessível.
- [x] A carreira recebe o resultado da partida 2D sem novo schema persistente.

## Validação

`verify:playable-match` cobre:

- movimento;
- aceleração;
- sprint/stamina;
- posse e primeiro toque;
- passe e profundidade;
- chute e gol;
- desarme e falta;
- lateral;
- tiro de meta;
- escanteio;
- teclado;
- touch;
- gamepad;
- 10 partidas completas headless.

O workflow `37516851694` também executou Chromium real:

- teclado: mover, sprintar, pausar, retomar e concluir partida — PASS;
- touch: mover, usar ações e concluir partida — PASS;
- modo rápido legado disponível — PASS.

## Arquitetura

A gameplay jogável permanece concentrada em:

- `app/match-core/*`;
- `app/playable-match-canvas.tsx`;
- `app/playable-match-screen.tsx`;
- `app/gameplay-integration.ts`.

O monólito de carreira continua sendo reduzido por integração, não por reescrita destrutiva.

## Próximo marco

`0.5.3` deve aprofundar a qualidade do futebol em campo: IA posicional, goleiros, colisões/disputas mais ricas, animação visual, leitura de passe/chute e polimento do ritmo antes das bolas paradas 3D.

---

# 0.5.3 - Futebol, controles e criação de atleta

Status: **EM DESENVOLVIMENTO**

Branch: `feat/v0.5.3-gameplay-ux-overhaul`

## Objetivo

Transformar o vertical slice 0.5.2 em uma experiência de jogo realmente confortável e configurável, ao mesmo tempo em que aprofundamos IA/tática/regras e corrigimos os principais problemas reais encontrados no GitHub Pages.

A 0.5.3 passa a ter quatro frentes obrigatórias:

1. **futebol em campo**;
2. **controles e ritmo da partida**;
3. **dificuldade e configurações**;
4. **criação de atleta e HUD de países**.

## A. IA, tática e regras em campo

- [ ] Criar posicionamento por formação.
- [ ] Criar comportamento com posse.
- [ ] Criar comportamento sem posse.
- [ ] Criar apoio ao portador da bola.
- [ ] Criar linhas de passe.
- [ ] Criar corrida em profundidade.
- [ ] Criar recomposição.
- [ ] Criar pressão.
- [ ] Criar marcação.
- [ ] Criar cobertura.
- [ ] Criar comportamento específico do goleiro.
- [ ] Melhorar seleção de passe da IA.
- [ ] Melhorar seleção de chute da IA.
- [ ] Integrar os 12 estilos táticos existentes.
- [ ] Integrar postura do adversário.
- [ ] Integrar rivalidade.
- [ ] Integrar adaptação ao histórico.
- [ ] Implementar impedimento baseado na posição real do campo.
- [ ] Melhorar faltas baseadas em disputas reais.
- [ ] Implementar cartões.
- [ ] Implementar lesões.
- [ ] Implementar substituições.
- [ ] Implementar vantagem.
- [ ] Implementar acréscimos.
- [ ] Integrar stamina e fadiga de forma mais forte.
- [ ] Fazer atributos do atleta alterarem controle, passe, chute, sprint e desarme.

## B. Controles mobile e qualidade de controle

- [ ] Substituir o D-pad mobile por joystick analógico virtual.
- [ ] Permitir intensidade/direção contínua de movimento pelo touch.
- [ ] Criar zona morta e normalização do joystick.
- [ ] Reposicionar botões de ação para ergonomia de polegar.
- [ ] Aumentar áreas de toque sem aumentar visualmente todos os botões.
- [ ] Impedir perda de input ao arrastar o dedo para fora do botão.
- [ ] Permitir sprint por botão segurado.
- [ ] Melhorar feedback visual de botão pressionado.
- [ ] Impedir seleção de texto/scroll/zoom acidental durante partida.
- [ ] Criar opção de tamanho dos controles mobile.
- [ ] Criar opção de opacidade dos controles mobile.
- [ ] Criar opção de inverter lado do joystick/botões.
- [ ] Preservar teclado e gamepad.
- [ ] Validar controles reais em viewport mobile.

## C. Tempo, dificuldade e configuração da partida

- [ ] Corrigir sensação/duração do relógio da partida 0.5.2.
- [ ] Separar tempo visual da partida de velocidade interna de simulação.
- [ ] Criar opções de duração de partida.
- [ ] Permitir partidas curtas, médias e longas.
- [ ] Exibir duração escolhida nas configurações.
- [ ] Fazer a duração escolhida valer na partida 2D.
- [ ] Manter os dois tempos e intervalo corretos em qualquer duração.
- [ ] Criar níveis de dificuldade reais sem manipular placar.
- [ ] Fazer dificuldade alterar reação, pressão, posicionamento, precisão e tomada de decisão da IA.
- [ ] Permitir selecionar dificuldade na criação de atleta.
- [ ] Permitir alterar dificuldade nas configurações da carreira.
- [ ] Preservar compatibilidade com saves existentes.
- [ ] Criar testes de duração e dificuldade.

## D. Criação de atleta / personagem

- [ ] Fazer grande redesign da tela de criação.
- [ ] Melhorar leitura visual e hierarquia das etapas.
- [ ] Melhorar preview do personagem.
- [ ] Redesenhar visual do personagem/rosto/corpo sem depender de assets externos.
- [ ] Melhorar representação de cabelo.
- [ ] Melhorar tons de pele.
- [ ] Adicionar opções visuais suficientes para personagens mais distintos.
- [ ] Melhorar camisa, número e leitura do clube.
- [ ] Mostrar atributos iniciais de forma visual.
- [ ] Mostrar efeito do arquétipo antes de criar.
- [ ] Mostrar efeito da dificuldade antes de criar.
- [ ] Melhorar seleção de posição e pé dominante.
- [ ] Melhorar fluxo de escolha de país/divisão/origem.
- [ ] Garantir que todos os 12 países fiquem acessíveis.
- [ ] Corrigir os dois países que hoje ultrapassam o limite inferior da HUD.
- [ ] Garantir scroll interno claro quando necessário.
- [ ] Garantir que o botão de criar carreira nunca fique inacessível.
- [ ] Validar criação em 360x800, 390x844, tablet e desktop.
- [ ] Validar criação em orientação landscape mobile.

## E. Qualidade e regressão

- [ ] Preservar Career Hub 0.5.1.
- [ ] Preservar Match Core 0.5.0.
- [ ] Preservar modo rápido legado.
- [ ] Preservar saves existentes.
- [ ] Criar gate `verify:0.5.3`.
- [ ] Criar browser tests específicos para controles mobile.
- [ ] Criar browser tests específicos para creator/12 países.
- [ ] Criar browser tests de tempo/dificuldade.
- [ ] Rodar 100 partidas IA x IA sem soft lock.
- [ ] Validar distribuição de gols e resultados dentro de faixas configuradas.
- [ ] Manter 5.000 partidas legadas e 25 temporadas verdes.

## Critérios de aceite

- [ ] Joystick mobile permite movimento analógico contínuo e confortável.
- [ ] Touch não perde movimento por pointer capture/arrasto.
- [ ] Usuário escolhe duração da partida e o relógio respeita essa escolha.
- [ ] Usuário escolhe dificuldade e a diferença aparece no comportamento, não no placar forçado.
- [ ] Todos os 12 países são acessíveis e visíveis na criação.
- [ ] Nenhum país fica escondido atrás do limite inferior da tela.
- [ ] Criador não apresenta overflow horizontal em 360 px.
- [ ] Botão final de criação permanece alcançável por scroll em todos os viewports testados.
- [ ] A IA consegue marcar gols sem scripts de placar.
- [ ] A IA consegue defender sem teleportes.
- [ ] Impedimentos dependem da posição real.
- [ ] Cartões/faltas derivam de eventos reais.
- [ ] Stamina altera velocidade e recuperação.
- [ ] Atributos alteram eficácia das ações.
- [ ] Cem partidas IA x IA terminam sem travamento.
- [ ] Não existe manipulação invisível que force vitória ou derrota.

---

# 0.5.4 - Visual retrô original e apresentação da partida

Status: **PLANEJADO**

## Objetivo

Fazer a partida possuir identidade visual própria e leitura comparável a um bom jogo arcade de futebol.

## Tarefas

- [ ] Criar linguagem de sprites original.
- [ ] Criar proporções próprias dos jogadores.
- [ ] Criar animação de corrida.
- [ ] Criar animação de passe.
- [ ] Criar animação de chute.
- [ ] Criar animação de carrinho/desarme.
- [ ] Criar animação de goleiro.
- [ ] Criar animação de comemoração.
- [ ] Criar variações de uniforme.
- [ ] Criar gramado e marcações.
- [ ] Criar sombra simples.
- [ ] Criar torcida/arquibancada estilizada.
- [ ] Criar efeitos de gol.
- [ ] Criar replay curto.
- [ ] Criar HUD final.
- [ ] Criar indicadores de jogador, stamina e posse.
- [ ] Criar opções de câmera.
- [ ] Criar feedback visual de passe e chute sem poluir a tela.
- [ ] Garantir legibilidade em telas pequenas.

## Critérios de aceite

- [ ] O jogador identifica rapidamente o próprio atleta.
- [ ] Bola e linhas do campo permanecem legíveis em mobile.
- [ ] Animações não alteram a lógica da simulação.
- [ ] HUD não cobre áreas críticas da jogada.
- [ ] Sprites e UI são originais.
- [ ] A partida continua funcional com efeitos visuais desativados.
- [ ] O renderer pode reduzir qualidade sem alterar o resultado da simulação.

---

# 0.5.5 - Faltas e escanteios em 3D

Status: **PLANEJADO**

## Objetivo

Criar momentos especiais em 3D para bolas paradas, preservando o restante da partida em 2D.

## Escopo obrigatório

- faltas diretas;
- faltas levantadas;
- escanteios.

Pênaltis podem ser migrados para a mesma tecnologia depois que faltas e escanteios estiverem estáveis.

## Tarefas

- [ ] Criar cena 3D independente da interface React.
- [ ] Criar campo/área 3D simplificada.
- [ ] Criar câmera específica para falta.
- [ ] Criar câmera específica para escanteio.
- [ ] Criar goleiro 3D.
- [ ] Criar barreira.
- [ ] Criar jogadores na área.
- [ ] Criar trajetória da bola.
- [ ] Criar potência.
- [ ] Criar altura.
- [ ] Criar efeito/curva.
- [ ] Criar gesto de arrastar no touch.
- [ ] Criar equivalente por mouse.
- [ ] Criar equivalente por controle.
- [ ] Transformar atributos do jogador em precisão, curva e potência.
- [ ] Integrar posicionamento da cobrança com o estado da partida 2D.
- [ ] Retornar o resultado da cobrança ao motor 2D.
- [ ] Preservar minuto, placar, cartões, stamina, lesões e posse.
- [ ] Criar fallback 2D quando WebGL não estiver disponível.
- [ ] Evitar carregamento pesado a cada cobrança.

## Critérios de aceite

- [ ] Transição 2D -> 3D -> 2D não reinicia a partida.
- [ ] O placar permanece consistente.
- [ ] O relógio permanece consistente.
- [ ] Jogadores e cartões permanecem consistentes.
- [ ] A posição da falta corresponde ao local da infração.
- [ ] Escanteio respeita o lado correto do campo.
- [ ] Curva, altura e potência alteram a trajetória.
- [ ] Goleiro reage à trajetória, não a um resultado pré-definido.
- [ ] Fallback 2D permite concluir a partida.
- [ ] Nenhum asset ou interface é copiado de Score! Hero ou outro jogo.

---

# 0.5.6 - Integração total com a carreira

Status: **PLANEJADO**

## Objetivo

Fazer tudo o que ocorre no campo jogável alimentar os sistemas já existentes da carreira.

## Tarefas

- [ ] Gerar nota a partir de ações reais.
- [ ] Gerar gols reais.
- [ ] Gerar assistências reais.
- [ ] Gerar chutes e chutes no alvo reais.
- [ ] Calcular xG a partir da posição e contexto do chute.
- [ ] Registrar passes tentados e certos.
- [ ] Registrar desarmes.
- [ ] Registrar interceptações.
- [ ] Registrar perdas de posse.
- [ ] Registrar faltas sofridas e cometidas.
- [ ] Registrar cartões.
- [ ] Registrar minutos jogados.
- [ ] Registrar distância percorrida.
- [ ] Integrar lesões reais.
- [ ] Integrar suspensão.
- [ ] Integrar confiança do treinador.
- [ ] Integrar relação com elenco.
- [ ] Integrar reputação.
- [ ] Integrar personalidade.
- [ ] Integrar consequências.
- [ ] Integrar objetivos de partida.
- [ ] Integrar mercado.
- [ ] Integrar recordes.
- [ ] Substituir estatísticas inventadas da partida do jogador por estatísticas observadas.
- [ ] Manter geração procedural para partidas não jogadas pelo usuário.

## Critérios de aceite

- [ ] O relatório pós-jogo reproduz os eventos da partida jogada.
- [ ] Gols e assistências não são gerados duas vezes.
- [ ] Consequências recebem dados do que realmente ocorreu.
- [ ] Suspensão afasta o jogador da partida.
- [ ] Lesão pode retirar o jogador da partida e persistir na carreira.
- [ ] Transferências continuam funcionando.
- [ ] Avanço de rodada continua funcionando.
- [ ] Avanço de temporada continua funcionando.
- [ ] Saves `0.4.3` continuam migrando.
- [ ] Simulações do resto do mundo continuam independentes do renderer.

---

# 0.5.7 - Polimento, dificuldade, desempenho e fechamento

Status: **PLANEJADO**

## Objetivo

Fechar a série `0.5.x` como uma versão jogável, estável e testável do novo Legado FC.

## Tarefas

- [ ] Criar tutorial.
- [ ] Criar treino de controles.
- [ ] Criar níveis de dificuldade.
- [ ] Criar remapeamento de teclado.
- [ ] Finalizar gamepad.
- [ ] Finalizar controles mobile.
- [ ] Criar configurações de qualidade.
- [ ] Criar volume separado para música, torcida e efeitos.
- [ ] Criar feedback sonoro original/licenciado.
- [ ] Criar acessibilidade de contraste.
- [ ] Criar opção de reduzir movimento.
- [ ] Criar opção de vibração/haptics quando disponível.
- [ ] Otimizar carregamento.
- [ ] Otimizar renderização 2D.
- [ ] Otimizar cenas 3D.
- [ ] Garantir recuperação segura ao sair da aba.
- [ ] Garantir pausa ao perder foco quando apropriado.
- [ ] Testar PWA instalada.
- [ ] Criar release notes completas.
- [ ] Atualizar README.
- [ ] Registrar limitações conhecidas.

## Critérios de aceite

- [ ] Uma temporada completa pode ser jogada sem corrupção de save.
- [ ] Cem partidas completas automatizadas terminam sem erro fatal.
- [ ] Dez partidas manuais consecutivas terminam sem soft lock.
- [ ] Mobile de referência mantém experiência jogável.
- [ ] Desktop de referência mantém alvo de 60 FPS no 2D.
- [ ] Mobile pode reduzir qualidade mantendo alvo mínimo aceitável.
- [ ] Cena 3D possui fallback.
- [ ] Importação/exportação continua funcionando.
- [ ] PWA continua instalável.
- [ ] Build de GitHub Pages continua funcional.
- [ ] Toda dependência nova possui licença revisada.
- [ ] Nenhum asset de referência foi incorporado ao projeto.

---

# Novas suítes de validação da 0.5

## verify:match-core

Deve rodar o motor sem renderer e validar:

- [ ] relógio;
- [ ] bola dentro de estados válidos;
- [ ] posições finitas;
- [ ] gol;
- [ ] reinício;
- [ ] lateral;
- [ ] tiro de meta;
- [ ] escanteio;
- [ ] falta;
- [ ] impedimento;
- [ ] cartões;
- [ ] substituições;
- [ ] lesões;
- [ ] fim de primeiro tempo;
- [ ] fim de jogo;
- [ ] prorrogação somente quando aplicável;
- [ ] disputa de pênaltis somente quando aplicável.

## verify:match-balance

Deve executar grande quantidade de partidas IA x IA e verificar:

- [ ] média de gols;
- [ ] taxa de empates;
- [ ] goleadas;
- [ ] chutes;
- [ ] xG;
- [ ] posse;
- [ ] faltas;
- [ ] cartões;
- [ ] lesões;
- [ ] stamina;
- [ ] diferença entre estilos táticos;
- [ ] diferença entre atributos;
- [ ] ausência de estratégia dominante absoluta.

## verify:match-integration

Deve verificar:

- [ ] carreira -> partida;
- [ ] partida -> relatório;
- [ ] relatório -> carreira;
- [ ] rodada;
- [ ] tabela;
- [ ] suspensão;
- [ ] lesão;
- [ ] consequências;
- [ ] mercado;
- [ ] save;
- [ ] reload;
- [ ] continuação da temporada.

## verify:set-pieces-3d

Deve verificar sem depender da apresentação visual final:

- [ ] origem correta da cobrança;
- [ ] trajetória finita;
- [ ] potência;
- [ ] curva;
- [ ] altura;
- [ ] colisão;
- [ ] defesa;
- [ ] gol;
- [ ] rebote;
- [ ] saída;
- [ ] retorno consistente ao motor 2D.

## verify:saves

Deve manter fixtures de saves de versões anteriores e confirmar:

- [ ] migração;
- [ ] nenhuma perda de campos essenciais;
- [ ] nenhuma duplicação de histórico;
- [ ] nenhuma duplicação de jogador;
- [ ] nenhum reset silencioso de carreira.

## browser-smoke

Adicionar testes de navegador para:

- [ ] criar carreira;
- [ ] abrir save;
- [ ] entrar na home;
- [ ] iniciar partida;
- [ ] pausar;
- [ ] terminar partida;
- [ ] salvar;
- [ ] recarregar;
- [ ] continuar carreira.

---

# Gate obrigatório do CI da 0.5

Toda PR/release da série `0.5.x` deve passar por:

- [ ] instalação com lockfile congelado;
- [ ] lint;
- [ ] typecheck;
- [ ] build de produção;
- [ ] build GitHub Pages;
- [ ] testes de renderização;
- [ ] `verify:variation`;
- [ ] `verify:world`;
- [ ] `verify:match-core`;
- [ ] `verify:match-balance`;
- [ ] `verify:match-integration`;
- [ ] `verify:saves`;
- [ ] browser smoke;
- [ ] validação de licenças/dependências.

Testes 3D entram no gate assim que a `0.5.5` começar.

---

# Fora do escopo inicial da 0.5

Para evitar que o marco se torne infinito, ficam fora do primeiro fechamento:

- multiplayer online;
- Ultimate Team/gacha;
- controle completo de todos os jogadores do time como modo principal;
- licenças oficiais de clubes e atletas;
- gráficos 3D para a partida inteira;
- narração por voz;
- editor público de mods;
- pós-carreira completo como treinador/empresário.

Esses itens podem ser reavaliados depois que a partida principal estiver sólida.

---

# Horizonte após a 0.5

## 0.6.x - Carreira esportiva expandida

Direção inicial:

- seleções nacionais;
- convocações;
- competições internacionais;
- objetivos de treinador;
- funções táticas por posição;
- evolução de carreira por desempenho realmente jogado;
- maior profundidade de imprensa e rivalidades.

A definição detalhada só deve ser fechada após a `0.5.x` ser considerada estável.

## 0.7.x - Legado e pós-carreira

Direção já preparada pela estrutura atual:

- aposentadoria do jogador;
- fechamento formal da carreira;
- pontuação/legado histórico;
- carreira de treinador;
- carreira de empresário/agente;
- continuidade do mundo após aposentadoria.

## 0.8.x - Conteúdo e apresentação

Direção inicial:

- mais eventos;
- mais contextos de vida;
- maior variedade visual;
- áudio;
- estádios;
- clima;
- recordes e conquistas;
- polimento de UX.

## 0.9.x - Release candidate

Objetivo:

- congelamento de features;
- correção de bugs;
- balanceamento;
- desempenho;
- acessibilidade;
- compatibilidade;
- estabilidade de save;
- preparação para `1.0.0`.

## 1.0.0 - Legado FC

Primeira versão considerada produto completo.

O critério não será quantidade de sistemas, e sim:

- carreira completa;
- partida divertida;
- mundo persistente;
- progressão compreensível;
- estabilidade;
- bom desempenho;
- saves confiáveis;
- identidade visual própria;
- ausência de bloqueadores conhecidos.
