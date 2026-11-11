import { clsx } from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { twoPointerSteps, type CellTone } from '../../components/visualizer/steps.ts';

const TONE: Record<CellTone, string> = {
  default: 'border-border bg-surface',
  window: 'border-accent/50 bg-accent-soft',
  dim: 'border-border bg-surface-2 text-subtle opacity-50',
  found: 'border-success bg-success-soft text-success font-semibold',
  active: 'border-accent bg-accent text-accent-fg font-semibold',
};

/** Mini visualizador em loop: mostra o tipo de explicação que o Algoky dá, em vez de só descrevê-la. */
export function AuthShowcase() {
  const { cells, steps } = useMemo(() => twoPointerSteps([1, 3, 4, 6, 8, 11, 15], 14), []);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setStep((s) => (s + 1) % (steps.length + 1)), 1800);
    return () => clearInterval(id);
  }, [steps.length]);

  // Um passo extra de pausa no estado final antes de recomeçar.
  const current = steps[Math.min(step, steps.length - 1)]!;

  return (
    <figure
      className="relative rounded-2xl border border-border bg-surface p-5 shadow-card"
      aria-label="Exemplo animado do padrão Two Pointers"
    >
      <figcaption className="flex items-center justify-between text-xs">
        <span className="font-medium text-text">Two Pointers · par com soma 14</span>
        <span className="font-mono text-subtle">
          {Math.min(step, steps.length - 1) + 1}/{steps.length}
        </span>
      </figcaption>
      <div className="mt-5 flex justify-center gap-1.5 pt-5">
        {cells.map((c, i) => (
          <div key={i} className="relative">
            <div className="absolute -top-5 left-1/2 flex -translate-x-1/2 gap-0.5">
              {current.pointers[i]?.map((p) => (
                <span
                  key={p}
                  className="rounded bg-text px-1 font-mono text-[9px] font-semibold leading-4 text-bg"
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
        className="mt-4 min-h-10 rounded-lg bg-surface-2 px-3 py-2 text-xs leading-relaxed text-muted"
        aria-live="off"
      >
        {current.message}
      </p>
    </figure>
  );
}
