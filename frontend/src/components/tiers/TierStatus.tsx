/**
 * Tier status and upgrade prompt component
 */

'use client';

import { useState } from 'react';

export interface TierInfo {
  tier: 'free' | 'premium';
  stats: {
    actionsCreated: number;
    actionsThisMonth: number;
    remainingThisMonth: number;
  };
}

interface TierStatusProps {
  tierInfo?: TierInfo | null;
  onUpgrade?: () => void;
  className?: string;
}

export function TierStatus({ tierInfo, onUpgrade, className = '' }: TierStatusProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!tierInfo) {
    return null;
  }

  const { tier, stats } = tierInfo;
  const isFree = tier === 'free';
  const isNearLimit = isFree && stats.remainingThisMonth <= 1;

  const handleUpgradeClick = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      setShowUpgradeModal(true);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    // TODO: Implement payment flow
    // For now, this would call the backend to get payment requirements
    // and then open a wallet or show payment instructions
    setTimeout(() => {
      setLoading(false);
      setShowUpgradeModal(false);
      alert('Payment flow would be triggered here. This will be connected to the backend premium endpoints.');
    }, 1000);
  };

  return (
    <>
      <div className={`glass rounded-lg p-4 ${isFree && isNearLimit ? 'border-yellow-500/50' : ''} ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-300">
              {tier === 'premium' ? '⭐ Premium' : 'Free Tier'}
            </span>
            {isFree && (
              <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-400">
                {stats.remainingThisMonth === -1 ? '∞' : `${stats.remainingThisMonth}`} actions left this month
              </span>
            )}
          </div>
          {isFree && (
            <button
              onClick={handleUpgradeClick}
              className="text-xs px-3 py-1.5 rounded bg-gradient-to-r from-accent to-primary hover:opacity-90 transition-opacity font-medium"
            >
              Upgrade to Premium
            </button>
          )}
        </div>

        {isFree && (
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mt-3">
            <div className="bg-black/20 rounded p-2 text-center">
              <div className="font-medium text-white">{stats.actionsCreated}</div>
              <div>Total Actions</div>
            </div>
            <div className="bg-black/20 rounded p-2 text-center">
              <div className="font-medium text-white">{stats.actionsThisMonth}</div>
              <div>This Month</div>
            </div>
            <div className="bg-black/20 rounded p-2 text-center">
              <div className="font-medium text-white">{stats.remainingThisMonth === -1 ? '∞' : stats.remainingThisMonth}</div>
              <div>Remaining</div>
            </div>
          </div>
        )}

        {tier === 'premium' && (
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mt-3">
            <div className="bg-primary/20 rounded p-2 text-center">
              <div className="font-medium text-primary">Unlimited</div>
              <div>Actions</div>
            </div>
            <div className="bg-primary/20 rounded p-2 text-center">
              <div className="font-medium text-primary">10</div>
              <div>Parameters</div>
            </div>
            <div className="bg-primary/20 rounded p-2 text-center">
              <div className="font-medium text-primary">Yes</div>
              <div>Analytics</div>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-strong rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 gradient-text">Upgrade to Premium</h3>

            <div className="space-y-4 mb-6">
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-primary">0.001 BCH</span>
                  <span className="text-xs text-gray-400">~$0.30-0.50</span>
                </div>
                <p className="text-sm text-gray-400">One-time payment • Lifetime access</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-white">Premium Features:</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Unlimited actions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Up to 10 parameters per action</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>API access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Custom branding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-2.5 rounded-lg glass hover:bg-white/5 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-accent to-primary hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Upgrade Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
