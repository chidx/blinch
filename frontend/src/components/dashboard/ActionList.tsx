/**
 * Dashboard action list component
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { StoredAction } from '@/lib/storage';
import { deleteAction } from '@/lib/storage';

interface ActionListProps {
  actions: StoredAction[];
  onUpdate: () => void;
}

export function ActionList({ actions, onUpdate }: ActionListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredActions = actions.filter(
    (action) =>
      action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string, action: StoredAction) => {
    if (!confirm('Are you sure you want to delete this action?')) {
      return;
    }

    setDeletingId(id);
    try {
      // Try to delete from backend first if action has a creator address
      if (action.creatorAddress) {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        const response = await fetch(`${backendUrl}/api/action/${id}?creator=${action.creatorAddress}`, {
          method: 'DELETE',
        });

        if (!response.ok && response.status !== 404) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to delete from server');
        }
      }

      // Delete from localStorage
      const success = deleteAction(id);
      if (success) {
        onUpdate();
      } else {
        alert('Failed to delete action from local storage');
      }
    } catch (error) {
      console.error('Error deleting action:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete action';
      alert(`Error: ${errorMessage}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleShare = (action: StoredAction) => {
    const url = `${window.location.origin}/action/${action.id}`;
    navigator.clipboard.writeText(url);
    alert('Action link copied to clipboard!');
  };

  if (actions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 rounded-full bg-white/5 mx-auto mb-4 flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">No actions yet</h3>
        <p className="text-gray-400 mb-6">Create your first Blinch action to get started</p>
        <button
          onClick={() => router.push('/create')}
          className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity font-medium"
        >
          Create Action
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="glass rounded-lg p-4">
        <input
          type="text"
          placeholder="Search actions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 rounded bg-white/5 border border-white/10 focus:border-primary focus:outline-none"
        />
      </div>

      {/* Actions Grid */}
      {filteredActions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No actions match your search
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredActions.map((action) => (
            <div
              key={action.id}
              className="glass rounded-xl p-5 hover:border-primary/30 transition-all group"
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={action.iconUrl || 'https://blinch.network/assets/icon.png'}
                  alt={action.title}
                  className="w-12 h-12 rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{action.title}</h4>
                  <p className="text-sm text-gray-400 line-clamp-2">{action.description}</p>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-medium">
                  {action.amount || '0'} BCH
                </span>
                {action.actionType && (
                  <span className="px-2 py-0.5 rounded bg-accent/20 text-accent text-xs">
                    {action.actionType}
                  </span>
                )}
                {action.parameters && action.parameters.length > 0 && (
                  <span className="px-2 py-0.5 rounded bg-white/10 text-gray-400 text-xs">
                    {action.parameters.length} params
                  </span>
                )}
              </div>

              {/* Recipient */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Recipient</p>
                <p className="text-sm font-mono text-accent truncate">
                  {action.recipientAddress}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push(`/action/${action.id}`)}
                  className="flex-1 px-3 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary text-sm font-medium transition-colors"
                >
                  View
                </button>
                <button
                  onClick={() => handleShare(action)}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
                  title="Share"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(action.id, action)}
                  disabled={deletingId === action.id}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  {deletingId === action.id ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Date */}
              <p className="text-xs text-gray-500 mt-3">
                Created {new Date(action.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
