import {
  PATTERNS,
  PROBLEMS,
  progressByPattern,
  type PatternProgress,
  type ProblemStatus,
} from '@algoky/shared';
import { useMemo } from 'react';
import { useProgress } from './queries.ts';

/** Status por slug e progresso por padrão, derivados do cache de progresso. */
export function useStatuses() {
  const query = useProgress();
  const statuses = useMemo(
    () =>
      new Map<string, ProblemStatus>(
        [...(query.data ?? new Map()).values()].map((p) => [p.slug, p.status]),
      ),
    [query.data],
  );
  const byPattern = useMemo(() => {
    const map = progressByPattern(PROBLEMS, statuses);
    return new Map<string, PatternProgress>(
      PATTERNS.map((p) => [
        p.id,
        map.get(p.id) ?? { pattern: p.id, total: 0, solved: 0, attempted: 0 },
      ]),
    );
  }, [statuses]);
  return { ...query, statuses, byPattern };
}
