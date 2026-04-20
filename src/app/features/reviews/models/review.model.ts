/**
 * Review Model
 * Represents a book review
 */
export interface Review {
  featured?: boolean;
  id: string;
  title: string;
  author: string;
  bookTitle: string;
  bookAuthor: string;
  rating: number;
  genre: string;
  description: string;
  content: string;
  imageUrl?: string;
  publishedAt: Date;
  updatedAt: Date;
  createdBy: string;
  isPublished: boolean;
}

/**
 * Review Filter
 */
export interface ReviewFilter {
  genre?: string;
  rating?: number;
  search?: string;
  author?: string;
  sort?: 'newest' | 'oldest' | 'rating-high' | 'rating-low';
  page?: number;
  limit?: number;
}

/**
 * Review Pagination Response
 */
export interface ReviewPaginationResponse {
  data: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

