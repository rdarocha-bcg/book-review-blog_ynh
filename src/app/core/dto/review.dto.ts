import { Review } from '@features/reviews/models/review.model';

/**
 * Raw API response shape for a Review.
 * Dates arrive as ISO strings from the JSON payload.
 */
export interface ReviewDto {
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
  publishedAt: string;
  updatedAt: string;
  createdBy: string;
  isPublished: boolean;
  featured?: boolean;
}

/** Maps a raw API DTO to the typed domain model (strings → Dates). */
export function fromReviewDto(dto: ReviewDto): Review {
  return {
    ...dto,
    publishedAt: new Date(dto.publishedAt),
    updatedAt: new Date(dto.updatedAt),
  };
}
