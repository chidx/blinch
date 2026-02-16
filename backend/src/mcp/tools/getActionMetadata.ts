/**
 * MCP Tool: get_action_metadata
 *
 * Retrieves metadata for a Blinch action, allowing AI agents to
 * understand payment requirements and parameters
 */

import { z } from 'zod';
import type { GetActionMetadataParams, GetActionMetadataResult } from '../types';

// Import the in-memory action store from the backend
// In a real implementation, this would query a database
let actionStore: Map<string, any>;

/**
 * Set the action store (called from server initialization)
 */
export function setActionStore(store: Map<string, any>) {
  actionStore = store;
}

/**
 * Input schema validation
 */
export const GetActionMetadataInputSchema = z.object({
  id: z.string().min(1).describe('The action ID to retrieve metadata for'),
});

/**
 * Get action metadata by ID
 */
export async function getActionMetadata(
  params: GetActionMetadataParams
): Promise<GetActionMetadataResult> {
  const { id } = params;

  if (!actionStore) {
    throw new Error('Action store not initialized. Please ensure the backend server is running.');
  }

  // Retrieve action from store
  const action = actionStore.get(id);

  if (!action) {
    throw new Error(`Action not found: ${id}. Available actions: ${Array.from(actionStore.keys()).join(', ')}`);
  }

  // Extract amount from the first action link's href
  const primaryAction = action.links?.actions?.[0];
  let amount: number | undefined;

  if (primaryAction?.href) {
    const url = new URL(primaryAction.href);
    const amountParam = url.searchParams.get('amount');
    if (amountParam) {
      // Convert BCH to satoshis
      amount = Math.round(parseFloat(amountParam) * 100000000);
    }
  }

  // Extract recipient from href
  let recipient: string = '';
  if (primaryAction?.href) {
    const match = primaryAction.href.match(/bitcoincash:([a-zA-Z0-9]+)/);
    if (match) {
      recipient = `bitcoincash:${match[1]}`;
    }
  }

  return {
    id,
    title: action.title,
    description: action.description,
    amount,
    recipient,
    parameters: primaryAction?.parameters || [],
    protocol: {
      name: action.metadata?.protocol || 'Blinch',
      version: action.version || '1.1.0',
      prefix: action.metadata?.hex_prefix || '464c4f5701',
    },
  };
}

/**
 * MCP Tool definition
 */
export const getActionMetadataTool = {
  name: 'get_action_metadata',
  description: 'Retrieves metadata for a Blinch action including the required payment amount, recipient address, and any parameters. Use this to understand what payment is required before creating a Blinch link.',
  inputSchema: GetActionMetadataInputSchema,
  handler: getActionMetadata,
};
