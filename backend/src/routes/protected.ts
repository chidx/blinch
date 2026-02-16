/**
 * Protected API Routes with x402 Payment Flow
 *
 * Example endpoints demonstrating the full AI agent flow:
 * 1. Agent requests protected resource
 * 2. Server returns 402 with Blinch payment link
 * 3. Agent uses MCP to sign payment transaction
 * 4. Agent retries with X-Payment header
 * 5. Server grants access (200 OK)
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { x402 } from '../middleware/x402';

const router = Router();

// Payment configuration for protected endpoints
const API_ACCESS_PAYMENT = {
  amount: 1000, // 1000 satoshis
  recipient: 'bitcoincash:qzp2wq8l9r5h6l7x8z9c0b1n2m3k4j5k6l7z8c9b0n1',
  actionType: 'api_access',
  description: 'Access to premium API endpoint',
};

const PREMIUM_DATA_PAYMENT = {
  amount: 5000, // 5000 satoshis
  recipient: 'bitcoincash:qzp2wq8l9r5h6l7x8z9c0b1n2m3k4j5k6l7z8c9b0n1',
  actionType: 'premium_data',
  description: 'Access to premium data feed',
};

/**
 * GET /api/protected/hello
 *
 * Simple protected endpoint requiring payment
 *
 * Flow:
 * 1. First request: Returns 402 with payment headers
 * 2. After payment: Returns hello message
 */
router.get(
  '/hello',
  x402(API_ACCESS_PAYMENT),
  asyncHandler(async (_req, res) => {
    res.json({
      message: 'Hello! You have successfully paid for access.',
      timestamp: new Date().toISOString(),
      payment: (req as any).blinchPayment,
    });
  })
);

/**
 * GET /api/protected/data
 *
 * Protected endpoint that returns sensitive data
 */
router.get(
  '/data',
  x402(API_ACCESS_PAYMENT),
  asyncHandler(async (_req, res) => {
    res.json({
      data: {
        id: 'secret-data-123',
        value: 'This is protected information',
        timestamp: new Date().toISOString(),
      },
      payment: (req as any).blinchPayment,
    });
  })
);

/**
 * GET /api/protected/premium
 *
 * Premium endpoint requiring higher payment
 */
router.get(
  '/premium',
  x402(PREMIUM_DATA_PAYMENT),
  asyncHandler(async (_req, res) => {
    res.json({
      premium: {
        features: ['AI predictions', 'Advanced analytics', 'Real-time data'],
        subscription: 'premium',
        expiresAt: new Date(Date.now() + 86400000).toISOString(), // 24 hours
      },
      payment: (req as any).blinchPayment,
    });
  })
);

/**
 * GET /api/protected/ai-prompt
 *
 * Example AI prompt endpoint that requires payment
 *
 * This demonstrates the AI agent use case where an AI assistant
 * needs to pay to access a prompt template or data feed.
 */
router.get(
  '/ai-prompt',
  x402(API_ACCESS_PAYMENT),
  asyncHandler(async (req, res) => {
    const promptTemplate = {
      name: 'Advanced Code Review',
      template: 'You are an expert code reviewer. Analyze the following code for:\n- Security vulnerabilities\n- Performance issues\n- Best practices\n\nCode: {code}',
      variables: ['code'],
      category: 'development',
      quality: 'premium',
    };

    res.json({
      prompt: promptTemplate,
      payment: (req as any).blinchPayment,
    });
  })
);

/**
 * POST /api/protected/generate
 *
 * Protected generation endpoint
 */
router.post(
  '/generate',
  x402(API_ACCESS_PAYMENT),
  asyncHandler(async (req, res) => {
    const { input } = req.body;

    // Simulate AI generation
    const result = {
      generated: `Generated result for: ${input}`,
      timestamp: new Date().toISOString(),
      model: 'blinch-ai-v1',
    };

    res.json({
      result,
      payment: (req as any).blinchPayment,
    });
  })
);

export default router;
