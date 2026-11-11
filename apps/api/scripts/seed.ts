/**
 * Cria (ou recria) uma conta de demonstração com ~4 meses de histórico realista.
 * Uso: npm run seed -w @algoky/api   (respeita DATABASE_PATH)
 * Conta: demo / senha-demo-123
 */
import { PATTERNS, PROBLEMS, REVIEW_RATINGS, roadmapOrder } from '@algoky/shared';
import { loadConfig } from '../src/config.ts';
import { openDatabase } from '../src/db/database.ts';
import { hashPassword } from '../src/lib/password.ts';
import {
  dueReviews,
  logFocusSession,
  reviewProblem,
  updateProblem,
} from '../src/services/progress.ts';
import { syncAchievements } from '../src/services/stats.ts';
import { createUser, deleteUser, findCredentials } from '../src/services/users.ts';

const DAYS = 120;
const config = loadConfig();
const db = openDatabase(config.databasePath);

// PRNG determinístico para o seed ser reproduzível.
let s = 42;
const rand = () => (s = (s * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;

const existing = findCredentials(db, 'demo');
if (existing) deleteUser(db, existing.user.id);
const user = createUser(db, {
  username: 'demo',
  displayName: 'Demo',
  passwordHash: await hashPassword('senha-demo-123'),
  timezone: 'America/Sao_Paulo',
});

const queue = roadmapOrder(PROBLEMS, PATTERNS);
const now = Date.now();
for (let day = DAYS; day >= 0; day--) {
  const ramp = 1 - day / DAYS; // estuda mais nas semanas recentes
  if (day > 0 && rand() > 0.45 + ramp * 0.45) continue;
  // Hoje usa instantes de poucos minutos atrás (nunca no futuro); dias anteriores, horários do dia.
  const at = (hour: number) =>
    day === 0
      ? new Date(now - (16 - hour) * 60_000)
      : new Date(now - day * 86_400_000 - (12 - hour) * 3_600_000);

  for (const r of dueReviews(db, user, at(9)).slice(0, 10)) {
    reviewProblem(db, user, r.slug, REVIEW_RATINGS[Math.min(3, Math.floor(rand() * 4.5))]!, at(9));
  }
  const solves = day === 0 ? 1 : 1 + Math.floor(rand() * (1 + ramp * 2));
  for (let i = 0; i < solves && queue.length; i++) {
    const p = queue.shift()!;
    if (rand() < 0.15) updateProblem(db, user, p.slug, { status: 'attempted' }, at(10));
    updateProblem(
      db,
      user,
      p.slug,
      {
        status: 'solved',
        confidence: 2 + Math.floor(rand() * 4),
        starred: rand() < 0.08,
        notes:
          rand() < 0.4
            ? `Padrão ${p.pattern}. Ideia-chave anotada no dia ${DAYS - day}.`
            : undefined,
      },
      at(11 + i),
    );
  }
  if (rand() < 0.5) logFocusSession(db, user, { minutes: rand() < 0.5 ? 25 : 50 }, at(14));
  syncAchievements(db, user, at(15));
}
const next = queue.shift();
if (next) updateProblem(db, user, next.slug, { status: 'attempted' });
syncAchievements(db, user);
console.log(`Conta demo criada em ${config.databasePath} (usuário: demo, senha: senha-demo-123)`);
db.close();
