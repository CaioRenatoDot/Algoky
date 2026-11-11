import {
  PROBLEMS_BY_SLUG,
  REVIEW_XP,
  SOLVE_XP,
  focusXp,
  newCard,
  reviewCard,
  toLocalDate,
  type ActivityType,
  type DueReview,
  type FocusSession,
  type ProblemState,
  type ReviewCardDto,
  type LocalDate,
  type ProblemStatus,
  type ReviewCard,
  type ReviewRating,
} from '@algoky/shared';
import { transaction, type Database } from '../db/database.ts';
import { badRequest, notFound } from '../lib/errors.ts';
import type { User } from './users.ts';

export type { DueReview, FocusSession, ProblemState, ReviewCardDto };

interface ProblemRow {
  slug: string;
  status: ProblemStatus;
  notes: string;
  confidence: number | null;
  starred: number;
  first_solved_at: string | null;
  updated_at: string;
  ease: number | null;
  interval_days: number | null;
  repetitions: number | null;
  due_date: string | null;
  last_reviewed_at: string | null;
}

const SELECT_STATE = `
  SELECT p.slug, p.status, p.notes, p.confidence, p.starred, p.first_solved_at, p.updated_at,
         r.ease, r.interval_days, r.repetitions, r.due_date, r.last_reviewed_at
  FROM user_problems p
  LEFT JOIN review_cards r ON r.user_id = p.user_id AND r.slug = p.slug
  WHERE p.user_id = ?`;

function toState(r: ProblemRow): ProblemState {
  return {
    slug: r.slug,
    status: r.status,
    notes: r.notes,
    confidence: r.confidence,
    starred: r.starred === 1,
    firstSolvedAt: r.first_solved_at,
    updatedAt: r.updated_at,
    review:
      r.due_date === null
        ? null
        : {
            ease: r.ease!,
            intervalDays: r.interval_days!,
            repetitions: r.repetitions!,
            dueDate: r.due_date,
            lastReviewedAt: r.last_reviewed_at,
          },
  };
}

export function listProgress(db: Database, userId: number): ProblemState[] {
  return (db.prepare(SELECT_STATE).all(userId) as unknown as ProblemRow[]).map(toState);
}

export function getProblemState(
  db: Database,
  userId: number,
  slug: string,
): ProblemState | undefined {
  const row = db.prepare(`${SELECT_STATE} AND p.slug = ?`).get(userId, slug) as
    ProblemRow | undefined;
  return row && toState(row);
}

function requireProblem(slug: string) {
  const problem = PROBLEMS_BY_SLUG.get(slug);
  if (!problem) throw notFound(`Problema "${slug}" não está no catálogo.`);
  return problem;
}

function logActivity(
  db: Database,
  userId: number,
  entry: {
    type: ActivityType;
    slug?: string | null;
    xp?: number;
    minutes?: number;
    detail?: string | null;
  },
  localDate: LocalDate,
  nowIso: string,
): void {
  db.prepare(
    'INSERT INTO activity (user_id, type, slug, xp, minutes, detail, local_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  ).run(
    userId,
    entry.type,
    entry.slug ?? null,
    entry.xp ?? 0,
    entry.minutes ?? 0,
    entry.detail ?? null,
    localDate,
    nowIso,
  );
}

function saveCard(
  db: Database,
  userId: number,
  slug: string,
  card: ReviewCard,
  reviewedAt: string | null,
): void {
  db.prepare(
    `INSERT INTO review_cards (user_id, slug, ease, interval_days, repetitions, due_date, last_reviewed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (user_id, slug) DO UPDATE SET
       ease = excluded.ease, interval_days = excluded.interval_days, repetitions = excluded.repetitions,
       due_date = excluded.due_date, last_reviewed_at = excluded.last_reviewed_at`,
  ).run(userId, slug, card.ease, card.intervalDays, card.repetitions, card.dueDate, reviewedAt);
}

export interface ProblemPatch {
  status?: ProblemStatus;
  notes?: string;
  confidence?: number | null;
  starred?: boolean;
}

export interface MutationResult<T> {
  data: T;
  xpGained: number;
}

/**
 * Atualiza o estado de um problema e aplica os efeitos colaterais:
 * XP na primeira solução, criação/remoção do cartão de revisão e registro de atividade.
 */
