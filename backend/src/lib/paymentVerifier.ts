/**
 * Payment Verification Utility
 *
 * Uses CashScript SDK to verify that a transaction with the FLOW\x01
 * prefix has reached the required amount on-chain.
 */

import {
  ElectrumNetworkProvider,
  type Utxo,
  Network,
} from 'cashscript';
import { PROTOCOL_PREFIX } from '@blinch/contracts/types';

/**
 * Payment verification parameters
 */
export interface VerifyPaymentParams {
  /**
   * Transaction ID to verify
   */
  txId: string;

  /**
   * Required payment amount in satoshis
   */
  requiredAmount: number;

  /**
   * Recipient address that should receive funds
   */
  recipient: string;

  /**
   * Expected action type in OP_RETURN
   */
  actionType?: string;

  /**
   * Network to verify on (default: chipnet)
   */
  network?: Network;
}

/**
 * Payment verification result
 */
export interface VerifyPaymentResult {
  /**
   * Whether the payment is valid
   */
  valid: boolean;

  /**
   * Actual amount sent in satoshis
   */
  amount: number;

  /**
   * Whether OP_RETURN has correct prefix
   */
  hasProtocolPrefix: boolean;

  /**
   * Confirmations count
   */
  confirmations: number;

  /**
   * Action type from OP_RETURN (if present)
   */
  actionType?: string;

  /**
   * Error message if invalid
   */
  error?: string;
}

/**
 * Verify a Blinch payment on-chain
 */
export async function verifyBlinchPayment(
  params: VerifyPaymentParams
): Promise<boolean> {
  const { txId, requiredAmount, recipient, actionType, network = 'chipnet' } = params;

  try {
    const result = await getPaymentDetails(txId, network);

    // Check if transaction exists
    if (!result) {
      console.error(`Transaction not found: ${txId}`);
      return false;
    }

    // Verify OP_RETURN prefix
    if (!result.hasProtocolPrefix) {
      console.error(`Transaction missing protocol prefix: ${txId}`);
      return false;
    }

    // Verify amount
    if (result.amount < requiredAmount) {
      console.error(
        `Insufficient amount: ${result.amount} < ${requiredAmount}`
      );
      return false;
    }

    // Verify action type (if specified)
    if (actionType && result.actionType && !result.actionType.includes(actionType)) {
      console.error(`Action type mismatch: ${result.actionType} != ${actionType}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Payment verification error:', error);
    return false;
  }
}

/**
 * Get detailed payment information
 */
export async function getPaymentDetails(
  txId: string,
  network: Network = 'chipnet'
): Promise<VerifyPaymentResult | null> {
  try {
    const provider = new ElectrumNetworkProvider(network);

    // Get transaction details
    const txHex = await provider.getRawTransaction(txId);
    if (!txHex) {
      return null;
    }

    // For now, return a simplified result
    // Full transaction parsing would require additional libraries
    return {
      valid: true,
      amount: 0,
      hasProtocolPrefix: false,
      confirmations: 0,
    };
  } catch (error) {
    console.error('Error getting payment details:', error);
    return null;
  }
}

/**
 * Get transaction from blockchain
 */
export async function getTransaction(
  txId: string,
  network: Network = 'chipnet'
) {
  const provider = new ElectrumNetworkProvider(network);
  return await provider.getRawTransaction(txId);
}

/**
 * Get UTXOs for an address
 */
export async function getUtxos(
  address: string,
  network: Network = 'chipnet'
): Promise<Utxo[]> {
  const provider = new ElectrumNetworkProvider(network);
  return await provider.getUtxos(address);
}
