import { ACHIEVEMENTS, type AchievementCategory } from '@algoky/shared';
import { clsx } from 'clsx';
import { Lock } from 'lucide-react';
import { AchievementIcon } from '../components/AchievementIcon.tsx';
import { Page, PageHeader } from '../components/AppShell.tsx';
import { Card } from '../components/ui/Card.tsx';
import { ErrorState, Skeleton } from '../components/ui/Feedback.tsx';
import { ProgressBar } from '../components/ui/Progress.tsx';
import { formatMinutes, plural } from '../lib/format.ts';
import { useDashboard } from '../lib/queries.ts';

const CATEGORIES: Array<{ id: AchievementCategory; label: string }> = [
  { id: 'solve', label: 'Resolução' },
  { id: 'streak', label: 'Constância' },
  { id: 'review', label: 'Revisão' },
  { id: 'focus', label: 'Foco' },
  { id: 'mastery', label: 'Maestria' },
];

const dateFmt = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export default function AchievementsPage() {
  const { data: d, isPending, error, refetch } = useDashboard();
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;

  const progress = new Map(d?.achievements.map((a) => [a.code, a]));
  const unlocked = d?.achievements.filter((a) => a.unlockedAt).length ?? 0;

  return (
    <Page>
      <PageHeader
        eyebrow="Conquistas"
        title={`${unlocked} de ${ACHIEVEMENTS.length} conquistas`}
        description="Marcos da sua jornada. Elas nunca são perdidas, mesmo que o streak quebre."
      />

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {isPending || !d ? (
          [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
        ) : (
          <>
            <Card className="p-4">
              <p className="text-xs text-muted">Nível {d.level.level}</p>
              <p className="mt-1 text-lg font-semibold">{d.level.title}</p>
              <ProgressBar value={d.level.progress} className="mt-2 h-1.5" />
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted">Maior streak</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {plural(d.streak.longest, 'dia')}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted">Revisões feitas</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{d.totals.reviews}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted">Tempo de foco</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {formatMinutes(d.totals.focusMinutes)}
              </p>
            </Card>
          </>
        )}
      </div>

      {CATEGORIES.map((cat) => (
        <section key={cat.id} className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{cat.label}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ACHIEVEMENTS.filter((a) => a.category === cat.id).map((a) => {
              const p = progress.get(a.code);
              const done = !!p?.unlockedAt;
              return (
                <Card
                  key={a.code}
                  className={clsx('flex items-start gap-4 p-4', !done && 'shadow-none')}
                >
                  <div
                    className={clsx(
                      'relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl',
                      done
                        ? 'bg-accent text-accent-fg shadow-md shadow-accent/25'
                        : 'bg-surface-2 text-subtle',
                    )}
                  >
                    <AchievementIcon name={a.icon} className="h-6 w-6" />
                    {!done && (
                      <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border border-border bg-surface">
                        <Lock className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={clsx('font-semibold', !done && 'text-muted')}>{a.name}</p>
                    <p className="text-sm text-muted">{a.description}</p>
                    {done ? (
                      <p className="mt-2 text-xs font-medium text-success">
                        Desbloqueada em {dateFmt.format(new Date(p.unlockedAt!))}
                      </p>
                    ) : p ? (
                      <div className="mt-2 flex items-center gap-2">
                        <ProgressBar value={p.current} max={p.target} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted tabular-nums">
                          {p.current}/{p.target}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </Page>
  );
}
