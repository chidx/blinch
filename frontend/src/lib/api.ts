/**
 * API client for fetching Blinch actions
 */

import type { BlinchAction, ActionResponse } from '../types/action';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Fetch an action by ID
 */
export async function fetchAction(id: string): Promise<ActionResponse> {
  try {
    const url = API_BASE_URL
      ? `${API_BASE_URL}/api/action/${encodeURIComponent(id)}`
      : `/action/${encodeURIComponent(id)}`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      // Enable caching
      next: {
        revalidate: 300, // 5 minutes
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: {
          code: errorData.error?.code || 'FETCH_ERROR',
          message: errorData.error?.message || 'Failed to fetch action',
          details: errorData.error?.details,
        },
      };
    }

    const action: BlinchAction = await response.json();
    return { action };
  } catch (error) {
    return {
      error: {
        code: 'NETWORK_ERROR',
        message: 'Network error while fetching action',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Parse a Bitcoin Cash URI
 */
export function parseBitcoinCashUri(uri: string): {
  address: string;
  amount?: string;
  opReturn?: string;
  [key: string]: string | undefined;
} {
  try {
    const url = new URL(uri);
    const address = url.pathname.replace('//', '');
    const params: Record<string, string> = {};

    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return {
      address,
      amount: params.amount,
      opReturn: params.op_return,
      ...params,
    };
  } catch (error) {
    throw new Error('Invalid Bitcoin Cash URI format');
  }
}

/**
 * Validate OP_RETURN prefix
 */
export function validateOpReturn(opReturn?: string): boolean {
  if (!opReturn) return false;
  return opReturn.toLowerCase().startsWith('464c4f5701');
}
