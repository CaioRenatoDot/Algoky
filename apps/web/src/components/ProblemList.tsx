import { leetcodeUrl, type Problem, type ProblemState } from '@algoky/shared';
import { clsx } from 'clsx';
import { Code2, ExternalLink, NotebookPen, Star } from 'lucide-react';
import { Link } from 'react-router';
import { patternName } from '../lib/format.ts';
import { useUpdateProblem } from '../lib/queries.ts';
import { StatusButton } from './StatusButton.tsx';
import { DifficultyBadge } from './ui/Badge.tsx';

export function ProblemList({
  problems,
  progress,
  onOpen,
  showPattern = true,
}: {
  problems: Problem[];
  progress: Map<string, ProblemState> | undefined;
  onOpen: (slug: string) => void;
  showPattern?: boolean;
}) {
  const update = useUpdateProblem();
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
      {problems.map((p) => {
        const state = progress?.get(p.slug);
        const status = state?.status ?? 'todo';
        return (
          <li
            key={p.slug}
            className={clsx(
              'group flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-surface-2/60 sm:px-4',
              status === 'solved' && 'bg-success-soft/30',
            )}
          >
            <StatusButton
              status={status}
              disabled={update.isPending && update.variables?.slug === p.slug}
              onChange={(next) => update.mutate({ slug: p.slug, patch: { status: next } })}
            />
            <button
              onClick={() => onOpen(p.slug)}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
              <span className="hidden w-10 shrink-0 font-mono text-xs text-subtle sm:block">
                {p.id}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={clsx(
                    'block truncate text-sm font-medium',
                    status === 'solved' && 'text-muted',
                  )}
                >
                  {p.title}
                  {p.essential && (
                    <span className="ml-2 align-middle text-[10px] font-semibold uppercase tracking-wide text-accent">
                      essencial
                    </span>
                  )}
                </span>
                {showPattern && (
                  <span className="block truncate text-xs text-muted">
                    {patternName(p.pattern)}
                  </span>
                )}
              </span>
            </button>
            <span className="flex shrink-0 items-center gap-2">
              {state?.starred && (
                <Star className="h-4 w-4 fill-current text-medium" aria-label="Favorito" />
              )}
              {state?.notes && (
                <NotebookPen
                  className="hidden h-4 w-4 text-subtle sm:block"
                  aria-label="Tem notas"
                />
              )}
              <DifficultyBadge difficulty={p.difficulty} />
              <Link
                to={`/app/problemas/${p.slug}`}
                className={clsx(
                  'rounded-md p-1.5 hover:bg-surface-3 hover:text-text',
                  state?.code ? 'text-accent' : 'text-subtle',
                )}
                aria-label={`Abrir ${p.title} no editor`}
                title={state?.code ? 'Continuar no editor' : 'Abrir no editor'}
              >
                <Code2 className="h-4 w-4" />
              </Link>
              <a
                href={leetcodeUrl(p.slug)}
                target="_blank"
                rel="noreferrer"
                className="rounded-md p-1.5 text-subtle hover:bg-surface-3 hover:text-text"
                aria-label={`Abrir ${p.title} no LeetCode`}
                title="Abrir no LeetCode"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
