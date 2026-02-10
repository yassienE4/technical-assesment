import { prisma } from '../lib/prisma';
import { NotFoundError } from '../middleware/errorHandler';
import { ListCandidatesQuery } from '../models/listCandidatesQuery';
import { UpdateCandidateRequest } from '../models/updateCandidateRequest';
import { Candidate } from '../models/candidate';
import { CandidateListResponse } from '../models/candidateListResponse';

// Simple in-memory cache
interface CacheEntry {
  data: CandidateListResponse;
  timestamp: number;
}

const listCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Generate cache key from query parameters
 */
function getCacheKey(query: ListCandidatesQuery): string {
  return JSON.stringify(query);
}

/**
 * Clear the list cache (called on data mutations)
 */
function clearListCache(): void {
  listCache.clear();
}

/**
 * List candidates with search, filter, sort, and pagination
 */
export async function listCandidates(
  query: ListCandidatesQuery
): Promise<CandidateListResponse> {
  // Check cache first
  const cacheKey = getCacheKey(query);
  const cached = listCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const {
    q,
    location,
    skill,
    status,
    availability,
    minExp,
    maxExp,
    sort = 'updatedAt',
    order = 'desc',
    page = 1,
    pageSize = 12,
  } = query;

  // Build where clause
  const where: any = {};

  if (q) {
    // Full-text search across fullName, headline, and skills
    where.OR = [
      { fullName: { contains: q, mode: 'insensitive' } },
      { headline: { contains: q, mode: 'insensitive' } },
      {
        skills: {
          hasSome: [q], // This checks if array contains the search term
        },
      },
    ];
  }

  if (location) {
    where.location = { contains: location, mode: 'insensitive' };
  }

  if (skill) {
    where.skills = { has: skill };
  }

  if (status) {
    where.status = { contains: status, mode: 'insensitive' };
  }

  if (availability) {
    where.availability = { contains: availability, mode: 'insensitive' };
  }

  if (minExp !== undefined) {
    where.yearsOfExperience = { gte: minExp };
  }

  if (maxExp !== undefined) {
    if (where.yearsOfExperience) {
      where.yearsOfExperience.lte = maxExp;
    } else {
      where.yearsOfExperience = { lte: maxExp };
    }
  }

  // Get total count
  const total = await prisma.candidate.count({ where });

  // Calculate pagination
  const skip = (page - 1) * pageSize;
  const totalPages = Math.ceil(total / pageSize);

  // Fetch candidates
  const candidates = await prisma.candidate.findMany({
    where,
    orderBy: { [sort]: order },
    skip,
    take: pageSize,
  });

  // Transform to response format
  const transformedCandidates: Candidate[] = candidates.map((c) => ({
    id: c.id,
    fullName: c.fullName,
    headline: c.headline,
    location: c.location,
    yearsOfExperience: c.yearsOfExperience,
    skills: c.skills,
    availability: c.availability,
    status: c.status,
    score: c.score,
    shortlisted: c.shortlisted,
    rejected: c.rejected,
    updatedAt: c.updatedAt.toISOString(),
    createdAt: c.createdAt.toISOString(),
  }));

  const result = {
    data: transformedCandidates,
    meta: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };

  // Store in cache
  listCache.set(cacheKey, {
    data: result,
    timestamp: Date.now(),
  });

  return result;
}

/**
 * Get candidate by ID
 */
export async function getCandidateById(id: string): Promise<Candidate> {
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: { auditLog: { orderBy: { at: 'desc' } } },
  });

  if (!candidate) {
    throw new NotFoundError(`Candidate with ID ${id} not found`);
  }

  return {
    id: candidate.id,
    fullName: candidate.fullName,
    headline: candidate.headline,
    location: candidate.location,
    yearsOfExperience: candidate.yearsOfExperience,
    skills: candidate.skills,
    availability: candidate.availability,
    status: candidate.status,
    score: candidate.score,
    shortlisted: candidate.shortlisted,
    rejected: candidate.rejected,
    updatedAt: candidate.updatedAt.toISOString(),
    createdAt: candidate.createdAt.toISOString(),
    auditLog: candidate.auditLog.map((e) => ({
      id: e.id,
      at: e.at.toISOString(),
      action: e.action,
      from: e.from ?? undefined,
      to: e.to ?? undefined,
    })),
  };
}

/**
 * Update candidate and create audit log entry
 */
