/**
 * Blockchain API Utilities
 * Fetches transaction data from Bitcoin Cash explorers
 */

export interface TxOutput {
  index: number;
  value: number;
  script: {
    asm: string;
    hex: string;
    type: string;
  };
  address?: string;
}

export interface TxData {
  txid: string;
  version: number;
  size: number;
  locktime: number;
  inputs: Array<{
    prevout: {
      hash: string;
      index: number;
    };
  }>;
  outputs: TxOutput[];
  blockhash?: string;
  confirmations?: number;
}

/**
 * Fetch transaction data from blockchain API
 */
export async function fetchTransaction(
  txId: string,
  network: 'chipnet' | 'mainnet' = 'chipnet'
): Promise<TxData | null> {
  try {
    const baseUrl =
      network === 'chipnet'
        ? 'https://chipnet.bitcoinexplorer.org/api'
        : 'https://bitcoinexplorer.org/api';

    const response = await fetch(`${baseUrl}/tx/${txId}`);
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch transaction:', error);
    return null;
  }
}

/**
 * Find OP_RETURN output in transaction
 */
export function findOpReturnOutput(tx: TxData): TxOutput | null {
  return tx.outputs.find(
    (output) => output.script.type === 'op_return' || output.script.asm.startsWith('OP_RETURN')
  ) || null;
}

/**
 * Parse OP_RETURN data from script
 */
export function parseOpReturn(scriptAsm: string): {
  raw: string;
  data: string[];
  isValid: boolean;
} {
  // Remove OP_RETURN prefix
  const parts = scriptAsm.split(' ').filter((p) => p !== 'OP_RETURN' && p !== 'OP_PUSHDATA1');

  // The data parts are hex-encoded
  const data = parts.map((part) => {
    try {
      // Try to convert hex to string
      return hexToString(part);
    } catch {
      return part;
    }
  });

  return {
    raw: scriptAsm,
    data,
    isValid: parts.length > 0,
  };
}

/**
 * Convert hex string to UTF-8 string
 */
function hexToString(hex: string): string {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    const code = parseInt(hex.substr(i, 2), 16);
    if (code >= 32 && code <= 126) {
      // Printable ASCII
      str += String.fromCharCode(code);
    }
  }
  return str;
}

/**
 * Check if OP_RETURN contains the Blinch protocol prefix
 */
export function containsBlinchPrefix(opReturnData: string[], prefix: string = '464c4f5701'): boolean {
  // Check hex version
  if (opReturnData.some((d) => d.toLowerCase().includes(prefix.toLowerCase()))) {
    return true;
  }

  // Check string version (FLOW\x01)
  if (opReturnData.some((d) => d.includes('FLOW'))) {
    return true;
  }

  return false;
}

/**
 * Format protocol prefix for display
 */
export function formatProtocolPrefix(prefix: string): {
  hex: string;
  ascii: string;
  bytes: Array<{ byte: string; char: string }>;
} {
  const bytes: Array<{ byte: string; char: string }> = [];

  for (let i = 0; i < prefix.length; i += 2) {
    const byte = prefix.substr(i, 2);
    const code = parseInt(byte, 16);
    const char = code >= 32 && code <= 126 ? String.fromCharCode(code) : '·';

    bytes.push({ byte, char });
  }

  return {
    hex: prefix,
    ascii: bytes.map((b) => b.char).join(''),
    bytes,
  };
}
