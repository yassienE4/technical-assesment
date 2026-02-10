export interface ListCandidatesQuery {
  q?: string;
  location?: string;
  skill?: string;
  status?: string;
  availability?: string;
  minExp?: number;
  maxExp?: number;
  sort?: 'updatedAt' | 'score' | 'yearsOfExperience';
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
