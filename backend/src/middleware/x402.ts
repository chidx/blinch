/**
 * x402 Middleware - HTTP 402 Payment Required
 *
 * Express middleware that implements the x402 protocol for monetized API access.
 * When a protected resource is requested without payment, returns 402 with
 * payment link and amount headers.
 *
 * Flow:
 * 1. Agent requests protected resource
 * 2. Server returns 402 with X-Payment-Link and X-Payment-Amount headers
 * 3. Agent uses Blinch MCP to create and sign payment transaction
 * 4. Agent retries request with X-Payment header containing transaction ID
 * 5. Server verifies payment and returns 200 OK with resource
 */

import type { Request, Response, NextFunction } from 'express';
import { verifyBlinchPayment } from '../lib/paymentVerifier';

/**
 * x402 configuration options
 */
export interface X402Options {
  /**
   * Required payment amount in satoshis
   */
  amount: number;

  /**
   * Recipient Bitcoin Cash address
   */
  recipient: string;

  /**
   * Optional action type for the payment
   */
  actionType?: string;

  /**
   * Optional description of what's being paid for
   */
  description?: string;

  /**
   * Custom function to generate payment link
   * Defaults to creating a standard Blinch link
   */
  paymentLinkGenerator?: (params: {
    amount: number;
    recipient: string;
    actionType?: string;
  }) => string;
}

/**
 * Default payment link generator
 */
function defaultPaymentLinkGenerator(params: {
  amount: number;
  recipient: string;
  actionType?: string;
}): string {
  const { amount, recipient, actionType } = params;

  // Build Bitcoin Cash URI
  const urlParams = new URLSearchParams();
  urlParams.set('amount', (amount / 100000000).toString()); // Convert to BCH
  urlParams.set('op_return', '464c4f5701' + (actionType || ''));

  return `${recipient}?${urlParams.toString()}`;
}

/**
 * x402 middleware factory
 *
 * @example
 * ```ts
 * app.get('/api/protected', x402({
 *   amount: 1000, // 1000 satoshis
 *   recipient: 'bitcoincash:qzp2wq8l9r5h6l7x8z9c0b1n2m3k4j5k6l7z8c9b0n1',
 *   actionType: 'api_access',
 *   description: 'Access to premium API endpoint'
 * }), protectedHandler);
 * ```
 */
export function x402(options: X402Options) {
  const {
    amount,
    recipient,
    actionType = 'api_access',
    description,
    paymentLinkGenerator = defaultPaymentLinkGenerator,
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if payment header is present
      const paymentTxId = req.headers['x-payment'] as string | undefined;

      if (paymentTxId) {
        // Verify the payment transaction
        const isValid = await verifyBlinchPayment({
          txId: paymentTxId,
          requiredAmount: amount,
          recipient,
          actionType,
        });

        if (isValid) {
          // Payment verified, attach info to request and continue
          (req as any).blinchPayment = {
            txId: paymentTxId,
            amount,
            verified: true,
          };
          return next();
        }

        // Invalid payment
        return res.status(402).json({
          error: {
            code: 'PAYMENT_INVALID',
            message: 'Payment transaction is invalid or does not meet requirements',
          },
        });
      }

      // No payment provided - request payment
      const paymentLink = paymentLinkGenerator({
        amount,
        recipient,
        actionType,
      });

      // Set x402 headers
      res.setHeader('X-Payment-Link', paymentLink);
      res.setHeader('X-Payment-Amount', amount.toString());
      res.setHeader('X-Payment-Currency', 'sat');

      if (description) {
        res.setHeader('X-Payment-Description', description);
      }

      // Return 402 Payment Required
      return res.status(402).json({
        error: {
          code: 'PAYMENT_REQUIRED',
          message: 'Payment required to access this resource',
          payment_link: paymentLink,
          payment_amount: amount,
          payment_currency: 'sat',
          protocol: 'Blinch',
          protocol_prefix: '464c4f5701',
        },
      });
    } catch (error) {
      console.error('x402 middleware error:', error);
      return res.status(500).json({
        error: {
          code: 'PAYMENT_VERIFICATION_ERROR',
          message: 'Failed to verify payment',
        },
      });
    }
  };
}

/**
 * Decorator for route handlers that require payment
 *
 * @example
 * ```ts
 * const protectedHandler = withPayment(
 *   { amount: 1000, recipient: 'bitcoincash:...' },
 *   async (req, res) => {
 *     // Handler code - payment already verified
 *     res.json({ data: 'sensitive data' });
 *   }
 * );
 * ```
 */
export function withPayment<T extends any[]>(
  options: X402Options,
  handler: (req: Request, res: Response, next: NextFunction, ...args: T) => void | Promise<void>
) {
  const middleware = x402(options);
  return async (req: Request, res: Response, next: NextFunction, ...args: T): Promise<void> => {
    // Apply middleware
    await new Promise<void>((resolve, reject) => {
      middleware(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if payment was verified (middleware would have returned 402 if not)
    if (res.headersSent) {
      return; // Middleware already sent response
    }

    // Call the actual handler
    await handler(req, res, next, ...args);
  };
}
