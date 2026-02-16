/**
 * MCP Server Types for Blinch Agent Gateway
 */

/**
 * Parameters for creating a Blinch link
 */
export interface CreateBlinchLinkParams {
  amount: number; // Amount in satoshis
  recipient: string; // Bitcoin Cash address
  action_type?: string; // Optional action type (e.g., "tip", "vote")
  note?: string; // Optional note for the transaction
}

/**
 * Result from creating a Blinch link
 */
export interface CreateBlinchLinkResult {
  url: string; // Complete bitcoincash: URI
  amount: number;
  recipient: string;
  op_return: string; // The OP_RETURN hex with protocol prefix
  protocol_prefix: string; // 464c4f5701
  action_id?: string; // Optional action ID if registered
}

/**
 * Parameters for getting action metadata
 */
export interface GetActionMetadataParams {
  id: string; // Action ID to look up
}

/**
 * Action metadata result
 */
export interface GetActionMetadataResult {
  id: string;
  title: string;
  description: string;
  amount?: number;
  recipient: string;
  parameters?: Array<{
    name: string;
    label: string;
    type: string;
    required?: boolean;
  }>;
  protocol: {
    name: string;
    version: string;
    prefix: string;
  };
}
