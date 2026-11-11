import {
  DIFFICULTIES,
  PATTERNS,
  PATTERNS_BY_ID,
  PROBLEMS,
  leetcodeUrl,
  type Difficulty,
  type Problem,
} from '@algoky/shared';
import { clsx } from 'clsx';
import { ExternalLink, Search, SearchX } from 'lucide-react';
import { useMemo } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router';
import { PublicLayout } from '../components/PublicLayout.tsx';
import { DifficultyBadge } from '../components/ui/Badge.tsx';
import { EmptyState } from '../components/ui/Feedback.tsx';
import { Input, Select } from '../components/ui/Field.tsx';
import { DIFFICULTY_LABEL } from '../lib/format.ts';
import {
  filterProblems,
  filtersFromParams,
  filtersToParams,
  type ProblemFilters,
} from '../lib/filterProblems.ts';
import { useMe } from '../lib/queries.ts';

const DIFF_ACTIVE: Record<Difficulty, string> = {
  easy: 'border-easy/50 bg-easy/12 text-easy-text',
  medium: 'border-medium/50 bg-medium/14 text-medium-text',
  hard: 'border-hard/50 bg-hard/12 text-hard-text',
};

function groupByPattern(problems: Problem[]): Array<[string, Problem[]]> {
  const groups = new Map<string, Problem[]>();
  for (const p of problems) groups.set(p.pattern, [...(groups.get(p.pattern) ?? []), p]);
  return [...groups];
}

/** Catálogo público: sem progresso, cada problema leva ao LeetCode e cada grupo ao seu padrão. */
export default function PublicProblemsPage() {
  const { data: me } = useMe();
  const [params, setParams] = useSearchParams();
  const filters = filtersFromParams(params);
  const set = (patch: Partial<ProblemFilters>) =>
    setParams(filtersToParams({ ...filters, ...patch }), { replace: true });
  const results = useMemo(
    () => filterProblems(PROBLEMS, undefined, { ...filters, status: '', starred: false }),
    [filters],
  );

  // Quem tem conta usa o catálogo com progresso dentro do app.
  if (me) return <Navigate to={`/app/problemas${params.size ? `?${params}` : ''}`} replace />;

  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Problemas</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          {PROBLEMS.length} problemas gratuitos do LeetCode, organizados por padrão. Os{' '}
          {PROBLEMS.filter((p) => p.essential).length} essenciais formam o núcleo mínimo de cada um.{' '}
          <Link
            to="/cadastro"
            className="font-medium text-text underline decoration-border-strong underline-offset-4 hover:decoration-accent"
          >
            Crie uma conta
          </Link>{' '}
          para marcar o que resolveu.
        </p>

        <div className="mt-10 grid gap-2 sm:grid-cols-[1fr_minmax(0,220px)]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <Input
              type="search"
              placeholder="Buscar por título ou número"
              value={filters.q}
              onChange={(e) => set({ q: e.target.value })}
              className="pl-9"
              aria-label="Buscar problemas"
            />
          </div>
          <Select
            value={filters.pattern}
            onChange={(e) => set({ pattern: e.target.value })}
            aria-label="Padrão"
          >
            <option value="">Todos os padrões</option>
            {PATTERNS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.order}. {p.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {DIFFICULTIES.map((d) => {
            const active = filters.difficulties.includes(d);
            return (
              <button
                key={d}
                aria-pressed={active}
                onClick={() =>
                  set({
                    difficulties: active
                      ? filters.difficulties.filter((x) => x !== d)
                      : [...filters.difficulties, d],
                  })
                }
                className={clsx(
                  'h-9 rounded-lg border px-3 text-sm font-medium',
                  active ? DIFF_ACTIVE[d] : 'border-border bg-surface text-muted hover:text-text',
                )}
              >
                {DIFFICULTY_LABEL[d]}
              </button>
            );
          })}
          <button
            aria-pressed={filters.essential}
            onClick={() => set({ essential: !filters.essential })}
            className={clsx(
              'h-9 rounded-lg border px-3 text-sm font-medium',
              filters.essential
                ? 'border-accent/50 bg-accent-soft text-text'
                : 'border-border bg-surface text-muted hover:text-text',
            )}
          >
            Só essenciais
          </button>
        </div>

        <p className="mb-6 mt-6 text-sm text-muted" aria-live="polite">
          {results.length === PROBLEMS.length
            ? `${results.length} problemas`
            : `${results.length} de ${PROBLEMS.length} problemas`}
        </p>

        {results.length === 0 ? (
          <EmptyState
            icon={<SearchX className="h-5 w-5" />}
            title="Nenhum problema encontrado"
            description="Tente remover algum filtro."
          />
        ) : (
          <div className="space-y-10">
            {groupByPattern(results).map(([patternId, items]) => {
              const pattern = PATTERNS_BY_ID.get(patternId)!;
              return (
                <section key={patternId}>
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <h2 className="text-sm font-semibold">
                      <span className="mr-2 font-mono text-xs text-subtle">
                        {String(pattern.order).padStart(2, '0')}
                      </span>
                      {pattern.name}
                    </h2>
                    <Link
                      to={`/padroes/${patternId}`}
                      className="shrink-0 text-xs font-medium text-muted hover:text-text"
                    >
                      Estudar o padrão →
                    </Link>
                  </div>
                  <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
                    {items.map((p) => (
                      <li key={p.slug}>
                        <a
                          href={leetcodeUrl(p.slug)}
                          target="_blank"
                          rel="noreferrer"
                          className="group flex items-center gap-3 px-4 py-3 hover:bg-surface-2"
                        >
                          <span className="w-10 shrink-0 font-mono text-xs text-subtle">
                            {p.id}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium group-hover:text-accent">
                            {p.title}
                            {p.essential && (
                              <span className="ml-2 align-middle text-[10px] font-semibold uppercase tracking-wide text-accent">
                                essencial
                              </span>
                            )}
                          </span>
                          <DifficultyBadge difficulty={p.difficulty} />
                          <ExternalLink className="h-4 w-4 shrink-0 text-subtle" aria-hidden />
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
