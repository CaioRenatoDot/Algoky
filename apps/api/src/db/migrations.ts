/**
 * Migrações versionadas via `PRAGMA user_version`.
 * Nunca edite uma migração já publicada: adicione uma nova no final.
 */
export const MIGRATIONS: string[] = [
  /* 1: esquema inicial */ `
  CREATE TABLE users (
    id                INTEGER PRIMARY KEY,
    username          TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    display_name      TEXT    NOT NULL,
    password_hash     TEXT    NOT NULL,
    timezone          TEXT    NOT NULL DEFAULT 'America/Sao_Paulo',
    daily_goal        INTEGER NOT NULL DEFAULT 2,
    preferred_language TEXT   NOT NULL DEFAULT 'python',
    leetcode_username TEXT,
    created_at        TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

  CREATE TABLE sessions (
    token_hash  TEXT    PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at  INTEGER NOT NULL,
    created_at  INTEGER NOT NULL
  );
  CREATE INDEX sessions_user ON sessions(user_id);

  CREATE TABLE user_problems (
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slug            TEXT    NOT NULL,
    status          TEXT    NOT NULL CHECK (status IN ('todo', 'attempted', 'solved')),
    notes           TEXT    NOT NULL DEFAULT '',
    confidence      INTEGER CHECK (confidence BETWEEN 1 AND 5),
    starred         INTEGER NOT NULL DEFAULT 0,
    first_solved_at TEXT,
    updated_at      TEXT    NOT NULL,
    PRIMARY KEY (user_id, slug)
  );

  CREATE TABLE review_cards (
    user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slug             TEXT    NOT NULL,
    ease             REAL    NOT NULL,
    interval_days    INTEGER NOT NULL,
    repetitions      INTEGER NOT NULL,
    due_date         TEXT    NOT NULL,
    last_reviewed_at TEXT,
    PRIMARY KEY (user_id, slug)
  );
  CREATE INDEX review_cards_due ON review_cards(user_id, due_date);

  CREATE TABLE activity (
    id          INTEGER PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        TEXT    NOT NULL CHECK (type IN ('solve', 'attempt', 'review', 'focus')),
    slug        TEXT,
    xp          INTEGER NOT NULL DEFAULT 0,
    minutes     INTEGER NOT NULL DEFAULT 0,
    detail      TEXT,
    local_date  TEXT    NOT NULL,
    created_at  TEXT    NOT NULL
  );
  CREATE INDEX activity_user_date ON activity(user_id, local_date);

  CREATE TABLE achievements (
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code        TEXT    NOT NULL,
    unlocked_at TEXT    NOT NULL,
    PRIMARY KEY (user_id, code)
  );
  `,
  /* 2: rascunho de código por problema (área de trabalho) */ `
  ALTER TABLE user_problems ADD COLUMN code TEXT NOT NULL DEFAULT '';
  ALTER TABLE user_problems ADD COLUMN code_language TEXT CHECK (code_language IN ('python', 'typescript', 'java'));
  `,
];
