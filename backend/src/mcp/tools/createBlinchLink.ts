/**
 * MCP Tool: create_blinch_link
 *
 * Creates a Blinch-standardized Bitcoin Cash URI with the mandatory
 * OP_RETURN prefix (464c4f5701 = FLOW\x01)
 */

import { z } from 'zod';
import type { CreateBlinchLinkParams, CreateBlinchLinkResult } from '../types';
import { PROTOCOL_PREFIX } from '@blinch/contracts/types';

/**
 * Input schema validation
 */
export const CreateBlinchLinkInputSchema = z.object({
  amount: z.number().positive().describe('Amount in satoshis'),
  recipient: z.string().min(1).describe('Bitcoin Cash address (with or without bitcoincash: prefix)'),
  action_type: z.string().optional().describe('Action type (e.g., "tip", "vote")'),
  note: z.string().optional().describe('Optional note or metadata'),
});

/**
 * Create a Blinch link with the mandatory protocol prefix
 */
export async function createBlinchLink(
  params: CreateBlinchLinkParams
): Promise<CreateBlinchLinkResult> {
  const { amount, recipient, action_type, note } = params;

  // Validate amount
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  // Normalize recipient address (ensure bitcoincash: prefix)
  const normalizedRecipient = recipient.startsWith('bitcoincash:')
    ? recipient
    : `bitcoincash:${recipient}`;

  // Build OP_RETURN data: protocol prefix + action type + optional note
  const actionData = action_type || '';
  const noteData = note ? `_${note}` : '';
  const opReturnHex = PROTOCOL_PREFIX + actionData + noteData;

  // Build Bitcoin Cash URI
  const urlParams = new URLSearchParams();
  urlParams.set('amount', (amount / 100000000).toString()); // Convert satoshis to BCH
  urlParams.set('op_return', opReturnHex);

  const url = `${normalizedRecipient}?${urlParams.toString()}`;

  return {
    url,
    amount,
    recipient: normalizedRecipient,
    op_return: opReturnHex,
    protocol_prefix: PROTOCOL_PREFIX,
  };
}

/**
 * MCP Tool definition
 */
export const createBlinchLinkTool = {
  name: 'create_blinch_link',
  description: 'Creates a Blinch-standardized Bitcoin Cash payment link with the mandatory FLOW\\x01 protocol prefix. Use this to enable AI agents to request Bitcoin Cash payments through the Blinch protocol.',
  inputSchema: CreateBlinchLinkInputSchema,
  handler: createBlinchLink,
};
