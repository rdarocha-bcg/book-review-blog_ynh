import 'dotenv/config';
import path from 'node:path';
import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import fastifyStatic from '@fastify/static';
import { createPool } from './db.js';
import { registerRoutes } from './routes.js';
import { registerMediaRoutes } from './media-routes.js';

function getMediaDir(): string {
  if (process.env.NODE_ENV === 'production') {
    return '/var/www/book-review-blog/media';
  }
  return path.join(process.cwd(), 'media');
}

async function main() {
  const pool = createPool();
  const app = Fastify({ logger: true });
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(fastifyStatic, {
    root: getMediaDir(),
    prefix: '/blog/media/',
    decorateReply: false,
  });
  await registerMediaRoutes(app);
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
