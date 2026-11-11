import { ACTIVITY_TYPES, PROBLEM_STATUSES, TEMPLATE_LANGUAGES, isLocalDate } from '@algoky/shared';
import { z } from 'zod';
import { transaction, type Database } from '../db/database.ts';
import type { User } from './users.ts';

export const EXPORT_VERSION = 1;

const localDate = z.string().refine(isLocalDate, 'data inválida (YYYY-MM-DD)');
const isoInstant = z.string().datetime();

export const exportSchema = z.object({
  version: z.literal(EXPORT_VERSION),
  exportedAt: isoInstant,
  settings: z.object({
    displayName: z.string().min(1).max(60),
    timezone: z.string(),
    dailyGoal: z.number().int().min(1).max(20),
    preferredLanguage: z.enum(TEMPLATE_LANGUAGES),
    leetcodeUsername: z.string().max(40).nullable(),
  }),
  problems: z
    .array(
      z.object({
        slug: z.string().max(120),
        status: z.enum(PROBLEM_STATUSES),
        notes: z.string().max(20_000),
        confidence: z.number().int().min(1).max(5).nullable(),
        starred: z.boolean(),
        // Opcionais: backups anteriores à área de trabalho não têm estes campos.
        code: z.string().max(50_000).default(''),
        codeLanguage: z.enum(TEMPLATE_LANGUAGES).nullable().default(null),
        firstSolvedAt: isoInstant.nullable(),
        updatedAt: isoInstant,
      }),
    )
    .max(5_000),
  reviews: z
    .array(
      z.object({
        slug: z.string().max(120),
        ease: z.number().min(1).max(5),
        intervalDays: z.number().int().min(0).max(3650),
        repetitions: z.number().int().min(0),
        dueDate: localDate,
        lastReviewedAt: isoInstant.nullable(),
      }),
    )
    .max(5_000),
  activity: z
    .array(
      z.object({
        type: z.enum(ACTIVITY_TYPES),
        slug: z.string().max(120).nullable(),
        xp: z.number().int().min(0).max(1_000),
        minutes: z.number().int().min(0).max(1_440),
        detail: z.string().max(40).nullable(),
        localDate,
        createdAt: isoInstant,
      }),
    )
    .max(200_000),
  achievements: z.array(z.object({ code: z.string().max(60), unlockedAt: isoInstant })).max(500),
});

export type ExportData = z.infer<typeof exportSchema>;

export function exportUserData(db: Database, user: User, now = new Date()): ExportData {
  const q = <T>(sql: string) => db.prepare(sql).all(user.id) as T[];
  return {
    version: EXPORT_VERSION,
    exportedAt: now.toISOString(),
    settings: {
      displayName: user.displayName,
      timezone: user.timezone,
      dailyGoal: user.dailyGoal,
      preferredLanguage: user.preferredLanguage,
      leetcodeUsername: user.leetcodeUsername,
    },
    problems: q<{
      slug: string;
      status: ExportData['problems'][number]['status'];
      notes: string;
      confidence: number | null;
      starred: number;
      code: string;
      code_language: ExportData['problems'][number]['codeLanguage'];
      first_solved_at: string | null;
      updated_at: string;
    }>(
      'SELECT slug, status, notes, confidence, starred, code, code_language, first_solved_at, updated_at FROM user_problems WHERE user_id = ? ORDER BY slug',
    ).map((r) => ({
      slug: r.slug,
      status: r.status,
      notes: r.notes,
      confidence: r.confidence,
      starred: r.starred === 1,
      code: r.code,
      codeLanguage: r.code_language,
      firstSolvedAt: r.first_solved_at,
      updatedAt: r.updated_at,
    })),
    reviews: q<{
      slug: string;
      ease: number;
      interval_days: number;
      repetitions: number;
      due_date: string;
      last_reviewed_at: string | null;
    }>(
      'SELECT slug, ease, interval_days, repetitions, due_date, last_reviewed_at FROM review_cards WHERE user_id = ? ORDER BY slug',
    ).map((r) => ({
      slug: r.slug,
      ease: r.ease,
      intervalDays: r.interval_days,
      repetitions: r.repetitions,
      dueDate: r.due_date,
      lastReviewedAt: r.last_reviewed_at,
    })),
    activity: q<{
      type: ExportData['activity'][number]['type'];
      slug: string | null;
      xp: number;
      minutes: number;
      detail: string | null;
      local_date: string;
      created_at: string;
    }>(
      'SELECT type, slug, xp, minutes, detail, local_date, created_at FROM activity WHERE user_id = ? ORDER BY id',
    ).map((r) => ({
      type: r.type,
      slug: r.slug,
      xp: r.xp,
      minutes: r.minutes,
      detail: r.detail,
      localDate: r.local_date,
      createdAt: r.created_at,
    })),
    achievements: q<{ code: string; unlocked_at: string }>(
      'SELECT code, unlocked_at FROM achievements WHERE user_id = ? ORDER BY unlocked_at',
    ).map((r) => ({ code: r.code, unlockedAt: r.unlocked_at })),
  };
}

/** Substitui todo o progresso do usuário pelos dados importados (atômico). */
export function importUserData(db: Database, user: User, data: ExportData): void {
  transaction(db, () => {
    for (const table of ['user_problems', 'review_cards', 'activity', 'achievements']) {
      db.prepare(`DELETE FROM ${table} WHERE user_id = ?`).run(user.id);
    }
    const s = data.settings;
    db.prepare(
      'UPDATE users SET display_name = ?, timezone = ?, daily_goal = ?, preferred_language = ?, leetcode_username = ? WHERE id = ?',
    ).run(s.displayName, s.timezone, s.dailyGoal, s.preferredLanguage, s.leetcodeUsername, user.id);

    const insProblem = db.prepare(
      'INSERT INTO user_problems (user_id, slug, status, notes, confidence, starred, code, code_language, first_solved_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    );
    for (const p of data.problems) {
      insProblem.run(
        user.id,
        p.slug,
        p.status,
        p.notes,
        p.confidence,
        p.starred ? 1 : 0,
        p.code,
        p.codeLanguage,
        p.firstSolvedAt,
        p.updatedAt,
      );
    }
    const insReview = db.prepare(
      'INSERT INTO review_cards (user_id, slug, ease, interval_days, repetitions, due_date, last_reviewed_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    );
    for (const r of data.reviews) {
      insReview.run(
        user.id,
        r.slug,
        r.ease,
        r.intervalDays,
        r.repetitions,
        r.dueDate,
        r.lastReviewedAt,
      );
    }
    const insActivity = db.prepare(
      'INSERT INTO activity (user_id, type, slug, xp, minutes, detail, local_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    );
    for (const a of data.activity) {
      insActivity.run(user.id, a.type, a.slug, a.xp, a.minutes, a.detail, a.localDate, a.createdAt);
    }
    const insAch = db.prepare(
      'INSERT OR IGNORE INTO achievements (user_id, code, unlocked_at) VALUES (?, ?, ?)',
    );
    for (const a of data.achievements) insAch.run(user.id, a.code, a.unlockedAt);
  });
}
