import type { Difficulty, ProblemStatus } from '@algoky/shared';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { DIFFICULTY_LABEL } from '../../lib/format.ts';

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
        className,
      )}
    >
      {children}
    </span>
  );
}

const difficultyClass: Record<Difficulty, string> = {
  easy: 'bg-easy/12 text-easy-text',
  medium: 'bg-medium/14 text-medium-text',
  hard: 'bg-hard/12 text-hard-text',
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return <Badge className={difficultyClass[difficulty]}>{DIFFICULTY_LABEL[difficulty]}</Badge>;
}

const statusMeta: Record<ProblemStatus, { label: string; className: string }> = {
  todo: { label: 'A fazer', className: 'bg-surface-2 text-muted' },
  attempted: { label: 'Tentado', className: 'bg-warning-soft text-warning' },
  solved: { label: 'Resolvido', className: 'bg-success-soft text-success' },
};

export function StatusBadge({ status }: { status: ProblemStatus }) {
  const meta = statusMeta[status];
  return <Badge className={meta.className}>{meta.label}</Badge>;
}
