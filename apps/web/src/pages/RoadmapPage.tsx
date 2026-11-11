import { PATTERNS, PROBLEMS } from '@algoky/shared';
import { clsx } from 'clsx';
import { Check, ChevronRight, Eye } from 'lucide-react';
import { Link } from 'react-router';
import { Page, PageHeader } from '../components/AppShell.tsx';
import { ErrorState, Skeleton } from '../components/ui/Feedback.tsx';
import { ProgressBar, ProgressRing } from '../components/ui/Progress.tsx';
import { useStatuses } from '../lib/useStatuses.ts';

export default function RoadmapPage() {
  const { byPattern, isPending, error, refetch } = useStatuses();

  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;

  const solvedTotal = [...byPattern.values()].reduce((s, p) => s + p.solved, 0);
  const completed = [...byPattern.values()].filter(
    (p) => p.total > 0 && p.solved === p.total,
  ).length;
  // Recomendado: primeiro padrão com menos da metade dos essenciais feitos.
  const recommended = PATTERNS.find((p) => {
    const ess = PROBLEMS.filter((x) => x.pattern === p.id && x.essential);
    const prog = byPattern.get(p.id);
    return prog && prog.solved < Math.ceil(ess.length * 0.6);
  })?.id;

  return (
    <Page>
      <PageHeader
        eyebrow="Trilha"
        title="Padrões de algoritmos"
        description="Siga na ordem: cada padrão se apoia nos anteriores. Não precisa terminar um para começar o próximo, mas os essenciais fazem diferença."
      />

      <div className="mt-6 grid grid-cols-3 gap-3 sm:max-w-lg">
        {[
          [String(solvedTotal), 'resolvidos'],
          [`${completed}/${PATTERNS.length}`, 'padrões completos'],
          [`${Math.round((solvedTotal / PROBLEMS.length) * 100)}%`, 'da trilha'],
        ].map(([v, l]) => (
          <div key={l} className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xl font-semibold tabular-nums">{isPending ? '–' : v}</p>
            <p className="text-xs text-muted">{l}</p>
          </div>
        ))}
      </div>

      <ol className="relative mt-10 space-y-3 before:absolute before:bottom-6 before:left-[27px] before:top-6 before:w-px before:bg-border sm:before:left-[31px]">
        {PATTERNS.map((p) => {
          const prog = byPattern.get(p.id);
          const done = !!prog && prog.total > 0 && prog.solved === prog.total;
          const started = !!prog && (prog.solved > 0 || prog.attempted > 0);
          const isRec = p.id === recommended;
          return (
            <li key={p.id} className="relative">
              <Link
                to={`/app/trilha/${p.id}`}
                className={clsx(
                  'group flex items-center gap-4 rounded-2xl border bg-surface p-3 pr-4 transition-all hover:shadow-card sm:p-4',
                  isRec
                    ? 'border-accent/60 ring-4 ring-accent/10'
                    : 'border-border hover:border-border-strong',
                )}
              >
                {isPending ? (
                  <Skeleton className="h-12 w-12 rounded-full sm:h-14 sm:w-14" />
                ) : (
                  <ProgressRing
                    value={prog?.solved ?? 0}
                    max={prog?.total ?? 1}
                    size={52}
                    stroke={5}
                    className="relative z-10 shrink-0 rounded-full bg-surface sm:scale-110"
                    barClassName={done ? 'stroke-success' : 'stroke-accent'}
                    label={`${prog?.solved ?? 0} de ${prog?.total ?? 0}`}
                  >
                    {done ? (
                      <Check className="h-5 w-5 text-success" strokeWidth={3} />
                    ) : (
                      <span
                        className={clsx(
                          'font-mono text-sm font-semibold',
                          started ? 'text-text' : 'text-subtle',
                        )}
                      >
                        {p.order}
                      </span>
                    )}
                  </ProgressRing>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold group-hover:text-accent">{p.name}</h2>
                    {isRec && (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-fg">
                        Recomendado agora
                      </span>
                    )}
                    {p.visualizer && (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] text-muted"
                        title="Tem visualizador interativo"
                      >
                        <Eye className="h-3.5 w-3.5" /> visual
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted">{p.tagline}</p>
                  <div className="mt-2 flex items-center gap-3 sm:hidden">
                    <ProgressBar
                      value={prog?.solved ?? 0}
                      max={prog?.total ?? 1}
                      className="h-1.5 flex-1"
                    />
                  </div>
                </div>
                <div className="hidden w-40 shrink-0 sm:block">
                  <div className="flex justify-between text-xs text-muted">
                    <span>{done ? 'Completo' : started ? 'Em andamento' : 'Não iniciado'}</span>
                    <span className="tabular-nums">
                      {prog?.solved ?? 0}/{prog?.total ?? 0}
                    </span>
                  </div>
                  <ProgressBar
                    value={prog?.solved ?? 0}
                    max={prog?.total ?? 1}
                    className="mt-1.5 h-1.5"
                    barClassName={done ? 'bg-success' : 'bg-accent'}
                  />
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-subtle group-hover:text-text" />
              </Link>
            </li>
          );
        })}
      </ol>
    </Page>
  );
}
