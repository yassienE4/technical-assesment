import express, { Request, Response } from "express";
import { prisma } from './lib/prisma';

const app = express();
const PORT = 8080;


app.get("/health", async (req, res) => {
  const base = {
    uptime: process.uptime(),
    timestamp: Date.now()
  };

  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      ...base,
      status: "ok",
      db: "ok"
    });
  } catch {
    return res.status(503).json({
      ...base,
      status: "degraded",
      db: "down"
    });
  }
});

app.get("/api/home", (req: Request, res: Response) => {
  res.json({ message: "Welcome to the Home API!" });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});