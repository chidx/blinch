/**
 * Express 5.x Extended Types
 */

import { ErrorCode } from './errors';
import type { NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode: number;
  code: ErrorCode;
  details?: unknown;
}

export interface AsyncHandler {
  (req: Request, res: Response, next: NextFunction): Promise<void>;
}
