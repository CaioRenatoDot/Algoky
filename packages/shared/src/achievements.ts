export interface AchievementStats {
  solvedTotal: number;
  solvedEasy: number;
  solvedMedium: number;
  solvedHard: number;
  longestStreak: number;
  reviewsTotal: number;
  focusMinutesTotal: number;
  /** Padrões com ao menos um problema resolvido. */
  patternsStarted: number;
  /** Padrões com todos os problemas resolvidos. */
  patternsCompleted: number;
  totalPatterns: number;
  level: number;
}

export type AchievementCategory = 'solve' | 'streak' | 'review' | 'focus' | 'mastery';

export interface Achievement {
  code: string;
  name: string;
  description: string;
  category: AchievementCategory;
  /** Nome do ícone (lucide) exibido na interface. */
  icon: string;
  /** Valor atual e alvo, para mostrar progresso de conquistas bloqueadas. */
  progress: (s: AchievementStats) => { current: number; target: number };
}

const target = (pick: (s: AchievementStats) => number, goal: number) => (s: AchievementStats) => ({
  current: Math.min(pick(s), goal),
  target: goal,
});

export const ACHIEVEMENTS: Achievement[] = [
  {
    code: 'first-solve',
    name: 'Primeiro passo',
    description: 'Resolva seu primeiro problema.',
    category: 'solve',
    icon: 'footprints',
    progress: target((s) => s.solvedTotal, 1),
  },
  {
    code: 'solved-10',
    name: 'Aquecendo',
    description: 'Resolva 10 problemas.',
    category: 'solve',
    icon: 'flame',
    progress: target((s) => s.solvedTotal, 10),
  },
  {
    code: 'solved-50',
    name: 'Meio século',
    description: 'Resolva 50 problemas.',
    category: 'solve',
    icon: 'medal',
    progress: target((s) => s.solvedTotal, 50),
  },
  {
    code: 'solved-100',
    name: 'Centurião',
    description: 'Resolva 100 problemas.',
    category: 'solve',
    icon: 'trophy',
    progress: target((s) => s.solvedTotal, 100),
  },
  {
    code: 'first-hard',
    name: 'Destemido',
    description: 'Resolva seu primeiro problema Hard.',
    category: 'solve',
    icon: 'swords',
    progress: target((s) => s.solvedHard, 1),
  },
  {
    code: 'hard-10',
    name: 'Domador de Hards',
    description: 'Resolva 10 problemas Hard.',
    category: 'solve',
    icon: 'crown',
    progress: target((s) => s.solvedHard, 10),
  },
  {
    code: 'streak-3',
    name: 'Constância',
    description: 'Estude 3 dias seguidos.',
    category: 'streak',
    icon: 'calendar-check',
    progress: target((s) => s.longestStreak, 3),
  },
  {
    code: 'streak-7',
    name: 'Semana perfeita',
    description: 'Estude 7 dias seguidos.',
    category: 'streak',
    icon: 'calendar-range',
    progress: target((s) => s.longestStreak, 7),
  },
  {
    code: 'streak-30',
    name: 'Hábito formado',
    description: 'Estude 30 dias seguidos.',
    category: 'streak',
    icon: 'zap',
    progress: target((s) => s.longestStreak, 30),
  },
  {
    code: 'streak-100',
    name: 'Imparável',
    description: 'Estude 100 dias seguidos.',
    category: 'streak',
    icon: 'rocket',
    progress: target((s) => s.longestStreak, 100),
  },
  {
    code: 'reviews-10',
    name: 'Memória fresca',
    description: 'Faça 10 revisões.',
    category: 'review',
    icon: 'brain',
    progress: target((s) => s.reviewsTotal, 10),
  },
  {
    code: 'reviews-100',
    name: 'Memória de elefante',
    description: 'Faça 100 revisões.',
    category: 'review',
    icon: 'library',
    progress: target((s) => s.reviewsTotal, 100),
  },
  {
    code: 'focus-60',
    name: 'Foco total',
    description: 'Acumule 1 hora em sessões de foco.',
    category: 'focus',
    icon: 'timer',
    progress: target((s) => s.focusMinutesTotal, 60),
  },
  {
    code: 'focus-600',
    name: 'Monge',
    description: 'Acumule 10 horas em sessões de foco.',
    category: 'focus',
    icon: 'hourglass',
    progress: target((s) => s.focusMinutesTotal, 600),
  },
  {
    code: 'pattern-master',
    name: 'Padrão dominado',
    description: 'Resolva todos os problemas de um padrão.',
    category: 'mastery',
    icon: 'badge-check',
    progress: target((s) => s.patternsCompleted, 1),
  },
  {
    code: 'explorer',
    name: 'Explorador',
    description: 'Resolva ao menos um problema de cada padrão.',
    category: 'mastery',
    icon: 'compass',
    progress: (s) => ({
      current: Math.min(s.patternsStarted, s.totalPatterns),
      target: s.totalPatterns,
    }),
  },
  {
    code: 'level-5',
    name: 'Subindo de nível',
    description: 'Alcance o nível 5.',
    category: 'mastery',
    icon: 'trending-up',
    progress: target((s) => s.level, 5),
  },
  {
    code: 'level-10',
    name: 'Estrategista',
    description: 'Alcance o nível 10.',
    category: 'mastery',
    icon: 'gem',
    progress: target((s) => s.level, 10),
  },
];

export function isUnlocked(a: Achievement, stats: AchievementStats): boolean {
  const { current, target: goal } = a.progress(stats);
  return goal > 0 && current >= goal;
}

export function unlockedAchievements(stats: AchievementStats): string[] {
  return ACHIEVEMENTS.filter((a) => isUnlocked(a, stats)).map((a) => a.code);
}
