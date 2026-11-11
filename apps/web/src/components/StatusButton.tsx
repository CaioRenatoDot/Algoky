import type { ProblemStatus } from '@algoky/shared';
import { clsx } from 'clsx';
import { Check, Circle, CircleDashed } from 'lucide-react';

export const NEXT_STATUS: Record<ProblemStatus, ProblemStatus> = {
  todo: 'attempted',
  attempted: 'solved',
  solved: 'todo',
};

const META: Record<ProblemStatus, { label: string; next: string }> = {
  todo: { label: 'A fazer', next: 'Marcar como tentado' },
  attempted: { label: 'Tentado', next: 'Marcar como resolvido' },
  solved: { label: 'Resolvido', next: 'Voltar para a fazer' },
};

/** Botão que avança o status: a fazer → tentado → resolvido → a fazer. */
export function StatusButton({
  status,
  onChange,
  disabled,
}: {
  status: ProblemStatus;
  onChange: (next: ProblemStatus) => void;
  disabled?: boolean;
}) {
  const meta = META[status];
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange(NEXT_STATUS[status]);
      }}
      title={`${meta.label} · ${meta.next}`}
      aria-label={`${meta.label}. ${meta.next}`}
      className={clsx(
        'grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-all active:scale-90 disabled:opacity-50',
        status === 'solved' && 'border-success bg-success text-white dark:text-black',
        status === 'attempted' && 'border-warning/60 bg-warning-soft text-warning',
        status === 'todo' &&
          'border-border-strong text-transparent hover:border-muted hover:text-subtle',
      )}
    >
      {status === 'solved' ? (
        <Check className="h-4 w-4" strokeWidth={3} />
      ) : status === 'attempted' ? (
        <CircleDashed className="h-4 w-4" strokeWidth={2.5} />
      ) : (
        <Circle className="h-3 w-3" />
      )}
    </button>
  );
}
