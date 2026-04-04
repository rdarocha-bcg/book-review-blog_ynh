import 'dotenv/config';
import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import { createPool } from './db.js';
import { registerRoutes } from './routes.js';

async function main() {
  const pool = createPool();
  const app = Fastify({ logger: true });
  await app.register(helmet, { contentSecurityPolicy: false });
  await registerRoutes(app, pool);

  app.addHook('onClose', async () => {
    await pool.end();
  });

  const host = process.env.HOST ?? '127.0.0.1';
  const port = Number(process.env.PORT ?? '3000');
  await app.listen({ host, port });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
