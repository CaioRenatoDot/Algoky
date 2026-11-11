# Contribuindo

## Ambiente

```bash
nvm use            # Node 24 (veja .nvmrc)
npm install
npm run seed -w @algoky/api
npm run dev
```

## Fluxo de trabalho

1. Crie uma branch a partir da `main`: `feat/...`, `fix/...`, `docs/...`, `chore/...`
2. Faça commits pequenos e focados, em português, seguindo o [Conventional Commits](https://www.conventionalcommits.org/pt-br/):
   - `feat(web): ...`, `fix(api): ...`, `feat(content): ...`, `test(shared): ...`, `docs: ...`, `chore: ...`, `ci: ...`
   - corpo explicando o **porquê** quando não for óbvio
3. Antes de abrir o PR, rode as mesmas checagens do CI:

   ```bash
   npm run format:check && npm run lint && npm run typecheck && npm test && npm run build
   ```

4. Abra o PR descrevendo contexto, o que muda e como foi verificado. O CI precisa estar verde para o merge.

## Onde mexer

| Quero...                             | Arquivo                                                                                             |
| ------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Adicionar ou corrigir um problema    | `packages/shared/src/content/problems.ts`                                                           |
| Escrever ou editar um padrão         | `packages/shared/src/content/patterns/<id>.ts` e registrar em `patterns/index.ts`                   |
| Mudar regras de XP, níveis ou streak | `packages/shared/src/gamification.ts`                                                               |
| Ajustar a revisão espaçada           | `packages/shared/src/srs.ts`                                                                        |
| Criar uma conquista                  | `packages/shared/src/achievements.ts` (e um ícone em `apps/web/src/components/AchievementIcon.tsx`) |
| Mudar um contrato da API             | `packages/shared/src/api.ts`: os dois lados vão acusar o que precisa mudar                          |
| Alterar o banco                      | nova entrada **no fim** de `apps/api/src/db/migrations.ts`                                          |
| Criar um visualizador                | `apps/web/src/components/visualizer/steps.ts` (gerador puro e teste) e o `Visualizer.tsx`           |

### Adicionando um problema

Cada linha é `[número, slug, título, dificuldade, essencial?]`:

```ts
[1, 'two-sum', 'Two Sum', 'E', 1],
```

- use apenas problemas **gratuitos**
- o slug é o da URL `leetcode.com/problems/<slug>/`
- `npm test -w @algoky/shared` valida unicidade, formato e vínculo com o padrão

### Adicionando um padrão

O padrão precisa de descrição, sinais, armadilhas, complexidade, pré-requisitos (que venham **antes** na trilha) e templates nas três linguagens. Ajuste o campo `order` dos padrões seguintes: o teste exige ordem contínua.

## Estilo de código

- TypeScript estrito; sem `any`
- regras de negócio em funções puras e testáveis (passe `now` em vez de ler o relógio)
- textos da interface em português, com acentuação correta
- componentes acessíveis: rótulos ARIA, foco visível, navegação por teclado
- cores apenas pelos tokens de `styles.css`, nunca hexadecimais soltos nos componentes
