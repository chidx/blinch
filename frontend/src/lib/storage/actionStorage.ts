/**
 * Action storage utilities for managing user-created actions
 * Uses localStorage for client-side persistence
 */

import type { BlinchAction } from '../../types/action';
import { getFromLocalStorage, setToLocalStorage, removeFromLocalStorage, STORAGE_KEYS } from './localStorage';

/**
 * Minimal action model for storage
 */
export interface StoredAction {
  id: string;
  title: string;
  description: string;
  recipientAddress: string;
  amount?: string;
  iconUrl?: string;
  actionType?: string;
  parameters?: any[];
  creatorAddress?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create action request (matches backend API)
 */
export interface CreateActionRequest {
  title: string;
  description: string;
  recipientAddress: string;
  amount?: string;
  iconUrl?: string;
  actionType?: string;
  parameters?: any[];
  creatorAddress?: string;
}

/**
 * Get all actions from localStorage
 */
export function getAllActions(): StoredAction[] {
  return getFromLocalStorage<StoredAction[]>(STORAGE_KEYS.USER_ACTIONS, []);
}

/**
 * Get a single action by ID
 */
export function getActionById(id: string): StoredAction | null {
  const actions = getAllActions();
  return actions.find((action) => action.id === id) || null;
}

/**
 * Save a new action to localStorage
 */
export function saveAction(action: StoredAction): boolean {
  const actions = getAllActions();

  // Check if action with same ID already exists
  const existingIndex = actions.findIndex((a) => a.id === action.id);

  if (existingIndex >= 0) {
    // Update existing action
    actions[existingIndex] = action;
  } else {
    // Add new action
    actions.push(action);
  }

  return setToLocalStorage(STORAGE_KEYS.USER_ACTIONS, actions);
}

/**
 * Delete an action from localStorage
 */
export function deleteAction(id: string): boolean {
  const actions = getAllActions();
  const filtered = actions.filter((action) => action.id !== id);

  if (filtered.length === actions.length) {
    // Action not found
    return false;
  }

  return setToLocalStorage(STORAGE_KEYS.USER_ACTIONS, filtered);
}

/**
 * Create a new action from request
 */
export function createActionFromRequest(
  request: CreateActionRequest,
  id: string
): StoredAction {
  const now = new Date().toISOString();

  return {
    id,
    title: request.title,
    description: request.description,
    recipientAddress: request.recipientAddress,
    amount: request.amount,
    iconUrl: request.iconUrl,
    actionType: request.actionType,
    parameters: request.parameters,
    creatorAddress: request.creatorAddress,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Update an existing action
 */
export function updateAction(id: string, updates: Partial<StoredAction>): boolean {
  const actions = getAllActions();
  const index = actions.findIndex((action) => action.id === id);

  if (index < 0) {
    return false;
  }

  actions[index] = {
    ...actions[index],
    ...updates,
    id, // Preserve ID
    createdAt: actions[index].createdAt, // Preserve creation time
    updatedAt: new Date().toISOString(),
  };

  return setToLocalStorage(STORAGE_KEYS.USER_ACTIONS, actions);
}

/**
 * Get actions by creator address
 */
export function getActionsByCreator(creatorAddress: string): StoredAction[] {
  const actions = getAllActions();
  return actions.filter((action) => action.creatorAddress === creatorAddress);
}

/**
 * Search actions by title or description
 */
export function searchActions(query: string): StoredAction[] {
  const actions = getAllActions();
  const lowerQuery = query.toLowerCase();

  return actions.filter(
    (action) =>
      action.title.toLowerCase().includes(lowerQuery) ||
      action.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Clear all actions from localStorage
 */
export function clearAllActions(): boolean {
  return removeFromLocalStorage(STORAGE_KEYS.USER_ACTIONS);
}

/**
 * Get action count
 */
export function getActionCount(): number {
  return getAllActions().length;
}
