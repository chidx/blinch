/**
 * Health check routes
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /health
 *
 * Health check endpoint
 */
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json({
      status: 'ok',
      service: 'blinch-backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  })
);

export default router;
