// src/middleware/error.middleware.ts
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

interface CustomError {
  message: string;
  statusCode: number;
}

const errorMiddleware = (
  err: any,
  _: Request,
  res: Response,
): void => {
  const customError: CustomError = {
    message: err.message || "INTERNAL SERVER ERROR",
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
  };

  res.status(customError.statusCode).json({
    success: false,
    message: customError.message,
  });
};

export default errorMiddleware;