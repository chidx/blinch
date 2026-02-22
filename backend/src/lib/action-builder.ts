/**
 * Action builder utilities for generating BCH-Action JSON Schema
 */

import {
  BlinchActionSchema,
  ActionLink,
  ActionParameter,
  BlinchActionMetadata,
} from '../types/action';

// Protocol prefix: "FLOW\x01" in hex (0x464c4f5701)
const PROTOCOL_PREFIX = '464c4f5701';

const DEFAULT_METADATA: BlinchActionMetadata = {
  protocol: 'Blinch',
  identifier: 'FLOW\\x01',
  hex_prefix: PROTOCOL_PREFIX,
};

/**
 * Build a Bitcoin Cash URI with OP_RETURN
 */
export function buildBitcoinCashUri(params: {
  address: string;
  amount?: string;
  opReturnData?: string;
  actionType?: string;
}): string {
  const { address, amount, opReturnData, actionType } = params;

  // Determine network prefix and strip it if present
  const isTestnet = /^bchtest:/i.test(address);
  const cleanAddress = address.replace(/^(bitcoincash:|bchtest:)/i, '');
  const prefix = isTestnet ? 'bchtest' : 'bitcoincash';

  // Build URI parameters
  const uriParams = new URLSearchParams();

  if (amount) {
    uriParams.set('amount', amount);
  }

  // Build OP_RETURN: protocol prefix + action type + optional data
  const opReturn = opReturnData || actionType
    ? PROTOCOL_PREFIX + (actionType || '') + (opReturnData || '')
    : PROTOCOL_PREFIX;

  uriParams.set('op_return', opReturn);

  return `${prefix}:${cleanAddress}?${uriParams.toString()}`;
}

/**
 * Create default action link
 */
export function createActionLink(params: {
  address: string;
  amount?: string;
  actionType?: string;
  label?: string;
  parameters?: ActionParameter[];
}): ActionLink {
  const { address, amount, actionType, label = 'Execute', parameters } = params;

  return {
    label,
    href: buildBitcoinCashUri({ address, amount, actionType }),
    parameters,
  };
}

/**
 * Build complete Blinch action schema
 */
export function buildBlinchAction(params: {
  id: string;
  title: string;
  description: string;
  recipientAddress: string;
  amount?: string;
  iconUrl?: string;
  actionType?: string;
  parameters?: ActionParameter[];
}): BlinchActionSchema {
  const {
    id,
    title,
    description,
    recipientAddress,
    amount,
    iconUrl = 'https://blinch.network/assets/icon.png',
    actionType,
    parameters,
  } = params;

  const actionLink = createActionLink({
    address: recipientAddress,
    amount,
    actionType,
    parameters,
  });

  return {
    version: '1.1.0',
    type: 'action',
    icon: iconUrl,
    title,
    description,
    links: {
      actions: [actionLink],
    },
    metadata: DEFAULT_METADATA,
  };
}

/**
 * Validate Bitcoin Cash address format (supports both mainnet and testnet)
 */
export function validateBchAddress(address: string): boolean {
  if (!address) return false;

  // Remove mainnet or testnet prefix if present
  const cleanAddress = address.replace(/^(bitcoincash:|bchtest:)/i, '');

  // Accept addresses between 34-54 alphanumeric characters (permissive for testnet variations)
  const isValidFormat = cleanAddress.length >= 34 && cleanAddress.length <= 54 && /^[a-zA-Z0-9]+$/.test(cleanAddress);

  return isValidFormat;
}

/**
 * Validate action parameters
 */
export function validateActionParameters(params: ActionParameter[]): boolean {
  const validTypes = ['text', 'number', 'boolean', 'date'];

  return params.every(
    (param) =>
      param.name &&
      param.label &&
      validTypes.includes(param.type)
  );
}
