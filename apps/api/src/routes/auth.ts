import type { FastifyInstance } from 'fastify';
import type { AppContext } from '../app.ts';
import {
  clearSessionCookie,
  currentUser,
  requireAuth,
  sessionToken,
  setSessionCookie,
} from '../lib/auth.ts';
import { conflict, forbidden, unauthorized } from '../lib/errors.ts';
import { hashPassword, verifyPassword } from '../lib/password.ts';
import { loginBody, registerBody } from '../lib/schemas.ts';
import {
  createSession,
  createUser,
  deleteSession,
  findCredentials,
  usernameTaken,
} from '../services/users.ts';

// Hash fixo usado para gastar o mesmo tempo quando o usuário não existe.
let dummyHash: Promise<string> | undefined;

export async function authRoutes(app: FastifyInstance, { db, config }: AppContext) {
  const rateLimit = { rateLimit: { max: config.authRateLimit, timeWindow: '1 minute' } };

  app.get('/api/auth/config', async () => ({ allowRegistration: config.allowRegistration }));

  app.post('/api/auth/register', { config: rateLimit }, async (request, reply) => {
    if (!config.allowRegistration)
      throw forbidden('Novos cadastros estão desativados nesta instância.');
    const body = registerBody.parse(request.body);
    if (usernameTaken(db, body.username))
      throw conflict('Esse nome de usuário já está em uso.', 'username_taken');
    const user = createUser(db, {
      username: body.username,
      displayName: body.displayName ?? body.username,
      passwordHash: await hashPassword(body.password),
      timezone: body.timezone ?? 'America/Sao_Paulo',
    });
    setSessionCookie(reply, config, createSession(db, user.id));
    return reply.code(201).send({ user });
  });

  app.post('/api/auth/login', { config: rateLimit }, async (request, reply) => {
    const body = loginBody.parse(request.body);
    const found = findCredentials(db, body.username);
    if (!found) {
      await verifyPassword(body.password, await (dummyHash ??= hashPassword('dummy-password')));
      throw unauthorized('Usuário ou senha incorretos.');
    }
    if (!(await verifyPassword(body.password, found.passwordHash)))
      throw unauthorized('Usuário ou senha incorretos.');
    setSessionCookie(reply, config, createSession(db, found.user.id));
    return { user: found.user };
  });

  app.post('/api/auth/logout', async (request, reply) => {
    const token = sessionToken(request);
    if (token) deleteSession(db, token);
    clearSessionCookie(reply, config);
    return reply.code(204).send();
  });

  app.get('/api/auth/me', { preHandler: requireAuth(db) }, async (request) => ({
    user: currentUser(request),
  }));
}
