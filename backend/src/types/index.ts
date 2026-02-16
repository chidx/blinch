/**
 * Backend TypeScript Types
 */

export * from './action';
export * from './express';

declare global {
  namespace Express {
    interface Request {
      actionId?: string;
    }
  }
}
