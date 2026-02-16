/**
 * TransactionBuilder Component
 *
 * Builds and broadcasts transactions using CashScript SDK
 * Ensures OP_RETURN with 464c4f5701 prefix
 */

'use client';

import { useState } from 'react';
import type { BlinchAction } from '../types/action';

interface TransactionBuilderProps {
  action: BlinchAction;
}

export default function TransactionBuilder({ action }: TransactionBuilderProps) {
  const [isBuilding, setIsBuilding] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBuildAndBroadcast = async () => {
    setIsBuilding(true);
    setError(null);
    setTxId(null);

    try {
      // TODO: Integrate with CashScript SDK
      // Steps:
      // 1. Get contract address from action
      // 2. Build transaction with OP_RETURN
      // 3. Sign transaction
      // 4. Broadcast to Chipnet

      console.log('Building transaction for action:', action.title);

      // Simulate building
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsBuilding(false);
      setIsBroadcasting(true);

      // Simulate broadcasting
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock transaction ID
      const mockTxId = '0x' + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2);
      setTxId(mockTxId);
      setIsBroadcasting(false);
    } catch (err) {
      console.error('Transaction error:', err);
      setError(err instanceof Error ? err.message : 'Failed to build transaction');
      setIsBuilding(false);
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="p-6 rounded-xl glass space-y-4">
      <h3 className="text-xl font-semibold">Build Transaction</h3>

      <p className="text-sm text-gray-400">
        This will build a transaction with the mandatory OP_RETURN output containing the Blinch
        protocol prefix <code className="text-accent">464c4f5701</code>.
      </p>

      <button
        onClick={handleBuildAndBroadcast}
        disabled={isBuilding || isBroadcasting || txId !== null}
        className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-accent to-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
      >
        {isBuilding ? (
          'Building Transaction...'
        ) : isBroadcasting ? (
          'Broadcasting...'
        ) : txId ? (
          'Transaction Broadcasted!'
        ) : (
          'Build & Broadcast'
        )}
      </button>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {txId && (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
          <p className="text-green-400 text-sm mb-2">✓ Transaction broadcasted successfully!</p>
          <p className="text-xs text-gray-400 font-mono break-all">{txId}</p>
          <a
            href={`https://chipnet.net/api/tx/${txId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent text-sm hover:underline"
          >
            View on Block Explorer →
          </a>
        </div>
      )}
    </div>
  );
}
