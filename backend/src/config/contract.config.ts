/**
 * Blinch Contract Configuration
 *
 * Contains deployment details for the Blinch smart contract on Chipnet
 */

export interface ContractConfig {
  network: 'chipnet' | 'testnet' | 'mainnet';
  contractAddress: string;
  transactionId: string;
  timeoutBlock: number;
  creatorPubKey: string;
  creatorAddress: string;
  recipientPubKey: string;
  deployedAt: string;
  deploymentBlock: number;
}

/**
 * Current active contract deployment on Chipnet
 * Deployed: 2026-02-23
 * Expires: Block 294265 (~24 hours from deployment)
 */
export const CHIPNET_CONTRACT: ContractConfig = {
  network: 'chipnet',
  contractAddress: 'bchtest:p0m9t6s85glh7w303pm8qj3u80ej0744eazssfscxlkmzl80ewdlqednnnvya',
  transactionId: 'b547212d5612ce1e85d52b988d11a5a77fa2415f0e73b19d22ddb17ba4d64ac0',
  timeoutBlock: 294265,
  creatorPubKey: '02be8602a91db05c4fc85af1f299ecbbd9d7c1fd163f7140aa7bf93a5280e7fb6a',
  creatorAddress: 'bchtest:qpntz7207trgrekq50jly9yqwteurej3nc0qr4arxr',
  recipientPubKey: '02be8602a91db05c4fc85af1f299ecbbd9d7c1fd163f7140aa7bf93a5280e7fb6a',
  deployedAt: '2026-02-23T01:58:36.002Z',
  deploymentBlock: 294121,
};

/**
 * Get contract configuration by network
 */
export function getContractConfig(network: string = 'chipnet'): ContractConfig {
  switch (network) {
    case 'chipnet':
      return CHIPNET_CONTRACT;
    case 'testnet':
    case 'mainnet':
      throw new Error(`Contract not yet deployed to ${network}`);
    default:
      return CHIPNET_CONTRACT;
  }
}

/**
 * Check if contract is still valid (not past timeout)
 */
export function isContractValid(config: ContractConfig, currentBlock?: number): boolean {
  if (!currentBlock) {
    // If we don't have current block height, assume valid (will be checked at runtime)
    return true;
  }
  return currentBlock < config.timeoutBlock;
}

/**
 * Get remaining blocks before contract timeout
 */
export function getRemainingBlocks(config: ContractConfig, currentBlock: number): number {
  const remaining = config.timeoutBlock - currentBlock;
  return Math.max(0, remaining);
}
