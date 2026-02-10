import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../models/errorResponse';

// Custom error class for application errors
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Validation error class
export class ValidationError extends AppError {
  constructor(
    message: string,
    public details?: Record<string, string[]>
  ) {
    super(message, 400, 'VALIDATION_ERROR');
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

// Not found error class
export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND');
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

// Unauthorized error class
export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401, 'UNAUTHORIZED');
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

// Forbidden error class
export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403, 'FORBIDDEN');
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

// Global error handler middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const timestamp = new Date().toISOString();
  const path = req.path;

  // Log the error
  console.error({
    timestamp,
    method: req.method,
    path,
    statusCode: err.statusCode || 500,
    message: err.message,
    code: err.code || 'INTERNAL_SERVER_ERROR',
    stack: err.stack,
  });

  // Handle AppError instances
  if (err instanceof AppError) {
    let details: string[] = [];
    if (err instanceof ValidationError && err.details) {
      // Convert Record<string, string[]> to flat array
      details = Object.entries(err.details).flatMap(([field, errors]) => 
        errors.map(error => `${field}: ${error}`)
      );
    }
    const errorResponse: ErrorResponse = {
      error: {
        code: err.code || 'APP_ERROR',
        message: err.message,
        details,
      },
    };
    return res.status(err.statusCode).json(errorResponse);
  }

  // Handle Prisma errors
  if (typeof err?.code === 'string' && /^P\d{4}$/.test(err.code)) {
    const statusCode = getStatusCodeForPrismaError(err.code);
    const errorResponse: ErrorResponse = {
      error: {
        code: `PRISMA_${err.code}`,
        message: mapPrismaErrorMessage(err),
        details: [],
      },
    };
    return res.status(statusCode).json(errorResponse);
  }

  // Handle JSON parse errors
  if (err instanceof SyntaxError && (err as any).type === 'entity.parse.failed') {
    const errorResponse: ErrorResponse = {
      error: {
        code: 'INVALID_JSON',
        message: 'Invalid JSON in request body',
        details: [],
      },
    };
    return res.status(400).json(errorResponse);
  }

  // Handle generic errors
  const statusCode = err.statusCode || 500;
  const errorResponse: ErrorResponse = {
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: statusCode === 500 ? 'Internal server error' : err.message,
      details: [],
    },
  };

  res.status(statusCode).json(errorResponse);
};

// Helper function to map Prisma error codes to HTTP status codes
function getStatusCodeForPrismaError(code: string): number {
  const prismaErrorMap: Record<string, number> = {
    P2000: 400, // The provided value for the column is too long for the column's type.
    P2001: 404, // The record searched for in the WHERE condition does not exist.
    P2002: 409, // Unique constraint failed.
    P2003: 400, // Foreign key constraint failed.
    P2004: 400, // A constraint failed on the database.
    P2005: 400, // The value stored in the database is invalid for the field's type.
    P2006: 400, // The provided value is invalid.
    P2007: 400, // Data validation error.
    P2008: 400, // Failed to parse the query.
    P2009: 400, // Failed to validate the query.
    P2010: 500, // Raw query failed.
    P2011: 400, // Null constraint violation.
    P2012: 400, // Missing a required value.
    P2013: 400, // Missing the required argument.
    P2014: 400, // The change you are trying to make would violate a required relation.
    P2015: 404, // A related record could not be found.
    P2016: 400, // Query interpretation error.
    P2017: 400, // The records for the relation between the requested models are not connected.
    P2018: 400, // The required relation does not exist.
    P2019: 400, // Input error.
    P2020: 500, // Value out of range.
    P2021: 404, // The table does not exist in the current database.
    P2022: 404, // The column does not exist in the current database.
    P2023: 400, // Inconsistent column data.
    P2024: 500, // Timed out fetching a new connection from the pool.
    P2025: 404, // An operation failed because it depends on one or more records that were required but not found.
  };

  return prismaErrorMap[code] || 500;
}

// Helper function to map Prisma error codes to user-friendly messages
function mapPrismaErrorMessage(err: any): string {
  const code = err.code;

  const messageMap: Record<string, string> = {
    P2002: 'This record already exists.',
    P2003: 'Invalid reference to related record.',
    P2015: 'Related record not found.',
    P2025: 'Record not found.',
  };

  return messageMap[code] || err.message || 'A database error occurred.';
}

// Async error wrapper for Express route handlers
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};
