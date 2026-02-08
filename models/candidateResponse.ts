export interface CandidateResponse {
  id: string;
  fullName: string;
  headline: string;
  location: string;
  yearsOfExperience: number;
  skills: string[];
  availability: string;
  status: string;
  score: number;

  shortlisted: boolean;
  rejected: boolean;
  updatedAt: string;
}
