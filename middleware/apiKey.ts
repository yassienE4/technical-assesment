import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from './errorHandler';

export const apiKeyMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = req.header('x-api-key');

    if (!apiKey || apiKey !== process.env.API_KEY) {
      throw new UnauthorizedError('Unauthorized');
    }

    next();
  } catch (error) {
    next(error);
  }
};
