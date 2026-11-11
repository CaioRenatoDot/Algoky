/**
 * Contratos HTTP entre API e frontend. A API produz e o frontend consome
 * estes tipos; mantê-los aqui evita que os dois lados divirjam.
 */
import type { LevelInfo, StreakInfo } from './gamification.ts';
import type { PatternProgress } from './roadmap.ts';
import type {
  ActivityType,
  LocalDate,
  ProblemStatus,
  ReviewCard,
  TemplateLanguage,
} from './types.ts';

export interface User {
  id: number;
  username: string;
  displayName: string;
  timezone: string;
  dailyGoal: number;
  preferredLanguage: TemplateLanguage;
  leetcodeUsername: string | null;
  createdAt: string;
}

export interface ReviewCardDto extends ReviewCard {
  lastReviewedAt: string | null;
}

export interface ProblemState {
  slug: string;
  status: ProblemStatus;
  notes: string;
  confidence: number | null;
  starred: boolean;
  /** Rascunho de solução escrito na área de trabalho. */
  code: string;
  codeLanguage: TemplateLanguage | null;
  firstSolvedAt: string | null;
  updatedAt: string;
  review: ReviewCardDto | null;
}

export interface DueReview {
  slug: string;
  card: ReviewCardDto;
  notes: string;
  /** Dias de atraso (0 = vence hoje). */
  overdueDays: number;
}

export interface FocusSession {
  minutes: number;
  slug: string | null;
  localDate: LocalDate;
}

export interface HeatmapDay {
  date: LocalDate;
  count: number;
  xp: number;
}

export interface ActivityEntry {
  type: ActivityType;
  slug: string | null;
  xp: number;
  minutes: number;
  detail: string | null;
  createdAt: string;
}

export interface AchievementProgress {
  code: string;
  unlockedAt: string | null;
  current: number;
  target: number;
}

export interface Totals {
  solved: number;
  attempted: number;
  easy: number;
  medium: number;
  hard: number;
  reviews: number;
  focusMinutes: number;
  totalProblems: number;
}

export interface Dashboard {
  today: LocalDate;
  level: LevelInfo;
  streak: StreakInfo;
  dailyGoal: { target: number; done: number; focusMinutes: number };
  totals: Totals;
  byPattern: PatternProgress[];
  heatmap: HeatmapDay[];
  reviewsDue: number;
  suggestion: string | null;
  recent: ActivityEntry[];
  achievements: AchievementProgress[];
}

/** Envelope devolvido por toda mutação de estudo. */
export interface MutationResponse<T> {
  data: T;
  xpGained: number;
  newAchievements: string[];
  level: LevelInfo;
  streak: StreakInfo;
}

export interface ApiErrorBody {
  error: { code: string; message: string };
}
