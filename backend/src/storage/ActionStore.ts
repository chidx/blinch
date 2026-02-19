/**
 * Action Storage Layer
 * Provides in-memory caching with file-based persistence for Blinch actions
 */

import { mkdir, writeFile, readFile, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { nanoid } from 'nanoid';
import type { ActionModel, BlinchActionSchema } from '../types/action.js';

const STORAGE_DIR = process.env.STORAGE_DIR || './data/actions';
const ACTIONS_FILE = join(STORAGE_DIR, 'actions.json');
const BACKUP_DIR = join(STORAGE_DIR, 'backups');

/**
 * Storage result type
 */
export interface StorageResult<T = void> {
  success: boolean;
  data?: T;
  error?: Error;
}

/**
 * ActionStore class for managing action persistence
 */
export class ActionStore {
  private memoryCache: Map<string, ActionModel> = new Map();
  private initialized: boolean = false;

  /**
   * Initialize the store (create directories, load existing data)
   */
  async initialize(): Promise<StorageResult> {
    try {
      // Create storage directory if it doesn't exist
      if (!existsSync(STORAGE_DIR)) {
        await mkdir(STORAGE_DIR, { recursive: true });
        await mkdir(BACKUP_DIR, { recursive: true });
      }

      // Load existing actions from file
      await this.loadFromFile();

      this.initialized = true;
      return { success: true };
    } catch (error) {
      console.error('Failed to initialize ActionStore:', error);
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Get an action by ID
   */
  get(id: string): ActionModel | null {
    return this.memoryCache.get(id) || null;
  }

  /**
   * Get all actions
   */
  getAll(): ActionModel[] {
    return Array.from(this.memoryCache.values());
  }

  /**
   * Get actions by creator address
   */
  getByCreator(creatorAddress: string): ActionModel[] {
    return this.getAll().filter(
      (action) => (action as any).creatorAddress === creatorAddress
    );
  }

  /**
   * Check if an action exists
   */
  has(id: string): boolean {
    return this.memoryCache.has(id);
  }

  /**
   * Create a new action
   */
  async create(
    schema: BlinchActionSchema,
    creatorAddress?: string
  ): Promise<StorageResult<ActionModel>> {
    try {
      // Generate unique ID
      const id = nanoid(10);

      // Create action model with timestamps
      const actionModel: ActionModel = {
        ...schema,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add creator address if provided
      if (creatorAddress) {
        (actionModel as any).creatorAddress = creatorAddress;
      }

      // Store in memory cache
      this.memoryCache.set(id, actionModel);

      // Persist to file
      await this.saveToFile();

      return {
        success: true,
        data: actionModel,
      };
    } catch (error) {
      console.error('Failed to create action:', error);
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Update an existing action
   */
  async update(
    id: string,
    updates: Partial<BlinchActionSchema>,
    creatorAddress?: string
  ): Promise<StorageResult<ActionModel>> {
    try {
      const existing = this.memoryCache.get(id);

      if (!existing) {
        return {
          success: false,
          error: new Error(`Action not found: ${id}`),
        };
      }

      // Verify ownership if the action has a creator address
      const actionCreatorAddress = (existing as any).creatorAddress;
      if (actionCreatorAddress && actionCreatorAddress !== creatorAddress) {
        return {
          success: false,
          error: new Error('Permission denied: not the creator'),
        };
      }

      // Update action
      const updated: ActionModel = {
        ...existing,
        ...updates,
        id, // Preserve ID
        createdAt: existing.createdAt, // Preserve creation time
        updatedAt: new Date(),
      };

      this.memoryCache.set(id, updated);
      await this.saveToFile();

      return {
        success: true,
        data: updated,
      };
    } catch (error) {
      console.error('Failed to update action:', error);
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Delete an action
   */
  async delete(
    id: string,
    creatorAddress?: string
  ): Promise<StorageResult> {
    try {
      const existing = this.memoryCache.get(id);

      if (!existing) {
        return {
          success: false,
          error: new Error(`Action not found: ${id}`),
        };
      }

      // Verify ownership if the action has a creator address
      const actionCreatorAddress = (existing as any).creatorAddress;
      if (actionCreatorAddress && actionCreatorAddress !== creatorAddress) {
        return {
          success: false,
          error: new Error('Permission denied: not the creator'),
        };
      }

      // Create backup before deletion
      await this.createBackup(id, existing);

      // Delete from memory
      this.memoryCache.delete(id);

      // Persist changes
      await this.saveToFile();

      return { success: true };
    } catch (error) {
      console.error('Failed to delete action:', error);
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Save all actions to file
   */
  private async saveToFile(): Promise<void> {
    const actions = Array.from(this.memoryCache.entries());
    const data = JSON.stringify(actions, null, 2);

    await writeFile(ACTIONS_FILE, data, 'utf-8');
  }

  /**
   * Load actions from file
   */
  private async loadFromFile(): Promise<void> {
    if (!existsSync(ACTIONS_FILE)) {
      // Initialize with empty array
      await writeFile(ACTIONS_FILE, '[]', 'utf-8');
      return;
    }

    const content = await readFile(ACTIONS_FILE, 'utf-8');
    const actions: [string, any][] = JSON.parse(content);

    // Load into memory cache
    this.memoryCache.clear();
    for (const [id, data] of actions) {
      // Convert date strings back to Date objects
      const actionModel: ActionModel = {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
      this.memoryCache.set(id, actionModel);
    }
  }

  /**
   * Create a backup before deletion
   */
  private async createBackup(id: string, action: ActionModel): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = join(BACKUP_DIR, `${id}_${timestamp}.json`);

    await writeFile(backupFile, JSON.stringify(action, null, 2), 'utf-8');
  }

  /**
   * Get statistics about the store
   */
  getStats() {
    return {
      totalActions: this.memoryCache.size,
      initialized: this.initialized,
      storageDir: STORAGE_DIR,
    };
  }
}

/**
 * Singleton instance
 */
let storeInstance: ActionStore | null = null;

/**
 * Get or create the singleton ActionStore instance
 */
export function getActionStore(): ActionStore {
  if (!storeInstance) {
    storeInstance = new ActionStore();
  }
  return storeInstance;
}

/**
 * Initialize the store (call this on app startup)
 */
export async function initializeActionStore(): Promise<ActionStore> {
  const store = getActionStore();
  await store.initialize();
  return store;
}
