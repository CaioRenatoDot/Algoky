import {
  DIFFICULTIES,
  PATTERNS,
  roadmapOrder,
  type Difficulty,
  type Problem,
  type ProblemState,
  type ProblemStatus,
} from '@algoky/shared';

export type SortKey = 'trilha' | 'numero' | 'dificuldade';

export interface ProblemFilters {
  q: string;
  pattern: string;
  difficulties: Difficulty[];
  status: ProblemStatus | '';
  essential: boolean;
  starred: boolean;
  sort: SortKey;
}

export const EMPTY_FILTERS: ProblemFilters = {
  q: '',
  pattern: '',
  difficulties: [],
  status: '',
  essential: false,
  starred: false,
  sort: 'trilha',
};

const DIFF_RANK: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 };

/** Normaliza para busca sem acento e sem caixa. */
const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

export function filterProblems(
  problems: Problem[],
  progress: ReadonlyMap<string, ProblemState> | undefined,
  f: ProblemFilters,
): Problem[] {
  const q = norm(f.q.trim().replace(/^#/, ''));
  const out = problems.filter((p) => {
    const state = progress?.get(p.slug);
    if (q && !(norm(p.title).includes(q) || String(p.id) === q || p.slug.includes(q))) return false;
    if (f.pattern && p.pattern !== f.pattern) return false;
    if (f.difficulties.length && !f.difficulties.includes(p.difficulty)) return false;
    if (f.status && (state?.status ?? 'todo') !== f.status) return false;
    if (f.essential && !p.essential) return false;
    if (f.starred && !state?.starred) return false;
    return true;
  });
  if (f.sort === 'numero') return out.sort((a, b) => a.id - b.id);
  if (f.sort === 'dificuldade')
    return out.sort((a, b) => DIFF_RANK[a.difficulty] - DIFF_RANK[b.difficulty] || a.id - b.id);
  return roadmapOrder(out, PATTERNS);
}

export function filtersFromParams(params: URLSearchParams): ProblemFilters {
  const sort = params.get('ordem');
  const status = params.get('status');
  return {
    q: params.get('q') ?? '',
    pattern: params.get('padrao') ?? '',
    difficulties: (params.get('dif') ?? '')
      .split(',')
      .filter((d): d is Difficulty => (DIFFICULTIES as readonly string[]).includes(d)),
    status: status === 'todo' || status === 'attempted' || status === 'solved' ? status : '',
    essential: params.get('essenciais') === '1',
    starred: params.get('favoritos') === '1',
    sort: sort === 'numero' || sort === 'dificuldade' ? sort : 'trilha',
  };
}

export function filtersToParams(f: ProblemFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q) p.set('q', f.q);
  if (f.pattern) p.set('padrao', f.pattern);
  if (f.difficulties.length) p.set('dif', f.difficulties.join(','));
  if (f.status) p.set('status', f.status);
  if (f.essential) p.set('essenciais', '1');
  if (f.starred) p.set('favoritos', '1');
  if (f.sort !== 'trilha') p.set('ordem', f.sort);
  return p;
}
