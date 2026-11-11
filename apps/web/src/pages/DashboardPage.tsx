import {
  ACHIEVEMENTS,
  PATTERNS_BY_ID,
  PROBLEMS,
  PROBLEMS_BY_SLUG,
  leetcodeUrl,
  type Dashboard,
  type Difficulty,
} from '@algoky/shared';
import { clsx } from 'clsx';
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  CircleDashed,
  ExternalLink,
  Flame,
  PartyPopper,
  Sparkles,
  Target,
  Timer,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { AchievementIcon } from '../components/AchievementIcon.tsx';
import { Page, PageHeader } from '../components/AppShell.tsx';
import { Heatmap } from '../components/Heatmap.tsx';
import { ProblemDrawer } from '../components/ProblemDrawer.tsx';
import { DifficultyBadge } from '../components/ui/Badge.tsx';
import { Button, ButtonLink, buttonClass } from '../components/ui/Button.tsx';
import { Card, CardHeader } from '../components/ui/Card.tsx';
import { ErrorState, Skeleton } from '../components/ui/Feedback.tsx';
import { ProgressBar, ProgressRing } from '../components/ui/Progress.tsx';
import {
  DIFFICULTY_LABEL,
  formatLocalDate,
  formatMinutes,
  greeting,
  patternName,
  plural,
  relativeTime,
} from '../lib/format.ts';
import { useDashboard, useMe, useUpdateProblem } from '../lib/queries.ts';

function motivation(d: Dashboard): string {
  const left = d.dailyGoal.target - d.dailyGoal.done;
  if (d.totals.solved === 0 && d.recent.length === 0)
    return 'Comece pela trilha: o primeiro problema leva uns 15 minutos.';
  if (left <= 0)
    return 'Meta de hoje batida! Uma revisão extra deixa o conhecimento ainda mais firme.';
  if (d.streak.current > 0 && !d.streak.activeToday)
    return `Seu streak de ${plural(d.streak.current, 'dia')} está em jogo. Um problema hoje mantém ele vivo.`;
  if (d.reviewsDue > 0)
    return `Você tem ${plural(d.reviewsDue, 'revisão pendente', 'revisões pendentes')}. Revisar é o jeito mais barato de não esquecer.`;
  return `Falta${left > 1 ? 'm' : ''} ${left} para a meta de hoje. Você consegue.`;
}

function StatCard({
  icon: Icon,
  label,
  children,
  footer,
  tone = 'default',
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  tone?: 'default' | 'accent';
}) {
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Icon className={clsx('h-4 w-4', tone === 'accent' && 'text-accent')} />
        {label}
      </div>
      <div className="mt-3 flex-1">{children}</div>
      {footer && <div className="mt-3 text-xs text-muted">{footer}</div>}
    </Card>
  );
}

function NextProblem({ d, onOpen }: { d: Dashboard; onOpen: (slug: string) => void }) {
  const update = useUpdateProblem();
  const problem = d.suggestion ? PROBLEMS_BY_SLUG.get(d.suggestion) : undefined;
  if (!problem) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <PartyPopper className="h-6 w-6 text-accent" />
          <div>
            <h2 className="font-semibold">Você completou a trilha inteira!</h2>
            <p className="text-sm text-muted">Agora é manter as revisões em dia. Lenda.</p>
          </div>
        </div>
      </Card>
    );
  }
  const pattern = PATTERNS_BY_ID.get(problem.pattern)!;
  const attempted = d.recent.some((r) => r.slug === problem.slug && r.type === 'attempt');
  return (
    <Card className="relative overflow-hidden p-6">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/10 blur-2xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-medium text-accent">
            <Sparkles className="h-4 w-4" />{' '}
            {attempted ? 'Continue de onde parou' : 'Próximo da trilha'}
          </p>
          <button onClick={() => onOpen(problem.slug)} className="mt-2 text-left">
            <h2 className="text-xl font-semibold tracking-tight hover:underline">
              {problem.id}. {problem.title}
            </h2>
          </button>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
            <DifficultyBadge difficulty={problem.difficulty} />
            <Link to={`/app/trilha/${pattern.id}`} className="hover:text-text">
              {pattern.name}
            </Link>
            <span aria-hidden>·</span>
            <span className="truncate">{pattern.tagline}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <a
            href={leetcodeUrl(problem.slug)}
            target="_blank"
            rel="noreferrer"
            className={buttonClass('primary')}
          >
            Resolver <ExternalLink className="h-4 w-4" />
          </a>
          <Button
            variant="secondary"
            icon={<CheckCircle2 className="h-4 w-4" />}
            loading={update.isPending}
            onClick={() => update.mutate({ slug: problem.slug, patch: { status: 'solved' } })}
          >
            Resolvi
          </Button>
          <ButtonLink
            to={`/app/foco?problema=${problem.slug}`}
            variant="ghost"
            icon={<Timer className="h-4 w-4" />}
          >
            Foco
          </ButtonLink>
        </div>
      </div>
    </Card>
  );
}

