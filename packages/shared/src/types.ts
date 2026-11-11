export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const PROBLEM_STATUSES = ['todo', 'attempted', 'solved'] as const;
export type ProblemStatus = (typeof PROBLEM_STATUSES)[number];

export const REVIEW_RATINGS = ['again', 'hard', 'good', 'easy'] as const;
export type ReviewRating = (typeof REVIEW_RATINGS)[number];

export const TEMPLATE_LANGUAGES = ['python', 'typescript', 'java'] as const;
export type TemplateLanguage = (typeof TEMPLATE_LANGUAGES)[number];

export const ACTIVITY_TYPES = ['solve', 'attempt', 'review', 'focus'] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

/** Data local no formato ISO `YYYY-MM-DD`. */
export type LocalDate = string;

export interface Problem {
  /** Slug do problema no LeetCode (também é o id interno). */
  slug: string;
  /** Número do problema no LeetCode. */
  id: number;
  title: string;
  difficulty: Difficulty;
  /** Padrão principal ao qual o problema pertence na trilha. */
  pattern: string;
  /** Problemas marcados como essenciais formam o núcleo da trilha. */
  essential?: boolean;
}

export interface PatternSignal {
  /** Frase curta que indica quando o padrão costuma ser a solução. */
  text: string;
}

export interface Pattern {
  id: string;
  name: string;
  /** Ordem sugerida de estudo (1 = primeiro). */
  order: number;
  /** Frase de uma linha exibida em cards. */
  tagline: string;
  /** Explicação em parágrafos (texto simples). */
  description: string[];
  signals: string[];
  complexity: { time: string; space: string };
  pitfalls: string[];
  templates: Record<TemplateLanguage, string>;
  /** Padrões recomendados antes deste. */
  prerequisites: string[];
  /** Visualizador interativo disponível para o padrão, se houver. */
  visualizer?: 'two-pointers' | 'sliding-window' | 'binary-search';
}

export interface ReviewCard {
  ease: number;
  intervalDays: number;
  repetitions: number;
  dueDate: LocalDate;
}