export async function updateCandidate(
  id: string,
  updates: UpdateCandidateRequest
): Promise<Candidate> {
  // Clear cache on update
  clearListCache();

  // Check if candidate exists
  const candidate = await prisma.candidate.findUnique({ where: { id } });
  if (!candidate) {
    throw new NotFoundError(`Candidate with ID ${id} not found`);
  }

  // Create audit log entries
  const auditEntries: any[] = [];

  if (updates.status !== undefined && updates.status !== candidate.status) {
    auditEntries.push({
      action: 'status_updated',
      from: candidate.status,
      to: updates.status,
    });
  }

  if (
    updates.shortlisted !== undefined &&
    updates.shortlisted !== candidate.shortlisted
  ) {
    auditEntries.push({
      action: 'shortlisted_updated',
      from: String(candidate.shortlisted),
      to: String(updates.shortlisted),
    });
  }

  if (
    updates.rejected !== undefined &&
    updates.rejected !== candidate.rejected
  ) {
    auditEntries.push({
      action: 'rejected_updated',
      from: String(candidate.rejected),
      to: String(updates.rejected),
    });
  }

  // Update candidate and create audit logs in transaction
  const updateData: any = {
    status: updates.status ?? candidate.status,
    shortlisted: updates.shortlisted ?? candidate.shortlisted,
    rejected: updates.rejected ?? candidate.rejected,
  };

  // Only add auditLog if there are entries
  if (auditEntries.length > 0) {
    updateData.auditLog = {
      createMany: {
        data: auditEntries,
      },
    };
  }

  const updated = await prisma.candidate.update({
    where: { id },
    data: updateData,
    include: { auditLog: { orderBy: { at: 'desc' } } },
  });

  return {
    id: updated.id,
    fullName: updated.fullName,
    headline: updated.headline,
    location: updated.location,
    yearsOfExperience: updated.yearsOfExperience,
    skills: updated.skills,
    availability: updated.availability,
    status: updated.status,
    score: updated.score,
    shortlisted: updated.shortlisted,
    rejected: updated.rejected,
    updatedAt: updated.updatedAt.toISOString(),
    createdAt: updated.createdAt.toISOString(),
    auditLog: updated.auditLog.map((e) => ({
      id: e.id,
      at: e.at.toISOString(),
      action: e.action,
      from: e.from ?? undefined,
      to: e.to ?? undefined,
    })),
  };
}

/**
 * Get related candidates based on:
 * - Skill overlap (weighted: 50%)
 * - Location match (weighted: 30%)
 * - Experience band similarity (weighted: 20%)
 */
export async function getRelatedCandidates(
  id: string,
  limit: number = 8
): Promise<Candidate[]> {
  // Get the target candidate
  const targetCandidate = await prisma.candidate.findUnique({
    where: { id },
  });

  if (!targetCandidate) {
    throw new NotFoundError(`Candidate with ID ${id} not found`);
  }

  // Get all other candidates
  const allCandidates = await prisma.candidate.findMany({
    where: { id: { not: id } },
  });

  // Score each candidate based on similarity
  const scoredCandidates = allCandidates.map((candidate) => {
    let score = 0;

    // Skill overlap (50%)
    const commonSkills = candidate.skills.filter((s) =>
      targetCandidate.skills.includes(s)
    );
    const skillScore =
      (commonSkills.length /
        Math.max(
          candidate.skills.length,
          targetCandidate.skills.length,
          1
        )) *
      50;
    score += skillScore;

    // Location match (30%)
    const locationScore =
      candidate.location.toLowerCase() ===
      targetCandidate.location.toLowerCase()
        ? 30
        : 0;
    score += locationScore;

    // Experience band similarity (20%)
    const expDiff = Math.abs(
      candidate.yearsOfExperience - targetCandidate.yearsOfExperience
    );
    const experienceScore = Math.max(0, 20 - expDiff * 2);
    score += experienceScore;

    return { candidate, score };
  });

  // Sort by score descending and take top N
  const related = scoredCandidates
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ candidate }) => ({
      id: candidate.id,
      fullName: candidate.fullName,
      headline: candidate.headline,
      location: candidate.location,
      yearsOfExperience: candidate.yearsOfExperience,
      skills: candidate.skills,
      availability: candidate.availability,
      status: candidate.status,
      score: candidate.score,
      shortlisted: candidate.shortlisted,
      rejected: candidate.rejected,
      updatedAt: candidate.updatedAt.toISOString(),
      createdAt: candidate.createdAt.toISOString(),
    }));

  return related;
}
