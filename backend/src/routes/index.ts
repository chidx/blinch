/**
 * Route aggregator
 */

import { Router } from 'express';
import actionsRouter from './actions';
import healthRouter from './health';

const router = Router();

// Mount routes
router.use('/action', actionsRouter);
router.use('/actions', actionsRouter);
router.use('/health', healthRouter);

export default router;
