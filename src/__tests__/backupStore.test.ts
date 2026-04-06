/**
 * Backup Store Tests
 * 
 * Round 169: Circuit Persistence Backup System
 * 
 * Tests for the backup store functionality including:
 * - Backup creation (manual and auto-save)
 * - Backup restoration
 * - Backup deletion
 * - Storage usage tracking
 * - Import/export functionality
 * - Version history (FIFO limit)
 * - Quota management
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useBackupStore, BackupData, MAX_BACKUP_COUNT, selectBackups, selectAutoSave, selectHasUnsavedChanges, selectStorageUsage } from '../store/backupStore';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((i: number) => Object.keys(store)[i] || null),
    // Helper to set up initial state
    __resetStore: () => {
      store = {};
    },
    __getStore: () => store,
    __setStore: (newStore: Record<string, string>) => {
      store = { ...newStore };
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Helper function to reset store state
function resetStoreState() {
  useBackupStore.setState({
    backups: [],
    autoSave: null,
    storageUsage: { used: 0, available: 5 * 1024 * 1024, usagePercent: 0 },
    hasUnsavedChanges: false,
    lastBackupTime: 0,
  });
}

// Helper to create a mock backup
function createMockBackup(overrides: Partial<BackupData> = {}): BackupData {
  return {
    id: `backup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Test Backup',
    timestamp: Date.now(),
    nodes: '[]',
    connections: '[]',
    isAutoSave: false,
    sizeBytes: 100,
    ...overrides,
  };
}

describe('backupStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.__resetStore();
    resetStoreState();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // Store Initialization Tests
  // =========================================================================
  describe('Store Initialization', () => {
    it('should initialize with empty backups array', () => {
      const state = useBackupStore.getState();
      expect(state.backups).toEqual([]);
    });

    it('should initialize with null autoSave', () => {
      const state = useBackupStore.getState();
      expect(state.autoSave).toBeNull();
    });

    it('should initialize with hasUnsavedChanges as false', () => {
      const state = useBackupStore.getState();
      expect(state.hasUnsavedChanges).toBe(false);
    });

    it('should initialize with lastBackupTime as 0', () => {
      const state = useBackupStore.getState();
      expect(state.lastBackupTime).toBe(0);
    });
  });

  // =========================================================================
  // Backup Creation Tests
  // =========================================================================
  describe('createBackup', () => {
    it('should create a backup with name when provided', () => {
      const backup = useBackupStore.getState().createBackup('My Circuit');
      
      expect(backup).not.toBeNull();
      expect(backup?.name).toBe('My Circuit');
      expect(backup?.isAutoSave).toBe(false);
      expect(backup?.timestamp).toBeDefined();
      expect(backup?.nodes).toBeDefined();
      expect(backup?.connections).toBeDefined();
    });

    it('should create an auto-save when no name is provided', () => {
      const backup = useBackupStore.getState().createBackup();
      
      expect(backup).not.toBeNull();
      expect(backup?.isAutoSave).toBe(true);
      expect(backup?.name).toBeUndefined();
    });

    it('should add named backup to backups array', () => {
      useBackupStore.getState().createBackup('Backup 1');
      useBackupStore.getState().createBackup('Backup 2');
      
      const backups = useBackupStore.getState().backups;
      expect(backups).toHaveLength(2);
      expect(backups[0].name).toBe('Backup 2');
      expect(backups[1].name).toBe('Backup 1');
    });

    it('should update autoSave when creating auto-save', () => {
      useBackupStore.getState().createBackup();
      
      const autoSave = useBackupStore.getState().autoSave;
      expect(autoSave).not.toBeNull();
      expect(autoSave?.isAutoSave).toBe(true);
    });

    it('should update lastBackupTime after creating backup', () => {
      const before = Date.now();
      useBackupStore.getState().createBackup('Test');
      const after = Date.now();
      
      const state = useBackupStore.getState();
      expect(state.lastBackupTime).toBeGreaterThanOrEqual(before);
      expect(state.lastBackupTime).toBeLessThanOrEqual(after);
    });

    it('should generate unique IDs for each backup', () => {
      const backup1 = useBackupStore.getState().createBackup('Backup 1');
      const backup2 = useBackupStore.getState().createBackup('Backup 2');
      
      expect(backup1?.id).not.toBe(backup2?.id);
    });

    it('should not overwrite existing named backup with same name', () => {
      const backup1 = useBackupStore.getState().createBackup('Same Name');
      const backup2 = useBackupStore.getState().createBackup('Same Name');
      
      // Should update existing backup instead of creating duplicate
      const backups = useBackupStore.getState().backups.filter(b => b.name === 'Same Name');
      expect(backups).toHaveLength(1);
      expect(backups[0].id).toBe(backup2?.id);
    });
  });

  // =========================================================================
  // Backup Listing Tests
  // =========================================================================
  describe('listBackups', () => {
    it('should return only named backups (not auto-saves)', () => {
      useBackupStore.getState().createBackup('Named 1');
      useBackupStore.getState().createBackup(); // Auto-save
      useBackupStore.getState().createBackup('Named 2');
      
      const backups = useBackupStore.getState().listBackups();
      expect(backups).toHaveLength(2);
      expect(backups.every(b => !b.isAutoSave)).toBe(true);
    });

    it('should return empty array when no backups exist', () => {
      const backups = useBackupStore.getState().listBackups();
      expect(backups).toEqual([]);
    });

    it('should return backups sorted by timestamp (newest first)', () => {
      useBackupStore.getState().createBackup('First');
      useBackupStore.getState().createBackup('Second');
      useBackupStore.getState().createBackup('Third');
      
      const backups = useBackupStore.getState().listBackups();
      expect(backups[0].name).toBe('Third');
      expect(backups[1].name).toBe('Second');
      expect(backups[2].name).toBe('First');
    });
  });

  // =========================================================================
  // Backup Restoration Tests
  // =========================================================================
  describe('restoreBackup', () => {
    it('should return backup data for valid backup ID', () => {
      const created = useBackupStore.getState().createBackup('Restorable');
      const restored = useBackupStore.getState().restoreBackup(created!.id);
      
      expect(restored).not.toBeNull();
      expect(restored?.id).toBe(created?.id);
      expect(restored?.name).toBe('Restorable');
    });

    it('should return null for invalid backup ID', () => {
      const restored = useBackupStore.getState().restoreBackup('non-existent-id');
      expect(restored).toBeNull();
    });

    it('should return auto-save when restoring with auto-save ID', () => {
      const created = useBackupStore.getState().createBackup(); // Auto-save
      const restored = useBackupStore.getState().restoreBackup(created!.id);
      
      expect(restored).not.toBeNull();
      expect(restored?.isAutoSave).toBe(true);
    });
  });

  // =========================================================================
  // Backup Deletion Tests
  // =========================================================================
  describe('deleteBackup', () => {
    it('should remove backup from backups array', () => {
      const backup = useBackupStore.getState().createBackup('To Delete');
      const deleted = useBackupStore.getState().deleteBackup(backup!.id);
      
      expect(deleted).toBe(true);
      expect(useBackupStore.getState().backups).toHaveLength(0);
    });

    it('should return false for non-existent backup ID', () => {
      const deleted = useBackupStore.getState().deleteBackup('non-existent');
      expect(deleted).toBe(false);
    });

    it('should clear auto-save when deleting auto-save', () => {
      const backup = useBackupStore.getState().createBackup(); // Auto-save
      useBackupStore.getState().deleteBackup(backup!.id);
      
      expect(useBackupStore.getState().autoSave).toBeNull();
    });

    it('should not affect other backups when deleting one', () => {
      useBackupStore.getState().createBackup('Keep 1');
      const toDelete = useBackupStore.getState().createBackup('Delete Me');
      useBackupStore.getState().createBackup('Keep 2');
      
      useBackupStore.getState().deleteBackup(toDelete!.id);
      
      const backups = useBackupStore.getState().listBackups();
      expect(backups).toHaveLength(2);
      expect(backups.map(b => b.name)).toContain('Keep 1');
      expect(backups.map(b => b.name)).toContain('Keep 2');
    });
  });

  // =========================================================================
  // Auto-save Tests
  // =========================================================================
  describe('Auto-save', () => {
    it('should return null getAutoSave when no auto-save exists', () => {
      const autoSave = useBackupStore.getState().getAutoSave();
      expect(autoSave).toBeNull();
    });

    it('should return auto-save data when it exists', () => {
      useBackupStore.getState().createBackup(); // Auto-save
      const autoSave = useBackupStore.getState().getAutoSave();
      
      expect(autoSave).not.toBeNull();
      expect(autoSave?.isAutoSave).toBe(true);
    });

    it('should clear auto-save correctly', () => {
      useBackupStore.getState().createBackup(); // Auto-save
      useBackupStore.getState().clearAutoSave();
      
      expect(useBackupStore.getState().autoSave).toBeNull();
    });

    it('should set hasUnsavedChanges to false after auto-save', () => {
      useBackupStore.getState().markUnsavedChanges();
      expect(useBackupStore.getState().hasUnsavedChanges).toBe(true);
      
      useBackupStore.getState().createBackup(); // Auto-save
      
      expect(useBackupStore.getState().hasUnsavedChanges).toBe(false);
    });
  });

  // =========================================================================
  // Storage Usage Tests
  // =========================================================================
  describe('getStorageUsage', () => {
    it('should return storage usage object', () => {
      const usage = useBackupStore.getState().getStorageUsage();
      
      expect(usage).toHaveProperty('used');
      expect(usage).toHaveProperty('available');
      expect(usage).toHaveProperty('usagePercent');
    });

    it('should have available equal to quota', () => {
      const usage = useBackupStore.getState().getStorageUsage();
      expect(usage.available).toBe(5 * 1024 * 1024);
    });

    it('should track used storage', () => {
      useBackupStore.getState().createBackup('Test');
      const usage = useBackupStore.getState().getStorageUsage();
      
      expect(usage.used).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // Import/Export Tests
  // =========================================================================
  describe('exportBackup', () => {
    it('should return JSON string for valid backup ID', () => {
      const backup = useBackupStore.getState().createBackup('Export Me');
      const json = useBackupStore.getState().exportBackup(backup!.id);
      
      expect(json).not.toBeNull();
      const parsed = JSON.parse(json!);
      expect(parsed.name).toBe('Export Me');
      expect(parsed.exportedAt).toBeDefined();
    });

    it('should return null for non-existent backup ID', () => {
      const json = useBackupStore.getState().exportBackup('non-existent');
      expect(json).toBeNull();
    });

    it('should include nodes and connections in export', () => {
      const backup = useBackupStore.getState().createBackup('With Data');
      const json = useBackupStore.getState().exportBackup(backup!.id);
      
      const parsed = JSON.parse(json!);
      expect(parsed.nodes).toBeDefined();
      expect(parsed.connections).toBeDefined();
    });
  });

  describe('importBackup', () => {
    it('should import valid backup JSON', () => {
      const json = JSON.stringify({
        name: 'Imported Backup',
        nodes: [{ id: 'test' }],
        connections: [],
        timestamp: Date.now(),
      });
      
      const imported = useBackupStore.getState().importBackup(json);
      
      expect(imported).not.toBeNull();
      expect(imported?.name).toBe('Imported Backup');
    });

    it('should return null for invalid JSON', () => {
      const imported = useBackupStore.getState().importBackup('not valid json');
      expect(imported).toBeNull();
    });

    it('should return null for missing required fields', () => {
      const json = JSON.stringify({
        name: 'Incomplete',
        // Missing nodes and connections
      });
      
      const imported = useBackupStore.getState().importBackup(json);
      expect(imported).toBeNull();
    });

    it('should add imported backup to list', () => {
      const json = JSON.stringify({
        name: 'New Import',
        nodes: [],
        connections: [],
      });
      
      useBackupStore.getState().importBackup(json);
      
      const backups = useBackupStore.getState().listBackups();
      expect(backups.some(b => b.name === 'New Import')).toBe(true);
    });

    it('should generate name for import without name field', () => {
      const json = JSON.stringify({
        nodes: [],
        connections: [],
      });
      
      const imported = useBackupStore.getState().importBackup(json);
      
      expect(imported?.name).toContain('Imported');
    });

    it('should handle roundtrip export/import', () => {
      const original = useBackupStore.getState().createBackup('Roundtrip Test');
      const json = useBackupStore.getState().exportBackup(original!.id);
      const imported = useBackupStore.getState().importBackup(json!);
      
      expect(imported?.name).toBe(original?.name);
      // After roundtrip, nodes and connections are re-serialized, so compare parsed values
      // Compare nodes and connections as strings (both are '[]')
      expect(imported?.nodes).toBe(original?.nodes);
      expect(imported?.connections).toBe(original?.connections);
    });
  });

  // =========================================================================
  // Version History / FIFO Tests
  // =========================================================================
  describe('Version History (FIFO)', () => {
    it('should limit backups to MAX_BACKUP_COUNT', () => {
      // Create more backups than the limit
      for (let i = 0; i < MAX_BACKUP_COUNT + 5; i++) {
        useBackupStore.getState().createBackup(`Backup ${i}`);
      }
      
      const backups = useBackupStore.getState().listBackups();
      expect(backups.length).toBeLessThanOrEqual(MAX_BACKUP_COUNT);
    });

    it('should keep newest backups when exceeding limit', () => {
      // Create more backups than the limit
      for (let i = 0; i < MAX_BACKUP_COUNT + 5; i++) {
        useBackupStore.getState().createBackup(`Keep ${i}`);
      }
      
      const backups = useBackupStore.getState().listBackups();
      // Should have Keep 9, Keep 8, etc. (newest first)
      expect(backups[0].name).toBe(`Keep ${MAX_BACKUP_COUNT + 4}`);
    });
  });

  // =========================================================================
  // Unsaved Changes Tracking Tests
  // =========================================================================
  describe('Unsaved Changes', () => {
    it('should track unsaved changes correctly', () => {
      useBackupStore.getState().markUnsavedChanges();
      expect(useBackupStore.getState().hasUnsavedChanges).toBe(true);
    });

    it('should clear unsaved changes flag', () => {
      useBackupStore.getState().markUnsavedChanges();
      useBackupStore.getState().clearUnsavedChanges();
      
      expect(useBackupStore.getState().hasUnsavedChanges).toBe(false);
    });

    it('should auto-clear unsaved changes after auto-save', () => {
      useBackupStore.getState().markUnsavedChanges();
      useBackupStore.getState().createBackup(); // Auto-save
      
      expect(useBackupStore.getState().hasUnsavedChanges).toBe(false);
    });
  });

  // =========================================================================
  // Pruning Tests
  // =========================================================================
  describe('pruneAutoSaves', () => {
    it('should prune oldest auto-saves when called', () => {
      // Create multiple auto-saves
      for (let i = 0; i < 5; i++) {
        useBackupStore.getState().createBackup(); // Auto-save
      }
      
      // Prune should keep only the most recent
      useBackupStore.getState().pruneAutoSaves();
      
      const backups = useBackupStore.getState().backups;
      const autoSaves = backups.filter(b => b.isAutoSave);
      expect(autoSaves.length).toBeLessThanOrEqual(1);
    });

    it('should not prune named backups', () => {
      // Create named backups
      for (let i = 0; i < 5; i++) {
        useBackupStore.getState().createBackup(`Named ${i}`);
      }
      
      useBackupStore.getState().pruneAutoSaves();
      
      const backups = useBackupStore.getState().listBackups();
      expect(backups).toHaveLength(5);
    });
  });

  // =========================================================================
  // Edge Cases
  // =========================================================================
  describe('Edge Cases', () => {
    it('should handle creating backup with empty name', () => {
      const backup = useBackupStore.getState().createBackup('');
      expect(backup).not.toBeNull();
    });

    it('should handle creating backup with whitespace name', () => {
      const backup = useBackupStore.getState().createBackup('   ');
      expect(backup?.name).toBe('   ');
    });

    it('should handle very long backup name', () => {
      const longName = 'A'.repeat(1000);
      const backup = useBackupStore.getState().createBackup(longName);
      expect(backup?.name).toBe(longName);
    });

    it('should handle rapid backup creation', () => {
      const promises: Promise<BackupData | null>[] = [];
      for (let i = 0; i < 10; i++) {
        promises.push(Promise.resolve(useBackupStore.getState().createBackup(`Rapid ${i}`)));
      }
      
      // All should succeed
      const results = Promise.all(promises);
      expect(results).resolves.not.toBeNull();
    });
  });

  // =========================================================================
  // Selector Tests
  // =========================================================================
  describe('Selectors', () => {
    it('should export selectBackups selector', () => {
      expect(typeof selectBackups).toBe('function');
    });

    it('should export selectAutoSave selector', () => {
      expect(typeof selectAutoSave).toBe('function');
    });

    it('should export selectHasUnsavedChanges selector', () => {
      expect(typeof selectHasUnsavedChanges).toBe('function');
    });

    it('should export selectStorageUsage selector', () => {
      expect(typeof selectStorageUsage).toBe('function');
    });

    it('should selectBackups return correct state', () => {
      useBackupStore.getState().createBackup('Selector Test');
      const result = selectBackups(useBackupStore.getState());
      expect(result.some(b => b.name === 'Selector Test')).toBe(true);
    });

    it('should selectAutoSave return correct state', () => {
      useBackupStore.getState().createBackup();
      const result = selectAutoSave(useBackupStore.getState());
      expect(result?.isAutoSave).toBe(true);
    });

    it('should selectHasUnsavedChanges return correct state', () => {
      useBackupStore.getState().markUnsavedChanges();
      const result = selectHasUnsavedChanges(useBackupStore.getState());
      expect(result).toBe(true);
    });

    it('should selectStorageUsage return correct state', () => {
      const result = selectStorageUsage(useBackupStore.getState());
      expect(result).toHaveProperty('used');
      expect(result).toHaveProperty('available');
      expect(result).toHaveProperty('usagePercent');
    });
  });
});
