# Arquitetura

Este documento explica como o Algoky é organizado e por que as principais decisões foram tomadas.

## Visão geral

```
┌──────────────────────────── navegador ────────────────────────────┐
│  React SPA (apps/web)                                             │
│  TanStack Query ── fetch /api/* (cookie de sessão httpOnly)       │
└───────────────────────────────┬───────────────────────────────────┘
                                │ HTTP (JSON)
┌───────────────────────────────▼───────────────────────────────────┐
│  Fastify (apps/api)                                               │
│  helmet · compress · rate-limit · cookie · static (SPA)           │
│  rotas ──► serviços ──► node:sqlite (WAL)                         │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                        /data/algoky.db
```

Em produção, **um único processo** serve a API e os arquivos estáticos do frontend. Não existe CDN nem serviço externo: a instância é autocontida e roda num container pequeno.

## Monorepo

| Pacote            | Papel                                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/shared` | Fonte única da verdade: tipos, regras de domínio (XP, níveis, streak, revisão espaçada, conquistas, trilha), conteúdo (padrões e problemas) e contratos HTTP |
| `apps/api`        | Persistência e aplicação das regras: autenticação, progresso, revisões, foco, dashboard                                                                      |
| `apps/web`        | Interface                                                                                                                                                    |

O `@algoky/shared` é consumido **como código-fonte TypeScript**: o Vite o compila no front, e o tsup o embute no bundle da API. Não há etapa de build separada nem pacote publicado. Por isso uma mudança em um contrato (`api.ts`) quebra a compilação dos dois lados ao mesmo tempo.

O conteúdo vive no código (e não no banco) porque é curado e versionado: adicionar um problema é um PR revisável, testado pelos testes de integridade do conteúdo.

## Backend

### Camadas

- **`routes/`**: HTTP. Valida a entrada com zod, resolve o usuário da sessão e chama os serviços.
- **`services/`**: regras e acesso a dados. São funções puras sobre `(db, user, input, now)`, o que permite testar datas e streaks passando `now` explicitamente, sem mocks de relógio.
- **`db/`**: abertura do SQLite e migrações.

### Banco de dados

SQLite via `node:sqlite` (nativo do Node 22.13+). Não há dependência nativa para compilar, o que simplifica a imagem Docker. Configuração: `journal_mode=WAL`, `synchronous=NORMAL`, `foreign_keys=ON`.

As migrações são versionadas por `PRAGMA user_version` em `db/migrations.ts`. Cada migração roda numa transação; nunca edite uma migração publicada, adicione uma nova no fim do array.

```
users          id, username (único, sem caixa), display_name, password_hash,
               timezone, daily_goal, preferred_language, leetcode_username
sessions       token_hash (PK), user_id, expires_at, created_at
user_problems  (user_id, slug) PK, status, notes, confidence, starred,
               first_solved_at, updated_at
review_cards   (user_id, slug) PK, ease, interval_days, repetitions,
               due_date, last_reviewed_at
activity       id, user_id, type (solve|attempt|review|focus), slug, xp,
               minutes, detail, local_date, created_at
