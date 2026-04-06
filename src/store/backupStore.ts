/**
 * Backup Store
 * 
 * Zustand store for managing circuit backups with version history,
 * crash recovery, and import/export functionality.
 * 
 * Round 169: Circuit Persistence Backup System
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// Storage Keys
// ============================================================================

const BACKUP_STORAGE_PREFIX = 'circuit-backup';
const AUTO_SAVE_KEY = `${BACKUP_STORAGE_PREFIX}-auto`;
const BACKUPS_LIST_KEY = `${BACKUP_STORAGE_PREFIX}-list`;

/** Maximum number of backups to store (FIFO when exceeded) */
export const MAX_BACKUP_COUNT = 10;

/** localStorage quota in bytes (approximately 5MB) */
const STORAGE_QUOTA_BYTES = 5 * 1024 * 1024;

/** Warning threshold for storage usage (80% of quota) */
const STORAGE_WARNING_THRESHOLD = 0.8;

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Circuit backup data structure
 */
export interface BackupData {
  /** Unique backup ID */
  id: string;
  /** User-provided name (optional, for named backups) */
  name?: string;
  /** Backup timestamp */
  timestamp: number;
  /** Circuit nodes data (serialized JSON) */
  nodes: string;
  /** Circuit connections data (serialized JSON) */
  connections: string;
  /** Whether this is an auto-save backup */
  isAutoSave: boolean;
  /** Backup size in bytes */
  sizeBytes: number;
}

/**
 * Storage usage information
 */
export interface StorageUsage {
  /** Currently used storage in bytes */
  used: number;
  /** Available storage (quota) in bytes */
  available: number;
  /** Usage percentage (0-1) */
  usagePercent: number;
}

/**
 * Backup store interface
 */
interface BackupStore {
  /** List of all backups (metadata only) */
  backups: BackupData[];
  
  /** Current auto-save data */
  autoSave: BackupData | null;
  
  /** Storage usage information */
  storageUsage: StorageUsage;
  
  /** Whether changes have been made since last save */
  hasUnsavedChanges: boolean;
  
  /** Last backup timestamp */
  lastBackupTime: number;
  
  // Actions
  /** Create a new backup */
  createBackup: (name?: string) => BackupData | null;
  
  /** Restore a specific backup by ID */
  restoreBackup: (backupId: string) => BackupData | null;
  
  /** Delete a specific backup by ID */
  deleteBackup: (backupId: string) => boolean;
  
  /** List all backups */
  listBackups: () => BackupData[];
  
  /** Get auto-save data */
  getAutoSave: () => BackupData | null;
  
  /** Clear auto-save */
  clearAutoSave: () => void;
  
  /** Get storage usage information */
  getStorageUsage: () => StorageUsage;
  
  /** Export backup as JSON string */
  exportBackup: (backupId: string) => string | null;
  
  /** Import backup from JSON string */
  importBackup: (json: string) => BackupData | null;
  
  /** Mark that changes have been made */
  markUnsavedChanges: () => void;
  
  /** Clear unsaved changes flag */
  clearUnsavedChanges: () => void;
  
  /** Prune oldest auto-saves when storage is full */
  pruneAutoSaves: () => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__backup_storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Calculate string size in bytes
 */
function getStringSize(str: string): number {
  return new Blob([str]).size;
}

/**
 * Get total localStorage usage for circuit-related data
 */
function getTotalStorageUsage(): number {
  let total = 0;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(BACKUP_STORAGE_PREFIX)) {
      const value = localStorage.getItem(key);
      if (value) {
        total += getStringSize(key) + getStringSize(value);
      }
    }
  }
  
  return total;
}



/**
 * Save backups list to localStorage
 */
