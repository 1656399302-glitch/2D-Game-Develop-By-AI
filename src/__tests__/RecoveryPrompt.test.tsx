/**
 * RecoveryPrompt Component Tests
 * 
 * Round 169: Circuit Persistence Backup System
 * 
 * Tests for the crash recovery modal including:
 * - Modal visibility
 * - Auto-save detection
 * - Restore functionality
 * - Start fresh functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { RecoveryPrompt } from '../components/Backup/RecoveryPrompt';
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
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Helper to reset store state
function resetStoreState() {
  useBackupStore.setState({
    backups: [],
    autoSave: null,
    storageUsage: { used: 0, available: 5 * 1024 * 1024, usagePercent: 0 },
    hasUnsavedChanges: false,
    lastBackupTime: 0,
  });
}

describe('RecoveryPrompt Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.__resetStore();
    resetStoreState();
  });

  afterEach(() => {
    cleanup();
  });

  // =========================================================================
  // Visibility Tests
  // =========================================================================
  describe('Visibility', () => {
    it('should not render when isVisible is false', () => {
      render(
        <RecoveryPrompt
          isVisible={false}
          onRestore={vi.fn()}
          onStartFresh={vi.fn()}
        />
      );
      
      expect(screen.queryByText('Unsaved Changes Detected')).not.toBeInTheDocument();
    });

    it('should not render when isVisible is true but no auto-save', () => {
      render(
        <RecoveryPrompt
          isVisible={true}
          onRestore={vi.fn()}
          onStartFresh={vi.fn()}
        />
      );
      
      expect(screen.queryByText('Unsaved Changes Detected')).not.toBeInTheDocument();
    });

    it('should render when isVisible is true and auto-save exists', () => {
      useBackupStore.getState().createBackup();
      
      render(
        <RecoveryPrompt
          isVisible={true}
          onRestore={vi.fn()}
          onStartFresh={vi.fn()}
        />
      );
      
      expect(screen.getByText('Unsaved Changes Detected')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Content Display Tests
  // =========================================================================
  describe('Content Display', () => {
    it('should display title', () => {
      useBackupStore.getState().createBackup();
      
      render(
        <RecoveryPrompt
          isVisible={true}
          onRestore={vi.fn()}
          onStartFresh={vi.fn()}
        />
      );
      
      expect(screen.getByText('Unsaved Changes Detected')).toBeInTheDocument();
    });

    it('should display description', () => {
      useBackupStore.getState().createBackup();
      
      render(
        <RecoveryPrompt
          isVisible={true}
          onRestore={vi.fn()}
          onStartFresh={vi.fn()}
        />
      );
      
      expect(screen.getByText(/previous session ended unexpectedly/)).toBeInTheDocument();
    });

    it('should display auto-save name', () => {
      useBackupStore.getState().createBackup();
      
      render(
        <RecoveryPrompt
          isVisible={true}
          onRestore={vi.fn()}
          onStartFresh={vi.fn()}
        />
      );
      
      expect(screen.getByText('Auto-saved Circuit')).toBeInTheDocument();
    });

    it('should display restore button', () => {
      useBackupStore.getState().createBackup();
      
      render(
        <RecoveryPrompt
          isVisible={true}
          onRestore={vi.fn()}
          onStartFresh={vi.fn()}
        />
      );
      
      expect(screen.getByText('Restore Previous Session')).toBeInTheDocument();
    });

    it('should display start fresh button', () => {
      useBackupStore.getState().createBackup();
      
      render(
        <RecoveryPrompt
          isVisible={true}
          onRestore={vi.fn()}
          onStartFresh={vi.fn()}
        />
      );
      
      expect(screen.getByText('Start Fresh (Discard)')).toBeInTheDocument();
    });

    it('should display import button when onImport is provided', () => {
      useBackupStore.getState().createBackup();
      
      render(
        <RecoveryPrompt
          isVisible={true}
          onRestore={vi.fn()}
          onStartFresh={vi.fn()}
          onImport={vi.fn()}
        />
      );
      
      expect(screen.getByText('Import Backup File')).toBeInTheDocument();
    });

    it('should not display import button when onImport is not provided', () => {
      useBackupStore.getState().createBackup();
      
      render(
        <RecoveryPrompt
          isVisible={true}
          onRestore={vi.fn()}
          onStartFresh={vi.fn()}
        />
      );
      
      expect(screen.queryByText('Import Backup File')).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // Restore Functionality Tests
  // =========================================================================
  describe('Restore Functionality', () => {
    it('should call onRestore when restore button is clicked', async () => {
      const onRestore = vi.fn();
      useBackupStore.getState().createBackup();
      
      render(
        <RecoveryPrompt
          isVisible={true}
          onRestore={onRestore}
          onStartFresh={vi.fn()}
        />
      );
      
      await act(async () => {
        fireEvent.click(screen.getByText('Restore Previous Session'));
      });
      
      expect(onRestore).toHaveBeenCalledTimes(1);
    });

    it('should clear unsaved changes flag on restore', async () => {
      const onRestore = vi.fn();
      useBackupStore.getState().createBackup();
      useBackupStore.getState().markUnsavedChanges();
      
      render(
        <RecoveryPrompt
          isVisible={true}
          onRestore={onRestore}
          onStartFresh={vi.fn()}
        />
      );
      
      await act(async () => {
        fireEvent.click(screen.getByText('Restore Previous Session'));
      });
      
      expect(useBackupStore.getState().hasUnsavedChanges).toBe(false);
    });
  });

  // =========================================================================
  // ARIA Attributes Tests
  // =========================================================================
  describe('Accessibility', () => {
    it('should have dialog role', () => {
      useBackupStore.getState().createBackup();
      
      render(
        <RecoveryPrompt
          isVisible={true}
          onRestore={vi.fn()}
          onStartFresh={vi.fn()}
        />
      );
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('should have aria-modal attribute', () => {
      useBackupStore.getState().createBackup();
      
      render(
        <RecoveryPrompt
          isVisible={true}
          onRestore={vi.fn()}
          onStartFresh={vi.fn()}
        />
      );
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });
});
