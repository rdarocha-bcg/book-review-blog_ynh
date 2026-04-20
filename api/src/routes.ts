import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { DbPool } from './db.js';
import { isAppAdmin, readYnhIdentity, type YnhIdentity } from './sso.js';
import { rowToReview, type ReviewRow } from './review-mapper.js';
import { rowToAcademic, type AcademicRow } from './academic-mapper.js';
import { randomUUID } from 'node:crypto';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

function parseBool(q: unknown): boolean {
  return q === '1' || q === 'true' || q === true;
}

function requireUser(req: FastifyRequest, reply: FastifyReply): YnhIdentity | null {
  const id = readYnhIdentity(req);
  if (!id) {
    void reply.code(401).send({ error: 'Unauthorized', message: 'SSO session required' });
    return null;
  }
  return id;
}

function requireAdmin(req: FastifyRequest, reply: FastifyReply): YnhIdentity | null {
  const id = requireUser(req, reply);
  if (!id) return null;
  if (!isAppAdmin(id.uid)) {
    void reply.code(403).send({ error: 'Forbidden', message: 'Admin only' });
    return null;
  }
  return id;
}

async function upsertUserDirectory(
  pool: DbPool,
  id: YnhIdentity,
): Promise<void> {
  await pool.execute(
    `INSERT INTO user_directory (uid, email, display_name)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE email = VALUES(email), display_name = VALUES(display_name)`,
    [id.uid, id.email, id.fullName],
  );
}

