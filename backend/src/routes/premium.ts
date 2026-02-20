/**
 * Premium Tier API Routes
 * Endpoints for premium features and tier management
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { x402 } from '../middleware/x402.js';
import {
  getUserTier,
  getUserTierStats,
  getUpgradePaymentRequirements,
  processPremiumUpgrade,
} from '../services/tierService.js';
import { BlinchApiError, ErrorCode } from '../types/errors.js';
import { verifyBlinchPayment } from '../lib/paymentVerifier.js';
import type { Tier } from '../config/tiers.js';

const router = Router();

/**
 * GET /api/premium/tier
 *
 * Get current user tier and stats
 */
router.get(
  '/tier',
  asyncHandler(async (req, res) => {
    const { address } = req.query;

    if (!address || typeof address !== 'string') {
      throw new BlinchApiError(
        400,
        ErrorCode.VALIDATION_ERROR,
        'Address parameter is required'
      );
    }

    const tier = getUserTier(address);
    const stats = await getUserTierStats(address);

    res.json({
      tier,
      stats,
    });
  })
);

/**
 * POST /api/premium/upgrade
 *
 * Initiate premium upgrade (returns payment requirements)
 */
router.post(
  '/upgrade',
  asyncHandler(async (req, res) => {
    const { address } = req.body;

    if (!address || typeof address !== 'string') {
      throw new BlinchApiError(
        400,
        ErrorCode.VALIDATION_ERROR,
        'Address is required'
      );
    }

    const tier = getUserTier(address);

    if (tier === 'premium') {
      return res.json({
        alreadyPremium: true,
        message: 'You already have premium access',
      });
    }

    const paymentReq = getUpgradePaymentRequirements(address);

    if (!paymentReq) {
      throw new BlinchApiError(
        400,
        ErrorCode.INTERNAL_ERROR,
        'Unable to process upgrade request'
      );
    }

    res.json({
      paymentRequired: true,
      payment: {
        amount: paymentReq.amount,
        currency: 'sat',
        bch: (paymentReq.amount / 100000000).toFixed(8),
        recipient: paymentReq.recipient,
        actionType: paymentReq.actionType,
        description: paymentReq.description,
      },
      features: {
        unlimitedActions: true,
        advancedAnalytics: true,
        maxParameters: 10,
        apiAccess: true,
        customBranding: true,
      },
    });
  })
);

/**
 * POST /api/premium/activate
 *
 * Activate premium after payment
 * Requires X-Payment header with transaction ID
 */
router.post(
  '/activate',
  asyncHandler(async (req, res) => {
    const { address, txId } = req.body;
    const paymentTxId = req.headers['x-payment'] as string | undefined;

    if (!address || typeof address !== 'string') {
      throw new BlinchApiError(
        400,
        ErrorCode.VALIDATION_ERROR,
        'Address is required'
      );
    }

    if (!paymentTxId && !txId) {
      throw new BlinchApiError(
        400,
        ErrorCode.VALIDATION_ERROR,
        'Payment transaction ID is required (use X-Payment header or txId body)'
      );
    }

    const transactionId = paymentTxId || txId;

    // Verify payment
    const paymentReq = getUpgradePaymentRequirements(address);

    if (!paymentReq) {
      return res.json({
        alreadyPremium: true,
        message: 'You already have premium access',
      });
    }

    const isValidPayment = await verifyBlinchPayment({
      txId: transactionId,
      requiredAmount: paymentReq.amount,
      recipient: paymentReq.recipient,
      actionType: paymentReq.actionType,
    });

    if (!isValidPayment) {
      throw new BlinchApiError(
        402,
        ErrorCode.PAYMENT_INVALID,
        'Payment verification failed. Please ensure you sent the correct amount to the specified address.'
      );
    }

    // Process upgrade
    const success = await processPremiumUpgrade(address);

    if (!success) {
      throw new BlinchApiError(
        500,
        ErrorCode.INTERNAL_ERROR,
        'Failed to activate premium'
      );
    }

    res.json({
      success: true,
      tier: 'premium',
      message: 'Premium activated successfully',
    });
  })
);

/**
 * GET /api/premium/analytics/:actionId
 *
 * Get analytics for an action (premium only)
 */
router.get(
  '/analytics/:actionId',
  x402({
    amount: 10000, // 10,000 satoshis for analytics access
    recipient: process.env.MONETIZATION_ADDRESS || 'bitcoincash:qrqglczyxh4yvdnkkenk3k9ltq3e2j2dnqjvulv4rk',
    actionType: 'analytics_access',
    description: 'Access action analytics (one-time payment)',
  }),
  asyncHandler(async (req, res) => {
    const { actionId } = req.params;
    const id = Array.isArray(actionId) ? actionId[0] : actionId;

    // Payment verified by x402 middleware
    // Return analytics data
    const { getActionStore } = await import('../storage/index.js');
    const storeInstance = getActionStore();
    const action = storeInstance.get(id);

    if (!action) {
      throw new BlinchApiError(
        404,
        ErrorCode.ACTION_NOT_FOUND,
        `Action not found: ${actionId}`
      );
    }

    // TODO: Implement actual analytics tracking
    // For now, return placeholder data
    res.json({
      actionId,
      analytics: {
        views: Math.floor(Math.random() * 1000),
        clicks: Math.floor(Math.random() * 500),
        conversions: Math.floor(Math.random() * 100),
        totalBch: (Math.random() * 1).toFixed(8),
        createdAt: action.createdAt,
      },
    });
  })
);

export default router;
