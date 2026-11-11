import {
  ACHIEVEMENTS,
  PATTERNS,
  PROBLEMS,
  PROBLEMS_BY_SLUG,
  addDays,
  computeStreak,
  levelFromXp,
  progressByPattern,
  suggestNextProblem,
  toLocalDate,
  unlockedAchievements,
  type AchievementStats,
  type ActivityType,
  type LevelInfo,
  type LocalDate,
  type PatternProgress,
  type ProblemStatus,
  type StreakInfo,
} from '@algoky/shared';
import type { Database } from '../db/database.ts';
import type { User } from './users.ts';

export const HEATMAP_DAYS = 371; // 53 semanas

interface Core {
  today: LocalDate;
  statuses: Map<string, ProblemStatus>;
  xp: number;
  level: LevelInfo;
  streak: StreakInfo;
  byPattern: Map<string, PatternProgress>;
  achievementStats: AchievementStats;
  totals: {
    solved: number;
    attempted: number;
    easy: number;
    medium: number;
    hard: number;
    reviews: number;
    focusMinutes: number;
    totalProblems: number;
  };
}

function gatherCore(db: Database, user: User, now: Date): Core {
  const today = toLocalDate(now, user.timezone);
  const rows = db
    .prepare('SELECT slug, status FROM user_problems WHERE user_id = ?')
    .all(user.id) as Array<{
    slug: string;
    status: ProblemStatus;
  }>;
  const statuses = new Map(
    rows.filter((r) => PROBLEMS_BY_SLUG.has(r.slug)).map((r) => [r.slug, r.status]),
  );

  const solvedBy = { easy: 0, medium: 0, hard: 0 };
  let attempted = 0;
  for (const [slug, status] of statuses) {
    if (status === 'solved') solvedBy[PROBLEMS_BY_SLUG.get(slug)!.difficulty]++;
    else if (status === 'attempted') attempted++;
  }
  const solved = solvedBy.easy + solvedBy.medium + solvedBy.hard;

  const agg = db
    .prepare(
      `SELECT COALESCE(SUM(xp), 0) AS xp,
              COALESCE(SUM(type = 'review'), 0) AS reviews,
              COALESCE(SUM(CASE WHEN type = 'focus' THEN minutes END), 0) AS focus
       FROM activity WHERE user_id = ?`,
    )
    .get(user.id) as { xp: number; reviews: number; focus: number };

  const dates = (
    db
      .prepare('SELECT DISTINCT local_date AS d FROM activity WHERE user_id = ?')
      .all(user.id) as Array<{ d: string }>
  ).map((r) => r.d);

  const level = levelFromXp(agg.xp);
  const streak = computeStreak(dates, today);
  const byPattern = progressByPattern(PROBLEMS, statuses);
  const patternValues = [...byPattern.values()];

  return {
    today,
    statuses,
    xp: agg.xp,
    level,
    streak,
    byPattern,
    totals: {
      solved,
      attempted,
      ...solvedBy,
      reviews: agg.reviews,
      focusMinutes: agg.focus,
      totalProblems: PROBLEMS.length,
    },
    achievementStats: {
      solvedTotal: solved,
      solvedEasy: solvedBy.easy,
      solvedMedium: solvedBy.medium,
      solvedHard: solvedBy.hard,
      longestStreak: streak.longest,
      reviewsTotal: agg.reviews,
      focusMinutesTotal: agg.focus,
      patternsStarted: patternValues.filter((p) => p.solved > 0).length,
      patternsCompleted: patternValues.filter((p) => p.solved === p.total).length,
      totalPatterns: PATTERNS.length,
      level: level.level,
    },
  };
}

/**
 * Persiste conquistas recém-desbloqueadas e devolve seus códigos.
 * Conquistas nunca são revogadas, mesmo que o progresso diminua.
 */
