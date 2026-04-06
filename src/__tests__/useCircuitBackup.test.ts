/**
 * useCircuitBackup Hook Tests
 * 
 * Round 169: Circuit Persistence Backup System
 * 
 * Tests for the circuit backup hook including:
 * - Auto-save functionality
 * - Crash recovery detection
 * - Manual backup creation
 * - Change tracking
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { useCircuitBackup, useRecoveryCheck, useCircuitChangeTracker } from '../hooks/useCircuitBackup';
import { useBackupStore } from '../store/backupStore';

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

// Mock beforeunload event listener
const mockBeforeUnload = vi.fn();
vi.stubGlobal('addEventListener', vi.fn((event: string, handler: EventListener) => {
  if (event === 'beforeunload') {
    mockBeforeUnload.mockImplementation(handler as EventListener);
  }
}));

vi.stubGlobal('removeEventListener', vi.fn());

describe('useCircuitBackup Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.__resetStore();
    resetStoreState();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // =========================================================================
  // Hook Initialization Tests
  // =========================================================================
  describe('Hook Initialization', () => {
    it('should initialize without errors', async () => {
      const { result } = renderHook(() => useCircuitBackup());
      
      await act(async () => {
        // Wait for hook to initialize
      });
      
      expect(result.current).toBeDefined();
    });

    it('should return all required methods', async () => {
      const { result } = renderHook(() => useCircuitBackup());
      
      expect(typeof result.current.createManualBackup).toBe('function');
      expect(typeof result.current.getAutoSaveBackup).toBe('function');
      expect(typeof result.current.hasUnsavedChanges).toBe('function');
      expect(typeof result.current.hasUnsavedChanges()).toBe('boolean');
      expect(typeof result.current.clearUnsavedChanges).toBe('function');
      expect(typeof result.current.triggerAutoSave).toBe('function');
      expect(typeof result.current.dismissRecovery).toBe('function');
      expect(typeof result.current.restoreFromAutoSave).toBe('function');
    });

    it('should accept custom options', async () => {
      const onBackupCreated = vi.fn();
      const onRecoveryNeeded = vi.fn();
      
      const { result } = renderHook(() => 
        useCircuitBackup({
          autoSaveInterval: 60000,
          enabled: true,
          onBackupCreated,
          onRecoveryNeeded,
        })
      );
      
      expect(result.current).toBeDefined();
    });
  });

  // =========================================================================
  // Manual Backup Tests
  // =========================================================================
  describe('createManualBackup', () => {
    it('should create a named backup', async () => {
      const { result } = renderHook(() => useCircuitBackup());
      
      await act(async () => {
        const backupId = result.current.createManualBackup('Test Backup');
        expect(backupId).not.toBeNull();
      });
      
      const backups = useBackupStore.getState().listBackups();
      expect(backups.some(b => b.name === 'Test Backup')).toBe(true);
    });

    it('should create an unnamed backup when name is not provided', async () => {
      const { result } = renderHook(() => useCircuitBackup());
      
      await act(async () => {
        const backupId = result.current.createManualBackup();
        expect(backupId).not.toBeNull();
      });
    });

    it('should call onBackupCreated callback when provided', async () => {
      const onBackupCreated = vi.fn();
      
      const { result } = renderHook(() => 
        useCircuitBackup({ onBackupCreated })
      );
      
      await act(async () => {
        result.current.createManualBackup('Callback Test');
      });
      
      expect(onBackupCreated).toHaveBeenCalled();
    });

    it('should not throw with undefined callback', async () => {
      const { result } = renderHook(() => 
        useCircuitBackup({ onBackupCreated: undefined })
      );
      
      await act(async () => {
        expect(() => result.current.createManualBackup('No Callback')).not.toThrow();
      });
    });
  });

  // =========================================================================
  // Auto-save Backup Tests
  // =========================================================================
  describe('getAutoSaveBackup', () => {
    it('should return null when no auto-save exists', async () => {
      const { result } = renderHook(() => useCircuitBackup());
      
      await act(async () => {
        const autoSave = result.current.getAutoSaveBackup();
        expect(autoSave).toBeNull();
      });
    });

    it('should return auto-save data when it exists', async () => {
      // First create an auto-save
      useBackupStore.getState().createBackup();
      
      const { result } = renderHook(() => useCircuitBackup());
      
      await act(async () => {
        const autoSave = result.current.getAutoSaveBackup();
        expect(autoSave).not.toBeNull();
        expect(autoSave?.isAutoSave).toBe(true);
      });
    });
  });

  // =========================================================================
  // Change Tracking Tests
  // =========================================================================
  describe('hasUnsavedChanges', () => {
    it('should return false initially', async () => {
      const { result } = renderHook(() => useCircuitBackup());
      
      await act(async () => {
        expect(result.current.hasUnsavedChanges()).toBe(false);
      });
    });

    it('should return true after marking changes', async () => {
      const { result } = renderHook(() => useCircuitBackup());
      
      await act(async () => {
        useBackupStore.getState().markUnsavedChanges();
      });
      
      expect(result.current.hasUnsavedChanges()).toBe(true);
    });
  });

  describe('clearUnsavedChanges', () => {
    it('should clear the unsaved changes flag', async () => {
      const { result } = renderHook(() => useCircuitBackup());
      
      await act(async () => {
        useBackupStore.getState().markUnsavedChanges();
        expect(result.current.hasUnsavedChanges()).toBe(true);
        
        result.current.clearUnsavedChanges();
        expect(result.current.hasUnsavedChanges()).toBe(false);
      });
    });
  });

  // =========================================================================
  // Trigger Auto-save Tests
  // =========================================================================
  describe('triggerAutoSave', () => {
    it('should create auto-save after debounce delay', async () => {
      const { result } = renderHook(() => useCircuitBackup());
      
      await act(async () => {
        // Mark as having changes
        useBackupStore.getState().markUnsavedChanges();
        
        // Trigger auto-save
        result.current.triggerAutoSave();
        
        // Advance timers past debounce
        vi.advanceTimersByTime(3000);
      });
      
      const autoSave = useBackupStore.getState().autoSave;
      expect(autoSave).not.toBeNull();
    });

    it('should debounce rapid trigger calls', async () => {
      const { result } = renderHook(() => useCircuitBackup());
      
      await act(async () => {
        useBackupStore.getState().markUnsavedChanges();
        
        // Trigger multiple times rapidly
        result.current.triggerAutoSave();
        result.current.triggerAutoSave();
        result.current.triggerAutoSave();
        
        // Advance timers
        vi.advanceTimersByTime(3000);
      });
      
      // Should only have one auto-save
      const autoSave = useBackupStore.getState().autoSave;
      expect(autoSave).not.toBeNull();
    });
  });

  // =========================================================================
  // Dismiss Recovery Tests
  // =========================================================================
  describe('dismissRecovery', () => {
    it('should clear auto-save when dismissed', async () => {
      // First create an auto-save
      useBackupStore.getState().createBackup();
      
      const { result } = renderHook(() => useCircuitBackup());
      
      await act(async () => {
        result.current.dismissRecovery();
      });
      
      expect(useBackupStore.getState().autoSave).toBeNull();
    });

    it('should clear unsaved changes flag', async () => {
      useBackupStore.getState().createBackup();
      useBackupStore.getState().markUnsavedChanges();
      
      const { result } = renderHook(() => useCircuitBackup());
      
      await act(async () => {
        result.current.dismissRecovery();
      });
      
      expect(useBackupStore.getState().hasUnsavedChanges).toBe(false);
    });
  });

  // =========================================================================
  // Restore from Auto-save Tests
  // =========================================================================
  describe('restoreFromAutoSave', () => {
    it('should return true when auto-save exists', async () => {
      useBackupStore.getState().createBackup();
      
      const { result } = renderHook(() => useCircuitBackup());
      
      await act(async () => {
        const restored = result.current.restoreFromAutoSave();
        expect(restored).toBe(true);
      });
    });

    it('should return false when no auto-save exists', async () => {
      const { result } = renderHook(() => useCircuitBackup());
      
      await act(async () => {
        const restored = result.current.restoreFromAutoSave();
        expect(restored).toBe(false);
      });
    });
  });

  // =========================================================================
  // Integration with Store Tests
  // =========================================================================
  describe('Store Integration', () => {
    it('should integrate with backup store', async () => {
      const { result } = renderHook(() => useCircuitBackup());
      
      await act(async () => {
        // Create a backup via hook
        const backupId = result.current.createManualBackup('Integration Test');
        expect(backupId).not.toBeNull();
        
        // Verify it exists in store
        const backup = useBackupStore.getState().restoreBackup(backupId!);
        expect(backup).not.toBeNull();
      });
    });

    it('should maintain state consistency with store', async () => {
      const { result } = renderHook(() => useCircuitBackup());
      
      await act(async () => {
        // Create backup via hook
        result.current.createManualBackup('State Test');
        
        // Verify hasUnsavedChanges is false (auto-save cleared it)
        expect(result.current.hasUnsavedChanges()).toBe(false);
      });
    });
  });
});

describe('useRecoveryCheck Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.__resetStore();
    resetStoreState();
  });

  it('should return false when no auto-save exists', () => {
    const { result } = renderHook(() => useRecoveryCheck());
    expect(result.current).toBe(false);
  });

  it('should return true when auto-save exists', () => {
    useBackupStore.getState().createBackup();
    
    const { result } = renderHook(() => useRecoveryCheck());
    expect(result.current).toBe(true);
  });

  it('should update when auto-save is created', () => {
    const { result } = renderHook(() => useRecoveryCheck());
    
    expect(result.current).toBe(false);
    
    act(() => {
      useBackupStore.getState().createBackup();
    });
    
    expect(result.current).toBe(true);
  });

  it('should update when auto-save is cleared', () => {
    useBackupStore.getState().createBackup();
    
    const { result } = renderHook(() => useRecoveryCheck());
    expect(result.current).toBe(true);
    
    act(() => {
      useBackupStore.getState().clearAutoSave();
    });
    
    expect(result.current).toBe(false);
  });
});

describe('useCircuitChangeTracker Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.__resetStore();
    resetStoreState();
  });

  it('should provide markChanged function', () => {
    const { result } = renderHook(() => useCircuitChangeTracker());
    expect(typeof result.current.markChanged).toBe('function');
  });

  it('should mark unsaved changes when markChanged is called', () => {
    const { result } = renderHook(() => useCircuitChangeTracker());
    
    act(() => {
      result.current.markChanged();
    });
    
    expect(useBackupStore.getState().hasUnsavedChanges).toBe(true);
  });

  it('should allow multiple calls to markChanged', () => {
    const { result } = renderHook(() => useCircuitChangeTracker());
    
    act(() => {
      result.current.markChanged();
      result.current.markChanged();
      result.current.markChanged();
    });
    
    expect(useBackupStore.getState().hasUnsavedChanges).toBe(true);
  });

  it('should work with auto-save workflow', () => {
    const { result: trackerResult } = renderHook(() => useCircuitChangeTracker());
    const { result: backupResult } = renderHook(() => useCircuitBackup());
    
    act(() => {
      // Mark changes
      trackerResult.current.markChanged();
      expect(backupResult.current.hasUnsavedChanges()).toBe(true);
      
      // Create backup (should clear unsaved changes)
      backupResult.current.createManualBackup('Workflow Test');
      expect(backupResult.current.hasUnsavedChanges()).toBe(false);
      
      // Mark new changes
      trackerResult.current.markChanged();
      expect(backupResult.current.hasUnsavedChanges()).toBe(true);
    });
  });
});