export async function registerRoutes(app: FastifyInstance, pool: DbPool): Promise<void> {
  await app.register(
    async (r) => {
      r.get('/auth/me', async (req, reply) => {
        const id = readYnhIdentity(req);
        if (!id) {
          return { authenticated: false };
        }
        await upsertUserDirectory(pool, id);
        const role = isAppAdmin(id.uid) ? 'admin' : 'user';
        return {
          authenticated: true,
          user: {
            id: id.uid,
            email: id.email ?? '',
            name: id.fullName ?? id.uid,
            role,
          },
        };
      });

      r.post('/auth/login', async (_req, reply) => {
        return reply.code(410).send({
          error: 'Gone',
          message: 'Use the YunoHost SSO portal to sign in.',
        });
      });

      r.post('/auth/register', async (_req, reply) => {
        return reply.code(410).send({
          error: 'Gone',
          message: 'Create accounts in the YunoHost admin panel.',
        });
      });

      r.post('/auth/refresh', async (_req, reply) => {
        return reply.code(501).send({ error: 'Not implemented' });
      });

      r.post('/auth/logout', async (_req, reply) => {
        return reply.code(204).send();
      });

      r.get('/reviews', async (req, reply) => {
        const q = req.query as Record<string, string | undefined>;
        const page = Math.max(1, parseInt(q.page ?? '1', 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(q.limit ?? '10', 10) || 10));
        const offset = (page - 1) * limit;
        const identity = readYnhIdentity(req);
        const includeDrafts = parseBool(q.includeDrafts);
        const admin = identity ? isAppAdmin(identity.uid) : false;

        const where: string[] = [];
        const params: unknown[] = [];

        if (!identity || !includeDrafts) {
          where.push('is_published = 1');
        } else if (admin) {
          // all reviews
        } else {
          where.push('(is_published = 1 OR created_by = ?)');
          params.push(identity.uid);
        }

        if (q.genre) {
          where.push('genre = ?');
          params.push(q.genre);
        }
        if (q.rating) {
          where.push('rating = ?');
          params.push(parseFloat(q.rating));
        }
        if (q.author) {
          where.push('author LIKE ?');
          params.push(`%${q.author}%`);
        }
        if (q.search) {
          where.push(
            '(title LIKE ? OR book_title LIKE ? OR description LIKE ? OR content LIKE ?)',
          );
          const s = `%${q.search}%`;
          params.push(s, s, s, s);
        }

        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
        const sort = q.sort ?? 'newest';
        const orderBy =
          sort === 'oldest'
            ? 'published_at ASC'
            : sort === 'rating-high'
              ? 'rating DESC, published_at DESC'
              : sort === 'rating-low'
                ? 'rating ASC, published_at DESC'
                : 'published_at DESC';

        const countSql = `SELECT COUNT(*) AS c FROM reviews ${whereSql}`;
        const [countRows] = await pool.query<RowDataPacket[]>(countSql, params);
        const total = Number((countRows[0] as { c: number }).c) || 0;

        const dataSql = `SELECT * FROM reviews ${whereSql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
        const [rows] = await pool.query<ReviewRow[]>(dataSql, [...params, limit, offset]);
        const data = rows.map(rowToReview);
        const totalPages = Math.ceil(total / limit) || 1;

        return { data, total, page, limit, totalPages };
      });

      r.get<{ Params: { id: string } }>('/reviews/:id', async (req, reply) => {
        const { id } = req.params;
        const [rows] = await pool.query<ReviewRow[]>('SELECT * FROM reviews WHERE id = ?', [id]);
        if (!rows.length) {
          return reply.code(404).send({ error: 'Not found' });
        }
        const row = rows[0]!;
        const identity = readYnhIdentity(req);
        const admin = identity ? isAppAdmin(identity.uid) : false;
        const published = Boolean(row.is_published);
        if (!published) {
          if (!identity || (row.created_by !== identity.uid && !admin)) {
            return reply.code(404).send({ error: 'Not found' });
          }
        }
        return rowToReview(row);
      });

      r.post('/reviews', async (req, reply) => {
        const identity = requireUser(req, reply);
        if (!identity) return;
        const body = req.body as Record<string, unknown>;
        const now = new Date();
        const display = identity.fullName || identity.uid;
        const author = String(body.author ?? display);
        const id = randomUUID();
        const isPublished = Boolean(body.isPublished);
        const title = String(body.title ?? '');
        const bookTitle = String(body.bookTitle ?? '');
        const bookAuthor = String(body.bookAuthor ?? '');
        const genre = String(body.genre ?? '');
        const rating = Number(body.rating ?? 0);
        const description = String(body.description ?? '');
        const content = String(body.content ?? '');
        const imageUrl = body.imageUrl != null ? String(body.imageUrl) : null;

        if (!title || !bookTitle || !bookAuthor || !genre || rating < 1 || rating > 5) {
          return reply.code(400).send({ error: 'Validation failed' });
        }

        await pool.execute(
          `INSERT INTO reviews (
            id, title, author, book_title, book_author, rating, genre,
            description, content, image_url, published_at, updated_at, created_by, is_published
          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            id,
            title,
            author,
            bookTitle,
            bookAuthor,
            rating,
            genre,
            description,
            content,
            imageUrl || null,
            now,
            now,
            identity.uid,
            isPublished ? 1 : 0,
          ],
        );

        const [created] = await pool.query<ReviewRow[]>('SELECT * FROM reviews WHERE id = ?', [id]);
        return rowToReview(created[0]!);
      });

      r.put<{ Params: { id: string } }>('/reviews/:id', async (req, reply) => {
        const identity = requireUser(req, reply);
        if (!identity) return;
        const { id } = req.params;
        const [existing] = await pool.query<ReviewRow[]>('SELECT * FROM reviews WHERE id = ?', [id]);
        if (!existing.length) {
          return reply.code(404).send({ error: 'Not found' });
        }
        const row = existing[0]!;
        const admin = isAppAdmin(identity.uid);
        if (row.created_by !== identity.uid && !admin) {
          return reply.code(403).send({ error: 'Forbidden' });
        }

        const body = req.body as Record<string, unknown>;
        const title = body.title != null ? String(body.title) : row.title;
        const author = body.author != null ? String(body.author) : row.author;
        const bookTitle = body.bookTitle != null ? String(body.bookTitle) : row.book_title;
        const bookAuthor = body.bookAuthor != null ? String(body.bookAuthor) : row.book_author;
        const genre = body.genre != null ? String(body.genre) : row.genre;
        const rating =
          body.rating != null ? Number(body.rating) : parseFloat(String(row.rating));
        const description =
          body.description != null ? String(body.description) : row.description ?? '';
        const content = body.content != null ? String(body.content) : row.content ?? '';
        const imageUrl =
          body.imageUrl !== undefined
            ? body.imageUrl === null || body.imageUrl === ''
              ? null
              : String(body.imageUrl)
            : row.image_url;
        const isPublished =
          body.isPublished !== undefined ? Boolean(body.isPublished) : Boolean(row.is_published);

        if (rating < 1 || rating > 5) {
          return reply.code(400).send({ error: 'Invalid rating' });
        }

        const now = new Date();
        await pool.execute(
          `UPDATE reviews SET
            title=?, author=?, book_title=?, book_author=?, rating=?, genre=?,
            description=?, content=?, image_url=?, updated_at=?, is_published=?
          WHERE id=?`,
          [
            title,
            author,
            bookTitle,
            bookAuthor,
            rating,
            genre,
            description,
            content,
            imageUrl,
            now,
            isPublished ? 1 : 0,
            id,
          ],
        );

        const [updated] = await pool.query<ReviewRow[]>('SELECT * FROM reviews WHERE id = ?', [id]);
        return rowToReview(updated[0]!);
      });

      r.delete<{ Params: { id: string } }>('/reviews/:id', async (req, reply) => {
        const identity = requireUser(req, reply);
        if (!identity) return;
        const { id } = req.params;
        const [existing] = await pool.query<ReviewRow[]>('SELECT * FROM reviews WHERE id = ?', [id]);
        if (!existing.length) {
          return reply.code(404).send({ error: 'Not found' });
        }
        const row = existing[0]!;
        const admin = isAppAdmin(identity.uid);
        if (row.created_by !== identity.uid && !admin) {
          return reply.code(403).send({ error: 'Forbidden' });
        }
        await pool.execute('DELETE FROM reviews WHERE id = ?', [id]);
        return reply.code(204).send();
      });

      r.get('/academics', async (req, reply) => {
        const q = req.query as Record<string, string | undefined>;
        const page = Math.max(1, parseInt(q.page ?? '1', 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(q.limit ?? '10', 10) || 10));
        const offset = (page - 1) * limit;
        const identity = readYnhIdentity(req);
        const includeDrafts = parseBool(q.includeDrafts);
        const admin = identity ? isAppAdmin(identity.uid) : false;

        const where: string[] = [];
        const params: unknown[] = [];

        if (!identity || !includeDrafts) {
          where.push('is_published = 1');
        } else if (admin) {
          // all academics
        } else {
          where.push('(is_published = 1 OR created_by = ?)');
          params.push(identity.uid);
        }

        if (q.workType) {
          where.push('work_type = ?');
          params.push(q.workType);
        }
        if (q.theme) {
          where.push('theme = ?');
          params.push(q.theme);
        }
        if (q.search) {
          where.push('(title LIKE ? OR summary LIKE ? OR content LIKE ?)');
          const s = `%${q.search}%`;
          params.push(s, s, s);
        }

        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
        const sort = q.sort ?? 'newest';
        const orderBy =
          sort === 'oldest'
            ? 'published_at ASC'
            : sort === 'year-high'
              ? 'year DESC, published_at DESC'
              : sort === 'year-low'
                ? 'year ASC, published_at DESC'
                : 'published_at DESC';

        const countSql = `SELECT COUNT(*) AS c FROM academics ${whereSql}`;
        const [countRows] = await pool.query<RowDataPacket[]>(countSql, params);
        const total = Number((countRows[0] as { c: number }).c) || 0;

        const dataSql = `SELECT * FROM academics ${whereSql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
        const [rows] = await pool.query<AcademicRow[]>(dataSql, [...params, limit, offset]);
        const data = rows.map(rowToAcademic);
        const totalPages = Math.ceil(total / limit) || 1;

        return { data, total, page, limit, totalPages };
      });

      r.get<{ Params: { id: string } }>('/academics/:id', async (req, reply) => {
        const { id } = req.params;
        const [rows] = await pool.query<AcademicRow[]>('SELECT * FROM academics WHERE id = ?', [id]);
        if (!rows.length) {
          return reply.code(404).send({ error: 'Not found' });
        }
        const row = rows[0]!;
        const identity = readYnhIdentity(req);
        const admin = identity ? isAppAdmin(identity.uid) : false;
        const published = Boolean(row.is_published);
        if (!published) {
          if (!identity || (row.created_by !== identity.uid && !admin)) {
            return reply.code(404).send({ error: 'Not found' });
          }
        }
        return rowToAcademic(row);
      });

      r.post('/academics', async (req, reply) => {
        const identity = requireUser(req, reply);
        if (!identity) return;
        const body = req.body as Record<string, unknown>;
        const now = new Date();
        const id = randomUUID();
        const title = String(body.title ?? '');
        const summary = String(body.summary ?? '');
        const workType = String(body.workType ?? '');
        const content = body.content != null ? String(body.content) : null;
        const imageUrl = body.imageUrl != null ? String(body.imageUrl) : null;
        const context = body.context != null ? String(body.context) : null;
        const year = body.year != null ? Number(body.year) : null;
        const theme = body.theme != null ? String(body.theme) : null;
        const excerpt = body.excerpt != null ? String(body.excerpt) : null;
        const sourceUrl = body.sourceUrl != null ? String(body.sourceUrl) : null;
        const isPublished = Boolean(body.isPublished);
        const featured = Boolean(body.featured);

        if (!title || !summary || !workType) {
          return reply.code(400).send({ error: 'Validation failed' });
        }

        await pool.execute(
          `INSERT INTO academics (
            id, title, summary, content, image_url, work_type, context, year, theme,
            excerpt, source_url, published_at, updated_at, created_by, is_published, featured
          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            id, title, summary, content, imageUrl, workType, context, year, theme,
            excerpt, sourceUrl, now, now, identity.uid, isPublished ? 1 : 0, featured ? 1 : 0,
          ],
        );

        const [created] = await pool.query<AcademicRow[]>('SELECT * FROM academics WHERE id = ?', [id]);
        return rowToAcademic(created[0]!);
      });

      r.put<{ Params: { id: string } }>('/academics/:id', async (req, reply) => {
        const identity = requireUser(req, reply);
        if (!identity) return;
        const { id } = req.params;
        const [existing] = await pool.query<AcademicRow[]>('SELECT * FROM academics WHERE id = ?', [id]);
        if (!existing.length) {
          return reply.code(404).send({ error: 'Not found' });
        }
        const row = existing[0]!;
        const admin = isAppAdmin(identity.uid);
        if (row.created_by !== identity.uid && !admin) {
          return reply.code(403).send({ error: 'Forbidden' });
        }

        const body = req.body as Record<string, unknown>;
        const title = body.title != null ? String(body.title) : row.title;
        const summary = body.summary != null ? String(body.summary) : row.summary;
        const workType = body.workType != null ? String(body.workType) : row.work_type;
        const content = body.content !== undefined
          ? (body.content === null ? null : String(body.content))
          : row.content;
        const imageUrl = body.imageUrl !== undefined
          ? (body.imageUrl === null || body.imageUrl === '' ? null : String(body.imageUrl))
          : row.image_url;
        const context = body.context !== undefined
          ? (body.context === null ? null : String(body.context))
          : row.context;
        const year = body.year !== undefined
          ? (body.year === null ? null : Number(body.year))
          : row.year;
        const theme = body.theme !== undefined
          ? (body.theme === null ? null : String(body.theme))
          : row.theme;
        const excerpt = body.excerpt !== undefined
          ? (body.excerpt === null ? null : String(body.excerpt))
          : row.excerpt;
        const sourceUrl = body.sourceUrl !== undefined
          ? (body.sourceUrl === null || body.sourceUrl === '' ? null : String(body.sourceUrl))
          : row.source_url;
        const isPublished = body.isPublished !== undefined ? Boolean(body.isPublished) : Boolean(row.is_published);
        const featured = body.featured !== undefined ? Boolean(body.featured) : Boolean(row.featured);

        const now = new Date();
        await pool.execute(
          `UPDATE academics SET
            title=?, summary=?, content=?, image_url=?, work_type=?, context=?, year=?, theme=?,
            excerpt=?, source_url=?, updated_at=?, is_published=?, featured=?
          WHERE id=?`,
          [title, summary, content, imageUrl, workType, context, year, theme,
           excerpt, sourceUrl, now, isPublished ? 1 : 0, featured ? 1 : 0, id],
        );

        const [updated] = await pool.query<AcademicRow[]>('SELECT * FROM academics WHERE id = ?', [id]);
        return rowToAcademic(updated[0]!);
      });

      r.delete<{ Params: { id: string } }>('/academics/:id', async (req, reply) => {
        if (!requireAdmin(req, reply)) return;
        const { id } = req.params;
        const [res] = await pool.execute<ResultSetHeader>('DELETE FROM academics WHERE id = ?', [id]);
        if (!res.affectedRows) {
          return reply.code(404).send({ error: 'Not found' });
        }
        return reply.code(204).send();
      });

      r.get('/admin/academics', async (req, reply) => {
        if (!requireAdmin(req, reply)) return;
        const [rows] = await pool.query<AcademicRow[]>(
          'SELECT * FROM academics ORDER BY updated_at DESC',
        );
        return rows.map(rowToAcademic);
      });

      r.patch<{ Params: { id: string } }>('/admin/academics/:id/publish', async (req, reply) => {
        if (!requireAdmin(req, reply)) return;
        const { id } = req.params;
        const body = (req.body as { isPublished?: boolean }) ?? {};
        const isPublished = Boolean(body.isPublished);
        const [existing] = await pool.query<AcademicRow[]>('SELECT * FROM academics WHERE id = ?', [id]);
        if (!existing.length) {
          return reply.code(404).send({ error: 'Not found' });
        }
        await pool.execute('UPDATE academics SET is_published = ?, updated_at = ? WHERE id = ?', [
          isPublished ? 1 : 0,
          new Date(),
          id,
        ]);
        const [updated] = await pool.query<AcademicRow[]>('SELECT * FROM academics WHERE id = ?', [id]);
        return rowToAcademic(updated[0]!);
      });

      r.delete<{ Params: { id: string } }>('/admin/academics/:id', async (req, reply) => {
        if (!requireAdmin(req, reply)) return;
        const { id } = req.params;
        const [res] = await pool.execute<ResultSetHeader>('DELETE FROM academics WHERE id = ?', [id]);
        if (!res.affectedRows) {
          return reply.code(404).send({ error: 'Not found' });
        }
        return reply.code(204).send();
      });

      r.get('/admin/users', async (req, reply) => {
        if (!requireAdmin(req, reply)) return;
        const [rows] = await pool.query<RowDataPacket[]>(
          'SELECT uid, email, display_name, created_at FROM user_directory ORDER BY created_at DESC',
        );
        return rows.map((u) => {
          const uid = String(u.uid);
          return {
            id: uid,
            email: String(u.email ?? ''),
            name: String(u.display_name ?? uid),
            role: isAppAdmin(uid) ? 'admin' : 'user',
            createdAt: u.created_at ? new Date(u.created_at as Date).toISOString() : undefined,
          };
        });
      });

      r.delete<{ Params: { id: string } }>('/admin/users/:id', async (req, reply) => {
        if (!requireAdmin(req, reply)) return;
        const { id } = req.params;
        if (isAppAdmin(id)) {
          return reply.code(400).send({ error: 'Cannot remove admin from directory' });
        }
        const [res] = await pool.execute<ResultSetHeader>('DELETE FROM user_directory WHERE uid = ?', [
          id,
        ]);
        if (!res.affectedRows) {
          return reply.code(404).send({ error: 'Not found' });
        }
        return reply.code(204).send();
      });

      r.get('/admin/reviews/pending', async (req, reply) => {
        if (!requireAdmin(req, reply)) return;
        const [rows] = await pool.query<ReviewRow[]>(
          'SELECT * FROM reviews WHERE is_published = 0 ORDER BY updated_at DESC',
        );
        return rows.map(rowToReview);
      });

      r.patch<{ Params: { id: string } }>('/admin/reviews/:id/approve', async (req, reply) => {
        if (!requireAdmin(req, reply)) return;
        const { id } = req.params;
        const body = (req.body as { isPublished?: boolean }) ?? {};
        const isPublished = Boolean(body.isPublished);
        const [existing] = await pool.query<ReviewRow[]>('SELECT * FROM reviews WHERE id = ?', [id]);
        if (!existing.length) {
          return reply.code(404).send({ error: 'Not found' });
        }
        await pool.execute('UPDATE reviews SET is_published = ?, updated_at = ? WHERE id = ?', [
          isPublished ? 1 : 0,
          new Date(),
          id,
        ]);
        const [updated] = await pool.query<ReviewRow[]>('SELECT * FROM reviews WHERE id = ?', [id]);
        return rowToReview(updated[0]!);
      });

      r.delete<{ Params: { id: string } }>('/admin/reviews/:id', async (req, reply) => {
        if (!requireAdmin(req, reply)) return;
        const { id } = req.params;
        const [res] = await pool.execute<ResultSetHeader>('DELETE FROM reviews WHERE id = ?', [id]);
        if (!res.affectedRows) {
          return reply.code(404).send({ error: 'Not found' });
        }
        return reply.code(204).send();
      });

      r.get('/admin/stats', async (req, reply) => {
        if (!requireAdmin(req, reply)) return;
        const [[reviewCounts]] = await pool.query<RowDataPacket[]>(
          `SELECT
            COUNT(*) AS totalReviews,
            SUM(CASE WHEN is_published = 1 THEN 1 ELSE 0 END) AS publishedReviews,
            SUM(CASE WHEN is_published = 0 THEN 1 ELSE 0 END) AS pendingReviews
          FROM reviews`,
        );
        const [[userCount]] = await pool.query<RowDataPacket[]>(
          'SELECT COUNT(*) AS totalUsers FROM user_directory',
        );
        const [genreRows] = await pool.query<RowDataPacket[]>(
          'SELECT genre, COUNT(*) AS c FROM reviews WHERE is_published = 1 GROUP BY genre',
        );
        const reviewsByGenre: Record<string, number> = {};
        for (const g of genreRows) {
          reviewsByGenre[String(g.genre)] = Number(g.c);
        }
        return {
          totalReviews: Number(reviewCounts.totalReviews) || 0,
          publishedReviews: Number(reviewCounts.publishedReviews) || 0,
          pendingReviews: Number(reviewCounts.pendingReviews) || 0,
          totalUsers: Number(userCount.totalUsers) || 0,
          reviewsByGenre,
        };
      });
    },
    { prefix: '/api' },
  );
}
