import express, { Request, Response, NextFunction } from "express";
import { prisma } from './lib/prisma';
import { errorHandler, asyncHandler, AppError } from './middleware/errorHandler';
import { apiKeyMiddleware } from './middleware/apiKey';
import cors from "cors";
import dotenv from 'dotenv';
import morgan from 'morgan';
import {
  validateListCandidatesQuery,
  validateUpdateCandidateRequest,
} from './lib/validations';
import {
  listCandidates,
  getCandidateById,
  updateCandidate,
  getRelatedCandidates,
} from './services/candidateService';

dotenv.config();

const app = express();
const PORT = 8080;

// Middleware
app.use(
  morgan(':method :url :status :response-time ms')
);

const corsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

app.use(express.json());

app.use('/api', apiKeyMiddleware);

// Routes

app.get("/health", asyncHandler(async (req: Request, res: Response) => {
  const base = {
    uptime: process.uptime(),
    timestamp: Date.now()
  };
  
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      success: true,
      ...base,
      status: "ok",
      db: "ok"
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      ...base,
      status: "degraded",
      db: "down"
    });
  }
}));

// Candidate routes

// GET /candidates - List candidates with search, filter, sort, and pagination
app.get('/api/candidates', asyncHandler(async (req: Request, res: Response) => {
  const query = validateListCandidatesQuery(req.query);
  const result = await listCandidates(query);
  return res.status(200).json(result);
}));

// GET /candidates/:id - Get candidate by ID
app.get('/api/candidates/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const candidate = await getCandidateById(id);
  return res.status(200).json(candidate);
}));

// PATCH /candidates/:id - Update candidate
app.patch('/api/candidates/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const updates = validateUpdateCandidateRequest(req.body);
  const candidate = await updateCandidate(id, updates);
  return res.status(200).json(candidate);
}));

// GET /candidates/:id/related - Get related candidates
app.get('/api/candidates/:id/related', asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const related = await getRelatedCandidates(id);
  return res.status(200).json({ data: related });
}));


// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  throw new AppError(`Route not found: ${req.method} ${req.path}`, 404, 'ROUTE_NOT_FOUND');
});

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});