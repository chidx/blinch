/**
 * Blinch Contract Integration
 *
 * Handles interaction with the Blinch smart contract using CashScript SDK
 */

import {
  Contract,
  ElectrumNetworkProvider,
  Network,
} from 'cashscript';
import BlinchArtifact from '../contracts/Blinch.json';

// Contract deployment configuration (from backend)
// Long-lived deployment for hackathon judging
export const CONTRACT_CONFIG = {
  network: 'chipnet',
  contractAddress: 'bchtest:pvl6kkac6wttmdlhzmyadq5kcvaplzsjwahl3zjyt26qgkwxdy0yga98dxe32',
  transactionId: '537325ba72e9d646269242afb8f486dce6eb8672b679e5605e95051aeed0fb7c',
  timeoutBlock: 296276,
  creatorPubKey: '02be8602a91db05c4fc85af1f299ecbbd9d7c1fd163f7140aa7bf93a5280e7fb6a',
  recipientPubKey: '02be8602a91db05c4fc85af1f299ecbbd9d7c1fd163f7140aa7bf93a5280e7fb6a',
};

export interface ContractInfo {
  address: string;
  txid: string;
  timeout: number;
  status: 'active' | 'expired';
}

/**
 * Get the CashScript Network enum value
 */
function getNetwork(network: string = 'chipnet'): Network {
  switch (network) {
    case 'chipnet':
      return Network.CHIPNET;
    case 'testnet':
      return Network.TESTNET3;
    case 'mainnet':
      return Network.MAINNET;
    default:
      return Network.CHIPNET;
  }
}

/**
 * Initialize the Blinch contract instance
 */
export function initializeContract(): Contract {
  const provider = new ElectrumNetworkProvider(getNetwork(CONTRACT_CONFIG.network));

  const contract = new Contract(
    BlinchArtifact,
    [
      CONTRACT_CONFIG.creatorPubKey,
      CONTRACT_CONFIG.recipientPubKey,
      BigInt(CONTRACT_CONFIG.timeoutBlock),
    ],
    { provider }
  );

  return contract;
}

/**
 * Get contract information for display
 */
export function getContractInfo(): ContractInfo {
  return {
    address: CONTRACT_CONFIG.contractAddress,
    txid: CONTRACT_CONFIG.transactionId,
    timeout: CONTRACT_CONFIG.timeoutBlock,
    status: 'active', // Will be validated with current block height
  };
}

/**
 * Check if the contract is still valid (not expired)
 */
export async function isContractValid(): Promise<boolean> {
  try {
    const provider = new ElectrumNetworkProvider(getNetwork(CONTRACT_CONFIG.network));
    const currentBlock = await provider.getBlockHeight();
    return currentBlock < CONTRACT_CONFIG.timeoutBlock;
  } catch {
    // If we can't check, assume valid for demo
    return true;
  }
}

/**
 * Get remaining blocks before contract timeout
 */
export async function getRemainingBlocks(): Promise<number> {
  try {
    const provider = new ElectrumNetworkProvider(getNetwork(CONTRACT_CONFIG.network));
    const currentBlock = await provider.getBlockHeight();
    const remaining = CONTRACT_CONFIG.timeoutBlock - currentBlock;
    return Math.max(0, remaining);
  } catch {
    return 0;
  }
}

/**
 * Get UTXOs at the contract address
 */
export async function getContractUtxos() {
  try {
    const provider = new ElectrumNetworkProvider(getNetwork(CONTRACT_CONFIG.network));
    const utxos = await provider.getUtxos(CONTRACT_CONFIG.contractAddress);
    return utxos;
  } catch (error) {
    console.error('Error fetching contract UTXOs:', error);
    return [];
  }
}

/**
 * Build transaction URI for contract execution
 * This is used as a fallback when direct SDK integration is not available
 */
export function buildContractExecutionUri(params: {
  amount?: string;
  note?: string;
}): string {
  const uriParams = new URLSearchParams();

  if (params.amount) {
    uriParams.set('amount', params.amount);
  }

  // Protocol prefix + action type
  uriParams.set('op_return', '464c4f5701execute');

  if (params.note) {
    uriParams.set('note', params.note);
  }

  return `bitcoincash:${CONTRACT_CONFIG.contractAddress}?${uriParams.toString()}`;
}
