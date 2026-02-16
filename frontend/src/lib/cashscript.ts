/**
 * CashScript SDK Integration
 *
 * This module provides utilities for building transactions with CashScript
 * Ensures OP_RETURN with 464c4f5701 prefix is always included
 */

import {
  Contract,
  ElectrumNetworkProvider,
  SignatureTemplate,
  Tx,
} from 'cashscript';

const PROTOCOL_PREFIX = '464c4f5701'; // FLOW\x01

/**
 * Build a Blinch transaction with mandatory OP_RETURN
 */
export async function buildBlinchTransaction(params: {
  contractAddress: string;
  artifact: any;
  creatorKey: string;
  recipientAddress: string;
  amount: number;
  actionData?: string;
  network?: 'chipnet' | 'testnet' | 'mainnet';
}): Promise<{
  tx: Tx;
  hex: string;
}> {
  const {
    contractAddress,
    artifact,
    creatorKey,
    recipientAddress,
    amount,
    actionData = '',
    network = 'chipnet',
  } = params;

  // Initialize network provider
  const provider = new ElectrumNetworkProvider(network);

  // Create contract instance
  const contract = new Contract(artifact, [creatorKey, recipientAddress], {
    provider,
  });

  // Build OP_RETURN output
  const opReturnData = PROTOCOL_PREFIX + actionData;

  // Build transaction
  const tx = await contract.functions.execute(
    new SignatureTemplate(creatorKey),
    recipientAddress
  );

  // Add OP_RETURN output
  tx.outputs.push({
    to: contract.address,
    amount: 0,
    opReturn: Buffer.from(opReturnData, 'hex'),
  });

  return {
    tx,
    hex: tx.hex(),
  };
}

/**
 * Broadcast transaction to network
 */
export async function broadcastTransaction(
  txHex: string,
  network: 'chipnet' | 'testnet' | 'mainnet' = 'chipnet'
): Promise<string> {
  const provider = new ElectrumNetworkProvider(network);

  try {
    const txid = await provider.sendRawTransaction(txHex);
    return txid;
  } catch (error) {
    throw new Error(`Failed to broadcast: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate OP_RETURN in transaction
 */
export function validateOpReturnInTx(opReturnHex: string): boolean {
  return opReturnHex.toLowerCase().startsWith(PROTOCOL_PREFIX.toLowerCase());
}

/**
 * Calculate transaction fee
 */
export function calculateTxFee(sizeBytes: number, satPerByte: number = 1): number {
  return sizeBytes * satPerByte;
}
