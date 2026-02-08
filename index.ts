import express, { Request, Response } from "express";

const app = express();
const PORT = 8080;



app.get("/api/home", (req: Request, res: Response) => {
  res.json({ message: "Welcome to the Home API!" });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});