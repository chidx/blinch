/**
 * Dashboard page - Manage user's created actions
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { ActionList } from '@/components/dashboard/ActionList';
import { getAllActions, saveAction } from '@/lib/storage';
import type { StoredAction } from '@/lib/storage';

export default function DashboardPage() {
  const router = useRouter();
  const [actions, setActions] = useState<StoredAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadActions = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load from localStorage first (fast load)
      const localActions = getAllActions();

      // Try to fetch from backend if we have a creator address
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

      // For now, just use localStorage
      // Backend integration for fetching by creator will be added when authentication is implemented
      setActions(localActions);
    } catch (err) {
      console.error('Failed to load actions:', err);
      setError('Failed to load actions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActions();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
              <p className="text-gray-400 mt-1">
                {actions.length} {actions.length === 1 ? 'action' : 'actions'} created
              </p>
            </div>
            <button
              onClick={() => router.push('/create')}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Action
            </button>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="glass rounded-xl p-12 text-center">
              <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading your actions...</p>
            </div>
          ) : (
            /* Action List */
            <ActionList actions={actions} onUpdate={loadActions} />
          )}

          {/* Stats */}
          {!loading && actions.length > 0 && (
            <div className="mt-8 grid md:grid-cols-3 gap-4">
              <div className="glass rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Actions</p>
                <p className="text-2xl font-bold">{actions.length}</p>
              </div>
              <div className="glass rounded-lg p-4">
                <p className="text-sm text-gray-500">With Parameters</p>
                <p className="text-2xl font-bold">
                  {actions.filter((a) => a.parameters.length > 0).length}
                </p>
              </div>
              <div className="glass rounded-lg p-4">
                <p className="text-sm text-gray-500">Custom Types</p>
                <p className="text-2xl font-bold">
                  {actions.filter((a) => a.actionType).length}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
