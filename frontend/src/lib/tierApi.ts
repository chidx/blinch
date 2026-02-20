/**
 * Premium Tier API Service
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export interface TierStats {
  tier: 'free' | 'premium';
  stats: {
    actionsCreated: number;
    actionsThisMonth: number;
    remainingThisMonth: number;
  };
}

export interface PremiumUpgradeInfo {
  paymentRequired: boolean;
  payment: {
    amount: number;
    currency: string;
    bch: string;
    recipient: string;
    actionType: string;
    description: string;
  };
  features: {
    unlimitedActions: boolean;
    advancedAnalytics: boolean;
    maxParameters: number;
    apiAccess: boolean;
    customBranding: boolean;
  };
}

/**
 * Get user tier information
 */
export async function getTierStats(userAddress: string): Promise<TierStats> {
  const url = `${BACKEND_URL}/api/premium/tier?address=${userAddress}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch tier stats');
  }

  return response.json();
}

/**
 * Get premium upgrade information
 */
export async function getPremiumUpgradeInfo(userAddress: string): Promise<PremiumUpgradeInfo> {
  const url = `${BACKEND_URL}/api/premium/upgrade`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: userAddress }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch upgrade info');
  }

  return response.json();
}

/**
 * Activate premium after payment
 */
export async function activatePremium(
  userAddress: string,
  txId: string
): Promise<{ success: boolean; tier: string; message: string }> {
  const url = `${BACKEND_URL}/api/premium/activate`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Payment': txId,
    },
    body: JSON.stringify({ address: userAddress, txId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to activate premium');
  }

  return response.json();
}

/**
 * Get action analytics (premium only)
 */
export async function getActionAnalytics(
  actionId: string,
  paymentTxId?: string
): Promise<any> {
  const url = `${BACKEND_URL}/api/premium/analytics/${actionId}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (paymentTxId) {
    headers['X-Payment'] = paymentTxId;
  }

  const response = await fetch(url, { headers });

  if (response.status === 402) {
    const error = await response.json();
    return {
      paymentRequired: true,
      ...error,
    };
  }

  if (!response.ok) {
    throw new Error('Failed to fetch analytics');
  }

  return response.json();
}

/**
 * Check if response is 402 Payment Required
 */
export function isPaymentRequired(response: Response): boolean {
  return response.status === 402;
}

/**
 * Extract payment info from 402 response
 */
export async function getPaymentRequirement(response: Response): Promise<any> {
  if (response.status !== 402) return null;

  const error = response.headers.get('Content-Type')?.includes('application/json')
    ? await response.json()
    : null;

  return error?.error || null;
}
