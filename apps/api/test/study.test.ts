import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestApp, registeredClient, type Client, type TestApp } from './helpers.ts';

let t: TestApp;
let client: Client;
beforeEach(async () => {
  t = await createTestApp();
  client = await registeredClient(t.app);
});
afterEach(() => t.close());

describe('progresso de problemas', () => {
  it('resolver dá XP uma única vez, cria revisão e desbloqueia conquista', async () => {
    const res = await client.patch('/api/progress/two-sum', { status: 'solved', confidence: 4 });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.xpGained).toBe(10);
    expect(body.newAchievements).toContain('first-solve');
    expect(body.level).toMatchObject({ level: 1, xp: 10 });
    expect(body.streak).toMatchObject({ current: 1, activeToday: true });
    expect(body.data).toMatchObject({ slug: 'two-sum', status: 'solved', confidence: 4 });
    expect(body.data.review).toMatchObject({ intervalDays: 4, repetitions: 0 });

    await client.patch('/api/progress/two-sum', { status: 'todo' });
    const again = (await client.patch('/api/progress/two-sum', { status: 'solved' })).json();
    expect(again.xpGained).toBe(0);
    expect(again.newAchievements).toEqual([]);
  });

  it('voltar para "todo" remove a revisão agendada', async () => {
    await client.patch('/api/progress/3sum', { status: 'solved' });
    const res = (await client.patch('/api/progress/3sum', { status: 'todo' })).json();
    expect(res.data.review).toBeNull();
  });

  it('salva notas e favoritos sem mudar status', async () => {
    const res = (
      await client.patch('/api/progress/valid-anagram', { notes: 'contar letras', starred: true })
    ).json();
    expect(res.data).toMatchObject({ status: 'todo', notes: 'contar letras', starred: true });
    expect(res.xpGained).toBe(0);
    const list = (await client.get('/api/progress')).json().problems;
    expect(list).toHaveLength(1);
  });

  it('rejeita problemas fora do catálogo e payloads inválidos', async () => {
    expect((await client.patch('/api/progress/nao-existe', { status: 'solved' })).statusCode).toBe(
      404,
    );
    expect((await client.patch('/api/progress/two-sum', { status: 'done' })).statusCode).toBe(400);
    expect((await client.patch('/api/progress/two-sum', {})).statusCode).toBe(400);
    expect(
      (await client.patch('/api/progress/two-sum', { status: 'solved', extra: 1 })).statusCode,
    ).toBe(400);
    expect((await client.patch('/api/progress/Two_Sum', { status: 'solved' })).statusCode).toBe(
      400,
    );
  });

  it('isola dados entre usuários', async () => {
    await client.patch('/api/progress/two-sum', { status: 'solved' });
    const other = await registeredClient(t.app, 'outro');
    expect((await other.get('/api/progress')).json().problems).toEqual([]);
    expect((await other.get('/api/dashboard')).json().totals.solved).toBe(0);
  });
});

describe('revisões e foco', () => {
  it('não permite revisar sem ter resolvido', async () => {
    const res = await client.post('/api/reviews/two-sum', { rating: 'good' });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('no_review_card');
  });

  it('revisão antecipada atualiza o cartão mas não dá XP', async () => {
    await client.patch('/api/progress/two-sum', { status: 'solved' });
    expect((await client.get('/api/reviews/due')).json().reviews).toEqual([]);
    const res = (await client.post('/api/reviews/two-sum', { rating: 'good' })).json();
    expect(res.xpGained).toBe(0);
    expect(res.data.review.repetitions).toBe(1);
  });

  it('registra sessões de foco com XP proporcional', async () => {
    const res = await client.post('/api/focus', { minutes: 25, slug: 'two-sum' });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toMatchObject({ xpGained: 5, data: { minutes: 25, slug: 'two-sum' } });
    expect((await client.post('/api/focus', { minutes: 0 })).statusCode).toBe(400);
    expect((await client.post('/api/focus', { minutes: 500 })).statusCode).toBe(400);
  });
});

describe('dashboard', () => {
  it('agrega totais, meta diária, heatmap, sugestão e conquistas', async () => {
    await client.patch('/api/progress/two-sum', { status: 'solved' });
    await client.patch('/api/progress/3sum', { status: 'solved' });
    await client.patch('/api/progress/trapping-rain-water', { status: 'attempted' });
    await client.post('/api/focus', { minutes: 30 });

    const d = (await client.get('/api/dashboard')).json();
    expect(d.totals).toMatchObject({
      solved: 2,
      easy: 1,
      medium: 1,
      hard: 0,
      attempted: 1,
      focusMinutes: 30,
      totalProblems: 192,
    });
    expect(d.level.xp).toBe(10 + 20 + 6);
    expect(d.dailyGoal).toEqual({ target: 2, done: 2, focusMinutes: 30 });
    expect(d.heatmap).toHaveLength(1);
    expect(d.heatmap[0]).toMatchObject({ date: d.today, count: 4, xp: 36 });
    expect(d.streak).toMatchObject({ current: 1, longest: 1 });
    expect(d.suggestion).toBe('trapping-rain-water');
    expect(
      d.byPattern.find((p: { pattern: string }) => p.pattern === 'two-pointers'),
    ).toMatchObject({ solved: 1, attempted: 1 });
    expect(d.recent[0].type).toBe('focus');
    const first = d.achievements.find((a: { code: string }) => a.code === 'first-solve');
    expect(first.unlockedAt).not.toBeNull();
    const tenSolved = d.achievements.find((a: { code: string }) => a.code === 'solved-10');
    expect(tenSolved).toMatchObject({ unlockedAt: null, current: 2, target: 10 });
  });
});

describe('rascunho de código', () => {
  it('salva código e linguagem sem mexer no status nem gerar XP', async () => {
    const code = 'def two_sum(nums, target):\n    seen = {}\n';
    const res = (
      await client.patch('/api/progress/two-sum', { code, codeLanguage: 'python' })
    ).json();
    expect(res.xpGained).toBe(0);
    expect(res.data).toMatchObject({ status: 'todo', code, codeLanguage: 'python' });
    expect((await client.get('/api/progress/two-sum')).json()).toMatchObject({
      code,
      codeLanguage: 'python',
    });

    // Atualizar o status preserva o código.
    const solved = (await client.patch('/api/progress/two-sum', { status: 'solved' })).json();
    expect(solved.data).toMatchObject({ status: 'solved', code, codeLanguage: 'python' });
  });

  it('valida linguagem e tamanho do código', async () => {
    expect(
      (await client.patch('/api/progress/two-sum', { codeLanguage: 'cobol' })).statusCode,
    ).toBe(400);
    expect(
      (await client.patch('/api/progress/two-sum', { code: 'x'.repeat(50_001) })).statusCode,
    ).toBe(400);
  });
});
