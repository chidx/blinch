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
 * Deployed: 2026-02-24
 * Expires: Block 296276 (~33 hours from deployment, long-lived for hackathon)
 */
export const CHIPNET_CONTRACT: ContractConfig = {
  network: 'chipnet',
  contractAddress: 'bchtest:pvl6kkac6wttmdlhzmyadq5kcvaplzsjwahl3zjyt26qgkwxdy0yga98dxe32',
  transactionId: '537325ba72e9d646269242afb8f486dce6eb8672b679e5605e95051aeed0fb7c',
  timeoutBlock: 296276,
  creatorPubKey: '02be8602a91db05c4fc85af1f299ecbbd9d7c1fd163f7140aa7bf93a5280e7fb6a',
  creatorAddress: 'bchtest:qpntz7207trgrekq50jly9yqwteurej3nc0qr4arxr',
  recipientPubKey: '02be8602a91db05c4fc85af1f299ecbbd9d7c1fd163f7140aa7bf93a5280e7fb6a',
  deployedAt: '2026-02-24T03:42:00.882Z',
  deploymentBlock: 294276,
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
