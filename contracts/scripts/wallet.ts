/**
 * HD Wallet utilities for CashScript contract deployment
 */

import * as bs58check from 'bs58check';
import { createHash } from 'crypto';

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
export function deriveAddress(publicKey: string): string {
  // Convert public key to address (simplified)
  // In production, use proper BCH address derivation
  const pkHash = createHash('ripemd160')
    .update(createHash('sha256').update(Buffer.from(publicKey, 'hex')).digest())
    .digest();

  // Add version byte for P2PKH (0x00 for mainnet, 0x6f for testnet)
  const version = process.env.NETWORK === 'chipnet' ? Buffer.from([0x6f]) : Buffer.from([0x00]);
  const payload = Buffer.concat([version, pkHash]);

  // Encode with Base58Check
  return bs58check.encode(payload);
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
  const length = publicKey.replace('0x', '').length / 2;

  return hexRegex.test(publicKey.replace('0x', '')) && (length === 33 || length === 65);
}
