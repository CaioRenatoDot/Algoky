import { createHash, randomBytes } from 'node:crypto';
import type { TemplateLanguage } from '@algoky/shared';
import type { Database } from '../db/database.ts';

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

interface UserRow {
  id: number;
  username: string;
  display_name: string;
  password_hash: string;
  timezone: string;
  daily_goal: number;
  preferred_language: TemplateLanguage;
  leetcode_username: string | null;
  created_at: string;
}

const toUser = (r: UserRow): User => ({
  id: r.id,
  username: r.username,
  displayName: r.display_name,
  timezone: r.timezone,
  dailyGoal: r.daily_goal,
  preferredLanguage: r.preferred_language,
  leetcodeUsername: r.leetcode_username,
  createdAt: r.created_at,
});

export function findUserById(db: Database, id: number): User | undefined {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
  return row && toUser(row);
}

export function findCredentials(
  db: Database,
  username: string,
): { user: User; passwordHash: string } | undefined {
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as
    UserRow | undefined;
  return row && { user: toUser(row), passwordHash: row.password_hash };
}

export function getPasswordHash(db: Database, userId: number): string {
  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId) as {
    password_hash: string;
  };
  return row.password_hash;
}

export function createUser(
  db: Database,
  input: { username: string; displayName: string; passwordHash: string; timezone: string },
): User {
  const { lastInsertRowid } = db
    .prepare(
      'INSERT INTO users (username, display_name, password_hash, timezone) VALUES (?, ?, ?, ?)',
    )
    .run(input.username, input.displayName, input.passwordHash, input.timezone);
  return findUserById(db, Number(lastInsertRowid))!;
}

export function usernameTaken(db: Database, username: string): boolean {
  return db.prepare('SELECT 1 FROM users WHERE username = ?').get(username) !== undefined;
}

export type SettingsPatch = Partial<
  Pick<User, 'displayName' | 'timezone' | 'dailyGoal' | 'preferredLanguage' | 'leetcodeUsername'>
>;

const SETTINGS_COLUMNS: Record<keyof SettingsPatch, string> = {
  displayName: 'display_name',
  timezone: 'timezone',
  dailyGoal: 'daily_goal',
  preferredLanguage: 'preferred_language',
  leetcodeUsername: 'leetcode_username',
};

export function updateSettings(db: Database, userId: number, patch: SettingsPatch): User {
  const entries = Object.entries(patch).filter(([, v]) => v !== undefined) as [
    keyof SettingsPatch,
    unknown,
  ][];
  if (entries.length > 0) {
    const sets = entries.map(([k]) => `${SETTINGS_COLUMNS[k]} = ?`).join(', ');
    db.prepare(`UPDATE users SET ${sets} WHERE id = ?`).run(
      ...(entries.map(([, v]) => v) as (string | number | null)[]),
      userId,
    );
  }
  return findUserById(db, userId)!;
}

export function updatePasswordHash(db: Database, userId: number, passwordHash: string): void {
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, userId);
}

export function deleteUser(db: Database, userId: number): void {
  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
}

// ---------------------------------------------------------------- sessões

export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

/** Cria uma sessão e devolve o token em claro (só o hash é persistido). */
export function createSession(db: Database, userId: number, now = Date.now()): string {
  const token = randomBytes(32).toString('base64url');
  db.prepare(
    'INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)',
  ).run(hashToken(token), userId, now + SESSION_TTL_MS, now);
  return token;
}

export function userFromSession(db: Database, token: string, now = Date.now()): User | undefined {
  const row = db
    .prepare('SELECT user_id, expires_at FROM sessions WHERE token_hash = ?')
    .get(hashToken(token)) as { user_id: number; expires_at: number } | undefined;
  if (!row) return undefined;
  if (row.expires_at <= now) {
    deleteSession(db, token);
    return undefined;
  }
  return findUserById(db, row.user_id);
}

export function deleteSession(db: Database, token: string): void {
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token));
}

export function deleteOtherSessions(db: Database, userId: number, keepToken: string): void {
  db.prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash <> ?').run(
    userId,
    hashToken(keepToken),
  );
}

export function purgeExpiredSessions(db: Database, now = Date.now()): number {
  return Number(db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(now).changes);
}
