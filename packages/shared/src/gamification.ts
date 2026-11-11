import { addDays, diffDays } from './dates.ts';
import type { Difficulty, LocalDate } from './types.ts';

/** XP concedido na primeira vez que um problema é resolvido. */
export const SOLVE_XP: Record<Difficulty, number> = { easy: 10, medium: 20, hard: 40 };
export const REVIEW_XP = 5;
/** XP por bloco de minutos de foco. */
export const FOCUS_XP_PER_BLOCK = 1;
export const FOCUS_BLOCK_MINUTES = 5;
export const MAX_FOCUS_SESSION_MINUTES = 180;

export function focusXp(minutes: number): number {
  const capped = Math.min(Math.max(0, Math.floor(minutes)), MAX_FOCUS_SESSION_MINUTES);
  return Math.floor(capped / FOCUS_BLOCK_MINUTES) * FOCUS_XP_PER_BLOCK;
}

/**
 * XP acumulado necessário para alcançar o nível `level`.
 * Curva triangular: nível 2 = 100, 3 = 300, 4 = 600, 5 = 1000...
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return (100 * (level - 1) * level) / 2;
}

export interface LevelInfo {
  level: number;
  title: string;
  xp: number;
  /** XP acumulado no início do nível atual. */
  currentLevelXp: number;
  /** XP acumulado necessário para o próximo nível. */
  nextLevelXp: number;
  /** Progresso no nível atual, de 0 a 1. */
  progress: number;
}

const LEVEL_TITLES: Array<[minLevel: number, title: string]> = [
  [1, 'Iniciante'],
  [3, 'Aprendiz'],
  [5, 'Explorador'],
  [7, 'Solucionador'],
  [10, 'Estrategista'],
  [13, 'Algoritmista'],
  [16, 'Mestre'],
  [20, 'Lenda'],
];

export function levelTitle(level: number): string {
  let title = LEVEL_TITLES[0]![1];
  for (const [min, t] of LEVEL_TITLES) if (level >= min) title = t;
  return title;
}

export function levelFromXp(xp: number): LevelInfo {
  const safeXp = Math.max(0, Math.floor(xp));
  let level = 1;
  while (xpForLevel(level + 1) <= safeXp) level++;
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  return {
    level,
    title: levelTitle(level),
    xp: safeXp,
    currentLevelXp,
    nextLevelXp,
    progress: (safeXp - currentLevelXp) / (nextLevelXp - currentLevelXp),
  };
}

export interface StreakInfo {
  current: number;
  longest: number;
  /** Se já houve atividade hoje. */
  activeToday: boolean;
}

/**
 * Calcula a sequência de dias com atividade.
 * A sequência atual continua viva se a última atividade foi hoje ou ontem,
 * para que o usuário não "perca" o streak antes de estudar no dia.
 */
export function computeStreak(activeDates: Iterable<LocalDate>, today: LocalDate): StreakInfo {
  const unique = [...new Set(activeDates)].filter((d) => d <= today).sort();
  if (unique.length === 0) return { current: 0, longest: 0, activeToday: false };

  let longest = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i++) {
    run = diffDays(unique[i - 1]!, unique[i]!) === 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  const set = new Set(unique);
  const activeToday = set.has(today);
  let cursor = activeToday ? today : addDays(today, -1);
  let current = 0;
  while (set.has(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }

  return { current, longest, activeToday };
}
