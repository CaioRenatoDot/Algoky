import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS, unlockedAchievements, type AchievementStats } from '../src/achievements.ts';
import { progressByPattern, suggestNextProblem } from '../src/roadmap.ts';
import type { Pattern, Problem, ProblemStatus } from '../src/types.ts';

const base: AchievementStats = {
  solvedTotal: 0,
  solvedEasy: 0,
  solvedMedium: 0,
  solvedHard: 0,
  longestStreak: 0,
  reviewsTotal: 0,
  focusMinutesTotal: 0,
  patternsStarted: 0,
  patternsCompleted: 0,
  totalPatterns: 3,
  level: 1,
};

describe('conquistas', () => {
  it('códigos são únicos', () => {
    const codes = ACHIEVEMENTS.map((a) => a.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('nenhuma é desbloqueada sem progresso', () => {
    expect(unlockedAchievements(base)).toEqual([]);
  });

  it('desbloqueia conforme as estatísticas', () => {
    const unlocked = unlockedAchievements({
      ...base,
      solvedTotal: 12,
      solvedHard: 1,
      longestStreak: 7,
      patternsStarted: 3,
    });
    expect(unlocked).toEqual(
      expect.arrayContaining([
        'first-solve',
        'solved-10',
        'first-hard',
        'streak-3',
        'streak-7',
        'explorer',
      ]),
    );
    expect(unlocked).not.toContain('solved-50');
  });
});

const pattern = (id: string, order: number) => ({ id, order }) as Pattern;
const problem = (
  slug: string,
  id: number,
  p: string,
  difficulty: Problem['difficulty'],
  essential = false,
): Problem => ({ slug, id, title: slug, pattern: p, difficulty, essential });

describe('trilha', () => {
  const patterns = [pattern('b', 2), pattern('a', 1)];
  const problems = [
    problem('b-easy', 1, 'b', 'easy'),
    problem('a-hard', 2, 'a', 'hard'),
    problem('a-easy', 3, 'a', 'easy'),
    problem('a-medium-essential', 4, 'a', 'medium', true),
  ];

  it('sugere seguindo ordem do padrão, essenciais e dificuldade', () => {
    expect(suggestNextProblem(problems, patterns, new Map())?.slug).toBe('a-medium-essential');
    const statuses = new Map<string, ProblemStatus>([
      ['a-medium-essential', 'solved'],
      ['a-easy', 'solved'],
    ]);
    expect(suggestNextProblem(problems, patterns, statuses)?.slug).toBe('a-hard');
  });

  it('prioriza retomar problemas tentados', () => {
    const statuses = new Map<string, ProblemStatus>([['b-easy', 'attempted']]);
    expect(suggestNextProblem(problems, patterns, statuses)?.slug).toBe('b-easy');
  });

  it('agrega progresso por padrão', () => {
    const statuses = new Map<string, ProblemStatus>([
      ['a-easy', 'solved'],
      ['a-hard', 'attempted'],
    ]);
    expect(progressByPattern(problems, statuses).get('a')).toEqual({
      pattern: 'a',
      total: 3,
      solved: 1,
      attempted: 1,
    });
  });
});
