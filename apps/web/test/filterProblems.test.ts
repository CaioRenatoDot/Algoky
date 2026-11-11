import { PROBLEMS, type ProblemState } from '@algoky/shared';
import { describe, expect, it } from 'vitest';
import {
  EMPTY_FILTERS,
  filterProblems,
  filtersFromParams,
  filtersToParams,
} from '../src/lib/filterProblems.ts';

const state = (slug: string, patch: Partial<ProblemState>): [string, ProblemState] => [
  slug,
  {
    slug,
    status: 'todo',
    notes: '',
    confidence: null,
    code: '',
    codeLanguage: null,
    starred: false,
    firstSolvedAt: null,
    updatedAt: '',
    review: null,
    ...patch,
  },
];

describe('filterProblems', () => {
  it('sem filtros devolve tudo na ordem da trilha', () => {
    const all = filterProblems(PROBLEMS, undefined, EMPTY_FILTERS);
    expect(all).toHaveLength(PROBLEMS.length);
    expect(all[0]!.pattern).toBe('arrays-hashing');
  });

  it('busca por título sem acento/caixa, por número e com #', () => {
    expect(
      filterProblems(PROBLEMS, undefined, { ...EMPTY_FILTERS, q: 'TWO SUM' }).map((p) => p.slug),
    ).toContain('two-sum');
    expect(
      filterProblems(PROBLEMS, undefined, { ...EMPTY_FILTERS, q: '#15' }).map((p) => p.slug),
    ).toEqual(['3sum']);
  });

  it('combina padrão, dificuldade e essenciais', () => {
    const r = filterProblems(PROBLEMS, undefined, {
      ...EMPTY_FILTERS,
      pattern: 'two-pointers',
      difficulties: ['hard'],
      essential: true,
    });
    expect(r.map((p) => p.slug)).toEqual(['trapping-rain-water']);
  });

  it('filtra por status e favoritos usando o progresso', () => {
    const progress = new Map([
      state('two-sum', { status: 'solved', starred: true }),
      state('3sum', { status: 'attempted' }),
    ]);
    expect(
      filterProblems(PROBLEMS, progress, { ...EMPTY_FILTERS, status: 'solved' }).map((p) => p.slug),
    ).toEqual(['two-sum']);
    expect(
      filterProblems(PROBLEMS, progress, { ...EMPTY_FILTERS, starred: true }).map((p) => p.slug),
    ).toEqual(['two-sum']);
    expect(filterProblems(PROBLEMS, progress, { ...EMPTY_FILTERS, status: 'todo' })).toHaveLength(
      PROBLEMS.length - 2,
    );
  });

  it('ordena por número', () => {
    const r = filterProblems(PROBLEMS, undefined, { ...EMPTY_FILTERS, sort: 'numero' });
    expect(r[0]!.id).toBe(1);
    expect(r.at(-1)!.id).toBeGreaterThan(2000);
  });
});

describe('filtros na URL', () => {
  it('ida e volta preserva os filtros e ignora valores inválidos', () => {
    const f = {
      ...EMPTY_FILTERS,
      q: 'tree',
      pattern: 'trees-dfs',
      difficulties: ['easy' as const],
      status: 'solved' as const,
      starred: true,
      sort: 'numero' as const,
    };
    expect(filtersFromParams(filtersToParams(f))).toEqual(f);
    expect(filtersFromParams(new URLSearchParams('dif=easy,nope&status=x&ordem=y'))).toEqual({
      ...EMPTY_FILTERS,
      difficulties: ['easy'],
    });
  });
});