const DIFF_BAR: Record<Difficulty, string> = {
  easy: 'bg-easy',
  medium: 'bg-medium',
  hard: 'bg-hard',
};
const DIFF_TOTAL: Record<Difficulty, number> = {
  easy: PROBLEMS.filter((p) => p.difficulty === 'easy').length,
  medium: PROBLEMS.filter((p) => p.difficulty === 'medium').length,
  hard: PROBLEMS.filter((p) => p.difficulty === 'hard').length,
};

const ACTIVITY_META = {
  solve: { icon: CheckCircle2, verb: 'Resolveu', className: 'text-success' },
  attempt: { icon: CircleDashed, verb: 'Tentou', className: 'text-warning' },
  review: { icon: Brain, verb: 'Revisou', className: 'text-accent' },
  focus: { icon: Timer, verb: 'Focou', className: 'text-muted' },
} as const;

function DashboardSkeleton() {
  return (
    <Page>
      <Skeleton className="h-9 w-64" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="mt-6 h-32 rounded-2xl" />
      <Skeleton className="mt-6 h-56 rounded-2xl" />
    </Page>
  );
}

export default function DashboardPage() {
  const { data: me } = useMe();
  const { data: d, error, refetch, isPending } = useDashboard();
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  if (isPending) return <DashboardSkeleton />;
  if (error || !d) return <ErrorState error={error} onRetry={() => void refetch()} />;

  const goalDone = d.dailyGoal.done >= d.dailyGoal.target;
  // Padrões começados e ainda incompletos, completando com os próximos da trilha.
  const inProgress = d.byPattern.filter(
    (p) => (p.solved > 0 || p.attempted > 0) && p.solved < p.total,
  );
  const upcoming = d.byPattern.filter((p) => p.solved === 0 && p.attempted === 0 && p.total > 0);
  const patternsToShow = [...inProgress, ...upcoming].slice(
    0,
    Math.max(4, Math.min(inProgress.length, 6)),
  );
  const lockedSorted = d.achievements
    .filter((a) => !a.unlockedAt)
    .sort((a, b) => b.current / b.target - a.current / a.target)
    .slice(0, 3);
  const unlockedCount = d.achievements.filter((a) => a.unlockedAt).length;

  return (
    <Page>
      <PageHeader
        eyebrow={
          <span className="inline-block first-letter:uppercase">
            {formatLocalDate(d.today, true)}
          </span>
        }
        title={`${greeting()}, ${me?.displayName ?? ''}`}
        description={motivation(d)}
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Flame}
          label="Streak"
          tone="accent"
          footer={
            d.streak.activeToday
              ? 'Você já estudou hoje'
              : d.streak.current > 0
                ? 'Estude hoje para manter'
                : 'Comece hoje'
          }
        >
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold tabular-nums">{d.streak.current}</span>
            <span className="text-muted">{d.streak.current === 1 ? 'dia' : 'dias'}</span>
          </div>
          <p className="mt-1 text-xs text-muted">Recorde: {plural(d.streak.longest, 'dia')}</p>
        </StatCard>

        <StatCard
          icon={Target}
          label="Meta de hoje"
          footer={
            d.dailyGoal.focusMinutes > 0
              ? `${formatMinutes(d.dailyGoal.focusMinutes)} de foco hoje`
              : 'Resoluções + revisões'
          }
        >
          <div className="flex items-center gap-4">
            <ProgressRing
              value={d.dailyGoal.done}
              max={d.dailyGoal.target}
              size={64}
              stroke={7}
              barClassName={goalDone ? 'stroke-success' : 'stroke-accent'}
              label={`${d.dailyGoal.done} de ${d.dailyGoal.target}`}
            >
              <span className="text-sm font-semibold tabular-nums">
                {Math.min(d.dailyGoal.done, 99)}/{d.dailyGoal.target}
              </span>
            </ProgressRing>
            <p className="text-sm text-muted">
              {goalDone ? (
                <span className="font-medium text-success">Meta batida!</span>
              ) : (
                <>
                  Faltam{' '}
                  <span className="font-semibold text-text">
                    {d.dailyGoal.target - d.dailyGoal.done}
                  </span>
                </>
              )}
            </p>
          </div>
        </StatCard>

        <StatCard
          icon={Sparkles}
          label={`Nível ${d.level.level}`}
          footer={`${d.level.nextLevelXp - d.level.xp} XP para o nível ${d.level.level + 1}`}
        >
          <p className="text-xl font-semibold">{d.level.title}</p>
          <ProgressBar value={d.level.progress} className="mt-3" label="Progresso do nível" />
          <p className="mt-1.5 text-xs text-muted tabular-nums">{d.level.xp} XP no total</p>
        </StatCard>

        <StatCard
          icon={Brain}
          label="Revisões"
          footer={d.reviewsDue > 0 ? 'Revisões vencidas dão XP' : 'Nada pendente agora'}
        >
          <div className="flex items-end justify-between gap-2">
            <div>
              <span className="text-4xl font-semibold tabular-nums">{d.reviewsDue}</span>
              <span className="ml-2 text-muted">
                {d.reviewsDue === 1 ? 'pendente' : 'pendentes'}
              </span>
            </div>
            {d.reviewsDue > 0 && (
              <ButtonLink to="/app/revisao" size="sm">
                Revisar
              </ButtonLink>
            )}
          </div>
        </StatCard>
      </div>

      <div className="mt-6">
        <NextProblem d={d} onOpen={setOpenSlug} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader
              title="Constância"
              subtitle="Cada quadrado é um dia. Quanto mais escuro, mais você estudou."
            />
            <div className="px-5 pb-5 pt-4">
              <Heatmap days={d.heatmap} today={d.today} />
            </div>
          </Card>

          <Card>
            <CardHeader
              title={inProgress.length ? 'Padrões em andamento' : 'Comece por aqui'}
              action={
                <Link
                  to="/app/trilha"
                  className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
                >
                  Trilha <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
            <ul className="space-y-4 px-5 pb-5 pt-4">
              {patternsToShow.map((p) => (
                <li key={p.pattern}>
                  <Link to={`/app/trilha/${p.pattern}`} className="group block">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium group-hover:text-accent">
                        {patternName(p.pattern)}
                      </span>
                      <span className="text-muted tabular-nums">
                        {p.solved}/{p.total}
                      </span>
                    </div>
                    <ProgressBar
                      value={p.solved}
                      max={p.total}
                      className="mt-2"
                      barClassName={p.solved === p.total ? 'bg-success' : 'bg-accent'}
                      label={`${patternName(p.pattern)}: ${p.solved} de ${p.total}`}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Resolvidos"
              subtitle={`${d.totals.solved} de ${d.totals.totalProblems} problemas`}
            />
            <ul className="space-y-4 px-5 pb-5 pt-4">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <li key={diff}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className={clsx('h-2.5 w-2.5 rounded-full', DIFF_BAR[diff])}
                        aria-hidden
                      />
                      {DIFFICULTY_LABEL[diff]}
                    </span>
                    <span className="text-muted tabular-nums">
                      {d.totals[diff]}/{DIFF_TOTAL[diff]}
                    </span>
                  </div>
                  <ProgressBar
                    value={d.totals[diff]}
                    max={DIFF_TOTAL[diff]}
                    className="mt-2"
                    barClassName={DIFF_BAR[diff]}
                  />
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader
              title="Próximas conquistas"
              subtitle={`${unlockedCount} de ${ACHIEVEMENTS.length} desbloqueadas`}
              action={
                <Link
                  to="/app/conquistas"
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Ver todas
                </Link>
              }
            />
            <ul className="space-y-3 px-5 pb-5 pt-4">
              {lockedSorted.map((a) => {
                const def = ACHIEVEMENTS.find((x) => x.code === a.code)!;
                return (
                  <li key={a.code} className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-muted">
                      <AchievementIcon name={def.icon} className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate font-medium">{def.name}</span>
                        <span className="text-xs text-muted tabular-nums">
                          {a.current}/{a.target}
                        </span>
                      </div>
                      <ProgressBar value={a.current} max={a.target} className="mt-1.5 h-1.5" />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Atividade recente" />
            {d.recent.length === 0 ? (
              <p className="px-5 pb-5 pt-3 text-sm text-muted">
                Suas resoluções, revisões e sessões de foco aparecem aqui.
              </p>
            ) : (
              <ul className="divide-y divide-border px-5 pb-2 pt-2">
                {d.recent.slice(0, 7).map((r, i) => {
                  const meta = ACTIVITY_META[r.type];
                  const p = r.slug ? PROBLEMS_BY_SLUG.get(r.slug) : undefined;
                  const row = (
                    <>
                      <meta.icon className={clsx('h-4 w-4 shrink-0', meta.className)} />
                      <span className="min-w-0 flex-1 truncate">
                        {meta.verb}{' '}
                        <span className="font-medium">
                          {r.type === 'focus' ? `${r.minutes} min` : (p?.title ?? r.slug)}
                        </span>
                      </span>
                      {r.xp > 0 && (
                        <span className="text-xs font-medium text-success">+{r.xp}</span>
                      )}
                      <span className="shrink-0 text-xs text-subtle">
                        {relativeTime(r.createdAt)}
                      </span>
                    </>
                  );
                  return (
                    <li key={i}>
                      {r.slug ? (
                        <button
                          onClick={() => setOpenSlug(r.slug)}
                          className="-mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm hover:bg-surface-2"
                        >
                          {row}
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 py-2.5 text-sm">{row}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <ProblemDrawer slug={openSlug} onClose={() => setOpenSlug(null)} />
    </Page>
  );
}
