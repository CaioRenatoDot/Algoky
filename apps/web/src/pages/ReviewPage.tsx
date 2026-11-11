import {
  PATTERNS_BY_ID,
  PROBLEMS_BY_SLUG,
  diffDays,
  leetcodeUrl,
  previewIntervals,
  type DueReview,
  type ReviewRating,
} from '@algoky/shared';
import { clsx } from 'clsx';
import { Brain, CalendarCheck, ExternalLink, Eye, PartyPopper } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Page, PageHeader } from '../components/AppShell.tsx';
import { RichText } from '../components/RichText.tsx';
import { DifficultyBadge } from '../components/ui/Badge.tsx';
import { Button, ButtonLink, buttonClass } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { EmptyState, ErrorState, Kbd, PageLoader } from '../components/ui/Feedback.tsx';
import { ProgressBar } from '../components/ui/Progress.tsx';
import { formatLocalDate, inDays, plural } from '../lib/format.ts';
import { useDashboard, useDueReviews, useProgress, useReview } from '../lib/queries.ts';

const RATINGS: Array<{ rating: ReviewRating; label: string; hint: string; className: string }> = [
  {
    rating: 'again',
    label: 'Errei',
    hint: 'Não lembrei a abordagem',
    className: 'hover:border-hard hover:bg-hard/10',
  },
  {
    rating: 'hard',
    label: 'Difícil',
    hint: 'Lembrei com esforço',
    className: 'hover:border-medium hover:bg-medium/10',
  },
  {
    rating: 'good',
    label: 'Bom',
    hint: 'Lembrei a ideia e a complexidade',
    className: 'hover:border-easy hover:bg-easy/10',
  },
  {
    rating: 'easy',
    label: 'Fácil',
    hint: 'Saberia codar agora',
    className: 'hover:border-accent hover:bg-accent-soft',
  },
];

const shortDays = (d: number) => (d < 30 ? `${d}d` : `${Math.round(d / 30)}m`);

function NothingDue() {
  const { data: progress } = useProgress();
  const { data: dash } = useDashboard();
  const nextDue = useMemo(() => {
    const dates = [...(progress?.values() ?? [])]
      .map((p) => p.review?.dueDate)
      .filter((d): d is string => !!d);
    return dates.sort()[0];
  }, [progress]);
  return (
    <Card className="mt-8">
      <EmptyState
        icon={<CalendarCheck className="h-5 w-5" />}
        title="Tudo em dia!"
        description={
          nextDue && dash
            ? `Nenhuma revisão pendente. A próxima é ${inDays(diffDays(dash.today, nextDue))} (${formatLocalDate(nextDue)}).`
            : 'Resolva problemas para que eles entrem na fila de revisão.'
        }
        action={<ButtonLink to="/app/problemas">Ir para os problemas</ButtonLink>}
      />
      <div className="border-t border-border px-6 py-5 text-sm text-muted">
        <p className="font-medium text-text">Como funciona a revisão espaçada?</p>
        <p className="mt-1">
          Cada problema resolvido volta depois de alguns dias. Se você lembrar bem, o intervalo
          cresce (3 dias, 1 semana, 1 mês…); se esquecer, ele volta amanhã. É o jeito mais eficiente
          de não esquecer o que já estudou.
        </p>
      </div>
    </Card>
  );
}