export function syncAchievements(db: Database, user: User, now = new Date()): string[] {
  const { achievementStats } = gatherCore(db, user, now);
  const unlocked = unlockedAchievements(achievementStats);
  const insert = db.prepare(
    'INSERT OR IGNORE INTO achievements (user_id, code, unlocked_at) VALUES (?, ?, ?)',
  );
  return unlocked.filter(
    (code) => Number(insert.run(user.id, code, now.toISOString()).changes) > 0,
  );
}

export interface HeatmapDay {
  date: LocalDate;
  count: number;
  xp: number;
}

export interface Dashboard {
  today: LocalDate;
  level: LevelInfo;
  streak: StreakInfo;
  dailyGoal: { target: number; done: number; focusMinutes: number };
  totals: Core['totals'];
  byPattern: PatternProgress[];
  heatmap: HeatmapDay[];
  reviewsDue: number;
  suggestion: string | null;
  recent: Array<{
    type: ActivityType;
    slug: string | null;
    xp: number;
    minutes: number;
    detail: string | null;
    createdAt: string;
  }>;
  achievements: Array<{ code: string; unlockedAt: string | null; current: number; target: number }>;
}

export function dashboard(db: Database, user: User, now = new Date()): Dashboard {
  const core = gatherCore(db, user, now);
  const { today } = core;

  const todayAgg = db
    .prepare(
      `SELECT COALESCE(SUM(type IN ('solve', 'review')), 0) AS done,
              COALESCE(SUM(CASE WHEN type = 'focus' THEN minutes END), 0) AS focus
       FROM activity WHERE user_id = ? AND local_date = ?`,
    )
    .get(user.id, today) as { done: number; focus: number };

  const heatmap = db
    .prepare(
      `SELECT local_date AS date, COUNT(*) AS count, SUM(xp) AS xp FROM activity
       WHERE user_id = ? AND local_date >= ? AND local_date <= ?
       GROUP BY local_date ORDER BY local_date`,
    )
    .all(user.id, addDays(today, -(HEATMAP_DAYS - 1)), today) as unknown as HeatmapDay[];

  const { due } = db
    .prepare('SELECT COUNT(*) AS due FROM review_cards WHERE user_id = ? AND due_date <= ?')
    .get(user.id, today) as { due: number };

  const recent = (
    db
      .prepare(
        'SELECT type, slug, xp, minutes, detail, created_at FROM activity WHERE user_id = ? ORDER BY id DESC LIMIT 12',
      )
      .all(user.id) as Array<{
      type: ActivityType;
      slug: string | null;
      xp: number;
      minutes: number;
      detail: string | null;
      created_at: string;
    }>
  ).map(({ created_at, ...r }) => ({ ...r, createdAt: created_at }));

  const unlockedAt = new Map(
    (
      db
        .prepare('SELECT code, unlocked_at FROM achievements WHERE user_id = ?')
        .all(user.id) as Array<{ code: string; unlocked_at: string }>
    ).map((r) => [r.code, r.unlocked_at]),
  );

  return {
    today,
    level: core.level,
    streak: core.streak,
    dailyGoal: { target: user.dailyGoal, done: todayAgg.done, focusMinutes: todayAgg.focus },
    totals: core.totals,
    byPattern: PATTERNS.map(
      (p) => core.byPattern.get(p.id) ?? { pattern: p.id, total: 0, solved: 0, attempted: 0 },
    ),
    heatmap,
    reviewsDue: due,
    suggestion: suggestNextProblem(PROBLEMS, PATTERNS, core.statuses)?.slug ?? null,
    recent,
    achievements: ACHIEVEMENTS.map((a) => ({
      code: a.code,
      unlockedAt: unlockedAt.get(a.code) ?? null,
      ...a.progress(core.achievementStats),
    })),
  };
}

/** Resumo enxuto devolvido junto das mutações, para a UI atualizar XP/nível. */
export function progressSummary(db: Database, user: User, now = new Date()) {
  const core = gatherCore(db, user, now);
  return { level: core.level, streak: core.streak };
}
