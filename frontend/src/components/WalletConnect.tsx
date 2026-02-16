/**
 * WalletConnect Component
 *
 * Handles wallet connection and signing for Bitcoin Cash
 * This is a placeholder for full wallet integration
 */

'use client';

import { useState } from 'react';

interface WalletConnectProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

export default function WalletConnect({ onConnect, onDisconnect }: WalletConnectProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);

    try {
      // TODO: Integrate with actual BCH wallet (e.g., Bitcoin.com Wallet, BCH Wallet)
      // For now, this is a placeholder

      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock address
      const mockAddress = 'bitcoincash:qzp2wq8l9r5h6l7x8z9c0b1n2m3k4j5k6l7z8c9b0n1';
      setAddress(mockAddress);
      setIsConnected(true);

      onConnect?.(mockAddress);
    } catch (error) {
      console.error('Connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setAddress(null);
    setIsConnected(false);
    onDisconnect?.();
  };

  return (
    <div className="flex items-center gap-3">
      {isConnected ? (
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-lg glass text-sm">
            <span className="text-gray-400">Connected: </span>
            <span className="font-mono text-accent">
              {address?.substring(0, 10)}...{address?.substring(-6)}
            </span>
          </div>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-colors text-sm"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 disabled:opacity-50 transition-opacity text-sm font-medium"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
}
