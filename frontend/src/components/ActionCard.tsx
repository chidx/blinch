/**
 * ActionCard Component
 *
 * Renders a Blinch action from BCH-Action JSON Schema
 * Handles wallet connection and transaction execution
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { BlinchAction, ActionLink } from '../types/action';

interface ActionCardProps {
  action: BlinchAction;
}

export default function ActionCard({ action }: ActionCardProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const primaryAction = action.links.actions[0];

  const handleExecute = async (actionLink: ActionLink) => {
    setIsExecuting(true);
    setError(null);

    try {
      // Parse the Bitcoin Cash URI
      const uri = actionLink.href;
      console.log('Executing action:', uri);

      // For now, just open the BCH URI in a wallet
      // In a full implementation, this would integrate with CashScript SDK
      window.location.href = uri;

      setSuccess(true);
    } catch (err) {
      console.error('Execution error:', err);
      setError(err instanceof Error ? err.message : 'Failed to execute action');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="glass-strong rounded-2xl overflow-hidden shadow-2xl">
      {/* Header with icon */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
        {action.icon && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-2xl glass flex items-center justify-center">
              <Image
                src="/icon-lg.png"
                alt={action.title}
                width={90}
                height={90}
                className="rounded-2xl"
                unoptimized
              />
            </div>
          </div>
        )}
        <div className="absolute top-4 right-4">
          <button
            className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 border border-primary/30 hover:bg-primary/30 hover:border-primary/50 transition-all cursor-pointer"
          >
            {action.metadata.protocol}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Title and Description */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-3 gradient-text">{action.title}</h2>
          <p className="text-gray-400">{action.description}</p>
        </div>

        {/* Protocol Info */}
        <div className="mb-6 p-4 rounded-lg bg-black/30 border border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Protocol Version</span>
            <span className="font-mono text-accent">{action.version}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-500">OP_RETURN Prefix</span>
            <span className="font-mono text-accent">{action.metadata.hex_prefix}</span>
          </div>
        </div>

        {/* Actions */}
        {action.links.actions.length > 0 && (
          <div className="space-y-4">
            {action.links.actions.map((actionLink, index) => (
              <div key={index} className="space-y-3">
                {/* Action Button */}
                <button
                  onClick={() => handleExecute(actionLink)}
                  disabled={isExecuting || success}
                  className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  {isExecuting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Executing...
                    </span>
                  ) : success ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Action Executed!
                    </span>
                  ) : (
                    actionLink.label
                  )}
                </button>

                {/* Parameters */}
                {actionLink.parameters && actionLink.parameters.length > 0 && (
                  <div className="p-4 rounded-lg bg-black/20 space-y-3">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Parameters</h4>
                    {actionLink.parameters.map((param, paramIndex) => (
                      <div key={paramIndex}>
                        <label className="block text-sm text-gray-400 mb-1">
                          {param.label}
                          {param.required && <span className="text-red-400 ml-1">*</span>}
                        </label>
                        <input
                          type={param.type === 'number' ? 'number' : 'text'}
                          name={param.name}
                          defaultValue={param.default?.toString()}
                          required={param.required}
                          className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 focus:border-primary/50 focus:outline-none transition-colors"
                          placeholder={`Enter ${param.label.toLowerCase()}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Success Display */}
        {success && (
          <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <p className="text-green-400 text-sm">
              ✓ Action executed successfully! Check your wallet for the transaction.
            </p>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-xs text-gray-500 text-center">
            Powered by{' '}
            <a
              href="https://cashscript.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              CashScript
            </a>{' '}
            • Bitcoin Cash
          </p>
        </div>
      </div>
    </div>
  );
}
