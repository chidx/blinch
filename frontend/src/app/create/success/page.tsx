/**
 * Success page - Display after action creation
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { getActionById } from '@/lib/storage';
import type { StoredAction } from '@/lib/storage';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const actionId = searchParams.get('id');
  const [action, setAction] = useState<StoredAction | null>(null);
  const [copied, setCopied] = useState<'url' | 'id' | null>(null);

  useEffect(() => {
    if (actionId) {
      const loadedAction = getActionById(actionId);
      setAction(loadedAction);
    }
  }, [actionId]);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  if (!action) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
        <Navigation />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Action not found</h1>
            <button
              onClick={() => router.push('/create')}
              className="px-6 py-2.5 rounded-lg bg-primary hover:opacity-90 transition-opacity"
            >
              Create New Action
            </button>
          </div>
        </main>
      </div>
    );
  }

  const actionUrl = typeof window !== 'undefined' ? `${window.location.origin}/action/${action.id}` : '';
  const prefix = action.recipientAddress.includes(':') ? '' : 'bitcoincash:';
  const bchUri = `${prefix}${action.recipientAddress}?amount=${action.amount || '0'}&op_return=464c4f5701${action.actionType || ''}`;

  const handleCopy = (type: 'url' | 'id', value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(type);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      <Navigation />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2 gradient-text">Action Created!</h1>
            <p className="text-gray-400">Your Blinch action is ready to share</p>
          </div>

          {/* Action Preview */}
          <div className="glass-strong rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <img
                src={action.iconUrl || '/icon-lg.png'}
                alt={action.title}
                className="w-16 h-16 rounded-lg"
              />
              <div className="flex-1">
                <h2 className="text-xl font-bold">{action.title}</h2>
                <p className="text-gray-400">{action.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                {action.amount || '0'} BCH
              </span>
              {action.actionType && (
                <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-medium">
                  {action.actionType}
                </span>
              )}
            </div>
          </div>

          {/* Share Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Share Your Action</h3>

            {/* Action URL */}
            <div className="glass rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Action Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={actionUrl}
                  className="flex-1 px-4 py-2 rounded bg-black/30 border border-white/10 font-mono text-sm"
                />
                <button
                  onClick={() => handleCopy('url', actionUrl)}
                  className="px-4 py-2 rounded bg-primary hover:opacity-90 transition-opacity font-medium whitespace-nowrap"
                >
                  {copied === 'url' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Action ID */}
            <div className="glass rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Action ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={action.id}
                  className="flex-1 px-4 py-2 rounded bg-black/30 border border-white/10 font-mono text-sm"
                />
                <button
                  onClick={() => handleCopy('id', action.id)}
                  className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 transition-opacity font-medium whitespace-nowrap"
                >
                  {copied === 'id' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* BCH URI */}
            <details className="glass rounded-lg p-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-300">
                Bitcoin Cash URI (for wallets)
              </summary>
              <div className="mt-3">
                <textarea
                  readOnly
                  value={bchUri}
                  rows={3}
                  className="w-full px-4 py-2 rounded bg-black/30 border border-white/10 font-mono text-sm resize-none"
                />
              </div>
            </details>

            {/* Embed Code */}
            <details className="glass rounded-lg p-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-300">
                Embed Code (for websites)
              </summary>
              <div className="mt-3">
                <textarea
                  readOnly
                  value={`<iframe src="${actionUrl}" width="400" height="300" frameborder="0"></iframe>`}
                  rows={3}
                  className="w-full px-4 py-2 rounded bg-black/30 border border-white/10 font-mono text-sm resize-none"
                />
              </div>
            </details>
          </div>

          {/* QR Code Placeholder */}
          <div className="mt-6 glass rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-300 mb-4 text-center">
              QR Code (coming soon)
            </h3>
            <div className="w-48 h-48 mx-auto bg-white/5 rounded-lg flex items-center justify-center">
              <p className="text-sm text-gray-500">QR Code</p>
            </div>
            <p className="text-xs text-gray-500 text-center mt-4">
              Scan with any Bitcoin Cash wallet to execute this action
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => router.push(actionUrl)}
              className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r glass cursor-pointer from-primary to-secondary hover:opacity-90 transition-opacity font-medium"
            >
              View Action
            </button>
            <button
              onClick={() => router.push('/create')}
              className="flex-1 px-6 py-3 rounded-lg glass cursor-pointer hover:bg-white/5 transition-colors font-medium"
            >
              Create Another
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CreateSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
        <Navigation />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-pulse">Loading...</div>
          </div>
        </main>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
