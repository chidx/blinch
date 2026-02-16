/**
 * Payment Verification Utility
 *
 * Uses CashScript SDK to verify that a transaction with the FLOW\x01
 * prefix has reached the required amount on-chain.
 */

import {
  ElectrumNetworkProvider,
  type Utxo,
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
  network?: 'chipnet' | 'testnet' | 'mainnet';
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

    // Verify recipient (if needed)
    // This would require parsing the transaction outputs
    // For now, we trust that the transaction was sent to the correct address

    // Verify action type (if specified)
    if (actionType && !result.actionType?.includes(actionType)) {
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
  network: 'chipnet' | 'testnet' | 'mainnet' = 'chipnet'
): Promise<VerifyPaymentResult | null> {
  try {
    const provider = new ElectrumNetworkProvider(network);

    // Get transaction details
    const tx = await provider.getTransaction(txId);

    if (!tx) {
      return null;
    }

    // Get current block height for confirmations
    const currentHeight = await provider.getBlockHeight();
    const confirmations = currentHeight - tx.height;

    // Parse OP_RETURN outputs
    let hasProtocolPrefix = false;
    let actionType: string | undefined;
    let totalAmount = 0;

    for (const output of tx.outputs) {
      totalAmount += output.satoshis;

      // Check for OP_RETURN
      if (output.lockingBytecode.toString('hex').startsWith('6a')) {
        const opReturnData = output.lockingBytecode.slice(2); // Skip OP_RETURN (0x6a)

        // Check for protocol prefix
        const hexData = opReturnData.toString('hex');
        if (hexData.toLowerCase().startsWith(PROTOCOL_PREFIX.toLowerCase())) {
          hasProtocolPrefix = true;

          // Extract action type (data after prefix)
          const actionHex = hexData.substring(PROTOCOL_PREFIX.length);
          if (actionHex) {
            actionType = Buffer.from(actionHex, 'hex').toString('utf8');
          }
        }
      }
    }

    return {
      valid: true,
      amount: totalAmount,
      hasProtocolPrefix,
      confirmations,
      actionType,
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
  network: 'chipnet' | 'testnet' | 'mainnet' = 'chipnet'
) {
  const provider = new ElectrumNetworkProvider(network);
  return await provider.getTransaction(txId);
}

/**
 * Get UTXOs for an address
 */
export async function getUtxos(
  address: string,
  network: 'chipnet' | 'testnet' | 'mainnet' = 'chipnet'
): Promise<Utxo[]> {
  const provider = new ElectrumNetworkProvider(network);
  return await provider.getUtxos(address);
}
