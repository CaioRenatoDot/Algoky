import { existsSync } from 'node:fs';
import { join } from 'node:path';
import compress from '@fastify/compress';
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import Fastify, { type FastifyError, type FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import type { Config } from './config.ts';
import type { Database } from './db/database.ts';
import { HttpError } from './lib/errors.ts';
import { authRoutes } from './routes/auth.ts';

export interface AppContext {
  db: Database;
  config: Config;
}

export async function buildApp(ctx: AppContext): Promise<FastifyInstance> {
  const { config } = ctx;
  const app = Fastify({
    logger: { level: config.logLevel },
    trustProxy: true,
    bodyLimit: 1024 * 1024,
  });

  app.decorateRequest('user', null);

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        fontSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: config.cookieSecure ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
  });
  await app.register(compress, { global: true, threshold: 1024 });
  await app.register(cookie);
  await app.register(rateLimit, { global: false });

  app.setErrorHandler((error: FastifyError | Error, request, reply) => {
    if (error instanceof ZodError) {
      const first = error.issues[0];
      return reply.code(400).send({
        error: {
          code: 'validation',
          message: first?.message ?? 'Dados inválidos.',
          issues: error.issues,
        },
      });
    }
    if (error instanceof HttpError) {
      return reply
        .code(error.statusCode)
        .send({ error: { code: error.code, message: error.message } });
    }
    const status = 'statusCode' in error && error.statusCode ? error.statusCode : 500;
    if (status >= 500) request.log.error(error);
    const message =
      status === 429
        ? 'Muitas tentativas. Aguarde um minuto.'
        : status >= 500
          ? 'Erro interno do servidor.'
          : error.message;
    return reply
      .code(status)
      .send({ error: { code: status === 429 ? 'rate_limited' : 'error', message } });
  });

  app.get('/api/health', async () => {
    ctx.db.prepare('SELECT 1').get();
    return { status: 'ok' };
  });

  await app.register(authRoutes, ctx);

  if (config.webDist && existsSync(join(config.webDist, 'index.html'))) {
    await app.register(fastifyStatic, {
      root: config.webDist,
      wildcard: false,
      preCompressed: true,
      setHeaders(reply, path) {
        // Arquivos com hash no nome podem ficar em cache para sempre; o index.html nunca.
        const immutable = path.startsWith(join(config.webDist!, 'assets'));
        reply.header(
          'cache-control',
          immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
        );
      },
    });
    app.setNotFoundHandler((request, reply) => {
      if (request.method === 'GET' && !request.url.startsWith('/api/')) {
        return reply.header('cache-control', 'no-cache').sendFile('index.html');
      }
      return reply
        .code(404)
        .send({ error: { code: 'not_found', message: 'Rota não encontrada.' } });
    });
  } else {
    app.setNotFoundHandler((_request, reply) =>
      reply.code(404).send({ error: { code: 'not_found', message: 'Rota não encontrada.' } }),
    );
  }

  return app;
}
