export interface Candidate {
    id: string;
    fullName: string;
    headline: string;
    location: string;
    yearsOfExperience: number;
    skills: string[];
    availability: string;
    updatedAt: string; // ISO date string
    status: string;
    score: number;
}