/**
 * Action API Routes
 * GET /api/action/:id - Returns BCH-Action JSON Schema v1.1.0
 * POST /api/action - Create a new action (public submissions)
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import {
  buildBlinchAction,
  validateBchAddress,
  validateActionParameters,
} from '../lib/action-builder';
import { BlinchApiError, ErrorCode } from '../types/errors';
import { getActionStore, initializeActionStore } from '../storage/index.js';
import { canCreateAction } from '../services/tierService.js';
import type { BlinchActionSchema } from '../types/action';

const router = Router();

// Initialize store on module load
let actionStore = await initializeActionStore();

// Initialize with example action if store is empty
if (actionStore.getAll().length === 0) {
  const exampleSchema = buildBlinchAction({
    id: 'example',
    title: 'Example Blinch Action',
    description: 'An example interactive Bitcoin Cash action',
    recipientAddress: 'bitcoincash:qzp2wq8l9r5h6l7x8z9c0b1n2m3k4j5k6l7z8c9b0n1',
    amount: '0.01',
    actionType: 'tip',
    parameters: [
      {
        name: 'note',
        label: 'Public Note',
        type: 'text',
        required: false,
      },
    ],
  });

  await actionStore.create(exampleSchema);
}

/**
 * GET /api/action/:id
 *
 * Returns BCH-Action JSON Schema v1.1.0 for the given action ID
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate action ID format
    if (!id || (typeof id === 'string' && id.length < 3)) {
      throw new BlinchApiError(
        400,
        ErrorCode.INVALID_ACTION_ID,
        'Invalid action ID format'
      );
    }

    // Handle array of IDs (use first one)
    const actionId = Array.isArray(id) ? id[0] : id;

    // Retrieve action from storage
    const action = actionStore.get(actionId);

    if (!action) {
      throw new BlinchApiError(
        404,
        ErrorCode.ACTION_NOT_FOUND,
        `Action not found: ${id}`
      );
    }

    // Return action schema with proper headers
    res.set({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300', // 5 minutes
      'X-Blinch-Protocol-Version': '1.1.0',
    });

    // Return only the BlinchActionSchema part (without internal fields like id, timestamps)
    const { id: _id, createdAt, updatedAt, ...schema } = action as any;
    res.json(schema);
  })
);

/**
 * GET /api/actions
 *
 * List all available actions (optional, for discovery)
 * Query params:
 * - creator: Filter by creator address
 * - limit: Limit number of results
 * - offset: Offset for pagination
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { creator, limit = '50', offset = '0' } = req.query;

    let actions = actionStore.getAll();

    // Filter by creator if provided
    if (creator && typeof creator === 'string') {
      actions = actions.filter(
        (action) => (action as any).creatorAddress === creator
      );
    }

    // Apply pagination
    const limitNum = parseInt(limit as string, 10) || 50;
    const offsetNum = parseInt(offset as string, 10) || 0;
    const paginatedActions = actions.slice(offsetNum, offsetNum + limitNum);

    // Return summary info
    const actionSummaries = paginatedActions.map((action) => ({
      id: action.id,
      title: action.title,
      description: action.description,
      createdAt: action.createdAt,
    }));

    res.json({
      actions: actionSummaries,
      count: actionSummaries.length,
      total: actions.length,
      limit: limitNum,
      offset: offsetNum,
    });
  })
);

/**
 * POST /api/action
 *
 * Create a new action (public submissions)
 *
 * Request body:
 * - title: string (required)
 * - description: string (required)
 * - recipientAddress: string (required) - BCH address to receive funds
 * - amount: string (optional) - Default amount in BCH
 * - iconUrl: string (optional) - Custom icon URL
 * - actionType: string (optional) - Custom action type identifier
 * - parameters: array (optional) - Action parameters
 * - creatorAddress: string (optional) - Creator's BCH address for ownership
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const {
      title,
      description,
      recipientAddress,
      amount,
      iconUrl,
      actionType,
      parameters,
      creatorAddress,
    } = req.body;

    // Validate required fields
    if (!title || !description || !recipientAddress) {
      throw new BlinchApiError(
        400,
        ErrorCode.VALIDATION_ERROR,
        'Missing required fields: title, description, recipientAddress'
      );
    }

    // Validate field types
    if (typeof title !== 'string' || title.trim().length === 0) {
      throw new BlinchApiError(
        400,
        ErrorCode.VALIDATION_ERROR,
        'Title must be a non-empty string'
      );
    }

    if (typeof description !== 'string' || description.trim().length === 0) {
      throw new BlinchApiError(
        400,
        ErrorCode.VALIDATION_ERROR,
        'Description must be a non-empty string'
      );
    }

    if (title.length > 100) {
      throw new BlinchApiError(
        400,
        ErrorCode.VALIDATION_ERROR,
        'Title must be 100 characters or less'
      );
    }

    if (description.length > 500) {
      throw new BlinchApiError(
        400,
        ErrorCode.VALIDATION_ERROR,
        'Description must be 500 characters or less'
      );
    }

    // Validate recipient address
    if (!validateBchAddress(recipientAddress)) {
      throw new BlinchApiError(
        400,
        ErrorCode.INVALID_ADDRESS,
        'Invalid Bitcoin Cash address format'
      );
    }

    // Validate amount if provided
    if (amount !== undefined) {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new BlinchApiError(
          400,
          ErrorCode.VALIDATION_ERROR,
          'Amount must be a positive number'
        );
      }
    }

    // Validate iconUrl if provided
    if (iconUrl !== undefined && typeof iconUrl !== 'string') {
      throw new BlinchApiError(
        400,
        ErrorCode.VALIDATION_ERROR,
        'iconUrl must be a string'
      );
    }

    // Validate actionType if provided
    if (actionType !== undefined && typeof actionType !== 'string') {
      throw new BlinchApiError(
        400,
        ErrorCode.VALIDATION_ERROR,
        'actionType must be a string'
      );
    }

    // Validate parameters if provided
    if (parameters !== undefined) {
      if (!Array.isArray(parameters)) {
        throw new BlinchApiError(
          400,
          ErrorCode.VALIDATION_ERROR,
          'Parameters must be an array'
        );
      }

      if (!validateActionParameters(parameters)) {
        throw new BlinchApiError(
          400,
          ErrorCode.VALIDATION_ERROR,
          'Invalid action parameters'
        );
      }
    }

    // Validate creator address if provided
    if (creatorAddress !== undefined && !validateBchAddress(creatorAddress)) {
      throw new BlinchApiError(
        400,
        ErrorCode.INVALID_ADDRESS,
        'Invalid creator Bitcoin Cash address format'
      );
    }

    // Check tier limits (if creator address provided)
    const parametersCount = parameters?.length || 0;
    if (creatorAddress) {
      const tierCheck = await canCreateAction(creatorAddress, parametersCount);

      if (!tierCheck.allowed) {
        if (tierCheck.paymentRequired) {
          // Return 402 with payment requirements
          const { getUpgradePaymentRequirements } = await import('../services/tierService.js');
          const paymentReq = getUpgradePaymentRequirements(creatorAddress);

          if (paymentReq) {
            res.setHeader('X-Payment-Link', `bitcoincash:${paymentReq.recipient}?amount=${paymentReq.amount / 100000000}&op_return=464c4f5701${paymentReq.actionType}`);
            res.setHeader('X-Payment-Amount', paymentReq.amount.toString());
            res.setHeader('X-Payment-Currency', 'sat');
            res.setHeader('X-Payment-Description', paymentReq.description);

            return res.status(402).json({
              error: {
                code: 'PAYMENT_REQUIRED',
                message: tierCheck.reason,
                tier_limit: 'FREE',
                payment_required: true,
                payment_link: paymentReq.recipient,
                payment_amount: paymentReq.amount,
                payment_currency: 'sat',
                feature: 'premium_upgrade',
              },
            });
          }
        }

        throw new BlinchApiError(
          403,
          ErrorCode.FORBIDDEN,
          tierCheck.reason || 'Tier limit exceeded'
        );
      }
    }

    // Build the action schema
    const actionSchema = buildBlinchAction({
      id: 'temp-id', // Will be replaced by store
      title,
      description,
      recipientAddress,
      amount,
      iconUrl,
      actionType,
      parameters,
    });

    // Create action in store (generates unique ID)
    const result = await actionStore.create(actionSchema, creatorAddress);

    if (!result.success || !result.data) {
      throw new BlinchApiError(
        500,
        ErrorCode.INTERNAL_ERROR,
        'Failed to create action'
      );
    }

    // Return created action with ID
    const { id, createdAt, updatedAt, ...schema } = result.data as any;

    res.status(201).json({
      id,
      ...schema,
      createdAt,
      creatorAddress,
    });
  })
);

/**
 * DELETE /api/action/:id
 *
 * Delete an action (requires creator address verification)
 * Query params:
 * - creator: Creator's BCH address (required for verification)
 */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { creator } = req.query;

    // Validate action ID format
    if (!id || (typeof id === 'string' && id.length < 3)) {
      throw new BlinchApiError(
        400,
        ErrorCode.INVALID_ACTION_ID,
        'Invalid action ID format'
      );
    }

    // Handle array of IDs (use first one)
    const actionId = Array.isArray(id) ? id[0] : id;

    // Verify action exists
    const action = actionStore.get(actionId);
    if (!action) {
      throw new BlinchApiError(
        404,
        ErrorCode.ACTION_NOT_FOUND,
        `Action not found: ${id}`
      );
    }

    // Verify creator address if action has one
    const actionCreatorAddress = (action as any).creatorAddress;
    if (actionCreatorAddress) {
      if (!creator || creator !== actionCreatorAddress) {
        throw new BlinchApiError(
          403,
          ErrorCode.FORBIDDEN,
          'Permission denied: creator address mismatch'
        );
      }
    }

    // Delete action
    const result = await actionStore.delete(actionId, creator as string);

    if (!result.success) {
      throw new BlinchApiError(
        500,
        ErrorCode.INTERNAL_ERROR,
        'Failed to delete action'
      );
    }

    res.status(204).send();
  })
);

export default router;