achievements   (user_id, code) PK, unlocked_at
```

A tabela `activity` é um **log de eventos**: XP total, streak, heatmap, meta diária e atividade recente são todos derivados dela. Isso mantém uma única fonte de verdade e evita contadores que divergem.

### Datas e fuso horário

Cada usuário tem um fuso (detectado no cadastro, editável). Toda atividade grava a `local_date` (`YYYY-MM-DD`) no fuso do usuário no momento do evento. Streak, meta do dia e vencimento de revisões comparam datas locais, então "hoje" significa o seu hoje, e não o do servidor.

## Regras de domínio

Todas em `packages/shared/src`, com testes.

### XP e níveis

| Evento                                      | XP                                           |
| ------------------------------------------- | -------------------------------------------- |
| Primeira solução de um Easy / Medium / Hard | 10 / 20 / 40                                 |
| Revisão vencida                             | 5                                            |
| Foco                                        | 1 a cada 5 minutos (máx. 180 min por sessão) |

O XP de solução só vale uma vez por problema: desmarcar e marcar de novo não gera XP. Revisões antecipadas atualizam o cartão, mas não dão XP.

Nível `n` exige `100 · (n−1) · n / 2` XP acumulado (100, 300, 600, 1000…), com títulos de Iniciante a Lenda.

### Streak

Dias consecutivos com qualquer atividade. A sequência atual **continua viva até o fim do dia seguinte** à última atividade, então você não "perde" o streak de manhã antes de estudar.

### Revisão espaçada

SM-2 simplificado, em `srs.ts`:

- ao resolver, a primeira revisão é agendada conforme a confiança informada (1 a 7 dias)
- **again**: volta amanhã e reduz a facilidade
- **hard**: intervalo × 1,2 e reduz a facilidade
- **good**: 3 dias na primeira vez; depois, intervalo × facilidade
- **easy**: como good, × 1,3, e aumenta a facilidade
- facilidade entre 1,3 e 3,0; intervalo máximo de 180 dias

### Sugestão do próximo problema

`suggestNextProblem` primeiro retoma problemas **tentados e não resolvidos**. Depois segue a ordem da trilha: padrão, essenciais primeiro, dificuldade crescente.

### Conquistas

São avaliadas depois de cada mutação, a partir de estatísticas agregadas. As novas são persistidas com data e devolvidas na resposta, para a interface comemorar. Conquistas nunca são revogadas.

## Frontend

- **Roteamento** (`router.tsx`): cada tela é um chunk carregado sob demanda. As rotas `/app/*` passam por `RequireAuth`.
- **Dados**: TanStack Query. Toda mutação de estudo devolve `{ data, xpGained, newAchievements, level, streak }`. O cliente atualiza o cache do progresso na hora, invalida dashboard e revisões e chama `celebrate()` (toast de XP, nível e conquista, e confete sob demanda).
- **Estado local relevante**: o timer de foco (`lib/focusTimer.ts`) é um store externo persistido no `localStorage` (via `useSyncExternalStore`). Ele sobrevive a navegação e reload, sincroniza entre abas, e a conclusão é "reivindicada" por uma única aba.
- **Design system**: tokens em CSS variables (`styles.css`) com temas claro e escuro próprios, expostos ao Tailwind v4 via `@theme inline`. As cores de dificuldade e a escala do heatmap foram validadas para contraste e daltonismo.

## Segurança

| Tema           | Decisão                                                                                                                                         |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Senhas         | scrypt (N=2¹⁵, r=8, p=1), salt aleatório, comparação em tempo constante                                                                         |
| Sessão         | token aleatório de 256 bits; só o SHA-256 vai para o banco; cookie `httpOnly`, `SameSite=Lax` e `Secure` opcional; 30 dias                      |
| Enumeração     | login gasta o mesmo tempo para usuário inexistente                                                                                              |
| Força bruta    | rate limit por IP em login e cadastro                                                                                                           |
| CSRF           | `SameSite=Lax` e corpo só em JSON: formulários cross-site recebem 415                                                                           |
| XSS            | React escapa tudo; o único HTML injetado é o do Shiki, gerado a partir do conteúdo do próprio repositório; CSP restritiva (`script-src 'self'`) |
| Validação      | zod em toda entrada, com objetos `strict()` (campos extras são rejeitados)                                                                      |
| Open redirect  | `?next=` só aceita caminhos internos                                                                                                            |
| Troca de senha | encerra as outras sessões                                                                                                                       |
| Container      | usuário não root, filesystem read-only, `no-new-privileges`                                                                                     |

## Performance

- code splitting por rota e chunks de vendor estáveis (React, Query) para melhor cache
- Shiki carregado só na página do padrão, com 3 linguagens, 2 temas e motor de regex em JS (sem WASM)
- confete e notificações carregados sob demanda
- build com **brotli e gzip pré-comprimidos**, servidos direto pelo `@fastify/static`
- `/assets/*` com `Cache-Control: public, max-age=31536000, immutable`; `index.html` com `no-cache`
- fontes auto-hospedadas com `unicode-range` (só o subset usado é baixado)
- nenhuma imagem raster na interface: logo, ícones e prévia da landing são SVG ou HTML/CSS
- consultas do dashboard são agregações indexadas sobre `activity(user_id, local_date)`

## Testes

| Pacote   | O que cobre                                                                                                                                                                                                                      |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shared` | datas e fusos, XP e níveis, streak, SRS, conquistas, trilha e integridade do conteúdo                                                                                                                                            |
| `api`    | integração via `fastify.inject` com SQLite em memória: autenticação, rate limit, isolamento entre usuários, regras de XP, revisões, streak ao longo de dias, fuso horário, export/import, SPA estático e cabeçalhos de segurança |
| `web`    | geradores de passos dos visualizadores e lógica de filtros (incluindo serialização na URL)                                                                                                                                       |

O CI também builda a imagem Docker e faz um smoke test de ponta a ponta no container (cadastro, progresso, backup e persistência após restart).
