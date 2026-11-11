// Backup consistente do SQLite (funciona com o servidor rodando, via VACUUM INTO).
// Uso no container: docker compose exec algoky node scripts/backup.mjs
// Uso local:        node apps/api/scripts/backup.mjs [destino.db]
import { existsSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const source = process.env.DATABASE_PATH ?? 'data/algoky.db';
if (!existsSync(source)) {
  console.error(`Banco não encontrado: ${source}`);
  process.exit(1);
}
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const target = process.argv[2] ?? source.replace(/\.db$/, '') + `-backup-${stamp}.db`;
if (existsSync(target)) {
  console.error(`Destino já existe: ${target}`);
  process.exit(1);
}
const db = new DatabaseSync(source, { readOnly: true });
db.prepare('VACUUM INTO ?').run(target);
db.close();
console.log(`Backup salvo em ${target}`);
