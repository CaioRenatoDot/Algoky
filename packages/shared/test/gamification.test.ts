import { describe, expect, it } from 'vitest';
import { computeStreak, focusXp, levelFromXp, xpForLevel } from '../src/gamification.ts';

describe('níveis', () => {
  it('segue a curva triangular', () => {
    expect([1, 2, 3, 4, 5].map(xpForLevel)).toEqual([0, 100, 300, 600, 1000]);
  });

  it('calcula nível e progresso a partir do XP', () => {
    expect(levelFromXp(0)).toMatchObject({ level: 1, title: 'Iniciante', progress: 0 });
    expect(levelFromXp(100)).toMatchObject({ level: 2, currentLevelXp: 100, nextLevelXp: 300 });
    expect(levelFromXp(200).progress).toBeCloseTo(0.5);
    expect(levelFromXp(1000)).toMatchObject({ level: 5, title: 'Explorador' });
  });

  it('XP de foco é proporcional e limitado', () => {
    expect(focusXp(4)).toBe(0);
    expect(focusXp(25)).toBe(5);
    expect(focusXp(10_000)).toBe(36);
  });
});

describe('streak', () => {
  const today = '2026-11-11';

  it('é zero sem atividade', () => {
    expect(computeStreak([], today)).toEqual({ current: 0, longest: 0, activeToday: false });
  });

  it('conta dias consecutivos terminando hoje', () => {
    const s = computeStreak(['2026-11-09', '2026-11-10', '2026-11-11', '2026-11-11'], today);
    expect(s).toEqual({ current: 3, longest: 3, activeToday: true });
  });

  it('mantém o streak vivo se a última atividade foi ontem', () => {
    expect(computeStreak(['2026-11-09', '2026-11-10'], today)).toMatchObject({
      current: 2,
      activeToday: false,
    });
  });

  it('zera quando houve um dia sem estudo, mas guarda o maior', () => {
    const s = computeStreak(
      ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-09'],
      today,
    );
    expect(s).toEqual({ current: 0, longest: 4, activeToday: false });
  });

  it('ignora datas no futuro', () => {
    expect(computeStreak(['2026-11-12'], today).current).toBe(0);
  });
});
