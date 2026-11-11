import {
  DIFFICULTIES,
  PATTERNS,
  PATTERNS_BY_ID,
  PROBLEMS,
  type Difficulty,
  type Problem,
} from '@algoky/shared';
import { clsx } from 'clsx';
import { Search, SearchX, Star, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Page, PageHeader } from '../components/AppShell.tsx';
import { ProblemDrawer } from '../components/ProblemDrawer.tsx';
import { ProblemList } from '../components/ProblemList.tsx';
import { Button } from '../components/ui/Button.tsx';
import { EmptyState, ErrorState, Skeleton } from '../components/ui/Feedback.tsx';
import { Input, Select } from '../components/ui/Field.tsx';
import { DIFFICULTY_LABEL } from '../lib/format.ts';
import {
  EMPTY_FILTERS,
  filterProblems,
  filtersFromParams,
  filtersToParams,
  type ProblemFilters,
} from '../lib/filterProblems.ts';
import { useProgress } from '../lib/queries.ts';

const DIFF_ACTIVE: Record<Difficulty, string> = {
  easy: 'border-easy/50 bg-easy/12 text-easy-text',
  medium: 'border-medium/50 bg-medium/14 text-medium-text',
  hard: 'border-hard/50 bg-hard/12 text-hard-text',
};

/** Agrupa preservando a ordem (os problemas já vêm na ordem da trilha). */
function groupByPattern(problems: Problem[]): Array<[string, Problem[]]> {
  const groups = new Map<string, Problem[]>();
  for (const p of problems) groups.set(p.pattern, [...(groups.get(p.pattern) ?? []), p]);
  return [...groups];
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        'inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors',
        active
          ? 'border-accent/50 bg-accent-soft text-text'
          : 'border-border bg-surface text-muted hover:text-text',
      )}
    >
      {children}
    </button>
  );
}

export default function ProblemsPage() {
  const [params, setParams] = useSearchParams();
  const filters = filtersFromParams(params);
  const { data: progress, isPending, error, refetch } = useProgress();
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const set = (patch: Partial<ProblemFilters>) =>
    setParams(filtersToParams({ ...filters, ...patch }), { replace: true });
  const results = useMemo(() => filterProblems(PROBLEMS, progress, filters), [progress, filters]);
  const solved = useMemo(
    () => [...(progress?.values() ?? [])].filter((p) => p.status === 'solved').length,
    [progress],
  );
  const hasFilters = filtersToParams({ ...filters, sort: 'trilha' }).size > 0;

  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;

  return (
    <Page>
      <PageHeader
        eyebrow="Problemas"
        title="Catálogo de problemas"
        description={`${PROBLEMS.length} problemas gratuitos do LeetCode, organizados por padrão. Você resolveu ${solved}.`}
      />

      <div className="sticky top-[57px] z-20 -mx-4 mt-6 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-3 lg:top-0">
        <div className="grid gap-2 sm:grid-cols-[1fr_minmax(0,220px)_minmax(0,170px)]">
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
          <Select
            value={filters.status}
            onChange={(e) => set({ status: e.target.value as ProblemFilters['status'] })}
            aria-label="Status"
          >
            <option value="">Qualquer status</option>
            <option value="todo">A fazer</option>
            <option value="attempted">Tentados</option>
            <option value="solved">Resolvidos</option>
          </Select>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="flex gap-1.5" role="group" aria-label="Dificuldade">
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
                    'h-10 rounded-lg border px-3 text-sm font-medium transition-colors',
                    active ? DIFF_ACTIVE[d] : 'border-border bg-surface text-muted hover:text-text',
                  )}
                >
                  {DIFFICULTY_LABEL[d]}
                </button>
              );
            })}
          </div>
          <Toggle active={filters.essential} onClick={() => set({ essential: !filters.essential })}>
            Essenciais
          </Toggle>
          <Toggle active={filters.starred} onClick={() => set({ starred: !filters.starred })}>
            <Star className={clsx('h-4 w-4', filters.starred && 'fill-current text-medium')} />{' '}
            Favoritos
          </Toggle>
          <div className="ml-auto flex items-center gap-2">
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                icon={<X className="h-4 w-4" />}
                onClick={() =>
                  setParams(filtersToParams({ ...EMPTY_FILTERS, sort: filters.sort }), {
                    replace: true,
                  })
                }
              >
                Limpar
              </Button>
            )}
            <Select
              value={filters.sort}
              onChange={(e) => set({ sort: e.target.value as ProblemFilters['sort'] })}
              className="h-9 w-40 text-xs"
              aria-label="Ordenar"
            >
              <option value="trilha">Ordem da trilha</option>
              <option value="numero">Número</option>
              <option value="dificuldade">Dificuldade</option>
            </Select>
          </div>
        </div>
      </div>

      <p className="mb-3 mt-5 text-sm text-muted" aria-live="polite">
        {results.length === PROBLEMS.length
          ? `${results.length} problemas`
          : `${results.length} de ${PROBLEMS.length} problemas`}
      </p>

      {isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          icon={<SearchX className="h-5 w-5" />}
          title="Nenhum problema encontrado"
          description="Tente remover algum filtro."
          action={
            <Button
              variant="secondary"
              onClick={() => setParams(new URLSearchParams(), { replace: true })}
            >
              Limpar filtros
            </Button>
          }
        />
      ) : filters.sort === 'trilha' && !filters.pattern ? (
        <div className="space-y-8">
          {groupByPattern(results).map(([patternId, items]) => {
            const pattern = PATTERNS_BY_ID.get(patternId)!;
            const solvedHere = items.filter(
              (p) => progress?.get(p.slug)?.status === 'solved',
            ).length;
            return (
              <section key={patternId} aria-labelledby={`grupo-${patternId}`}>
                <div className="mb-2 flex items-baseline justify-between gap-3 px-1">
                  <h2 id={`grupo-${patternId}`} className="text-sm font-semibold">
                    <span className="mr-2 font-mono text-xs text-subtle">
                      {String(pattern.order).padStart(2, '0')}
                    </span>
                    <Link to={`/app/trilha/${patternId}`} className="hover:text-accent">
                      {pattern.name}
                    </Link>
                  </h2>
                  <span className="text-xs text-muted tabular-nums">
                    {solvedHere}/{items.length}
                  </span>
                </div>
                <ProblemList
                  problems={items}
                  progress={progress}
                  onOpen={setOpenSlug}
                  showPattern={false}
                />
              </section>
            );
          })}
        </div>
      ) : (
        <ProblemList problems={results} progress={progress} onOpen={setOpenSlug} />
      )}

      <ProblemDrawer slug={openSlug} onClose={() => setOpenSlug(null)} />
    </Page>
  );
}
