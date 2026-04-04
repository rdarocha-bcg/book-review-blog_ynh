import type { RowDataPacket } from 'mysql2';

export type ReviewRow = RowDataPacket & {
  id: string;
  title: string;
  author: string;
  book_title: string;
  book_author: string;
  rating: string | number;
  genre: string;
  description: string | null;
  content: string | null;
  image_url: string | null;
  published_at: Date;
  updated_at: Date;
  created_by: string;
  is_published: number | boolean;
};

export function rowToReview(row: ReviewRow) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    bookTitle: row.book_title,
    bookAuthor: row.book_author,
    rating: typeof row.rating === 'string' ? parseFloat(row.rating) : row.rating,
    genre: row.genre,
    description: row.description ?? '',
    content: row.content ?? '',
    imageUrl: row.image_url ?? undefined,
    publishedAt: new Date(row.published_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    createdBy: row.created_by,
    isPublished: Boolean(row.is_published),
  };
}
