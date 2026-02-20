/**
 * Route aggregator
 */

import { Router } from 'express';
import actionsRouter from './actions';
import healthRouter from './health';
import protectedRouter from './protected';
import premiumRouter from './premium';

const router = Router();

// Mount routes
router.use('/action', actionsRouter);
router.use('/actions', actionsRouter);
router.use('/health', healthRouter);
router.use('/protected', protectedRouter);
router.use('/premium', premiumRouter);

export default router;
