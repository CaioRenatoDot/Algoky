import { PROBLEMS_BY_SLUG, diffDays, leetcodeUrl, type ProblemStatus } from '@algoky/shared';
import { clsx } from 'clsx';
import { CalendarClock, ExternalLink, Star, Timer } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { formatLocalDate, inDays, patternName } from '../lib/format.ts';
import { useDashboard, useProgress, useUpdateProblem } from '../lib/queries.ts';
import { DifficultyBadge } from './ui/Badge.tsx';
import { buttonClass } from './ui/Button.tsx';
import { Drawer } from './ui/Dialog.tsx';
import { Textarea } from './ui/Field.tsx';
import { Segmented } from './ui/Segmented.tsx';

const CONFIDENCE = [
  { value: 1, label: 'Precisei da solução' },
  { value: 2, label: 'Com muita dica' },
  { value: 3, label: 'Com esforço' },
  { value: 4, label: 'Tranquilo' },
  { value: 5, label: 'Fácil demais' },
];

/** Remonta o conteúdo a cada problema aberto, para o rascunho de notas começar do valor salvo. */
export function ProblemDrawer({ slug, onClose }: { slug: string | null; onClose: () => void }) {
  return <ProblemDrawerContent key={slug ?? ''} slug={slug} onClose={onClose} />;
}

function ProblemDrawerContent({ slug, onClose }: { slug: string | null; onClose: () => void }) {
  const problem = slug ? PROBLEMS_BY_SLUG.get(slug) : undefined;
  const { data: progress } = useProgress();
  const { data: dash } = useDashboard();
  const update = useUpdateProblem();
  const state = slug ? progress?.get(slug) : undefined;
  const status = state?.status ?? 'todo';

  const [notes, setNotes] = useState(() => state?.notes ?? '');
  const [saved, setSaved] = useState<'idle' | 'saving' | 'saved'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const saveNotes = (value: string) => {
    if (!slug || value === (state?.notes ?? '')) return;
    setSaved('saving');
    update.mutate({ slug, patch: { notes: value } }, { onSuccess: () => setSaved('saved') });
  };

  const onNotesChange = (value: string) => {
    setNotes(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => saveNotes(value), 900);
  };

  const close = () => {
    clearTimeout(timer.current);
    saveNotes(notes);
    onClose();
  };

  if (!problem) return <Drawer open={false} onClose={onClose} title="" children={null} />;

  const setStatus = (next: ProblemStatus) =>
    update.mutate({ slug: problem.slug, patch: { status: next } });
  const review = state?.review;
  const dueIn = review && dash ? diffDays(dash.today, review.dueDate) : null;

  return (
    <Drawer
      open={!!slug}
      onClose={close}
      title={
        <div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="font-mono">#{problem.id}</span>·
            <Link
              to={`/app/trilha/${problem.pattern}`}
              onClick={close}
              className="hover:text-accent"
            >
              {patternName(problem.pattern)}
            </Link>
          </div>
          <h2 className="mt-1 text-lg font-semibold leading-snug">{problem.title}</h2>
          <div className="mt-2 flex items-center gap-2">
            <DifficultyBadge difficulty={problem.difficulty} />
            {problem.essential && (
              <span className="text-xs font-medium text-accent">Essencial</span>
            )}
          </div>
        </div>
      }
      footer={
        <div className="flex flex-wrap gap-2">
          <a
            href={leetcodeUrl(problem.slug)}
            target="_blank"
            rel="noreferrer"
            className={buttonClass('primary', 'md', 'flex-1')}
          >
            Abrir no LeetCode <ExternalLink className="h-4 w-4" />
          </a>
          <Link
            to={`/app/foco?problema=${problem.slug}`}
            onClick={close}
            className={buttonClass('secondary', 'md')}
          >
            <Timer className="h-4 w-4" /> Foco
          </Link>
        </div>
      }
    >
      <div className="space-y-7">
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Status</h3>
            <button
              onClick={() =>
                update.mutate({ slug: problem.slug, patch: { starred: !state?.starred } })
              }
              className={clsx(
                'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium',
                state?.starred ? 'text-medium-text' : 'text-muted hover:text-text',
              )}
              aria-pressed={!!state?.starred}
            >
              <Star className={clsx('h-4 w-4', state?.starred && 'fill-current')} />{' '}
              {state?.starred ? 'Favorito' : 'Favoritar'}
            </button>
          </div>
          <div className="mt-2">
            <Segmented
              label="Status do problema"
              value={status}
              onChange={setStatus}
              options={[
                { value: 'todo', label: 'A fazer' },
                { value: 'attempted', label: 'Tentado' },
                { value: 'solved', label: 'Resolvido' },
              ]}
            />
          </div>
        </section>

        <section>
          <h3 className="text-sm font-medium">Como foi?</h3>
          <p className="mt-0.5 text-xs text-muted">Define quando o problema volta para revisão.</p>
          <div className="mt-2 grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="Confiança">
            {CONFIDENCE.map((c) => (
              <button
                key={c.value}
                role="radio"
                aria-checked={state?.confidence === c.value}
                title={c.label}
                onClick={() =>
                  update.mutate({ slug: problem.slug, patch: { confidence: c.value } })
                }
                className={clsx(
                  'flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[11px] leading-tight transition-colors',
                  state?.confidence === c.value
                    ? 'border-accent bg-accent-soft text-text'
                    : 'border-border text-muted hover:border-border-strong',
                )}
              >
                <span className="text-base font-semibold">{c.value}</span>
                <span className="text-center">{c.label}</span>
              </button>
            ))}
          </div>
        </section>

        {review && (
          <section className="flex items-center gap-3 rounded-xl bg-surface-2 px-4 py-3 text-sm">
            <CalendarClock className="h-5 w-5 shrink-0 text-accent" />
            <div>
              <p className="font-medium">
                Próxima revisão{' '}
                {dueIn !== null && dueIn <= 0 ? 'pendente' : dueIn !== null ? inDays(dueIn) : ''}
              </p>
              <p className="text-xs text-muted">
                {formatLocalDate(review.dueDate, true)} · {review.repetitions}{' '}
                {review.repetitions === 1 ? 'revisão feita' : 'revisões feitas'}
              </p>
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between">
            <label htmlFor="notes" className="text-sm font-medium">
              Notas
            </label>
            <span className="text-xs text-muted" aria-live="polite">
              {saved === 'saving' ? 'Salvando…' : saved === 'saved' ? 'Salvo' : ''}
            </span>
          </div>
          <Textarea
            id="notes"
            className="mt-2 min-h-44 font-mono text-[13px]"
            placeholder={
              'Ideia-chave, complexidade, armadilhas...\nEx.: hash map valor → índice; O(n) tempo e espaço.'
            }
            value={notes}
            maxLength={20_000}
            onChange={(e) => onNotesChange(e.target.value)}
            onBlur={() => saveNotes(notes)}
          />
          <p className="mt-1.5 text-xs text-muted">
            As notas aparecem na revisão. Escreva o que você gostaria de lembrar.
          </p>
        </section>
      </div>
    </Drawer>
  );
}
