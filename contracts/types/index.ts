/**
 * Blinch Protocol Types
 */

/**
 * Protocol identifier constant
 * Every transaction must include OP_RETURN with this prefix
 */
export const PROTOCOL_PREFIX = '464c4f5701' as const; // "FLOW\x01"
export const PROTOCOL_PREFIX_BYTES = Buffer.from([0x46, 0x4c, 0x4f, 0x57, 0x01]);

/**
 * Supported networks
 */
export type Network = 'chipnet' | 'testnet' | 'mainnet';

/**
 * Contract constructor parameters
 */
export interface BlinchContractParams {
  creator: string; // Public key
  recipient: string; // Public key
  timeout: number; // Block height
}

/**
 * Contract function names
 */
export type ContractFunction = 'execute' | 'cancel';

/**
 * Execute function parameters
 */
export interface ExecuteParams {
  signature: string;
  publicKey: string;
}

/**
 * Cancel function parameters
 */
export interface CancelParams {
  signature: string;
}

/**
 * Deployment information
 */
export interface DeploymentInfo {
  network: Network;
  contractAddress: string;
  transactionId: string;
  timeout: number;
  creatorPk: string;
  recipientPk: string;
  deployedAt: string;
  blockHeight: number;
}

/**
 * OP_RETURN data structure
 */
export interface OpReturnData {
  prefix: string; // "FLOW\x01"
  actionType?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Transaction validation result
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  hasProtocolReturn?: boolean;
}

/**
 * Validates that an OP_RETURN contains the Blinch protocol prefix
 */
export function validateOpReturn(opReturnHex: string): ValidationResult {
  if (!opReturnHex || opReturnHex.length < 10) {
    return {
      valid: false,
      error: 'OP_RETURN too short',
      hasProtocolReturn: false,
    };
  }

  // Extract prefix (first 10 hex chars = 5 bytes)
  const prefix = opReturnHex.substring(0, 10);
  const hasProtocolReturn = prefix.toLowerCase() === PROTOCOL_PREFIX.toLowerCase();

  return {
    valid: hasProtocolReturn,
    hasProtocolReturn,
    error: hasProtocolReturn ? undefined : 'Missing protocol prefix 464c4f5701',
  };
}

/**
 * Creates an OP_RETURN output with the Blinch protocol prefix
 */
export function createOpReturn(actionData?: string): string {
  const actionHex = actionData || '';
  return PROTOCOL_PREFIX + actionHex;
}