function ReviewSession({ initial }: { initial: DueReview[] }) {
  const { data: dash } = useDashboard();
  const review = useReview();
  const [queue] = useState(initial); // fila congelada no início da sessão
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [xp, setXp] = useState(0);

  const current = queue[index];
  const problem = current ? PROBLEMS_BY_SLUG.get(current.slug) : undefined;
  const pattern = problem ? PATTERNS_BY_ID.get(problem.pattern) : undefined;
  const today = dash?.today;
  const previews = current && today ? previewIntervals(current.card, today) : null;

  const answer = (rating: ReviewRating) => {
    if (!current || review.isPending) return;
    review.mutate(
      { slug: current.slug, rating },
      {
        onSuccess: (res) => {
          setXp((x) => x + res.xpGained);
          setRevealed(false);
          setIndex((i) => i + 1);
        },
      },
    );
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (!revealed && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        setRevealed(true);
      } else if (revealed && ['1', '2', '3', '4'].includes(e.key)) {
        answer(RATINGS[Number(e.key) - 1]!.rating);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!current || !problem || !pattern) {
    return (
      <Card className="mt-8">
        <EmptyState
          icon={<PartyPopper className="h-5 w-5" />}
          title="Revisões concluídas!"
          description={`Você revisou ${plural(queue.length, 'problema')}${xp > 0 ? ` e ganhou ${xp} XP` : ''}. Seu eu do futuro agradece.`}
          action={
            <div className="flex gap-2">
              <ButtonLink to="/app">Voltar ao painel</ButtonLink>
              <ButtonLink to="/app/trilha" variant="secondary">
                Continuar a trilha
              </ButtonLink>
            </div>
          }
        />
      </Card>
    );
  }

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center gap-3">
        <ProgressBar
          value={index}
          max={queue.length}
          className="flex-1"
          label="Progresso da sessão"
        />
        <span className="text-sm text-muted tabular-nums">
          {index + 1} de {queue.length}
        </span>
      </div>

      <Card className="overflow-hidden" key={current.slug}>
        <div className="animate-fade-up p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <DifficultyBadge difficulty={problem.difficulty} />
            <span className="font-mono">#{problem.id}</span>
            {current.overdueDays > 0 && (
              <span className="text-warning">· atrasada {plural(current.overdueDays, 'dia')}</span>
            )}
            <span>
              · {plural(current.card.repetitions, 'revisão anterior', 'revisões anteriores')}
            </span>
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">{problem.title}</h2>

          {!revealed ? (
            <div className="mt-6 rounded-xl bg-surface-2 p-5">
              <p className="flex items-center gap-2 font-medium">
                <Brain className="h-5 w-5 text-accent" /> Antes de revelar, tente lembrar:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted">
                <li>Qual padrão resolve este problema?</li>
                <li>Qual é a ideia-chave da solução?</li>
                <li>Qual a complexidade de tempo e espaço?</li>
              </ul>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button icon={<Eye className="h-4 w-4" />} onClick={() => setRevealed(true)}>
                  Mostrar resposta
                </Button>
                <a
                  href={leetcodeUrl(problem.slug)}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonClass('ghost')}
                >
                  Resolver de novo <ExternalLink className="h-4 w-4" />
                </a>
                <span className="hidden text-xs text-muted sm:inline">
                  ou aperte <Kbd>espaço</Kbd>
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-border p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Padrão</p>
                <p className="mt-1 font-semibold">{pattern.name}</p>
                <p className="text-sm text-muted">{pattern.tagline}</p>
                <p className="mt-3 text-sm">
                  <span className="text-muted">Complexidade típica:</span> {pattern.complexity.time}{' '}
                  · {pattern.complexity.space}
                </p>
              </div>
              <div className="rounded-xl border border-border p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Suas notas</p>
                {current.notes ? (
                  <p className="mt-2 whitespace-pre-wrap font-mono text-[13px] leading-relaxed">
                    {current.notes}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-muted">
                    Sem notas para este problema. Na próxima vez, anote a ideia-chave no painel do
                    problema.
                  </p>
                )}
              </div>
              <div className="rounded-xl bg-surface-2 p-5 text-sm">
                <p className="font-medium">Sinais do padrão</p>
                <ul className="mt-2 space-y-1 text-muted">
                  {pattern.signals.slice(0, 3).map((s) => (
                    <li key={s}>
                      • <RichText text={s} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {revealed && (
          <div className="border-t border-border bg-surface-2/50 p-4 sm:p-6">
            <p className="mb-3 text-center text-sm text-muted">Quão bem você lembrou?</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {RATINGS.map((r, i) => (
                <button
                  key={r.rating}
                  onClick={() => answer(r.rating)}
                  disabled={review.isPending}
                  className={clsx(
                    'flex flex-col items-center rounded-xl border border-border bg-surface px-3 py-3 transition-colors disabled:opacity-50',
                    r.className,
                  )}
                >
                  <span className="font-semibold">{r.label}</span>
                  <span className="mt-0.5 text-center text-[11px] leading-tight text-muted">
                    {r.hint}
                  </span>
                  <span className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                    <Kbd>{i + 1}</Kbd> {previews ? shortDays(previews[r.rating]) : ''}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function ReviewPage() {
  const { data, isPending, error, refetch } = useDueReviews();
  // Congela a fila carregada na primeira vez; invalidações durante a sessão não a reordenam.
  const [session, setSession] = useState<DueReview[] | null>(null);
  if (session === null && data) setSession(data);

  return (
    <Page className="max-w-3xl">
      <PageHeader
        eyebrow="Revisão"
        title="Revisão espaçada"
        description="Relembre a abordagem de problemas que você já resolveu, no momento certo para fixar."
      />
      {error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : isPending || session === null ? (
        <PageLoader />
      ) : session.length === 0 ? (
        <NothingDue />
      ) : (
        <ReviewSession initial={session} />
      )}
    </Page>
  );
}
