import { AcademicWork } from '@features/academics/models/academic.model';

/**
 * Raw API response shape for an AcademicWork.
 * Dates arrive as ISO strings from the JSON payload.
 */
export interface AcademicWorkDto {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl?: string;
  workType: string;
  context: string;
  year: number;
  theme?: string | null;
  excerpt?: string;
  sourceUrl?: string;
  publishedAt: string;
  updatedAt: string;
  createdBy: string;
  isPublished: boolean;
  featured?: boolean;
}

/** Maps a raw API DTO to the typed domain model (strings → Dates). */
export function fromAcademicWorkDto(dto: AcademicWorkDto): AcademicWork {
  return {
    ...dto,
    publishedAt: new Date(dto.publishedAt),
    updatedAt: new Date(dto.updatedAt),
  };
}
