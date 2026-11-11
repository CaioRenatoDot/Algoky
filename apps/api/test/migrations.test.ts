import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import { migrate } from '../src/db/database.ts';
import { MIGRATIONS } from '../src/db/migrations.ts';

describe('migrações', () => {
  it('atualiza um banco existente da versão 1 preservando os dados', () => {
    const db = new DatabaseSync(':memory:');
    db.exec(MIGRATIONS[0]!);
    db.exec('PRAGMA user_version = 1');
    db.prepare(
      "INSERT INTO users (id, username, display_name, password_hash) VALUES (1, 'u', 'U', 'x')",
    ).run();
    db.prepare(
      "INSERT INTO user_problems (user_id, slug, status, notes, updated_at) VALUES (1, 'two-sum', 'solved', 'nota', '2026-01-01T00:00:00Z')",
    ).run();

    expect(migrate(db)).toBe(MIGRATIONS.length);
    const row = db
      .prepare('SELECT status, notes, code, code_language FROM user_problems')
      .get() as Record<string, unknown>;
    expect({ ...row }).toEqual({ status: 'solved', notes: 'nota', code: '', code_language: null });
    expect((db.prepare('PRAGMA user_version').get() as { user_version: number }).user_version).toBe(
      MIGRATIONS.length,
    );
    db.close();
  });

  it('é idempotente', () => {
    const db = new DatabaseSync(':memory:');
    migrate(db);
    expect(() => migrate(db)).not.toThrow();
    db.close();
  });
});
