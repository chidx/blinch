/**
 * Freemium Tier Configuration
 */

/**
 * User tiers and their limits
 */
export enum Tier {
  FREE = 'free',
  PREMIUM = 'premium',
}

/**
 * Tier limits
 */
export interface TierLimits {
  maxActionsPerMonth: number;
  maxParametersPerAction: number;
  advancedAnalytics: boolean;
  apiAccess: boolean;
  customBranding: boolean;
  prioritySupport: boolean;
}

/**
 * Tier configurations
 */
export const TIER_CONFIGS: Record<Tier, TierLimits> = {
  [Tier.FREE]: {
    maxActionsPerMonth: 3,
    maxParametersPerAction: 2,
    advancedAnalytics: false,
    apiAccess: false,
    customBranding: false,
    prioritySupport: false,
  },
  [Tier.PREMIUM]: {
    maxActionsPerMonth: -1, // Unlimited
    maxParametersPerAction: 10,
    advancedAnalytics: true,
    apiAccess: true,
    customBranding: true,
    prioritySupport: true,
  },
};

/**
 * Premium pricing (one-time payment in satoshis)
 */
export const PREMIUM_PRICING = {
  LIFETIME: 100000, // 0.001 BCH = ~$0.30-0.50
  MONTHLY: 50000,   // 0.0005 BCH = ~$0.15-0.25
};

/**
 * Check if user has exceeded free tier limits
 */
export function hasExceededFreeTier(
  actionsCreatedThisMonth: number,
  parametersCount: number
): boolean {
  const freeLimits = TIER_CONFIGS[Tier.FREE];
  return (
    actionsCreatedThisMonth >= freeLimits.maxActionsPerMonth ||
    parametersCount > freeLimits.maxParametersPerAction
  );
}

/**
 * Get action count for user in current month
 */
export function getActionsCreatedThisMonth(
  userActions: Array<{ createdAt: Date | string }>
): number {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return userActions.filter((action) => {
    const createdAt = action.createdAt instanceof Date ? action.createdAt : new Date(action.createdAt);
    return createdAt >= startOfMonth;
  }).length;
}
