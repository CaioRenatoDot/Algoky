import type { FastifyInstance } from 'fastify';
import type { AppContext } from '../app.ts';
import { clearSessionCookie, currentUser, requireAuth, sessionToken } from '../lib/auth.ts';
import { unauthorized } from '../lib/errors.ts';
import { hashPassword, verifyPassword } from '../lib/password.ts';
import { deleteAccountBody, passwordChangeBody, settingsBody } from '../lib/schemas.ts';
import { exportSchema, exportUserData, importUserData } from '../services/portability.ts';
import { syncAchievements } from '../services/stats.ts';
import {
  deleteOtherSessions,
  deleteUser,
  getPasswordHash,
  updatePasswordHash,
  updateSettings,
} from '../services/users.ts';

export async function meRoutes(app: FastifyInstance, { db, config }: AppContext) {
  app.addHook('preHandler', requireAuth(db));

  app.patch('/api/me/settings', async (request) => {
    const patch = settingsBody.parse(request.body);
    return { user: updateSettings(db, currentUser(request).id, patch) };
  });

  app.post('/api/me/password', async (request, reply) => {
    const user = currentUser(request);
    const body = passwordChangeBody.parse(request.body);
    if (!(await verifyPassword(body.currentPassword, getPasswordHash(db, user.id)))) {
      throw unauthorized('Senha atual incorreta.');
    }
    updatePasswordHash(db, user.id, await hashPassword(body.newPassword));
    // Encerra as outras sessões: quem tinha a senha antiga perde o acesso.
    deleteOtherSessions(db, user.id, sessionToken(request)!);
    return reply.code(204).send();
  });

  app.get('/api/me/export', async (request, reply) => {
    const data = exportUserData(db, currentUser(request));
    const date = data.exportedAt.slice(0, 10);
    return reply
      .header('content-disposition', `attachment; filename="algoky-${date}.json"`)
      .send(data);
  });

  app.post('/api/me/import', { bodyLimit: 20 * 1024 * 1024 }, async (request) => {
    const user = currentUser(request);
    importUserData(db, user, exportSchema.parse(request.body));
    syncAchievements(db, user);
    return { ok: true };
  });

  app.delete('/api/me', async (request, reply) => {
    const user = currentUser(request);
    const { password } = deleteAccountBody.parse(request.body);
    if (!(await verifyPassword(password, getPasswordHash(db, user.id))))
      throw unauthorized('Senha incorreta.');
    deleteUser(db, user.id);
    clearSessionCookie(reply, config);
    return reply.code(204).send();
  });
}
