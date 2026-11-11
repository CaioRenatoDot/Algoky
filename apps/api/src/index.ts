import { buildApp } from './app.ts';
import { loadConfig } from './config.ts';
import { openDatabase } from './db/database.ts';
import { purgeExpiredSessions } from './services/users.ts';

const config = loadConfig();
const db = openDatabase(config.databasePath);
const app = await buildApp({ db, config });

purgeExpiredSessions(db);
const cleanup = setInterval(() => purgeExpiredSessions(db), 6 * 60 * 60 * 1000);
cleanup.unref();

let closing = false;
async function shutdown(signal: string) {
  if (closing) return;
  closing = true;
  app.log.info({ signal }, 'encerrando');
  clearInterval(cleanup);
  await app.close();
  db.close();
  process.exit(0);
}
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

try {
  await app.listen({ host: config.host, port: config.port });
  if (config.webDist) app.log.info(`servindo frontend de ${config.webDist}`);
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
