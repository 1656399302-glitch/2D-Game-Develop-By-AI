/**
 * useCircuitBackup Hook
 * 
 * React hook for integrating circuit backup functionality.
 * Provides auto-save, crash recovery detection, and backup triggers.
 * 
 * Round 169: Circuit Persistence Backup System
 */

import { useEffect, useRef, useCallback } from 'react';
import { useBackupStore } from '../store/backupStore';

/** Default auto-save interval in milliseconds (30 seconds) */
const DEFAULT_AUTO_SAVE_INTERVAL = 30000;

/** Debounce delay for triggering auto-save after changes */
const AUTO_SAVE_DEBOUNCE = 2000;

interface UseCircuitBackupOptions {
  /** Auto-save interval in milliseconds */
  autoSaveInterval?: number;
  /** Whether auto-save is enabled */
  enabled?: boolean;
  /** Callback when recovery is needed */
  onRecoveryNeeded?: () => void;
  /** Callback when backup is created */
  onBackupCreated?: (backupId: string) => void;
}

interface UseCircuitBackupReturn {
  /** Create a manual backup */
  createManualBackup: (name?: string) => string | null;
  /** Get the current auto-save backup */
  getAutoSaveBackup: () => ReturnType<typeof useBackupStore.getState>['autoSave'];
  /** Check if there are unsaved changes */
  hasUnsavedChanges: () => boolean;
  /** Clear unsaved changes flag */
  clearUnsavedChanges: () => void;
  /** Trigger immediate auto-save */
  triggerAutoSave: () => void;
  /** Dismiss recovery prompt */
  dismissRecovery: () => void;
  /** Restore from auto-save */
  restoreFromAutoSave: () => boolean;
}

/**
 * Hook for managing circuit backup lifecycle
 * 
 * @example
 * const {
 *   createManualBackup,
 *   getAutoSaveBackup,
 *   hasUnsavedChanges,
 *   triggerAutoSave,
 * } = useCircuitBackup({
 *   autoSaveInterval: 30000,
 *   enabled: true,
 * });
 */
export function useCircuitBackup(
  options: UseCircuitBackupOptions = {}
): UseCircuitBackupReturn {
  const {
    autoSaveInterval = DEFAULT_AUTO_SAVE_INTERVAL,
    enabled = true,
    onRecoveryNeeded,
    onBackupCreated,
  } = options;

  // Get store methods
  const {
    createBackup,
    getAutoSave,
    clearUnsavedChanges,
  } = useBackupStore();

  // Refs for timers
  const autoSaveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInitializedRef = useRef(false);

  /**
   * Create a manual backup with optional name
   */
  const createManualBackup = useCallback((name?: string) => {
    const backup = createBackup(name);
    if (backup && onBackupCreated) {
      onBackupCreated(backup.id);
    }
    return backup?.id || null;
  }, [createBackup, onBackupCreated]);

  /**
   * Get the current auto-save backup
   */
  const getAutoSaveBackup = useCallback(() => {
    return getAutoSave();
  }, [getAutoSave]);

  /**
   * Check if there are unsaved changes
   */
  const hasUnsavedChanges = useCallback(() => {
    return useBackupStore.getState().hasUnsavedChanges;
  }, []);

  /**
   * Clear unsaved changes flag
   */
  const clearChangesFlag = useCallback(() => {
    clearUnsavedChanges();
  }, [clearUnsavedChanges]);

  /**
   * Trigger immediate auto-save (debounced)
   */
  const triggerAutoSave = useCallback(() => {
    // Clear existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new debounce timeout
    debounceTimeoutRef.current = setTimeout(() => {
      const backup = createBackup();
      if (backup && onBackupCreated) {
        onBackupCreated(backup.id);
      }
    }, AUTO_SAVE_DEBOUNCE);
  }, [createBackup, onBackupCreated]);

  /**
   * Dismiss recovery prompt and clear auto-save
   */
  const dismissRecovery = useCallback(() => {
    useBackupStore.getState().clearAutoSave();
    clearUnsavedChanges();
  }, [clearUnsavedChanges]);

  /**
   * Restore from auto-save
   */
  const restoreFromAutoSave = useCallback(() => {
    const backup = getAutoSave();
    if (backup) {
      // The actual restoration would be handled by the RecoveryPrompt component
      return true;
    }
    return false;
  }, [getAutoSave]);

  // Setup auto-save interval
  useEffect(() => {
    if (!enabled) {
      // Clear interval if disabled
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
      return;
    }

    // Setup auto-save interval
    autoSaveIntervalRef.current = setInterval(() => {
      const store = useBackupStore.getState();
      
      // Only auto-save if there are unsaved changes
      if (store.hasUnsavedChanges) {
        const backup = store.createBackup();
        if (backup && onBackupCreated) {
          onBackupCreated(backup.id);
        }
      }
    }, autoSaveInterval);

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
    };
  }, [enabled, autoSaveInterval, onBackupCreated]);

  // Setup beforeunload warning
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const store = useBackupStore.getState();
      
      // Only warn if there are unsaved changes
      if (store.hasUnsavedChanges) {
        // Trigger final auto-save
        store.createBackup();
        
        // Show browser warning
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return event.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Check for recovery needed on mount
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      
      const store = useBackupStore.getState();
      const autoSaveData = store.getAutoSave();
      
      if (autoSaveData && onRecoveryNeeded) {
        // Mark that we have unsaved changes so recovery prompt shows
        store.markUnsavedChanges();
        onRecoveryNeeded();
      }
    }
  }, [onRecoveryNeeded]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    createManualBackup,
    getAutoSaveBackup,
    hasUnsavedChanges,
    clearUnsavedChanges: clearChangesFlag,
    triggerAutoSave,
    dismissRecovery,
    restoreFromAutoSave,
  };
}

/**
 * Hook to check if recovery is needed
 * Returns true if there's auto-save data available
 */
export function useRecoveryCheck(): boolean {
  const autoSave = useBackupStore((state) => state.autoSave);
  return autoSave !== null;
}

/**
 * Hook to track changes for auto-save triggering
 * Call markChanged() whenever the circuit is modified
 */
export function useCircuitChangeTracker(): {
  markChanged: () => void;
} {
  const markUnsavedChanges = useBackupStore((state) => state.markUnsavedChanges);

  const markChanged = useCallback(() => {
    markUnsavedChanges();
  }, [markUnsavedChanges]);

  return { markChanged };
}

export default useCircuitBackup;
