# Referência da API

Base: `/api`. Todas as requisições e respostas são JSON. Os tipos completos estão em [`packages/shared/src/api.ts`](../packages/shared/src/api.ts).

## Convenções

- **Autenticação:** cookie `algoky_session` (httpOnly), definido no login e no cadastro. Rotas marcadas com 🔒 devolvem `401` sem sessão válida.
- **Corpo:** só `application/json` (outros tipos recebem `415`). Objetos são estritos: campos desconhecidos dão `400`.
- **Erros:** sempre no formato

  ```json
  { "error": { "code": "validation", "message": "A senha precisa ter pelo menos 8 caracteres." } }
  ```

  | Status | `code`                                        | Quando                                  |
  | ------ | --------------------------------------------- | --------------------------------------- |
  | 400    | `validation`, `bad_request`, `no_review_card` | Entrada inválida ou operação impossível |
  | 401    | `unauthorized`                                | Sem sessão ou credenciais erradas       |
  | 403    | `forbidden`                                   | Cadastro desativado                     |
  | 404    | `not_found`                                   | Rota ou problema inexistente            |
  | 409    | `username_taken`                              | Nome de usuário em uso                  |
  | 429    | `rate_limited`                                | Muitas tentativas de login/cadastro     |

- **Mutações de estudo** devolvem um envelope com o efeito na gamificação:

  ```json
  {
    "data": { "...": "o recurso atualizado" },
    "xpGained": 20,
    "newAchievements": ["first-solve"],
    "level": {
      "level": 1,
      "title": "Iniciante",
      "xp": 20,
      "currentLevelXp": 0,
      "nextLevelXp": 100,
      "progress": 0.2
    },
    "streak": { "current": 1, "longest": 1, "activeToday": true }
  }
  ```

## Saúde

### `GET /api/health`

`200 { "status": "ok" }`. Também testa o banco; é usado pelo healthcheck do Docker.

## Autenticação

### `GET /api/auth/config`

`{ "allowRegistration": true }`

### `POST /api/auth/register`

```json
{
  "username": "ana_dev",
  "password": "minha-senha-forte",
  "displayName": "Ana",
  "timezone": "America/Sao_Paulo"
}
```

- `username`: 3 a 32 caracteres `[a-z0-9_]` (normalizado para minúsculas)
- `password`: 8 a 128 caracteres
- `displayName` e `timezone` (IANA) são opcionais

`201 { "user": User }` e define o cookie de sessão. Erros: `409 username_taken` e `403` se o cadastro estiver fechado.

### `POST /api/auth/login`

`{ "username": "ana_dev", "password": "..." }` → `200 { "user": User }` e define o cookie. `401` com mensagem genérica se as credenciais estiverem erradas.

### `POST /api/auth/logout`

`204`. Remove a sessão e limpa o cookie.

### `GET /api/auth/me` 🔒

`{ "user": User }`

```json
{
  "id": 1,
  "username": "ana_dev",
  "displayName": "Ana",
  "timezone": "America/Sao_Paulo",
  "dailyGoal": 2,
  "preferredLanguage": "python",
  "leetcodeUsername": null,
  "createdAt": "2026-11-11T03:16:45.460Z"
}
```

## Estudo

### `GET /api/dashboard` 🔒

Tudo o que o painel precisa, numa chamada:

| Campo             | Conteúdo                                                                                     |
| ----------------- | -------------------------------------------------------------------------------------------- |
| `today`           | Data local do usuário                                                                        |
| `level`, `streak` | Nível/XP e sequência de dias                                                                 |
| `dailyGoal`       | `{ target, done, focusMinutes }` de hoje                                                     |
| `totals`          | Resolvidos (total e por dificuldade), tentados, revisões, minutos de foco, total do catálogo |
| `byPattern`       | Progresso por padrão, na ordem da trilha                                                     |
| `heatmap`         | `{ date, count, xp }` dos últimos 371 dias (só os dias com atividade)                        |
| `reviewsDue`      | Revisões vencidas                                                                            |
| `suggestion`      | Slug do próximo problema sugerido (ou `null`)                                                |
| `recent`          | Últimas 12 atividades                                                                        |
| `achievements`    | Todas as conquistas com `unlockedAt` (ou `null`) e progresso `current/target`                |

### `GET /api/progress` 🔒

`{ "problems": ProblemState[] }`, apenas os problemas com algum registro.

```json
{
  "slug": "two-sum",
  "status": "solved",
  "notes": "hash map valor → índice",
  "confidence": 4,
  "starred": false,
  "firstSolvedAt": "2026-11-11T03:16:45.470Z",
  "updatedAt": "2026-11-11T03:16:45.470Z",
  "review": {
    "ease": 2.5,
    "intervalDays": 4,
    "repetitions": 0,
    "dueDate": "2026-11-15",
    "lastReviewedAt": null
  }
}
```

### `GET /api/progress/:slug` 🔒

`ProblemState`, ou `404` se não houver registro.

### `PATCH /api/progress/:slug` 🔒

Atualiza qualquer combinação de campos (pelo menos um):

```json
{ "status": "solved", "notes": "...", "confidence": 4, "starred": true }
```

Efeitos:

- **→ `solved`** (primeira vez): XP conforme a dificuldade e criação do cartão de revisão (a 1ª revisão depende de `confidence`)
- **→ `attempted`**: registra uma tentativa (no máximo uma por problema por dia)
- **→ `todo`**: remove o cartão de revisão

Resposta: envelope de mutação com `data: ProblemState`. `404` para slugs fora do catálogo.

### `GET /api/reviews/due` 🔒

`{ "reviews": DueReview[] }`, ordenadas pelo vencimento:

```json
{
  "slug": "two-sum",
  "notes": "...",
  "overdueDays": 2,
  "card": {
    "ease": 2.5,
    "intervalDays": 4,
    "repetitions": 0,
    "dueDate": "2026-11-09",
    "lastReviewedAt": null
  }
}
```

### `POST /api/reviews/:slug` 🔒

`{ "rating": "again" | "hard" | "good" | "easy" }` → envelope com `data: ProblemState` (cartão reagendado). Só revisões vencidas dão XP. `400 no_review_card` se o problema não foi resolvido.

### `POST /api/focus` 🔒

`{ "minutes": 25, "slug": "two-sum" }` (`minutes` de 1 a 180; `slug` opcional) → `201` com envelope e `data: { minutes, slug, localDate }`.

## Conta

### `PATCH /api/me/settings` 🔒

Qualquer subconjunto de:

```json
{
  "displayName": "Ana",
  "timezone": "Europe/Lisbon",
  "dailyGoal": 3,
  "preferredLanguage": "typescript",
  "leetcodeUsername": "ana-lc"
}
```

`dailyGoal` vai de 1 a 20; `leetcodeUsername` aceita `null`. Resposta: `{ "user": User }`.

### `POST /api/me/password` 🔒

`{ "currentPassword": "...", "newPassword": "..." }` → `204`. Encerra as outras sessões. `401` se a senha atual estiver errada.

### `GET /api/me/export` 🔒

Download (`Content-Disposition: attachment`) do backup completo em JSON versionado (`version: 1`): configurações, problemas, cartões de revisão, atividades e conquistas.

### `POST /api/me/import` 🔒

Recebe o JSON do export (até 20 MB) e **substitui** todo o progresso do usuário numa transação. `400` se o formato for inválido.

### `DELETE /api/me` 🔒

`{ "password": "..." }` → `204`. Exclui a conta e todos os dados.
