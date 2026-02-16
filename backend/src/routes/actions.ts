/**
 * Action API Routes
 * GET /api/action/:id - Returns BCH-Action JSON Schema v1.1.0
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import {
  buildBlinchAction,
  validateBchAddress,
  validateActionParameters,
} from '../lib/action-builder';
import { BlinchApiError, ErrorCode } from '../types/errors';
import type { BlinchActionSchema } from '../types/action';

const router = Router();

/**
 * In-memory action storage
 * In production, this would use a database
 */
const actionStore = new Map<string, BlinchActionSchema>();

// Initialize with example action
actionStore.set(
  'example',
  buildBlinchAction({
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
  })
);

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
    if (!id || id.length < 3) {
      throw new BlinchApiError(
        400,
        ErrorCode.INVALID_ACTION_ID,
        'Invalid action ID format'
      );
    }

    // Retrieve action from storage
    const action = actionStore.get(id);

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

    res.json(action);
  })
);

/**
 * GET /api/actions
 *
 * List all available actions (optional, for discovery)
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const actions = Array.from(actionStore.entries()).map(([id, action]) => ({
      id,
      title: action.title,
      description: action.description,
    }));

    res.json({
      actions,
      count: actions.length,
    });
  })
);

/**
 * POST /api/action
 *
 * Create a new action (optional, for admin use)
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const {
      title,
      description,
      recipientAddress,
      amount,
      parameters,
      iconUrl,
    } = req.body;

    // Validate required fields
    if (!title || !description || !recipientAddress) {
      throw new BlinchApiError(
        400,
        ErrorCode.VALIDATION_ERROR,
        'Missing required fields: title, description, recipientAddress'
      );
    }

    // Validate address
    if (!validateBchAddress(recipientAddress)) {
      throw new BlinchApiError(
        400,
        ErrorCode.INVALID_ADDRESS,
        'Invalid Bitcoin Cash address format'
      );
    }

    // Validate parameters if provided
    if (parameters && !validateActionParameters(parameters)) {
      throw new BlinchApiError(
        400,
        ErrorCode.VALIDATION_ERROR,
        'Invalid action parameters'
      );
    }

    // Generate action ID (simple incrementing ID for demo)
    const id = `action_${Date.now()}`;

    // Create action
    const action = buildBlinchAction({
      id,
      title,
      description,
      recipientAddress,
      amount,
      parameters,
      iconUrl,
    });

    // Store action
    actionStore.set(id, action);

    // Return created action
    res.status(201).json({
      id,
      ...action,
    });
  })
);

export default router;
