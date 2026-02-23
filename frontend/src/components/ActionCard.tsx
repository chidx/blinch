/**
 * ActionCard Component
 *
 * Renders a Blinch action from BCH-Action JSON Schema
 * Handles URI-based transaction execution with post-execution verification
 * Displays contract information when available
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { BlinchAction, ActionLink, ContractInfo } from '../types/action';
import TransactionVerification from './TransactionVerification';

interface ActionCardProps {
  action: BlinchAction;
}

export default function ActionCard({ action }: ActionCardProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const primaryAction = action.links.actions[0];
  const contractInfo = action.metadata.contract_info;

  const handleExecute = async (actionLink: ActionLink) => {
    setIsExecuting(true);
    setError(null);

    try {
      // Parse the Bitcoin Cash URI
      const uri = actionLink.href;
      console.log('Executing action:', uri);

      // Open the BCH URI in user's wallet
      window.location.href = uri;

      // Show success state with verification UI
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
        <div className="absolute top-4 right-4 flex gap-2">
          {contractInfo && (
            <button
              className="px-3 py-1 rounded-full text-xs font-medium bg-accent/20 border border-accent/30 hover:bg-accent/30 hover:border-accent/50 transition-all cursor-pointer"
              title="Protected by Smart Contract"
            >
              🔒 Smart Contract
            </button>
          )}
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

        {/* Contract Information */}
        {contractInfo && (
          <div className="mb-6 p-4 rounded-lg bg-accent/10 border border-accent/30">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-accent text-lg">🔐</span>
              <h3 className="font-semibold text-accent">Smart Contract Protection</h3>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Contract Address</span>
                <span className="font-mono text-xs text-accent truncate max-w-[200px]">
                  {contractInfo.address}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status</span>
                <span className={`font-medium ${contractInfo.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                  {contractInfo.status === 'active' ? '● Active' : '● Expired'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Timeout Block</span>
                <span className="font-mono text-accent">#{contractInfo.timeout}</span>
              </div>
              <div className="pt-2 border-t border-accent/20">
                <a
                  href={`https://chipnet.bitcoinexplorer.org/address/${contractInfo.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline flex items-center gap-1"
                >
                  View on Explorer
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {action.links.actions.length > 0 && (
          <div className="space-y-4">
            {action.links.actions.map((actionLink, index) => (
              <div key={index} className="space-y-3">
                {/* Action Button */}
                <button
                  onClick={() => handleExecute(actionLink)}
                  disabled={isExecuting}
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
                      Opening Wallet...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      {actionLink.label}
                    </span>
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

        {/* Post-Execution Verification UI */}
        {success && (
          <>
            <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-green-400 text-sm mb-2">
                ✓ Transaction initiated! Your wallet should have opened.
              </p>
              <p className="text-xs text-gray-400">
                Complete the transaction in your wallet, then use the verification tool below.
              </p>
            </div>

            <TransactionVerification
              protocolPrefix={action.metadata.hex_prefix}
              network="chipnet"
              actionTitle={action.title}
            />
          </>
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
            • Bitcoin Cash URI Protocol{contractInfo && ' • Covenant Smart Contract'}
          </p>
        </div>
      </div>
    </div>
  );
}
