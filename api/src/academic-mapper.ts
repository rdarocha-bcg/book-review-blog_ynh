import type { RowDataPacket } from 'mysql2';

export type AcademicRow = RowDataPacket & {
  id: string;
  title: string;
  summary: string;
  content: string | null;
  image_url: string | null;
  work_type: string;
  context: string | null;
  year: number | null;
  theme: string | null;
  excerpt: string | null;
  source_url: string | null;
  published_at: Date;
  updated_at: Date;
  created_by: string;
  is_published: number | boolean;
  featured: number | boolean;
};

export function rowToAcademic(row: AcademicRow) {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    content: row.content ?? '',
    imageUrl: row.image_url ?? undefined,
    workType: row.work_type,
    context: row.context ?? undefined,
    year: row.year ?? undefined,
    theme: row.theme ?? undefined,
    excerpt: row.excerpt ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    publishedAt: new Date(row.published_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    createdBy: row.created_by,
    isPublished: Boolean(row.is_published),
    featured: Boolean(row.featured),
  };
}