function saveBackupsList(backups: BackupData[]): boolean {
  try {
    localStorage.setItem(BACKUPS_LIST_KEY, JSON.stringify(backups));
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate backup ID
 */
function generateBackupId(): string {
  return `backup-${Date.now()}-${uuidv4()}`;
}

/**
 * Validate backup JSON structure
 */
function validateBackupJson(json: string): { valid: boolean; data?: Partial<BackupData>; error?: string } {
  try {
    const parsed = JSON.parse(json);
    
    // Check required fields
    if (typeof parsed !== 'object' || parsed === null) {
      return { valid: false, error: 'Invalid JSON structure: expected object' };
    }
    
    // Validate basic structure (nodes and connections can be empty arrays)
    if (!('nodes' in parsed) || !('connections' in parsed)) {
      return { valid: false, error: 'Missing required fields: nodes and connections' };
    }
    
    return {
      valid: true,
      data: {
        id: parsed.id || generateBackupId(),
        name: parsed.name || 'Imported Backup',
        timestamp: parsed.timestamp || Date.now(),
        // Handle both string and array formats for nodes/connections
        nodes: typeof parsed.nodes === 'string' ? parsed.nodes : JSON.stringify(parsed.nodes || []),
        connections: typeof parsed.connections === 'string' ? parsed.connections : JSON.stringify(parsed.connections || []),
        isAutoSave: false,
        sizeBytes: getStringSize(json),
      },
    };
  } catch (error) {
    return { valid: false, error: `JSON parse error: ${error}` };
  }
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useBackupStore = create<BackupStore>((set, get) => ({
  // Initial state
  backups: [],
  autoSave: null,
  storageUsage: { used: 0, available: STORAGE_QUOTA_BYTES, usagePercent: 0 },
  hasUnsavedChanges: false,
  lastBackupTime: 0,
  
  /**
   * Create a new backup
   * If no name provided, it's treated as an auto-save
   */
  createBackup: (name?: string) => {
    if (!isLocalStorageAvailable()) {
      console.error('localStorage not available');
      return null;
    }
    
    // Get current circuit state from circuitCanvasStore
    // In a real implementation, this would integrate with the actual store
    // For now, we'll create a backup with placeholder data
    const nodes = '[]';
    const connections = '[]';
    
    const backup: BackupData = {
      id: generateBackupId(),
      name: name,
      timestamp: Date.now(),
      nodes,
      connections,
      isAutoSave: !name,
      sizeBytes: getStringSize(JSON.stringify({ nodes, connections })),
    };
    
    // Check storage quota
    const currentUsage = getTotalStorageUsage();
    const newTotal = currentUsage + backup.sizeBytes;
    
    if (newTotal > STORAGE_QUOTA_BYTES * STORAGE_WARNING_THRESHOLD) {
      // Prune oldest auto-saves before creating new backup
      get().pruneAutoSaves();
    }
    
    // Save backup data to localStorage
    try {
      localStorage.setItem(`${BACKUP_STORAGE_PREFIX}-${backup.id}`, JSON.stringify({
        nodes,
        connections,
        timestamp: backup.timestamp,
      }));
    } catch (error) {
      console.error('Failed to save backup data:', error);
      return null;
    }
    
    if (name) {
      // Named backup - add to backups list
      const currentBackups = get().backups;
      
      // Check for duplicate names
      const existingIndex = currentBackups.findIndex(b => b.name === name && !b.isAutoSave);
      if (existingIndex >= 0) {
        // Update existing backup
      const updatedBackups = [...currentBackups];
      updatedBackups[existingIndex] = backup;
      saveBackupsList(updatedBackups);
      set({ backups: updatedBackups, lastBackupTime: Date.now(), hasUnsavedChanges: false });
        return backup;
      }
      
      // Add new named backup
      const newBackups = [backup, ...currentBackups].slice(0, MAX_BACKUP_COUNT);
      saveBackupsList(newBackups);
      set({ backups: newBackups, lastBackupTime: Date.now(), hasUnsavedChanges: false });
    } else {
      // Auto-save - update auto-save slot
      try {
        localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(backup));
        set({ autoSave: backup, lastBackupTime: Date.now(), hasUnsavedChanges: false });
      } catch (error) {
        console.error('Failed to save auto-save:', error);
      }
    }
    
    // Update storage usage
    set({
      storageUsage: {
        used: getTotalStorageUsage(),
        available: STORAGE_QUOTA_BYTES,
        usagePercent: getTotalStorageUsage() / STORAGE_QUOTA_BYTES,
      },
    });
    
    return backup;
  },
  
  /**
   * Restore a specific backup by ID
   */
  restoreBackup: (backupId: string) => {
    const backups = get().backups;
    const backup = backups.find(b => b.id === backupId);
    
    if (!backup) {
      // Try auto-save
      const autoSave = get().autoSave;
      if (autoSave && autoSave.id === backupId) {
        return autoSave;
      }
      return null;
    }
    
    return backup;
  },
  
  /**
   * Delete a specific backup by ID
   */
  deleteBackup: (backupId: string) => {
    const currentBackups = get().backups;
    const backupIndex = currentBackups.findIndex(b => b.id === backupId);
    
    if (backupIndex < 0) {
      // Check if it's the auto-save
      const autoSave = get().autoSave;
      if (autoSave && autoSave.id === backupId) {
        get().clearAutoSave();
        return true;
      }
      return false;
    }
    
    // Remove backup data from localStorage
    try {
      localStorage.removeItem(`${BACKUP_STORAGE_PREFIX}-${backupId}`);
    } catch {
      // Ignore removal errors
    }
    
    // Update backups list
    const newBackups = currentBackups.filter(b => b.id !== backupId);
    saveBackupsList(newBackups);
    
    // Update storage usage
    set({
      backups: newBackups,
      storageUsage: {
        used: getTotalStorageUsage(),
        available: STORAGE_QUOTA_BYTES,
        usagePercent: getTotalStorageUsage() / STORAGE_QUOTA_BYTES,
      },
    });
    
    return true;
  },
  
  /**
   * List all backups (excluding auto-save)
   */
  listBackups: () => {
    return get().backups.filter(b => !b.isAutoSave);
  },
  
  /**
   * Get auto-save data
   */
  getAutoSave: () => {
    return get().autoSave;
  },
  
  /**
   * Clear auto-save
   */
  clearAutoSave: () => {
    try {
      localStorage.removeItem(AUTO_SAVE_KEY);
    } catch {
      // Ignore removal errors
    }
    set({ autoSave: null });
  },
  
  /**
   * Get storage usage information
   */
  getStorageUsage: () => {
    const used = getTotalStorageUsage();
    return {
      used,
      available: STORAGE_QUOTA_BYTES,
      usagePercent: used / STORAGE_QUOTA_BYTES,
    };
  },
  
  /**
   * Export backup as JSON string
   */
  exportBackup: (backupId: string) => {
    const backups = get().backups;
    const backup = backups.find(b => b.id === backupId);
    
    if (!backup) {
      // Try auto-save
      const autoSave = get().autoSave;
      if (autoSave && autoSave.id === backupId) {
        const exportData = {
          ...autoSave,
          exportedAt: Date.now(),
        };
        return JSON.stringify(exportData, null, 2);
      }
      return null;
    }
    
    const exportData = {
      ...backup,
      exportedAt: Date.now(),
    };
    
    return JSON.stringify(exportData, null, 2);
  },
  
  /**
   * Import backup from JSON string
   */
  importBackup: (json: string) => {
    const validation = validateBackupJson(json);
    
    if (!validation.valid || !validation.data) {
      console.error('Invalid backup JSON:', validation.error);
      return null;
    }
    
    const backup: BackupData = {
      id: validation.data.id!,
      name: validation.data.name || `Imported ${new Date().toLocaleString()}`,
      timestamp: validation.data.timestamp!,
      nodes: validation.data.nodes!,
      connections: validation.data.connections!,
      isAutoSave: false,
      sizeBytes: validation.data.sizeBytes!,
    };
    
    // Save imported backup data
    try {
      localStorage.setItem(`${BACKUP_STORAGE_PREFIX}-${backup.id}`, JSON.stringify({
        nodes: JSON.parse(backup.nodes),
        connections: JSON.parse(backup.connections),
        timestamp: backup.timestamp,
      }));
    } catch (error) {
      console.error('Failed to save imported backup:', error);
      return null;
    }
    
    // Add to backups list
    const currentBackups = get().backups;
    const newBackups = [backup, ...currentBackups].slice(0, MAX_BACKUP_COUNT);
    saveBackupsList(newBackups);
    
    set({ backups: newBackups });
    
    return backup;
  },
  
  /**
   * Mark that changes have been made
   */
  markUnsavedChanges: () => {
    set({ hasUnsavedChanges: true });
  },
  
  /**
   * Clear unsaved changes flag
   */
  clearUnsavedChanges: () => {
    set({ hasUnsavedChanges: false });
  },
  
  /**
   * Prune oldest auto-saves when storage is full
   */
  pruneAutoSaves: () => {
    const currentBackups = get().backups;
    const autoSaves = currentBackups.filter(b => b.isAutoSave);
    
    if (autoSaves.length <= 1) return;
    
    // Remove oldest auto-saves, keeping only the most recent one
    const sortedAutoSaves = [...autoSaves].sort((a, b) => a.timestamp - b.timestamp);
    const toRemove = sortedAutoSaves.slice(0, -1);
    
    for (const backup of toRemove) {
      try {
        localStorage.removeItem(`${BACKUP_STORAGE_PREFIX}-${backup.id}`);
      } catch {
        // Ignore removal errors
      }
    }
    
    // Update backups list
    const newBackups = currentBackups.filter(b => !toRemove.find(r => r.id === b.id));
    saveBackupsList(newBackups);
    set({ backups: newBackups });
  },
}));

// ============================================================================
// Selector Helpers
// ============================================================================

export const selectBackups = (state: BackupStore) => state.backups;
export const selectAutoSave = (state: BackupStore) => state.autoSave;
export const selectHasUnsavedChanges = (state: BackupStore) => state.hasUnsavedChanges;
export const selectStorageUsage = (state: BackupStore) => state.storageUsage;
