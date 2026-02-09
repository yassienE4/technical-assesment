import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from './errorHandler';

export const apiKeyMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const apiKey = req.header('x-api-key');

  if (!apiKey || apiKey !== process.env.API_KEY) {
    throw new UnauthorizedError('Unauthorized');
  }

  next();
};
