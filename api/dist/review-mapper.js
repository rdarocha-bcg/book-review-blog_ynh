export function rowToReview(row) {
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
