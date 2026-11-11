import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Client, createTestApp, registeredClient, type TestApp } from './helpers.ts';

let t: TestApp;
beforeEach(async () => (t = await createTestApp()));
afterEach(() => t.close());

describe('conta e configurações', () => {
  it('atualiza configurações parcialmente e valida campos', async () => {
    const client = await registeredClient(t.app);
    const res = await client.patch('/api/me/settings', {
      dailyGoal: 4,
      preferredLanguage: 'java',
      leetcodeUsername: 'ana-lc',
    });
    expect(res.json().user).toMatchObject({
      dailyGoal: 4,
      preferredLanguage: 'java',
      leetcodeUsername: 'ana-lc',
    });
    expect((await client.patch('/api/me/settings', { dailyGoal: 0 })).statusCode).toBe(400);
    expect((await client.patch('/api/me/settings', { timezone: 'X/Y' })).statusCode).toBe(400);
    expect((await client.patch('/api/me/settings', { isAdmin: true })).statusCode).toBe(400);
  });

  it('troca de senha exige a atual e encerra outras sessões', async () => {
    const a = await registeredClient(t.app, 'dani', 'senha-antiga-1');
    const b = new Client(t.app);
    await b.post('/api/auth/login', { username: 'dani', password: 'senha-antiga-1' });

    expect(
      (
        await a.post('/api/me/password', {
          currentPassword: 'errada',
          newPassword: 'senha-nova-123',
        })
      ).statusCode,
    ).toBe(401);
    expect(
      (
        await a.post('/api/me/password', {
          currentPassword: 'senha-antiga-1',
          newPassword: 'senha-nova-123',
        })
      ).statusCode,
    ).toBe(204);

    expect((await a.get('/api/auth/me')).statusCode).toBe(200);
    expect((await b.get('/api/auth/me')).statusCode).toBe(401);
    expect(
      (
        await new Client(t.app).post('/api/auth/login', {
          username: 'dani',
          password: 'senha-nova-123',
        })
      ).statusCode,
    ).toBe(200);
  });

  it('exporta e importa o progresso completo', async () => {
    const a = await registeredClient(t.app, 'eva');
    await a.patch('/api/progress/two-sum', { status: 'solved', notes: 'hash map' });
    await a.post('/api/focus', { minutes: 25 });
    const exported = await a.get('/api/me/export');
    expect(exported.headers['content-disposition']).toMatch(
      /attachment; filename="algoky-\d{4}-\d{2}-\d{2}\.json"/,
    );
    const data = exported.json();
    expect(data).toMatchObject({ version: 1, problems: [{ slug: 'two-sum', notes: 'hash map' }] });
    expect(data.activity).toHaveLength(2);

    const b = await registeredClient(t.app, 'fabio');
    expect((await b.post('/api/me/import', data)).statusCode).toBe(200);
    const d = (await b.get('/api/dashboard')).json();
    expect(d.totals.solved).toBe(1);
    expect(d.level.xp).toBe(15);
    expect(
      d.achievements.find((x: { code: string }) => x.code === 'first-solve').unlockedAt,
    ).not.toBeNull();

    expect((await b.post('/api/me/import', { ...data, version: 99 })).statusCode).toBe(400);
  });

  it('exclui a conta com confirmação de senha', async () => {
    const client = await registeredClient(t.app, 'gil', 'senha-do-gil-1');
    expect((await client.delete('/api/me', { password: 'errada' })).statusCode).toBe(401);
    expect((await client.delete('/api/me', { password: 'senha-do-gil-1' })).statusCode).toBe(204);
    expect((await client.get('/api/auth/me')).statusCode).toBe(401);
    expect(
      (
        await new Client(t.app).post('/api/auth/login', {
          username: 'gil',
          password: 'senha-do-gil-1',
        })
      ).statusCode,
    ).toBe(401);
  });
});

describe('infra', () => {
  it('health check e 404 em JSON', async () => {
    const client = new Client(t.app);
    expect((await client.get('/api/health')).json()).toEqual({ status: 'ok' });
    const res = await client.get('/api/nao-existe');
    expect(res.statusCode).toBe(404);
    expect(res.json().error.code).toBe('not_found');
  });

  it('envia cabeçalhos de segurança', async () => {
    const res = await new Client(t.app).get('/api/health');
    expect(res.headers['content-security-policy']).toContain("default-src 'self'");
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});

describe('frontend estático', () => {
  it('serve o SPA nas rotas do app e 404 em assets inexistentes', async () => {
    const { mkdtempSync, writeFileSync, mkdirSync } = await import('node:fs');
    const { tmpdir } = await import('node:os');
    const { join } = await import('node:path');
    const dir = mkdtempSync(join(tmpdir(), 'algoky-web-'));
    mkdirSync(join(dir, 'assets'));
    writeFileSync(join(dir, 'index.html'), '<!doctype html><title>Algoky</title>');
    writeFileSync(join(dir, 'assets', 'app-abc123.js'), 'console.log(1)');
    const web = await createTestApp({ WEB_DIST: dir });
    const client = new Client(web.app);

    const page = await client.get('/app/trilha?x=1');
    expect(page.statusCode).toBe(200);
    expect(page.headers['content-type']).toMatch(/text\/html/);
    expect(page.headers['cache-control']).toBe('no-cache');

    const asset = await client.get('/assets/app-abc123.js');
    expect(asset.statusCode).toBe(200);
    expect(asset.headers['cache-control']).toContain('immutable');

    expect((await client.get('/assets/antigo-999.js')).statusCode).toBe(404);
    expect((await client.get('/favicon.png')).statusCode).toBe(404);
    await web.close();
  });
});

describe('backup com rascunhos de código', () => {
  it('exporta/importa o código e aceita backups antigos sem esses campos', async () => {
    const a = await registeredClient(t.app, 'hana');
    await a.patch('/api/progress/two-sum', { code: 'print(1)', codeLanguage: 'python' });
    const data = (await a.get('/api/me/export')).json();
    expect(data.problems[0]).toMatchObject({ code: 'print(1)', codeLanguage: 'python' });

    const b = await registeredClient(t.app, 'igor');
    expect((await b.post('/api/me/import', data)).statusCode).toBe(200);
    expect((await b.get('/api/progress/two-sum')).json()).toMatchObject({
      code: 'print(1)',
      codeLanguage: 'python',
    });

    const legacy = structuredClone(data);
    delete legacy.problems[0].code;
    delete legacy.problems[0].codeLanguage;
    const c = await registeredClient(t.app, 'joana');
    expect((await c.post('/api/me/import', legacy)).statusCode).toBe(200);
    expect((await c.get('/api/progress/two-sum')).json()).toMatchObject({
      code: '',
      codeLanguage: null,
    });
  });
});
