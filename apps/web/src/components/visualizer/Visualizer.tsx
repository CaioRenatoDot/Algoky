import type { Pattern } from '@algoky/shared';
import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Field.tsx';
import {
  binarySearchSteps,
  parseNumbers,
  slidingWindowSteps,
  twoPointerSteps,
  type CellTone,
  type VizResult,
} from './steps.ts';

type Kind = NonNullable<Pattern['visualizer']>;

const DEFAULTS: Record<Kind, { array: string; target: string; title: string }> = {
  'two-pointers': { array: '1, 3, 4, 6, 8, 11, 15', target: '14', title: 'Par com soma alvo' },
  'sliding-window': { array: 'abcabcbb', target: '', title: 'Maior substring sem repetição' },
  'binary-search': {
    array: '2, 5, 8, 12, 16, 23, 38, 56, 72, 91',
    target: '23',
    title: 'Buscar um valor',
  },
};

const TONE: Record<CellTone, string> = {
  default: 'border-border bg-surface',
  window: 'border-accent/50 bg-accent-soft',
  dim: 'border-border bg-surface-2 text-subtle opacity-50',
  found: 'border-success bg-success-soft text-success font-semibold',
  active: 'border-accent bg-accent text-accent-fg font-semibold',
};

function compute(kind: Kind, array: string, target: string): VizResult {
  if (kind === 'sliding-window') return slidingWindowSteps(array.slice(0, 16));
  const nums = parseNumbers(array);
  const t = Number(target) || 0;
  return kind === 'two-pointers' ? twoPointerSteps(nums, t) : binarySearchSteps(nums, t);
}

export function Visualizer({ kind }: { kind: Kind }) {
  const d = DEFAULTS[kind];
  const [array, setArray] = useState(d.array);
  const [target, setTarget] = useState(d.target);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const result = useMemo(() => compute(kind, array, target), [kind, array, target]);
  const last = result.steps.length - 1;
  const current = result.steps[Math.min(step, last)]!;

  // "Tocando" é derivado: a animação para sozinha ao chegar no último passo.
  const isPlaying = playing && step < last;
  useEffect(() => {
    if (!isPlaying) return;
    const id = setTimeout(() => setStep((s) => s + 1), 1100);
    return () => clearTimeout(id);
  }, [isPlaying, step]);

  const restartWith = (update: () => void) => {
    update();
    setStep(0);
    setPlaying(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') setStep((s) => Math.min(last, s + 1));
    if (e.key === 'ArrowLeft') setStep((s) => Math.max(0, s - 1));
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-5" onKeyDown={onKey}>
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-0 flex-1 text-sm">
          <span className="mb-1.5 block font-medium">
            {kind === 'sliding-window' ? 'String' : 'Array'}
          </span>
          <Input
            value={array}
            onChange={(e) => restartWith(() => setArray(e.target.value))}
            className="font-mono"
            aria-label="Entrada"
          />
        </label>
        {kind !== 'sliding-window' && (
          <label className="w-28 text-sm">
            <span className="mb-1.5 block font-medium">Alvo</span>
            <Input
              value={target}
              onChange={(e) => restartWith(() => setTarget(e.target.value))}
              inputMode="numeric"
              className="font-mono"
              aria-label="Alvo"
            />
          </label>
        )}
      </div>

      <div className="mt-6 overflow-x-auto pb-2">
        <div className="mx-auto flex w-max gap-1.5 px-1 pt-7">
          {result.cells.map((c, i) => (
            <div key={i} className="relative flex flex-col items-center">
              <div className="absolute -top-6 flex gap-0.5">
                {current.pointers[i]?.map((p) => (
                  <span
                    key={p}
                    className="rounded bg-text px-1 font-mono text-[10px] font-semibold text-bg"
                  >
                    {p}
                  </span>
                ))}
              </div>
              <div
                className={clsx(
                  'grid h-11 w-11 place-items-center rounded-lg border font-mono text-sm transition-all duration-300',
                  TONE[current.tones[i] ?? 'default'],
                )}
              >
                {c}
              </div>
              <span className="mt-1 font-mono text-[10px] text-subtle">{i}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 min-h-[4.5rem] rounded-xl bg-surface-2 px-4 py-3" aria-live="polite">
        <p className="text-sm">{current.message}</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted">
          {current.facts.map(([k, v]) => (
            <span key={k}>
              {k}: <span className="text-text">{v}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setPlaying(false);
              setStep(0);
            }}
            aria-label="Reiniciar"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            aria-label="Passo anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (step >= last) setStep(0);
              setPlaying(step >= last ? true : !isPlaying);
            }}
            className="w-24"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? 'Pausar' : step >= last ? 'De novo' : 'Animar'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setStep((s) => Math.min(last, s + 1))}
            disabled={step >= last}
            aria-label="Próximo passo"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <span className="text-xs text-muted tabular-nums">
          Passo {Math.min(step, last) + 1} de {last + 1} · use ← →
        </span>
      </div>
    </div>
  );
}

export const VISUALIZER_TITLE: Record<Kind, string> = Object.fromEntries(
  Object.entries(DEFAULTS).map(([k, v]) => [k, v.title]),
) as Record<Kind, string>;
