/**
 * TransactionVerification Component
 *
 * Displays verification steps and blockchain explorer links
 * after user initiates a transaction via Bitcoin Cash URI
 */

'use client';

import { useState } from 'react';
import TransactionVisualizer from './TransactionVisualizer';

interface TransactionVerificationProps {
  protocolPrefix: string;
  network?: 'chipnet' | 'mainnet';
  actionTitle?: string;
}

export default function TransactionVerification({
  protocolPrefix,
  network = 'chipnet',
  actionTitle
}: TransactionVerificationProps) {
  const [txIdInput, setTxIdInput] = useState('');
  const [verifyingTxId, setVerifyingTxId] = useState('');
  const [copied, setCopied] = useState(false);

  const explorerUrl = network === 'chipnet'
    ? 'https://chipnet.bitcoinexplorer.org'
    : 'https://blockchair.com/bitcoin-cash';

  const handleCopyPrefix = async () => {
    await navigator.clipboard.writeText(protocolPrefix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyTxId = () => {
    if (txIdInput.trim()) {
      setVerifyingTxId(txIdInput.trim());
    }
  };

  const handleResetVerification = () => {
    setVerifyingTxId('');
    setTxIdInput('');
  };

  const verificationSteps = [
    {
      step: 1,
      title: 'Complete Transaction in Wallet',
      description: 'Your wallet should have opened with a pre-filled transaction. Review and confirm it.',
      icon: '👛'
    },
    {
      step: 2,
      title: 'Copy Transaction ID',
      description: 'After broadcasting, copy the transaction ID (TXID) from your wallet.',
      icon: '📋'
    },
    {
      step: 3,
      title: 'Verify on Blockchain',
      description: 'Paste the TXID below to verify the transaction on the block explorer.',
      icon: '🔍'
    },
    {
      step: 4,
      title: 'Check Protocol Compliance',
      description: `Confirm the transaction includes OP_RETURN with prefix "${protocolPrefix}"`,
      icon: '✅'
    }
  ];

  return (
    <div className="mt-6 p-6 rounded-xl glass space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/10">
        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center text-xl">
          🔍
        </div>
        <div>
          <h3 className="text-lg font-semibold">Transaction Verification</h3>
          <p className="text-xs text-gray-400">Follow these steps to verify your transaction</p>
        </div>
      </div>

      {/* Verification Steps */}
      <div className="space-y-4">
        {verificationSteps.map((item) => (
          <div key={item.step} className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary">
              {item.step}
            </div>
            <div className="flex-1">
              <h4 className="font-medium mb-1">{item.title}</h4>
              <p className="text-sm text-gray-400">{item.description}</p>
            </div>
            <div className="text-2xl">{item.icon}</div>
          </div>
        ))}
      </div>

      {/* Quick Verification Tool */}
      <div className="p-4 rounded-lg bg-black/30 space-y-4">
        <h4 className="font-medium text-sm">Quick Verification</h4>

        {/* Protocol Prefix Reference */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">Protocol Prefix (for reference)</label>
          <div className="flex gap-2">
            <code className="flex-1 px-3 py-2 rounded bg-black/50 border border-white/10 text-sm font-mono text-accent">
              {protocolPrefix}
            </code>
            <button
              onClick={handleCopyPrefix}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* TXID Input */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">Paste Transaction ID to Verify</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={txIdInput}
              onChange={(e) => setTxIdInput(e.target.value)}
              placeholder="Paste transaction hash here..."
              className="flex-1 px-3 py-2 rounded-lg bg-black/50 border border-white/10 focus:border-accent/50 focus:outline-none transition-colors text-sm font-mono"
            />
            <button
              onClick={handleVerifyTxId}
              disabled={!txIdInput.trim()}
              className="px-4 py-2 rounded-lg bg-accent/20 border border-accent/30 hover:bg-accent/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Verify
            </button>
          </div>
        </div>

        {/* Explorer Link */}
        <div className="pt-2 border-t border-white/5">
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent hover:underline flex items-center gap-2"
          >
            Open Block Explorer
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* Transaction Visualizer */}
      {verifyingTxId && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Transaction Analysis</h4>
            <button
              onClick={handleResetVerification}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Verify Another
            </button>
          </div>
          <TransactionVisualizer
            txId={verifyingTxId}
            protocolPrefix={protocolPrefix}
            network={network}
          />
        </div>
      )}

      {/* Network Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        <span>Verifying on {network === 'chipnet' ? 'Chipnet Testnet' : 'Bitcoin Cash Mainnet'}</span>
      </div>
    </div>
  );
}
