import { clsx } from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import {
  binarySearchSteps,
  slidingWindowSteps,
  twoPointerSteps,
  type CellTone,
  type VizResult,
} from '../../components/visualizer/steps.ts';

const TONE: Record<CellTone, string> = {
  default: 'border-border bg-surface',
  window: 'border-accent/50 bg-accent-soft',
  dim: 'border-border bg-surface-2 text-subtle opacity-50',
  found: 'border-success bg-success-soft text-success font-semibold',
  active: 'border-accent bg-accent text-accent-fg font-semibold',
};

interface Demo {
  title: string;
  result: VizResult;
}

const STEP_MS = 1700;

/**
 * Mini visualizador em loop: percorre os passos de um padrão e, ao terminar,
 * troca para o próximo com uma transição. Mostra o tipo de explicação do
 * Algoky em vez de só descrevê-la.
 */
export function AuthShowcase() {
  const demos = useMemo<Demo[]>(
    () => [
      {
        title: 'Two Pointers · par com soma 14',
        result: twoPointerSteps([1, 3, 4, 6, 8, 11, 15], 14),
      },
      {
        title: 'Sliding Window · maior substring sem repetição',
        result: slidingWindowSteps('abcabcb'),
      },
      {
        title: 'Binary Search · buscar 23',
        result: binarySearchSteps([2, 5, 8, 12, 16, 23, 38], 23),
      },
    ],
    [],
  );
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [demoIndex, setDemoIndex] = useState(0);
  const [step, setStep] = useState(0);

  const demo = demos[demoIndex]!;
  const last = demo.result.steps.length - 1;

  useEffect(() => {
    if (reduced) return;
    // Um tique extra de pausa no último passo antes de trocar de padrão.
    const id = setTimeout(() => {
      if (step <= last) setStep((s) => s + 1);
      else {
        setDemoIndex((d) => (d + 1) % demos.length);
        setStep(0);
      }
    }, STEP_MS);
    return () => clearTimeout(id);
  }, [step, last, reduced, demos.length]);

  const current = demo.result.steps[Math.min(step, last)]!;

  return (
    <figure
      className="relative rounded-2xl border border-border bg-surface p-5 shadow-card"
      aria-label="Exemplos animados de padrões"
    >
      <figcaption className="flex items-center justify-between gap-3 text-xs">
        <span key={demo.title} className="animate-fade-up truncate font-medium text-text">
          {demo.title}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          {demos.map((d, i) => (
            <button
              key={d.title}
              type="button"
              onClick={() => {
                setDemoIndex(i);
                setStep(0);
              }}
              aria-label={`Mostrar ${d.title}`}
              aria-pressed={i === demoIndex}
              className={clsx(
                'h-1.5 rounded-full transition-all duration-300',
                i === demoIndex ? 'w-4 bg-text' : 'w-1.5 bg-border-strong hover:bg-muted',
              )}
            />
          ))}
        </span>
      </figcaption>

      <div key={demoIndex} className="animate-swap">
        <div className="mt-5 flex justify-center gap-1.5 pt-5">
          {demo.result.cells.map((c, i) => (
            <div key={i} className="relative">
              <div className="absolute -top-5 left-1/2 flex -translate-x-1/2 gap-0.5">
                {current.pointers[i]?.map((p) => (
                  <span
                    key={p}
                    className="animate-pop rounded bg-text px-1 font-mono text-[9px] font-semibold leading-4 text-bg"
                  >
                    {p}
                  </span>
                ))}
              </div>
              <div
                className={clsx(
                  'grid h-9 w-9 place-items-center rounded-md border font-mono text-sm transition-all duration-500',
                  TONE[current.tones[i] ?? 'default'],
                )}
              >
                {c}
              </div>
            </div>
          ))}
        </div>
        <p
          key={step}
          className="mt-4 min-h-10 animate-fade-up rounded-lg bg-surface-2 px-3 py-2 text-xs leading-relaxed text-muted"
        >
          {current.message}
        </p>
      </div>
    </figure>
  );
}
