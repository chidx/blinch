/**
 * Contract Service
 *
 * Manages Blinch contract interactions and metadata
 */

import { getContractConfig, isContractValid, ContractConfig } from '../config/contract.config.js';

export interface ContractMetadata {
  contractAddress: string;
  contractTxId: string;
  timeoutBlock: number;
  deployedAt: string;
  status: 'active' | 'expired';
  remainingBlocks?: number;
}

export interface ContractActionParams {
  recipientAddress: string;
  amount?: string;
  actionType?: string;
  note?: string;
  network?: string;
}

/**
 * Get contract metadata for frontend consumption
 */
export function getContractMetadata(network: string = 'chipnet'): ContractMetadata {
  const config = getContractConfig(network);

  return {
    contractAddress: config.contractAddress,
    contractTxId: config.transactionId,
    timeoutBlock: config.timeoutBlock,
    deployedAt: config.deployedAt,
    status: isContractValid(config) ? 'active' : 'expired',
  };
}

/**
 * Build a contract-based Bitcoin Cash URI
 * This points to the contract address instead of the recipient
 */
export function buildContractUri(params: ContractActionParams & { network?: string }): string {
  const config = getContractConfig(params.network);

  // Build URI pointing to contract address
  const uriParams = new URLSearchParams();

  if (params.amount) {
    uriParams.set('amount', params.amount);
  }

  // Build OP_RETURN with protocol prefix + action type
  const opReturnData = params.actionType || 'execute';
  const opReturnValue = `464c4f5701${opReturnData}`;

  uriParams.set('op_return', opReturnValue);

  // Add optional note
  if (params.note) {
    uriParams.set('note', params.note);
  }

  return `bitcoincash:${config.contractAddress}?${uriParams.toString()}`;
}

/**
 * Check if contract can be executed (not expired)
 */
export function canExecuteContract(network: string = 'chipnet'): boolean {
  const config = getContractConfig(network);
  return isContractValid(config);
}

/**
 * Get explorer URL for contract transaction
 */
export function getContractExplorerUrl(network: string = 'chipnet'): string {
  const config = getContractConfig(network);

  if (network === 'chipnet') {
    return `https://chipnet.bitcoinexplorer.org/address/${config.contractAddress}`;
  }

  return `https://blockchair.com/bitcoin-cash/address/${config.contractAddress}`;
}
