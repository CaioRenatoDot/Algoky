import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { openDatabase, type Database } from '../src/db/database.ts';
import {
  dueReviews,
  logFocusSession,
  reviewProblem,
  updateProblem,
} from '../src/services/progress.ts';
import { dashboard, syncAchievements } from '../src/services/stats.ts';
import { createUser, type User } from '../src/services/users.ts';

let db: Database;
let user: User;
const at = (iso: string) => new Date(iso);

beforeEach(() => {
  db = openDatabase(':memory:');
  user = createUser(db, {
    username: 'svc',
    displayName: 'Svc',
    passwordHash: 'x',
    timezone: 'America/Sao_Paulo',
  });
});
afterEach(() => db.close());

describe('datas locais', () => {
  it('usa o fuso do usuário para decidir o dia da atividade', () => {
    // 01:30 UTC de 11/11 ainda é 10/11 em São Paulo (UTC-3).
    updateProblem(db, user, 'two-sum', { status: 'solved' }, at('2026-11-11T01:30:00Z'));
    const d = dashboard(db, user, at('2026-11-11T01:31:00Z'));
    expect(d.today).toBe('2026-11-10');
    expect(d.heatmap[0]!.date).toBe('2026-11-10');
  });
});

describe('streak ao longo de dias', () => {
  it('cresce com dias consecutivos e quebra após um dia sem estudo', () => {
    logFocusSession(db, user, { minutes: 10 }, at('2026-11-01T15:00:00Z'));
    logFocusSession(db, user, { minutes: 10 }, at('2026-11-02T15:00:00Z'));
    updateProblem(db, user, 'two-sum', { status: 'solved' }, at('2026-11-03T15:00:00Z'));
    expect(dashboard(db, user, at('2026-11-03T20:00:00Z')).streak).toEqual({
      current: 3,
      longest: 3,
      activeToday: true,
    });
    expect(dashboard(db, user, at('2026-11-04T20:00:00Z')).streak).toEqual({
      current: 3,
      longest: 3,
      activeToday: false,
    });
    expect(dashboard(db, user, at('2026-11-05T20:00:00Z')).streak).toEqual({
      current: 0,
      longest: 3,
      activeToday: false,
    });
  });

  it('desbloqueia a conquista de 3 dias seguidos', () => {
    for (const day of ['01', '02', '03'])
      logFocusSession(db, user, { minutes: 5 }, at(`2026-11-${day}T15:00:00Z`));
    expect(syncAchievements(db, user, at('2026-11-03T16:00:00Z'))).toContain('streak-3');
    expect(syncAchievements(db, user, at('2026-11-03T16:00:00Z'))).toEqual([]);
  });
});

describe('fila de revisão', () => {
  it('cartão vence na data agendada e revisão vencida dá XP', () => {
    updateProblem(
      db,
      user,
      'two-sum',
      { status: 'solved', confidence: 3 },
      at('2026-11-01T15:00:00Z'),
    );
    expect(dueReviews(db, user, at('2026-11-02T15:00:00Z'))).toEqual([]);
    const due = dueReviews(db, user, at('2026-11-04T15:00:00Z'));
    expect(due).toHaveLength(1);
    expect(due[0]).toMatchObject({ slug: 'two-sum', overdueDays: 1 });

    const res = reviewProblem(db, user, 'two-sum', 'good', at('2026-11-04T15:00:00Z'));
    expect(res.xpGained).toBe(5);
    expect(res.data.review).toMatchObject({
      repetitions: 1,
      intervalDays: 3,
      dueDate: '2026-11-07',
    });
    expect(dueReviews(db, user, at('2026-11-04T16:00:00Z'))).toEqual([]);
  });
});

describe('tentativas', () => {
  it('registra no máximo uma tentativa por problema por dia', () => {
    updateProblem(db, user, 'two-sum', { status: 'attempted' }, at('2026-11-01T15:00:00Z'));
    updateProblem(db, user, 'two-sum', { status: 'todo' }, at('2026-11-01T15:10:00Z'));
    updateProblem(db, user, 'two-sum', { status: 'attempted' }, at('2026-11-01T15:20:00Z'));
    const d = dashboard(db, user, at('2026-11-01T16:00:00Z'));
    expect(d.recent.filter((r) => r.type === 'attempt')).toHaveLength(1);
  });
});
