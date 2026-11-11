import { resolve } from 'node:path';

export interface Config {
  env: 'development' | 'production' | 'test';
  host: string;
  port: number;
  /** Caminho do arquivo SQLite, ou ':memory:' para testes. */
  databasePath: string;
  /** Pasta com o build do frontend. Se definida, a API também serve o SPA. */
  webDist: string | null;
  /** Cookies com flag Secure (exige HTTPS). */
  cookieSecure: boolean;
  allowRegistration: boolean;
  /** Tentativas de login/cadastro por IP por minuto. */
  authRateLimit: number;
  logLevel: string;
}

function bool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const mode =
    env.NODE_ENV === 'production' ? 'production' : env.NODE_ENV === 'test' ? 'test' : 'development';
  const port = Number(env.PORT ?? 3333);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`PORT inválida: ${env.PORT}`);
  }
  return {
    env: mode,
    host: env.HOST ?? (mode === 'production' ? '0.0.0.0' : '127.0.0.1'),
    port,
    databasePath: env.DATABASE_PATH ?? resolve('data', 'algoky.db'),
    webDist: env.WEB_DIST ? resolve(env.WEB_DIST) : null,
    cookieSecure: bool(env.COOKIE_SECURE, false),
    allowRegistration: bool(env.ALLOW_REGISTRATION, true),
    authRateLimit: Number(env.AUTH_RATE_LIMIT ?? (mode === 'test' ? 10_000 : 20)),
    logLevel: env.LOG_LEVEL ?? (mode === 'test' ? 'silent' : 'info'),
  };
}
