/**
 * CashScript Utilities
 *
 * Validation and utility functions for Blinch protocol compliance.
 * Since we use a URI-based approach, this module provides helper functions
 * for OP_RETURN validation and protocol compliance checks.
 */

export const PROTOCOL_PREFIX = '464c4f5701'; // FLOW\x01

/**
 * Validate OP_RETURN in transaction
 * Checks if the OP_RETURN data contains the required Blinch protocol prefix
 */
export function validateOpReturnInTx(opReturnHex: string): boolean {
  return opReturnHex.toLowerCase().startsWith(PROTOCOL_PREFIX.toLowerCase());
}

/**
 * Parse a Bitcoin Cash URI to extract components
 */
export function parseBchUri(uri: string): {
  address: string;
  amount?: number;
  opReturn?: string;
  parameters?: Record<string, string>;
} | null {
  try {
    // Remove bitcoincash: prefix if present
    const cleanUri = uri.replace(/^bitcoincash:/i, '');

    // Split address from query parameters
    const [address, queryString] = cleanUri.split('?');

    if (!address) return null;

    const result: {
      address: string;
      amount?: number;
      opReturn?: string;
      parameters?: Record<string, string>;
    } = {
      address,
    };

    if (queryString) {
      const params = new URLSearchParams(queryString);

      // Parse amount (convert to satoshis if in BCH)
      if (params.has('amount')) {
        result.amount = parseFloat(params.get('amount')!);
      }

      // Parse op_return
      if (params.has('op_return')) {
        result.opReturn = params.get('op_return')!;
      }

      // Parse additional parameters
      const additionalParams: Record<string, string> = {};
      for (const [key, value] of params.entries()) {
        if (!['amount', 'op_return'].includes(key)) {
          additionalParams[key] = value;
        }
      }
      if (Object.keys(additionalParams).length > 0) {
        result.parameters = additionalParams;
      }
    }

    return result;
  } catch {
    return null;
  }
}

/**
 * Build a Bitcoin Cash URI with protocol-compliant OP_RETURN
 */
export function buildBchUri(params: {
  address: string;
  amount?: number;
  actionData?: string;
  additionalParams?: Record<string, string>;
}): string {
  const uriParams = new URLSearchParams();

  if (params.amount) {
    uriParams.set('amount', params.amount.toString());
  }

  // Always include the protocol prefix
  const opReturnValue = params.actionData
    ? `${PROTOCOL_PREFIX}${params.actionData}`
    : PROTOCOL_PREFIX;

  uriParams.set('op_return', opReturnValue);

  // Add additional parameters
  if (params.additionalParams) {
    Object.entries(params.additionalParams).forEach(([key, value]) => {
      uriParams.set(key, value);
    });
  }

  return `bitcoincash:${params.address}?${uriParams.toString()}`;
}

/**
 * Calculate transaction fee estimate
 */
export function calculateTxFee(sizeBytes: number, satPerByte: number = 1): number {
  return sizeBytes * satPerByte;
}

/**
 * Estimate transaction size based on inputs and outputs
 */
export function estimateTxSize(inputCount: number, outputCount: number): number {
  // Approximate sizes (in bytes)
  const txOverhead = 10;
  const inputSize = 150; // P2PKH input with signature
  const outputSize = 34; // P2PKH output

  return txOverhead + (inputCount * inputSize) + (outputCount * outputSize);
}

/**
 * Chipnet explorer URL for transaction verification
 */
export function getChipnetExplorerUrl(txId: string): string {
  return `https://chipnet.bitcoinexplorer.org/tx/${txId}`;
}
