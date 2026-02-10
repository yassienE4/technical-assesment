import { Candidate } from "./candidate";

export interface CandidateListResponse {
  data: Candidate[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}