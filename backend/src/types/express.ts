/**
 * Express 5.x Extended Types
 */

import { ErrorCode } from './errors';

export interface ApiError extends Error {
  statusCode: number;
  code: ErrorCode;
  details?: unknown;
}

export interface AsyncHandler {
  (req: Request, res: Response, next: NextFunction): Promise<void>;
}
