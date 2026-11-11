import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Config } from '../config.ts';
import type { Database } from '../db/database.ts';
import { unauthorized } from './errors.ts';
import { SESSION_TTL_MS, userFromSession, type User } from '../services/users.ts';

export const SESSION_COOKIE = 'algoky_session';

declare module 'fastify' {
  interface FastifyRequest {
    user: User | null;
  }
}

export function setSessionCookie(reply: FastifyReply, config: Config, token: string): void {
  reply.setCookie(SESSION_COOKIE, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: config.cookieSecure,
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export function clearSessionCookie(reply: FastifyReply, config: Config): void {
  reply.clearCookie(SESSION_COOKIE, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: config.cookieSecure,
  });
}

export function sessionToken(request: FastifyRequest): string | undefined {
  return request.cookies[SESSION_COOKIE] || undefined;
}

/** preHandler que exige sessão válida e popula `request.user`. */
export function requireAuth(db: Database) {
  return async (request: FastifyRequest) => {
    const token = sessionToken(request);
    const user = token ? userFromSession(db, token) : undefined;
    if (!user) throw unauthorized();
    request.user = user;
  };
}

/** Acesso ao usuário autenticado dentro de rotas protegidas por `requireAuth`. */
export function currentUser(request: FastifyRequest): User {
  if (!request.user) throw unauthorized();
  return request.user;
}
