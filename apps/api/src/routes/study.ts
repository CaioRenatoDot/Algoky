import type { FastifyInstance } from 'fastify';
import type { AppContext } from '../app.ts';
import type { Database } from '../db/database.ts';
import { currentUser, requireAuth } from '../lib/auth.ts';
import { notFound } from '../lib/errors.ts';
import { focusBody, problemPatchBody, reviewBody, slugParams } from '../lib/schemas.ts';
import {
  dueReviews,
  getProblemState,
  listProgress,
  logFocusSession,
  reviewProblem,
  updateProblem,
  type MutationResult,
} from '../services/progress.ts';
import { dashboard, progressSummary, syncAchievements } from '../services/stats.ts';
import type { User } from '../services/users.ts';

/** Envelope padrão das mutações: dado + XP ganho + conquistas novas + nível/streak atualizados. */
function withProgress<T>(db: Database, user: User, result: MutationResult<T>) {
  return {
    data: result.data,
    xpGained: result.xpGained,
    newAchievements: syncAchievements(db, user),
    ...progressSummary(db, user),
  };
}

export async function studyRoutes(app: FastifyInstance, { db }: AppContext) {
  app.addHook('preHandler', requireAuth(db));

  app.get('/api/dashboard', async (request) => dashboard(db, currentUser(request)));

  app.get('/api/progress', async (request) => ({
    problems: listProgress(db, currentUser(request).id),
  }));

  app.get('/api/progress/:slug', async (request) => {
    const { slug } = slugParams.parse(request.params);
    const state = getProblemState(db, currentUser(request).id, slug);
    if (!state) throw notFound('Nenhum progresso registrado para este problema.');
    return state;
  });

  app.patch('/api/progress/:slug', async (request) => {
    const user = currentUser(request);
    const { slug } = slugParams.parse(request.params);
    return withProgress(
      db,
      user,
      updateProblem(db, user, slug, problemPatchBody.parse(request.body)),
    );
  });

  app.get('/api/reviews/due', async (request) => ({
    reviews: dueReviews(db, currentUser(request)),
  }));

  app.post('/api/reviews/:slug', async (request) => {
    const user = currentUser(request);
    const { slug } = slugParams.parse(request.params);
    const { rating } = reviewBody.parse(request.body);
    return withProgress(db, user, reviewProblem(db, user, slug, rating));
  });

  app.post('/api/focus', async (request, reply) => {
    const user = currentUser(request);
    const result = withProgress(db, user, logFocusSession(db, user, focusBody.parse(request.body)));
    return reply.code(201).send(result);
  });
}
