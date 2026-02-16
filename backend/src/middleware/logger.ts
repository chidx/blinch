/**
 * Request logging middleware
 */

import type { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, path } = req;
    const statusCode = res.statusCode;

    console.log(
      `${new Date().toISOString()} ${method} ${path} ${statusCode} - ${duration}ms`
    );
  });

  next();
}
