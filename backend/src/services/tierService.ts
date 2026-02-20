/**
 * Tier Service - Manage user tiers and subscriptions
 */

import { Tier, TIER_CONFIGS, getActionsCreatedThisMonth, hasExceededFreeTier } from '../config/tiers.js';
import { getActionStore } from '../storage/ActionStore.js';
import type { ActionModel } from '../types/action.js';

/**
 * User tier information
 */
export interface UserTier {
  address: string;
  tier: Tier;
  subscribedAt?: string;
  expiresAt?: string;
}

/**
 * Tier storage (in-memory for now, can be upgraded to database)
 */
const tierStorage = new Map<string, UserTier>();

/**
 * Monetization recipient address (where premium payments go)
 */
const MONETIZATION_ADDRESS = process.env.MONETIZATION_ADDRESS || 'bitcoincash:qrqglczyxh4yvdnkkenk3k9ltq3e2j2dnqjvulv4rk';

/**
 * Get user tier
 */
export function getUserTier(userAddress: string): Tier {
  const userTier = tierStorage.get(userAddress);
  return userTier?.tier || Tier.FREE;
}

/**
 * Set user tier (called after premium payment verification)
 */
export function setUserTier(
  userAddress: string,
  tier: Tier,
  expiresAt?: Date
): void {
  tierStorage.set(userAddress, {
    address: userAddress,
    tier,
    subscribedAt: new Date().toISOString(),
    expiresAt: expiresAt?.toISOString(),
  });
}

/**
 * Check if user can create action
 */
export async function canCreateAction(
  userAddress: string,
  parametersCount: number
): Promise<{ allowed: boolean; reason?: string; paymentRequired?: boolean }> {
  const tier = getUserTier(userAddress);
  const tierConfig = TIER_CONFIGS[tier];

  // Premium users can always create
  if (tier === Tier.PREMIUM) {
    return { allowed: true };
  }

  // Check free tier limits
  const store = getActionStore();
  const userActions = store.getByCreator(userAddress);
  const actionsThisMonth = getActionsCreatedThisMonth(userActions);

  if (actionsThisMonth >= tierConfig.maxActionsPerMonth) {
    return {
      allowed: false,
      reason: `Free tier limit: ${tierConfig.maxActionsPerMonth} actions per month`,
      paymentRequired: true,
    };
  }

  if (parametersCount > tierConfig.maxParametersPerAction) {
    return {
      allowed: false,
      reason: `Free tier limit: ${tierConfig.maxParametersPerAction} parameters per action`,
      paymentRequired: true,
    };
  }

  return { allowed: true };
}

/**
 * Check if user can access premium feature
 */
export function canAccessFeature(
  userAddress: string,
  feature: 'advancedAnalytics' | 'apiAccess' | 'customBranding' | 'prioritySupport'
): boolean {
  const tier = getUserTier(userAddress);
  const tierConfig = TIER_CONFIGS[tier];
  return tierConfig[feature];
}

/**
 * Get tier upgrade payment requirements
 */
export function getUpgradePaymentRequirements(
  userAddress: string
): { amount: number; recipient: string; actionType: string; description: string } | null {
  const tier = getUserTier(userAddress);

  if (tier === Tier.PREMIUM) {
    return null; // Already premium
  }

  return {
    amount: 100000, // 100,000 satoshis = 0.001 BCH
    recipient: MONETIZATION_ADDRESS,
    actionType: 'premium_upgrade',
    description: 'Premium upgrade - unlimited actions, analytics, and more',
  };
}

/**
 * Process premium upgrade (after payment verification)
 */
export async function processPremiumUpgrade(userAddress: string): Promise<boolean> {
  try {
    // Set tier to premium (lifetime for now)
    setUserTier(userAddress, Tier.PREMIUM);
    return true;
  } catch (error) {
    console.error('Failed to process premium upgrade:', error);
    return false;
  }
}

/**
 * Get user stats for tier usage
 */
export async function getUserTierStats(userAddress: string) {
  const tier = getUserTier(userAddress);
  const tierConfig = TIER_CONFIGS[tier];
  const store = getActionStore();
  const userActions = store.getByCreator(userAddress);
  const actionsThisMonth = getActionsCreatedThisMonth(userActions);

  return {
    tier,
    limits: tierConfig,
    usage: {
      actionsCreated: userActions.length,
      actionsThisMonth,
      remainingThisMonth: tierConfig.maxActionsPerMonth === -1
        ? -1
        : Math.max(0, tierConfig.maxActionsPerMonth - actionsThisMonth),
    },
  };
}
