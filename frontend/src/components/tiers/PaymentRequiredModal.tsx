/**
 * Payment Required Modal - Shows when user hits tier limits
 */

'use client';

import { useState, useEffect } from 'react';

interface PaymentRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  paymentDetails?: {
    payment_link: string;
    payment_amount: string;
    payment_currency: string;
    payment_bch?: string;
    feature?: string;
  };
}

export function PaymentRequiredModal({
  isOpen,
  onClose,
  reason,
  paymentDetails,
}: PaymentRequiredModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  if (!isOpen) return null;

  const handleCopyPaymentLink = () => {
    if (paymentDetails?.payment_link) {
      navigator.clipboard.writeText(paymentDetails.payment_link);
      setCopied(true);
    }
  };

  const getPaymentAmount = () => {
    if (!paymentDetails) return null;

    const satoshis = parseInt(paymentDetails.payment_amount, 10);
    const bch = satoshis / 100000000;

    if (bch < 0.001) {
      return `${(bch * 1000000).toFixed(0)} satoshis`;
    }
    return `${bch.toFixed(6)} BCH`;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-strong rounded-xl p-6 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-yellow-500/20 mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">💎</span>
          </div>
          <h3 className="text-2xl font-bold mb-2 gradient-text">Premium Feature</h3>
          <p className="text-gray-400">{reason}</p>
        </div>

        {/* Payment Details */}
        {paymentDetails && (
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-white mb-3">Payment Required</h4>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Amount:</span>
                <span className="font-mono text-white font-medium">
                  {getPaymentAmount()}
                </span>
              </div>

              {paymentDetails.payment_bch && (
                <div className="flex justify-between">
                  <span className="text-gray-400">USD (approx):</span>
                  <span className="text-white">
                    ~${(parseInt(paymentDetails.payment_amount, 10) / 100000000 * 300).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-400">Currency:</span>
                <span className="text-white">Bitcoin Cash (BCH)</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Protocol:</span>
                <span className="text-accent font-mono text-xs">464c4f5701</span>
              </div>
            </div>

            {/* Payment Link */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <label className="block text-xs text-gray-400 mb-2">Payment Link:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={paymentDetails.payment_link}
                  className="flex-1 px-3 py-2 rounded bg-black/30 border border-white/10 font-mono text-xs text-white"
                />
                <button
                  onClick={handleCopyPaymentLink}
                  className="px-3 py-2 rounded bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Click to copy, then open in your BCH wallet
              </p>
            </div>
          </div>
        )}

        {/* Upgrade Benefits */}
        <div className="mb-6">
          <h4 className="font-medium text-white mb-3">What you get:</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>
                <strong className="text-white">Unlimited</strong> action creation
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>
                <strong className="text-white">Advanced analytics</strong> for your actions
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>
                <strong className="text-white">Priority support</strong> and updates
              </span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg glass hover:bg-white/5 transition-colors font-medium"
          >
            Maybe Later
          </button>
          <button
            onClick={() => {
              handleCopyPaymentLink();
              // In a real implementation, this would:
              // 1. Copy the payment link
              // 2. Open the user's wallet or show instructions
              // 3. After payment, retry the action creation with X-Payment header
            }}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-accent to-primary hover:opacity-90 transition-opacity font-medium"
          >
            Pay Now
          </button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-gray-500 text-center mt-4">
          One-time payment • Instant activation • Cancel anytime
        </p>
      </div>
    </div>
  );
}
