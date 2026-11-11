import { PATTERNS, PROBLEMS, PROBLEMS_BY_SLUG, leetcodeUrl, roadmapOrder } from '@algoky/shared';
import { clsx } from 'clsx';
import { Bell, BellRing, ExternalLink, Pause, Play, Square, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { Page, PageHeader } from '../components/AppShell.tsx';
import { Button, buttonClass } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Select } from '../components/ui/Field.tsx';
import { ProgressRing } from '../components/ui/Progress.tsx';
import { focusTimer, formatClock, remainingMs, useFocusState } from '../lib/focusTimer.ts';
import { formatMinutes, patternName } from '../lib/format.ts';
import { useDashboard, useLogFocus } from '../lib/queries.ts';
import { useStatuses } from '../lib/useStatuses.ts';

const PRESETS = [15, 25, 45, 60];

const TIPS = [
  'Leia o enunciado duas vezes e escreva os casos de borda antes de codar.',
  'Pense na força bruta primeiro e em qual padrão a melhora.',
  'Travou por 20 minutos? Veja uma dica, não a solução inteira.',
  'Depois de passar, anote a ideia-chave: ela aparece na revisão.',
];

export default function FocusPage() {
  const [params] = useSearchParams();
  const state = useFocusState();
  const { data: dash } = useDashboard();
  const { statuses } = useStatuses();
  const logFocus = useLogFocus();
  const [duration, setDuration] = useState(25);
  const [slug, setSlug] = useState<string>(() => {
    const p = params.get('problema');
    return p && PROBLEMS_BY_SLUG.has(p) ? p : '';
  });
  const [now, setNow] = useState(() => Date.now());
  const [notifyGranted, setNotifyGranted] = useState(
    () => 'Notification' in window && Notification.permission === 'granted',
  );

  useEffect(() => {
    if (state.status !== 'running') return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [state.status]);

  const active = state.status !== 'idle';
  const remaining = active ? remainingMs(state, now) : duration * 60_000;
  const total = (active ? state.durationMin : duration) * 60_000;
  const currentSlug = active ? state.slug : slug || null;
  const problem = currentSlug ? PROBLEMS_BY_SLUG.get(currentSlug) : undefined;

  useEffect(() => {
    if (!active) return;
    const prev = document.title;
    document.title = `${formatClock(remaining)} · Foco · Algoky`;
    return () => {
      document.title = prev;
    };
  }, [active, remaining]);

  const options = useMemo(() => {
    const ordered = roadmapOrder(PROBLEMS, PATTERNS);
    return {
      attempted: ordered.filter((p) => statuses.get(p.slug) === 'attempted'),
      next: ordered
        .filter((p) => !statuses.has(p.slug) || statuses.get(p.slug) === 'todo')
        .slice(0, 25),
    };
  }, [statuses]);

  const finishEarly = () => {
    const { minutes, slug: s } = focusTimer.stop();
    if (minutes >= 1) logFocus.mutate({ minutes, slug: s });
    else toast('Sessão descartada', { description: 'Menos de 1 minuto não é registrado.' });
  };

  const askNotify = async () => {
    if (!('Notification' in window)) return;
    setNotifyGranted((await Notification.requestPermission()) === 'granted');
  };

  return (
    <Page className="max-w-4xl">
      <PageHeader
        eyebrow="Foco"
        title="Sessão de foco"
        description="Escolha um problema, defina o tempo e resolva sem distrações. Sessões concluídas contam XP e entram no seu dia."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card className="flex flex-col items-center p-6 sm:p-10">
          <ProgressRing
            value={total - remaining}
            max={total}
            size={260}
            stroke={10}
            barClassName={state.status === 'paused' ? 'stroke-muted' : 'stroke-accent'}
            label="Progresso da sessão"
          >
            <div className="text-center">
              <p
                className="font-mono text-5xl font-semibold tabular-nums tracking-tight sm:text-6xl"
                aria-live="off"
              >
                {formatClock(remaining)}
              </p>
              <p className="mt-2 text-sm text-muted">
                {state.status === 'running'
                  ? 'Focando…'
                  : state.status === 'paused'
                    ? 'Pausado'
                    : `${duration} minutos`}
              </p>
            </div>
          </ProgressRing>

          {!active && (
            <div className="mt-8 w-full max-w-sm space-y-4">
              <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Duração">
                {PRESETS.map((m) => (
                  <button
                    key={m}
                    role="radio"
                    aria-checked={duration === m}
                    onClick={() => setDuration(m)}
                    className={clsx(
                      'h-10 rounded-lg border text-sm font-medium transition-colors',
                      duration === m
                        ? 'border-accent bg-accent-soft text-text'
                        : 'border-border text-muted hover:text-text',
                    )}
                  >
                    {m} min
                  </button>
                ))}
              </div>
              <label className="block">
                <span className="flex justify-between text-xs text-muted">
                  <span>Personalizado</span>
                  <span className="tabular-nums">{duration} min</span>
                </span>
                <input
                  type="range"
                  min={5}
                  max={120}
                  step={5}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="mt-2 w-full accent-[var(--accent)]"
                  aria-label="Duração personalizada em minutos"
                />
              </label>
              <Select
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                aria-label="Problema da sessão"
              >
                <option value="">Sem problema específico</option>
                {options.attempted.length > 0 && (
                  <optgroup label="Em andamento">
                    {options.attempted.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.id}. {p.title}
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="Próximos da trilha">
                  {options.next.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.id}. {p.title}
                    </option>
                  ))}
                </optgroup>
                {slug &&
                  !options.attempted.some((p) => p.slug === slug) &&
                  !options.next.some((p) => p.slug === slug) && (
                    <option value={slug}>{PROBLEMS_BY_SLUG.get(slug)?.title}</option>
                  )}
              </Select>
              <Button
                size="lg"
                className="w-full"
                icon={<Play className="h-5 w-5" />}
                onClick={() => focusTimer.start(duration, slug || null)}
              >
                Começar
              </Button>
            </div>
          )}

          {active && (
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {state.status === 'running' ? (
                <Button
                  size="lg"
                  variant="secondary"
                  icon={<Pause className="h-5 w-5" />}
                  onClick={focusTimer.pause}
                >
                  Pausar
                </Button>
              ) : (
                <Button size="lg" icon={<Play className="h-5 w-5" />} onClick={focusTimer.resume}>
                  Retomar
                </Button>
              )}
              <Button
                size="lg"
                variant="secondary"
                icon={<Square className="h-4 w-4" />}
                onClick={finishEarly}
              >
                Encerrar e registrar
              </Button>
              <Button
                size="lg"
                variant="ghost"
                icon={<X className="h-5 w-5" />}
                onClick={() => focusTimer.stop()}
                title="Descartar sem registrar"
              >
                Descartar
              </Button>
            </div>
          )}

          {problem && (
            <div className="mt-8 flex w-full max-w-sm items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
              <div className="min-w-0">
                <p className="text-xs text-muted">{patternName(problem.pattern)}</p>
                <p className="truncate font-medium">
                  {problem.id}. {problem.title}
                </p>
              </div>
              <a
                href={leetcodeUrl(problem.slug)}
                target="_blank"
                rel="noreferrer"
                className={buttonClass('secondary', 'sm')}
              >
                Abrir <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <p className="text-sm text-muted">Foco hoje</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">
              {formatMinutes(dash?.dailyGoal.focusMinutes ?? 0)}
            </p>
            <p className="mt-3 text-sm text-muted">Total acumulado</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">
              {formatMinutes(dash?.totals.focusMinutes ?? 0)}
            </p>
          </Card>
          {'Notification' in window && (
            <button
              onClick={() => void askNotify()}
              disabled={notifyGranted}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-left text-sm disabled:cursor-default"
            >
              {notifyGranted ? (
                <BellRing className="h-5 w-5 text-success" />
              ) : (
                <Bell className="h-5 w-5 text-muted" />
              )}
              <span>
                <span className="block font-medium">
                  {notifyGranted ? 'Notificações ativas' : 'Avisar quando terminar'}
                </span>
                <span className="text-xs text-muted">
                  {notifyGranted
                    ? 'Você será avisado mesmo em outra aba.'
                    : 'Notificação do navegador ao fim da sessão.'}
                </span>
              </span>
            </button>
          )}
          <Card className="p-5">
            <h2 className="text-sm font-semibold">Dicas para a sessão</h2>
            <ul className="mt-3 space-y-2.5 text-sm text-muted">
              {TIPS.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </Page>
  );
}
