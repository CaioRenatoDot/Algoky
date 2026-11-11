import { PATTERNS, PROBLEMS, type Pattern } from '@algoky/shared';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';
import { Link } from 'react-router';
import { useMe } from '../lib/queries.ts';
import { useStatuses } from '../lib/useStatuses.ts';

/** Partes da trilha, como capítulos de um livro. */
export const PARTS: Array<{ title: string; description: string; from: number; to: number }> = [
  {
    title: 'Parte I · Fundamentos',
    description: 'Arrays, strings e as técnicas que aparecem em quase tudo.',
    from: 1,
    to: 7,
  },
  {
    title: 'Parte II · Estruturas e buscas',
    description: 'Árvores, heaps, grafos e como percorrê-los.',
    from: 8,
    to: 16,
  },
  {
    title: 'Parte III · Otimização',
    description: 'Escolhas gulosas, programação dinâmica e truques de baixo nível.',
    from: 17,
    to: 21,
  },
];

export const patternsOfPart = (from: number, to: number) =>
  PATTERNS.filter((p) => p.order >= from && p.order <= to);
export const problemCount = (id: string) => PROBLEMS.filter((p) => p.pattern === id).length;

/** Sumário da trilha: usado na home, no índice /padroes e na lateral das páginas de estudo. */
export function PatternToc({
  currentId,
  compact = false,
  linkBase = '/padroes',
}: {
  currentId?: string;
  compact?: boolean;
  linkBase?: string;
}) {
  const { data: me } = useMe();
  const { byPattern } = useStatuses(!!me);

  const row = (p: Pattern) => {
    const prog = byPattern.get(p.id);
    const done = !!me && !!prog && prog.total > 0 && prog.solved === prog.total;
    const active = p.id === currentId;
    if (compact) {
      return (
        <li key={p.id}>
          <Link
            to={`${linkBase}/${p.id}`}
            aria-current={active ? 'page' : undefined}
            className={clsx(
              'flex items-baseline gap-2.5 rounded-md px-2 py-1.5 text-sm',
              active ? 'bg-surface-2 font-medium text-text' : 'text-muted hover:text-text',
            )}
          >
            <span className="w-5 shrink-0 font-mono text-xs text-subtle">
              {String(p.order).padStart(2, '0')}
            </span>
            <span className="min-w-0 flex-1 leading-snug">{p.name}</span>
            {done && <Check className="h-3.5 w-3.5 shrink-0 text-success" aria-label="Completo" />}
          </Link>
        </li>
      );
    }
    return (
      <li key={p.id}>
        <Link to={`${linkBase}/${p.id}`} className="group flex items-baseline gap-4 py-3.5">
          <span className="w-7 shrink-0 font-mono text-sm text-subtle">
            {String(p.order).padStart(2, '0')}
          </span>
          <span className="min-w-0 flex-1">
            <span className="font-medium group-hover:text-accent group-hover:underline group-hover:underline-offset-4">
              {p.name}
            </span>
            <span className="mt-0.5 block text-sm text-muted">{p.tagline}</span>
          </span>
          <span className="hidden shrink-0 text-xs text-muted tabular-nums sm:block">
            {me && prog
              ? `${prog.solved}/${prog.total} resolvidos`
              : `${problemCount(p.id)} problemas`}
          </span>
          {done && (
            <Check className="h-4 w-4 shrink-0 self-center text-success" aria-label="Completo" />
          )}
        </Link>
      </li>
    );
  };

  return (
    <div className={compact ? 'space-y-5' : 'space-y-12'}>
      {PARTS.map((part) => (
        <section key={part.title}>
          <h3
            className={
              compact
                ? 'mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-subtle'
                : 'text-sm font-semibold uppercase tracking-wide text-muted'
            }
          >
            {compact ? part.title.split(' · ')[1] : part.title}
          </h3>
          {!compact && <p className="mt-1 text-sm text-muted">{part.description}</p>}
          <ol
            className={
              compact ? 'space-y-0.5' : 'mt-3 divide-y divide-border border-y border-border'
            }
          >
            {patternsOfPart(part.from, part.to).map(row)}
          </ol>
        </section>
      ))}
    </div>
  );
}
