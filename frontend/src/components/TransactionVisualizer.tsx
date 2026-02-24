/**
 * TransactionVisualizer Component
 *
 * Fetches and displays transaction data from the blockchain
 * Highlights OP_RETURN output and protocol compliance
 */

'use client';

import { useState, useEffect } from 'react';
import {
  fetchTransaction,
  findOpReturnOutput,
  parseOpReturn,
  containsBlinchPrefix,
  formatProtocolPrefix,
} from '@/lib/blockchain';

interface TransactionVisualizerProps {
  txId: string;
  protocolPrefix: string;
  network?: 'chipnet' | 'mainnet';
}

type VerificationStatus = 'loading' | 'valid' | 'invalid' | 'error';

export default function TransactionVisualizer({
  txId,
  protocolPrefix,
  network = 'chipnet',
}: TransactionVisualizerProps) {
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [txData, setTxData] = useState<any>(null);
  const [opReturnData, setOpReturnData] = useState<any>(null);
  const [prefixInfo, setPrefixInfo] = useState<any>(null);

  useEffect(() => {
    async function verifyTransaction() {
      setStatus('loading');

      try {
        const tx = await fetchTransaction(txId, network);

        if (!tx) {
          setStatus('error');
          return;
        }

        setTxData(tx);

        const opReturn = findOpReturnOutput(tx);
        if (!opReturn) {
          setStatus('invalid');
          return;
        }

        const parsed = parseOpReturn(opReturn.script.asm);
        setOpReturnData(parsed);

        const hasPrefix = containsBlinchPrefix(parsed.data, protocolPrefix);
        setStatus(hasPrefix ? 'valid' : 'invalid');

        const formatted = formatProtocolPrefix(protocolPrefix);
        setPrefixInfo(formatted);
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
      }
    }

    verifyTransaction();
  }, [txId, protocolPrefix, network]);

  const explorerUrl =
    network === 'chipnet'
      ? `https://chipnet.bitcoinexplorer.org/tx/${txId}`
      : `https://blockchair.com/bitcoin-cash/transaction/${txId}`;

  if (status === 'loading') {
    return (
      <div className="p-6 rounded-xl glass border border-accent/30">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400">Fetching transaction from blockchain...</span>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-6 rounded-xl glass border border-red-500/30 bg-red-500/5">
        <div className="flex items-center gap-3 text-red-400">
          <span className="text-2xl">⚠️</span>
          <div>
            <h4 className="font-semibold">Transaction Not Found</h4>
            <p className="text-sm text-gray-400 mt-1">
              Unable to fetch transaction. It may not be broadcast yet or the TXID is incorrect.
            </p>
          </div>
        </div>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-sm text-accent hover:underline"
        >
          View on Explorer
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    );
  }

  return (
    <div
      className={`p-6 rounded-xl glass border ${
        status === 'valid' ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'
      }`}
    >
      {/* Status Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/10">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
          status === 'valid' ? 'bg-green-500/20' : 'bg-red-500/20'
        }`}>
          {status === 'valid' ? '✅' : '❌'}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">
            {status === 'valid' ? 'Protocol Verified' : 'Protocol Violation'}
          </h3>
          <p className="text-xs text-gray-400">
            {status === 'valid'
              ? 'Transaction includes valid Blinch protocol identifier'
              : 'Transaction missing required OP_RETURN prefix'}
          </p>
        </div>
      </div>

      {/* Transaction Details */}
      {txData && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Transaction ID</span>
              <div className="font-mono text-xs text-accent truncate">{txId}</div>
            </div>
            <div>
              <span className="text-gray-500">Confirmations</span>
              <div className="font-medium">
                {txData.confirmations !== undefined ? txData.confirmations : 'Pending'}
              </div>
            </div>
          </div>

          {/* OP_RETURN Output */}
          {opReturnData && (
            <div className={`p-4 rounded-lg ${
              status === 'valid' ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
            }`}>
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <span className="text-accent">📜</span>
                OP_RETURN Output
              </h4>

              {/* Raw Data */}
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-500">Script ASM</span>
                  <code className="block mt-1 px-3 py-2 rounded bg-black/30 text-xs font-mono text-gray-300 break-all">
                    {opReturnData.raw}
                  </code>
                </div>

                {/* Parsed Data */}
                {opReturnData.data.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-500">Parsed Data</span>
                    <div className="mt-1 space-y-1">
                      {opReturnData.data.map((data: string, idx: number) => (
                        <div
                          key={idx}
                          className={`px-3 py-1 rounded text-xs font-mono ${
                            data.toLowerCase().includes(protocolPrefix.toLowerCase()) ||
                            data.includes('FLOW')
                              ? 'bg-accent/20 text-accent border border-accent/30'
                              : 'bg-black/30 text-gray-400'
                          }`}
                        >
                          {data}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Protocol Prefix Breakdown */}
          {prefixInfo && status === 'valid' && (
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
              <h4 className="font-medium text-sm mb-3">🔐 Protocol Identifier</h4>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Hex (Raw)</span>
                  <code className="text-accent">{prefixInfo.hex}</code>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">ASCII (Decoded)</span>
                  <code className="text-accent">"{prefixInfo.ascii}"</code>
                </div>

                {/* Byte Breakdown */}
                <div className="mt-3 pt-3 border-t border-white/10">
                  <span className="text-xs text-gray-500">Byte Breakdown</span>
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {prefixInfo.bytes.map((byte: any, idx: number) => (
                      <div
                        key={idx}
                        className="px-2 py-1 rounded bg-black/30 border border-white/10 text-xs"
                      >
                        <span className="text-gray-500">{byte.byte}</span>
                        <span className="ml-1 text-accent">{byte.char}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Explorer Link */}
      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-2 text-sm text-accent hover:underline"
      >
        View Full Transaction on Explorer
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  );
}
