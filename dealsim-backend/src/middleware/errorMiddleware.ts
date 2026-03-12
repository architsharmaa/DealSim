import type { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[ERROR] ${req.method} ${req.url}:`, err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val: any) => val.message)
      .join(', ');
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
