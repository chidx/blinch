/**
 * HD Wallet utilities for CashScript contract deployment
 */

import { publicKeyToP2PKHLockingBytecode } from 'cashscript/dist/utils.js';
import { CashAddressVersionByte, CashAddressType, encodeCashAddress } from '@bitauth/libauth';

/**
 * HD derivation path for Bitcoin Cash
 * Standard BIP44/145 path: m / 44' / 145' / 0' / 0 / index
 */
export function getDerivationPath(account: number = 0, index: number = 0): string {
  return `m/44'/145'/${account}'/0/${index}`;
}

/**
 * Derive a key pair from mnemonic and derivation path
 */
export interface KeyPair {
  publicKey: string;
  privateKey: string;
  address: string;
}

export function deriveKeyPair(
  mnemonic: string,
  derivationPath: string
): KeyPair {
  // This is a simplified version - in production use a proper BCH HD library
  // For now, we'll use environment variables as a fallback

  const envPubKey = process.env.CREATOR_PUBLIC_KEY;
  const envPrivKey = process.env.CREATOR_PRIVATE_KEY;

  if (envPubKey && envPrivKey) {
    return {
      publicKey: envPubKey,
      privateKey: envPrivKey,
      address: deriveAddress(envPubKey),
    };
  }

  throw new Error(
    'Please set CREATOR_PUBLIC_KEY and CREATOR_PRIVATE_KEY environment variables'
  );
}

/**
 * Derive a Bitcoin Cash address from a public key
 */
export function deriveAddress(publicKey: string, network?: string): string {
  // Get network prefix from parameter or environment
  const networkPrefix = network === 'chipnet' ? 'bchtest' :
                        network === 'testnet' ? 'bchtest' :
                        network === 'mainnet' ? 'bitcoincash' :
                        process.env.NETWORK === 'chipnet' ? 'bchtest' :
                        process.env.NETWORK === 'testnet' ? 'bchtest' :
                        'bitcoincash';

  // Convert public key to P2PKH locking bytecode
  const lockingBytecode = publicKeyToP2PKHLockingBytecode(
    Buffer.from(publicKey, 'hex')
  );

  // Extract the pubkey hash (skip the OP_DUP OP_HASH160 OP_PUSH_20 prefix)
  // P2PKH locking bytecode format: OP_DUP OP_HASH160 OP_PUSH_20 <pubkeyHash> OP_EQUALVERIFY OP_CHECKSIG
  // Which is: 0x76 0xa9 0x14 <20-byte pubkeyHash> 0x88 0xac
  const pubkeyHash = lockingBytecode.slice(3, 23);

  // Encode as CashAddress
  const result = encodeCashAddress({
    prefix: networkPrefix,
    type: CashAddressType.p2pkh,
    payload: pubkeyHash,
    throwErrors: true,
  });

  // The result can be either a string (success) or an object (error)
  if (typeof result === 'string') {
    return result;
  }

  // If it's an error object, extract the address or throw
  if (result.address) {
    return result.address;
  }

  throw new Error(`Failed to encode address: ${JSON.stringify(result)}`);
}

/**
 * Get creator credentials from environment
 */
export function getCreatorCredentials(): KeyPair {
  const mnemonic = process.env.MNEMONIC;
  const derivationPath = process.env.DERIVATION_PATH || getDerivationPath(0, 0);

  if (mnemonic) {
    return deriveKeyPair(mnemonic, derivationPath);
  }

  // Fallback to direct key pair from environment
  const publicKey = process.env.CREATOR_PUBLIC_KEY;
  const privateKey = process.env.CREATOR_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw new Error(
      'Missing credentials. Please set either:\n' +
        '  - MNEMONIC environment variable\n' +
        '  - Both CREATOR_PUBLIC_KEY and CREATOR_PRIVATE_KEY'
    );
  }

  return {
    publicKey,
    privateKey,
    address: deriveAddress(publicKey),
  };
}

/**
 * Get recipient public key from environment
 */
export function getRecipientPublicKey(): string {
  const recipientKey = process.env.RECIPIENT_PUBLIC_KEY;

  if (!recipientKey) {
    throw new Error(
      'Missing RECIPIENT_PUBLIC_KEY environment variable.\n' +
        'Please provide a recipient public key for the contract.'
    );
  }

  return recipientKey;
}

/**
 * Validate a public key format
 */
export function validatePublicKey(publicKey: string): boolean {
  // Bitcoin Cash public keys are 33 bytes (compressed) or 65 bytes (uncompressed)
  const hexRegex = /^[0-9a-fA-F]+$/;
  const cleanedKey = publicKey.replace('0x', '');
  const length = cleanedKey.length / 2;

  return hexRegex.test(cleanedKey) && (length === 33 || length === 65);
}
