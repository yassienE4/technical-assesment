import { ValidationError } from '../middleware/errorHandler';
import { UpdateCandidateRequest } from './updateCandidateRequest';

// List candidates query parameters
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

// Validate list candidates query parameters
export function validateListCandidatesQuery(query: any): ListCandidatesQuery {
  const errors: Record<string, string[]> = {};

  // Parse and validate page
  let page = 1;
  if (query.page !== undefined) {
    const parsed = parseInt(query.page, 10);
    if (isNaN(parsed) || parsed < 1) {
      errors.page = ['Page must be a positive integer'];
    } else {
      page = parsed;
    }
  }

  // Parse and validate pageSize
  let pageSize = 12; // default
  if (query.pageSize !== undefined) {
    const parsed = parseInt(query.pageSize, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 50) {
      errors.pageSize = ['Page size must be between 1 and 50'];
    } else {
      pageSize = parsed;
    }
  }

  // Validate sort
  let sort: 'updatedAt' | 'score' | 'yearsOfExperience' = 'updatedAt';
  if (query.sort !== undefined) {
    if (!['updatedAt', 'score', 'yearsOfExperience'].includes(query.sort)) {
      errors.sort = ['Sort must be one of: updatedAt, score, yearsOfExperience'];
    } else {
      sort = query.sort as any;
    }
  }

  // Validate order
  let order: 'asc' | 'desc' = 'desc';
  if (query.order !== undefined) {
    if (!['asc', 'desc'].includes(query.order)) {
      errors.order = ['Order must be either asc or desc'];
    } else {
      order = query.order as any;
    }
  }

  // Validate minExp
  let minExp: number | undefined;
  if (query.minExp !== undefined) {
    const parsed = parseInt(query.minExp, 10);
    if (isNaN(parsed) || parsed < 0) {
      errors.minExp = ['Minimum experience must be a non-negative number'];
    } else {
      minExp = parsed;
    }
  }

  // Validate maxExp
  let maxExp: number | undefined;
  if (query.maxExp !== undefined) {
    const parsed = parseInt(query.maxExp, 10);
    if (isNaN(parsed) || parsed < 0) {
      errors.maxExp = ['Maximum experience must be a non-negative number'];
    } else {
      maxExp = parsed;
    }
  }

  // Cross-field validation
  if (minExp !== undefined && maxExp !== undefined && minExp > maxExp) {
    errors.experience = ['minExp cannot be greater than maxExp'];
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Invalid query parameters', errors);
  }

  return {
    q: query.q,
    location: query.location,
    skill: query.skill,
    status: query.status,
    availability: query.availability,
    minExp,
    maxExp,
    sort,
    order,
    page,
    pageSize,
  };
}

// Validate update candidate request body
export function validateUpdateCandidateRequest(body: any): UpdateCandidateRequest {
  const errors: Record<string, string[]> = {};
  const allowed = ['status', 'shortlisted', 'rejected'];

  // Check for unknown fields
  for (const key in body) {
    if (!allowed.includes(key)) {
      errors[key] = ['Unknown field'];
    }
  }

  // Validate status (if provided)
  if (body.status !== undefined) {
    if (typeof body.status !== 'string' || body.status.trim() === '') {
      errors.status = ['Status must be a non-empty string'];
    }
  }

  // Validate shortlisted (if provided)
  if (body.shortlisted !== undefined) {
    if (typeof body.shortlisted !== 'boolean') {
      errors.shortlisted = ['Shortlisted must be a boolean'];
    }
  }

  // Validate rejected (if provided)
  if (body.rejected !== undefined) {
    if (typeof body.rejected !== 'boolean') {
      errors.rejected = ['Rejected must be a boolean'];
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Invalid request body', errors);
  }

  return {
    status: body.status,
    shortlisted: body.shortlisted,
    rejected: body.rejected,
  };
}
