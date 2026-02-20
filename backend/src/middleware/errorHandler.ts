/**
 * Express 5.x Async Error Handling Middleware
 */

import type { Request, Response, NextFunction } from 'express';
import { BlinchApiError, ErrorCode } from '../types/errors';

/**
 * Wrap async functions to catch errors
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, any>>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Global error handler for Express 5.x
 */
export function errorHandler(
  err: Error | BlinchApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', err);

  // Handle Blinch API errors
  if (err instanceof BlinchApiError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // Handle unknown errors
  const statusCode = (err as any).statusCode || 500;
  const code = (err as any).code || ErrorCode.INTERNAL_ERROR;

  res.status(statusCode).json({
    error: {
      code,
      message: err.message || 'Internal server error',
    },
  });
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: ErrorCode.ACTION_NOT_FOUND,
      message: `Route not found: ${req.method} ${req.path}`,
    },
  });
}
