import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Client, createTestApp, registeredClient, type TestApp } from './helpers.ts';

let t: TestApp;
beforeEach(async () => (t = await createTestApp()));
afterEach(() => t.close());

describe('autenticação', () => {
  it('cadastra, mantém sessão e faz logout', async () => {
    const client = await registeredClient(t.app);
    const me = await client.get('/api/auth/me');
    expect(me.statusCode).toBe(200);
    expect(me.json().user).toMatchObject({
      username: 'ana',
      displayName: 'ana',
      dailyGoal: 2,
      timezone: 'America/Sao_Paulo',
    });
    expect(me.json().user).not.toHaveProperty('passwordHash');

    expect((await client.post('/api/auth/logout')).statusCode).toBe(204);
    expect((await client.get('/api/auth/me')).statusCode).toBe(401);
  });

  it('cookie de sessão é httpOnly e SameSite=Lax', async () => {
    const res = await new Client(t.app).post('/api/auth/register', {
      username: 'bia',
      password: 'senha-segura-123',
    });
    const cookie = res.cookies.find((c) => c.name === 'algoky_session')!;
    expect(cookie.httpOnly).toBe(true);
    expect(cookie.sameSite).toBe('Lax');
  });

  it('normaliza o usuário e rejeita duplicados', async () => {
    await registeredClient(t.app, 'joao');
    const res = await new Client(t.app).post('/api/auth/register', {
      username: '  JOAO ',
      password: 'outra-senha-123',
    });
    expect(res.statusCode).toBe(409);
    expect(res.json().error.code).toBe('username_taken');
  });

  it('valida entrada do cadastro', async () => {
    const client = new Client(t.app);
    expect(
      (await client.post('/api/auth/register', { username: 'a', password: 'senha-segura-123' }))
        .statusCode,
    ).toBe(400);
    const short = await client.post('/api/auth/register', { username: 'valido', password: '123' });
    expect(short.statusCode).toBe(400);
    expect(short.json().error.message).toMatch(/8 caracteres/);
    const tz = await client.post('/api/auth/register', {
      username: 'valido',
      password: 'senha-segura-123',
      timezone: 'Lua/Base',
    });
    expect(tz.statusCode).toBe(400);
  });

  it('login aceita credenciais corretas e rejeita as erradas', async () => {
    await registeredClient(t.app, 'carla', 'minha-senha-123');
    const client = new Client(t.app);
    expect(
      (await client.post('/api/auth/login', { username: 'carla', password: 'errada-123' }))
        .statusCode,
    ).toBe(401);
    expect(
      (await client.post('/api/auth/login', { username: 'ninguem', password: 'errada-123' }))
        .statusCode,
    ).toBe(401);
    const ok = await client.post('/api/auth/login', {
      username: 'CARLA',
      password: 'minha-senha-123',
    });
    expect(ok.statusCode).toBe(200);
    expect((await client.get('/api/auth/me')).statusCode).toBe(200);
  });

  it('respeita ALLOW_REGISTRATION=false', async () => {
    const closed = await createTestApp({ ALLOW_REGISTRATION: 'false' });
    const client = new Client(closed.app);
    expect((await client.get('/api/auth/config')).json()).toEqual({ allowRegistration: false });
    expect(
      (await client.post('/api/auth/register', { username: 'zeca', password: 'senha-segura-123' }))
        .statusCode,
    ).toBe(403);
    await closed.close();
  });

  it('limita tentativas de login por IP', async () => {
    const limited = await createTestApp({ AUTH_RATE_LIMIT: '3' });
    const client = new Client(limited.app);
    const codes: number[] = [];
    for (let i = 0; i < 4; i++)
      codes.push(
        (await client.post('/api/auth/login', { username: 'x', password: 'y' })).statusCode,
      );
    expect(codes).toEqual([401, 401, 401, 429]);
    await limited.close();
  });

  it('rotas protegidas exigem sessão', async () => {
    const client = new Client(t.app);
    for (const url of ['/api/dashboard', '/api/progress', '/api/reviews/due', '/api/me/export']) {
      expect((await client.get(url)).statusCode, url).toBe(401);
    }
  });
});
