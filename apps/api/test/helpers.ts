import type { FastifyInstance, InjectOptions } from 'fastify';
import { buildApp } from '../src/app.ts';
import { loadConfig } from '../src/config.ts';
import { openDatabase, type Database } from '../src/db/database.ts';

export interface TestApp {
  app: FastifyInstance;
  db: Database;
  close: () => Promise<void>;
}

export async function createTestApp(env: Record<string, string> = {}): Promise<TestApp> {
  const config = loadConfig({ NODE_ENV: 'test', DATABASE_PATH: ':memory:', ...env });
  const db = openDatabase(config.databasePath);
  const app = await buildApp({ db, config });
  return {
    app,
    db,
    close: async () => {
      await app.close();
      db.close();
    },
  };
}

/** Cliente simples que guarda o cookie de sessão entre requisições. */
export class Client {
  cookie = '';
  constructor(private app: FastifyInstance) {}

  async request(method: InjectOptions['method'], url: string, payload?: unknown) {
    const res = await this.app.inject({
      method,
      url,
      payload: payload as InjectOptions['payload'],
      headers: this.cookie ? { cookie: this.cookie } : {},
    });
    const setCookie = res.cookies.find((c) => c.name === 'algoky_session');
    if (setCookie) this.cookie = setCookie.value ? `algoky_session=${setCookie.value}` : '';
    return res;
  }

  get = (url: string) => this.request('GET', url);
  post = (url: string, body?: unknown) => this.request('POST', url, body);
  patch = (url: string, body?: unknown) => this.request('PATCH', url, body);
  delete = (url: string, body?: unknown) => this.request('DELETE', url, body);
}

export async function registeredClient(
  app: FastifyInstance,
  username = 'ana',
  password = 'senha-segura-123',
) {
  const client = new Client(app);
  const res = await client.post('/api/auth/register', {
    username,
    password,
    timezone: 'America/Sao_Paulo',
  });
  if (res.statusCode !== 201) throw new Error(`register falhou: ${res.body}`);
  return client;
}