export function updateProblem(
  db: Database,
  user: User,
  slug: string,
  patch: ProblemPatch,
  now = new Date(),
): MutationResult<ProblemState> {
  const problem = requireProblem(slug);
  const today = toLocalDate(now, user.timezone);
  const nowIso = now.toISOString();

  return transaction(db, () => {
    const current = getProblemState(db, user.id, slug);
    const prevStatus = current?.status ?? 'todo';
    const status = patch.status ?? prevStatus;
    const confidence =
      patch.confidence !== undefined ? patch.confidence : (current?.confidence ?? null);
    let firstSolvedAt = current?.firstSolvedAt ?? null;
    let xpGained = 0;

    if (status === 'solved' && prevStatus !== 'solved') {
      if (!firstSolvedAt) {
        // XP só na primeira solução: desmarcar e marcar de novo não gera XP extra.
        xpGained = SOLVE_XP[problem.difficulty];
        firstSolvedAt = nowIso;
      }
      logActivity(
        db,
        user.id,
        { type: 'solve', slug, xp: xpGained, detail: problem.difficulty },
        today,
        nowIso,
      );
      if (!current?.review) {
        const c = Math.min(5, Math.max(1, confidence ?? 3)) as 1 | 2 | 3 | 4 | 5;
        saveCard(db, user.id, slug, newCard(today, c), null);
      }
    } else if (status === 'attempted' && prevStatus !== 'attempted') {
      const alreadyToday = db
        .prepare(
          "SELECT 1 FROM activity WHERE user_id = ? AND type = 'attempt' AND slug = ? AND local_date = ?",
        )
        .get(user.id, slug, today);
      if (!alreadyToday) logActivity(db, user.id, { type: 'attempt', slug }, today, nowIso);
    }

    if (status === 'todo') {
      db.prepare('DELETE FROM review_cards WHERE user_id = ? AND slug = ?').run(user.id, slug);
    }

    db.prepare(
      `INSERT INTO user_problems (user_id, slug, status, notes, confidence, starred, first_solved_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (user_id, slug) DO UPDATE SET
         status = excluded.status, notes = excluded.notes, confidence = excluded.confidence,
         starred = excluded.starred, first_solved_at = excluded.first_solved_at, updated_at = excluded.updated_at`,
    ).run(
      user.id,
      slug,
      status,
      patch.notes ?? current?.notes ?? '',
      confidence,
      (patch.starred ?? current?.starred ?? false) ? 1 : 0,
      firstSolvedAt,
      nowIso,
    );

    return { data: getProblemState(db, user.id, slug)!, xpGained };
  });
}

export function dueReviews(db: Database, user: User, now = new Date()): DueReview[] {
  const today = toLocalDate(now, user.timezone);
  const rows = db
    .prepare(
      `SELECT r.slug, r.ease, r.interval_days, r.repetitions, r.due_date, r.last_reviewed_at, COALESCE(p.notes, '') AS notes,
              CAST(julianday(?) - julianday(r.due_date) AS INTEGER) AS overdue
       FROM review_cards r
       LEFT JOIN user_problems p ON p.user_id = r.user_id AND p.slug = r.slug
       WHERE r.user_id = ? AND r.due_date <= ?
       ORDER BY r.due_date, r.slug`,
    )
    .all(today, user.id, today) as Array<{
    slug: string;
    ease: number;
    interval_days: number;
    repetitions: number;
    due_date: string;
    last_reviewed_at: string | null;
    notes: string;
    overdue: number;
  }>;
  return rows
    .filter((r) => PROBLEMS_BY_SLUG.has(r.slug))
    .map((r) => ({
      slug: r.slug,
      notes: r.notes,
      overdueDays: r.overdue,
      card: {
        ease: r.ease,
        intervalDays: r.interval_days,
        repetitions: r.repetitions,
        dueDate: r.due_date,
        lastReviewedAt: r.last_reviewed_at,
      },
    }));
}

export function reviewProblem(
  db: Database,
  user: User,
  slug: string,
  rating: ReviewRating,
  now = new Date(),
): MutationResult<ProblemState> {
  requireProblem(slug);
  const today = toLocalDate(now, user.timezone);
  const nowIso = now.toISOString();

  return transaction(db, () => {
    const state = getProblemState(db, user.id, slug);
    if (!state?.review)
      throw badRequest(
        'Este problema ainda não tem revisão agendada. Resolva-o primeiro.',
        'no_review_card',
      );
    // Revisões antecipadas são permitidas, mas só as que venceram dão XP.
    const xpGained = state.review.dueDate <= today ? REVIEW_XP : 0;
    saveCard(db, user.id, slug, reviewCard(state.review, rating, today), nowIso);
    logActivity(db, user.id, { type: 'review', slug, xp: xpGained, detail: rating }, today, nowIso);
    return { data: getProblemState(db, user.id, slug)!, xpGained };
  });
}

export function logFocusSession(
  db: Database,
  user: User,
  input: { minutes: number; slug?: string | null },
  now = new Date(),
): MutationResult<FocusSession> {
  if (input.slug) requireProblem(input.slug);
  const today = toLocalDate(now, user.timezone);
  const xpGained = focusXp(input.minutes);
  logActivity(
    db,
    user.id,
    { type: 'focus', slug: input.slug ?? null, xp: xpGained, minutes: input.minutes },
    today,
    now.toISOString(),
  );
  return { data: { minutes: input.minutes, slug: input.slug ?? null, localDate: today }, xpGained };
}
