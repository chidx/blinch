/**
 * Utility functions for Blinch contract deployment and testing
 */

import { validateOpReturn, createOpReturn, PROTOCOL_PREFIX } from '../types';

/**
 * Generate a test mnemonic for development
 * WARNING: Never use in production!
 */
export function generateTestMnemonic(): string {
  return 'test test test test test test test test test test test junk';
}

/**
 * Convert public key to PKH (Public Key Hash)
 */
export function pkToPkh(publicKey: string): string {
  const crypto = require('crypto');
  const pubkey = Buffer.from(publicKey.replace('0x', ''), 'hex');
  const hash = crypto.hash('sha256', pubkey);
  const pkh = crypto.hash('ripemd160', hash);
  return pkh.toString('hex');
}

/**
 * Validate that a transaction includes the required OP_RETURN
 */
export function validateTransactionOpReturn(opReturnData: string): boolean {
  const result = validateOpReturn(opReturnData);
  return result.valid && result.hasProtocolReturn;
}

/**
 * Format contract address for display
 */
export function formatAddress(address: string): string {
  return `${address.substring(0, 10)}...${address.substring(address.length - 6)}`;
}

/**
 * Calculate timeout block height
 */
export function calculateTimeout(currentHeight: number, blocks: number): number {
  return currentHeight + blocks;
}

/**
 * Verify block timeout has elapsed
 */
export function verifyTimeout(currentHeight: number, timeout: number): boolean {
  return currentHeight >= timeout;
}
