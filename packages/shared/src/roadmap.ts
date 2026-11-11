import type { Difficulty, Pattern, Problem, ProblemStatus } from './types.ts';

const DIFFICULTY_RANK: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 };

/** Ordena problemas na sequência da trilha: padrão → essenciais → dificuldade → número. */
export function roadmapOrder(problems: Problem[], patterns: Pattern[]): Problem[] {
  const patternOrder = new Map(patterns.map((p) => [p.id, p.order]));
  return [...problems].sort(
    (a, b) =>
      (patternOrder.get(a.pattern) ?? 999) - (patternOrder.get(b.pattern) ?? 999) ||
      Number(!!b.essential) - Number(!!a.essential) ||
      DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty] ||
      a.id - b.id,
  );
}

/**
 * Sugere o próximo problema: primeiro retoma algo tentado e não resolvido,
 * depois segue a trilha pelo primeiro problema ainda não feito.
 */
export function suggestNextProblem(
  problems: Problem[],
  patterns: Pattern[],
  statuses: ReadonlyMap<string, ProblemStatus>,
): Problem | undefined {
  const ordered = roadmapOrder(problems, patterns);
  return (
    ordered.find((p) => statuses.get(p.slug) === 'attempted') ??
    ordered.find((p) => (statuses.get(p.slug) ?? 'todo') === 'todo')
  );
}

export interface PatternProgress {
  pattern: string;
  total: number;
  solved: number;
  attempted: number;
}

export function progressByPattern(
  problems: Problem[],
  statuses: ReadonlyMap<string, ProblemStatus>,
): Map<string, PatternProgress> {
  const out = new Map<string, PatternProgress>();
  for (const p of problems) {
    const entry = out.get(p.pattern) ?? { pattern: p.pattern, total: 0, solved: 0, attempted: 0 };
    entry.total++;
    const status = statuses.get(p.slug);
    if (status === 'solved') entry.solved++;
    else if (status === 'attempted') entry.attempted++;
    out.set(p.pattern, entry);
  }
  return out;
}
