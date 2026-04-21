import type { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';
import { randomUUID } from 'node:crypto';
import { createWriteStream, mkdirSync } from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { readYnhIdentity } from './sso.js';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

function getMediaDir(): string {
  if (process.env.NODE_ENV === 'production') {
    return '/var/www/book-review-blog/media';
  }
  return path.join(process.cwd(), 'media');
}

export async function registerMediaRoutes(app: FastifyInstance): Promise<void> {
  await app.register(multipart, {
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: 1,
    },
  });

  app.post('/api/media/upload', async (req, reply) => {
    const identity = readYnhIdentity(req);
    if (!identity) {
      return reply.code(401).send({ error: 'Unauthorized', message: 'SSO session required' });
    }

    const data = await req.file();
    if (!data) {
      return reply.code(400).send({ error: 'No file provided' });
    }

    const mimeType = data.mimetype;
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      // Drain the stream to avoid hanging connections
      data.file.resume();
      return reply.code(400).send({ error: 'Unsupported file type. Accepted: jpeg, png, webp' });
    }

    const ext = MIME_TO_EXT[mimeType]!;
    const filename = `${randomUUID()}${ext}`;
    const mediaDir = getMediaDir();

    mkdirSync(mediaDir, { recursive: true });

    const destPath = path.join(mediaDir, filename);

    try {
      await pipeline(data.file, createWriteStream(destPath));
    } catch (err: unknown) {
      // @fastify/multipart throws when the file exceeds the size limit
      const code = (err as NodeJS.ErrnoException & { code?: string }).code;
      if (code === 'FST_FILES_LIMIT' || code === 'FST_FILE_LIMIT_REACHED' ||
          (err instanceof Error && err.message.includes('File size limit'))) {
        return reply.code(413).send({ error: 'File too large (max 2 MB)' });
      }
      req.log.error({ err }, 'media upload failed');
      return reply.code(500).send({ error: 'Upload failed' });
    }

    // Check if the stream was aborted because the file exceeded the limit
    if (data.file.truncated) {
      return reply.code(413).send({ error: 'File too large (max 2 MB)' });
    }

    return { url: `/blog/media/${filename}` };
  });
}
