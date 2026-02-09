import express, { Request, Response, NextFunction } from "express";
import { prisma } from './lib/prisma';
import { errorHandler, asyncHandler, AppError } from './middleware/errorHandler';
import { apiKeyMiddleware } from './middleware/apiKey';
import cors from "cors";
import dotenv from 'dotenv';
import morgan from 'morgan';

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

app.get("/api/home", (req: Request, res: Response) => {
  res.json({ success: true, message: "Welcome to the Home API!" });
});

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  throw new AppError(`Route not found: ${req.method} ${req.path}`, 404, 'ROUTE_NOT_FOUND');
});

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});