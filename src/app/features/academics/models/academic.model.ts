/** Academic Work Model */
export interface AcademicWork {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl?: string;
  workType: string;
  context: string;
  year: number;
  theme: string;
  excerpt?: string;
  sourceUrl?: string;
  publishedAt: Date;
  updatedAt: Date;
  createdBy: string;
  isPublished: boolean;
  featured?: boolean;
}

export interface AcademicPaginationResponse {
  data: AcademicWork[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AcademicFilter {
  workType?: string;
  theme?: string;
  published?: boolean;
  featured?: boolean;
  page?: number;
  limit?: number;
}
