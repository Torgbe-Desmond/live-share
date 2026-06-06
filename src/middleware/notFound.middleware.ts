// src/middleware/notFound.middleware.ts
import { Request, Response } from "express";

const notFound = (_: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
};

export default notFound;