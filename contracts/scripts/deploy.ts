import {
  Contract,
  ElectrumNetworkProvider,
  SignatureTemplate,
} from 'cashscript';
import * as fs from 'fs';
import * as path from 'path';
import { getCreatorCredentials, getRecipientPublicKey, validatePublicKey } from './wallet';

interface DeploymentConfig {
  network: 'chipnet' | 'testnet' | 'mainnet';
  mnemonic?: string;
  recipientPkh: string;
  timeoutBlocks: number;
}

// Default configuration for Chipnet
const DEFAULT_CONFIG: DeploymentConfig = {
  network: 'chipnet',
  recipientPkh: '', // Set this or pass as argument
  timeoutBlocks: 144,
};

class BlinchDeployer {
  private config: DeploymentConfig;
  private provider: ElectrumNetworkProvider;

  constructor(config: DeploymentConfig) {
    this.config = config;
    this.provider = new ElectrumNetworkProvider(config.network);
  }

  /**
   * Deploy the Blinch contract to the specified network
   */
  async deploy(): Promise<{
    contract: Contract;
    address: string;
    txId: string;
  }> {
    console.log(`🚀 Deploying Blinch contract to ${this.config.network}...`);

    // Get credentials from HD wallet or environment
    console.log('🔐 Deriving keys from HD wallet...');
    const creatorCredentials = getCreatorCredentials();
    const recipientPublicKey = this.config.recipientPkh || getRecipientPublicKey();

    // Validate recipient public key
    if (!validatePublicKey(recipientPublicKey)) {
      throw new Error('Invalid recipient public key format');
    }

    console.log(`✓ Creator: ${creatorCredentials.address}`);
    console.log(`✓ Recipient PK: ${recipientPublicKey.substring(0, 20)}...`);

    // Calculate timeout (current block height + timeout)
    const currentHeight = await this.provider.getBlockHeight();
    const timeout = currentHeight + this.config.timeoutBlocks;

    console.log(`📊 Current block height: ${currentHeight}`);
    console.log(`⏰ Timeout block: ${timeout} (+${this.config.timeoutBlocks} blocks)`);

    // Import the compiled contract artifact
    const artifactPath = path.join(__dirname, '../dist/Blinch.json');
    if (!fs.existsSync(artifactPath)) {
      throw new Error(
        'Contract artifact not found. Please run `npm run build` first to compile the contract.'
      );
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf-8'));

    // Create the contract instance
    const contract = new Contract(
      artifact,
      [creatorCredentials.publicKey, recipientPublicKey, timeout],
      { provider: this.provider }
    );

    console.log(`📜 Contract address: ${contract.address}`);
    console.log(`🔗 Redemption address: ${contract.address}`);

    // Deploy the contract with some funding
    // For demo: 10,000 satoshis
    const deployTx = await contract.deploy(
      new SignatureTemplate(creatorCredentials.privateKey),
      10000
    );

    console.log(`✅ Contract deployed successfully!`);
    console.log(`📝 Transaction ID: ${deployTx.txid}`);

    // Save deployment info
    this.saveDeploymentInfo({
      network: this.config.network,
      contractAddress: contract.address,
      transactionId: deployTx.txid,
      timeout,
      creatorPk: creatorCredentials.publicKey,
      creatorAddress: creatorCredentials.address,
      recipientPk: recipientPublicKey,
      deployedAt: new Date().toISOString(),
      blockHeight: currentHeight,
    });

    return {
      contract,
      address: contract.address,
      txId: deployTx.txid,
    };
  }

  /**
   * Get creator key from environment or generate one
   * In production, this should derive from a proper HD wallet
   * @deprecated Use getCreatorCredentials() instead
   */
  private getCreatorKey(): any {
    // Deprecated - kept for compatibility
    return getCreatorCredentials();
  }

  /**
   * Get recipient key from config
   * @deprecated Use getRecipientPublicKey() instead
   */
  private getRecipientKey(): any {
    // Deprecated - kept for compatibility
    return {
      publicKey: getRecipientPublicKey(),
    };
  }

  /**
   * Save deployment information to file
   */
  private saveDeploymentInfo(info: any): void {
    const deploymentsDir = path.join(__dirname, '../deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const filename = `${this.config.network}-${Date.now()}.json`;
    const filepath = path.join(deploymentsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(info, null, 2));
    console.log(`💾 Deployment info saved to: ${filepath}`);
  }

  /**
   * Verify contract deployment
   */
  async verifyDeployment(address: string): Promise<boolean> {
    try {
      const utxos = await this.provider.getUtxos(address);
      console.log(`🔍 Found ${utxos.length} UTXOs at contract address`);
      return utxos.length > 0;
    } catch (error) {
      console.error('❌ Verification failed:', error);
      return false;
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const network = args.find((arg) => arg.startsWith('--network='))?.split('=')[1] as
    | 'chipnet'
    | 'testnet'
    | 'mainnet' || 'chipnet';

  const recipientPkh = args.find((arg) => arg.startsWith('--recipient='))?.split('=')[1];

  const config: DeploymentConfig = {
    ...DEFAULT_CONFIG,
    network,
    recipientPkh: recipientPkh || DEFAULT_CONFIG.recipientPkh,
  };

  if (!config.recipientPkh) {
    console.error('❌ Error: recipient public key must be provided');
    console.error('Usage: npm run deploy:chipnet -- --recipient=<PUBLIC_KEY>');
    process.exit(1);
  }

  const deployer = new BlinchDeployer(config);

  try {
    const result = await deployer.deploy();

    // Verify deployment
    console.log('\n🔍 Verifying deployment...');
    const verified = await deployer.verifyDeployment(result.address);
    if (verified) {
      console.log('✅ Deployment verified successfully!');
    } else {
      console.log('⚠️  Deployment verification failed - contract may not be funded yet');
    }

    console.log('\n🎉 Blinch contract is ready to use!');
    console.log(`\nContract address: ${result.address}`);
    console.log(`Transaction: https://chipnet.net/api/tx/${result.txId}`);
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { BlinchDeployer, DeploymentConfig };
