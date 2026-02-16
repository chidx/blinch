# Blinch Contract Deployment Guide

This guide explains how to deploy the Blinch.cash contract to the Bitcoin Cash testnet.

## Prerequisites

1. **CashScript SDK v0.12.1** installed
2. **Chipnet BCH** for testing
3. **Node.js 25.6.1+**
4. **Wallet credentials** (see setup below)

## Quick Start

### 1. Install Dependencies

```bash
cd contracts
npm install
```

### 2. Configure Environment

Copy the example environment file and add your credentials:

```bash
cp .env.example .env
```

Edit `.env` and add your wallet details:

```bash
# Recommended: Use HD wallet mnemonic
MNEMONIC="your twelve word mnemonic phrase"
DERIVATION_PATH="m/44'/145'/0'/0/0"

# OR use direct keys
CREATOR_PUBLIC_KEY="02abc..."
CREATOR_PRIVATE_KEY="your_private_key"

# Recipient
RECIPIENT_PUBLIC_KEY="03xyz..."
```

### 3. Compile the Contract

```bash
npm run build
```

This compiles `Blinch.cash` and outputs to `dist/Blinch.json`.

### 4. Deploy to Chipnet

```bash
# Deploy with default recipient from .env
npm run deploy:chipnet

# Or specify recipient via CLI
npm run deploy:chipnet -- --recipient=03abc...
```

### 5. Verify Deployment

The deployment script will automatically verify by checking for UTXOs at the contract address.

You can also verify manually:

```bash
# Check on block explorer
echo "https://chipnet.net/api/addr/<CONTRACT_ADDRESS>"
```

## Deployment Process

The deployment script performs the following steps:

1. ✅ Derives keys from HD wallet or environment
2. ✅ Fetches current block height from Electrum
3. ✅ Calculates timeout block (current + 144)
4. ✅ Compiles contract artifact
5. ✅ Creates contract instance with parameters
6. ✅ Deploys contract with funding
7. ✅ Saves deployment info to `deployments/`
8. ✅ Verifies deployment by checking UTXOs

## Deployment Artifacts

After deployment, you'll find:

- **deployments/chipnet-{timestamp}.json** - Deployment details
- **dist/Blinch.json** - Compiled contract artifact
- **dist/Blinch.artifact** - CashScript artifact

### Deployment JSON Structure

```json
{
  "network": "chipnet",
  "contractAddress": "bitcoincash:...",
  "transactionId": "...",
  "timeout": 1234567,
  "creatorPk": "02abc...",
  "creatorAddress": "bitcoincash:...",
  "recipientPk": "03xyz...",
  "deployedAt": "2026-02-16T...",
  "blockHeight": 1234423
}
```

## HD Wallet Derivation

The contract uses BIP44/145 derivation path for Bitcoin Cash:

```
m / 44' / 145' / <account>' / 0 / <index>
```

- **44'** - BIP44 purpose
- **145'** - Bitcoin Cash coin type
- **account'** - Account (hardened)
- **0** - Change (external = 0)
- **index** - Address index

## Networks

### Chipnet (Default)
```bash
npm run deploy:chipnet
```

### Testnet
```bash
npm run deploy:testnet
```

### Mainnet
```bash
npm run deploy:mainnet
```

⚠️ **WARNING**: Only deploy to mainnet after thorough testing!

## Troubleshooting

### "Contract artifact not found"
```bash
npm run build
```

### "Missing credentials"
Check your `.env` file has required variables.

### "Verification failed"
- Check if transaction has enough confirmations
- Verify contract address matches deployment output
- Check network connection to Electrum server

### "Invalid recipient public key format"
Public key must be 33 bytes (compressed) or 65 bytes (uncompressed) hex string.

## Security Best Practices

1. ✅ **Never commit private keys** to git
2. ✅ **Use `.env` file** (already in `.gitignore`)
3. ✅ **Test on Chipnet first** before mainnet
4. ✅ **Use HD wallets** for production
5. ✅ **Verify timeout** is appropriate (default: 144 blocks)
6. ✅ **Keep deployment artifacts** for contract interaction

## Contract Parameters

When deploying, you specify:

| Parameter | Type | Description |
|-----------|------|-------------|
| `creator` | pubkey | Can cancel after timeout |
| `recipient` | pubkey | Can execute transaction |
| `timeout` | int | Block height when creator can cancel |

## Next Steps

After deployment:

1. **Fund the contract** - Send BCH to contract address
2. **Test execute()** - Create transaction with OP_RETURN
3. **Test cancel()** - Wait for timeout and reclaim funds
4. **Integrate with backend** - Use contract address in API

## Support

For issues or questions:
- Check CashScript docs: https://cashscript.org
- Chipnet faucet: https://chipnet.net/faucet
- BCH explorer: https://chipnet.net
