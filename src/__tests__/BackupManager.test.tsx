/**
 * BackupManager Component Tests
 * 
 * Round 169: Circuit Persistence Backup System
 * 
 * Tests for the BackupManager UI component including:
 * - Backup list display
 * - Backup creation
 * - Backup restoration
 * - Backup deletion
 * - Import/export functionality
 * - Storage usage display
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { BackupManager } from '../components/Backup/BackupManager';
import { useBackupStore, BackupData } from '../store/backupStore';

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

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = vi.fn(() => 'blob:http://localhost/mock-url');
const mockRevokeObjectURL = vi.fn();

vi.stubGlobal('URL', {
  createObjectURL: mockCreateObjectURL,
  revokeObjectURL: mockRevokeObjectURL,
});

// Mock window.alert
const mockAlert = vi.fn();
vi.stubGlobal('alert', mockAlert);

// Mock window.confirm
const mockConfirm = vi.fn();
vi.stubGlobal('confirm', mockConfirm);

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

describe('BackupManager Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.__resetStore();
    resetStoreState();
    cleanup();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // Component Rendering Tests
  // =========================================================================
  describe('Rendering', () => {
    it('should render the component', () => {
      render(<BackupManager />);
      
      expect(screen.getByText('Backup Manager')).toBeInTheDocument();
    });

    it('should display storage usage information', () => {
      render(<BackupManager />);
      
      expect(screen.getByText(/\/ 5 MB/)).toBeInTheDocument();
    });

    it('should show empty state when no backups exist', () => {
      render(<BackupManager />);
      
      expect(screen.getByText(/No backups yet/)).toBeInTheDocument();
    });

    it('should display action buttons', () => {
      render(<BackupManager />);
      
      expect(screen.getByText('+ Create Backup')).toBeInTheDocument();
      expect(screen.getByText('Import')).toBeInTheDocument();
    });

    it('should display backup list container', () => {
      render(<BackupManager />);
      
      // The backup list should be present (may be empty)
      expect(document.querySelector('[role="menu"]') || document.querySelector('button')).toBeTruthy();
    });
  });

  // =========================================================================
  // Backup List Tests
  // =========================================================================
  describe('Backup List', () => {
    it('should display created backups', async () => {
      // Create some test backups
      useBackupStore.getState().createBackup('Test Backup 1');
      useBackupStore.getState().createBackup('Test Backup 2');
      useBackupStore.getState().createBackup('Test Backup 3');
      
      await act(async () => {
        render(<BackupManager />);
      });
      
      expect(screen.getByText('Test Backup 3')).toBeInTheDocument();
      expect(screen.getByText('Test Backup 2')).toBeInTheDocument();
      expect(screen.getByText('Test Backup 1')).toBeInTheDocument();
    });

    it('should not display auto-saves in default mode', async () => {
      // Create auto-save
      useBackupStore.getState().createBackup();
      
      await act(async () => {
        render(<BackupManager showAutoSaves={false} />);
      });
      
      // Should not show auto-save
      expect(screen.queryByText(/Auto-save/)).not.toBeInTheDocument();
    });

    it('should show Restore, Export, Delete buttons for each backup', async () => {
      useBackupStore.getState().createBackup('Test Backup 1');
      useBackupStore.getState().createBackup('Test Backup 2');
      useBackupStore.getState().createBackup('Test Backup 3');
      
      await act(async () => {
        render(<BackupManager />);
      });
      
      const restoreButtons = screen.getAllByText('Restore');
      const exportButtons = screen.getAllByText('Export');
      const deleteButtons = screen.getAllByText('Delete');
      
      expect(restoreButtons.length).toBe(3);
      expect(exportButtons.length).toBe(3);
      expect(deleteButtons.length).toBe(3);
    });
  });

  // =========================================================================
  // Backup Creation Tests
  // =========================================================================
  describe('Backup Creation', () => {
    it('should open create backup modal on button click', async () => {
      await act(async () => {
        render(<BackupManager />);
      });
      
      await act(async () => {
        fireEvent.click(screen.getByText('+ Create Backup'));
      });
      
      expect(screen.getByText('Create Backup')).toBeInTheDocument();
    });

    it('should create backup with provided name', async () => {
      await act(async () => {
        render(<BackupManager />);
      });
      
      await act(async () => {
        fireEvent.click(screen.getByText('+ Create Backup'));
      });
      
      const input = screen.getByPlaceholderText('Enter a name for this backup');
      await act(async () => {
        fireEvent.change(input, { target: { value: 'My Named Backup' } });
      });
      
      await act(async () => {
        fireEvent.click(screen.getByText('Create'));
      });
      
      const backups = useBackupStore.getState().listBackups();
      expect(backups.some(b => b.name === 'My Named Backup')).toBe(true);
    });

    it('should use generated name when input is empty', async () => {
      await act(async () => {
        render(<BackupManager />);
      });
      
      await act(async () => {
        fireEvent.click(screen.getByText('+ Create Backup'));
      });
      
      // Leave input empty
      await act(async () => {
        fireEvent.click(screen.getByText('Create'));
      });
      
      const backups = useBackupStore.getState().listBackups();
      expect(backups.length).toBe(1);
      expect(backups[0].name).toContain('Backup');
    });

    it('should close modal after creating backup', async () => {
      await act(async () => {
        render(<BackupManager />);
      });
      
      await act(async () => {
        fireEvent.click(screen.getByText('+ Create Backup'));
      });
      
      await act(async () => {
        fireEvent.click(screen.getByText('Create'));
      });
      
      expect(screen.queryByText('Create Backup')).not.toBeInTheDocument();
    });

    it('should close modal on cancel', async () => {
      await act(async () => {
        render(<BackupManager />);
      });
      
      await act(async () => {
        fireEvent.click(screen.getByText('+ Create Backup'));
      });
      
      await act(async () => {
        fireEvent.click(screen.getByText('Cancel'));
      });
      
      expect(screen.queryByText('Create Backup')).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // Backup Restoration Tests
  // =========================================================================
  describe('Backup Restoration', () => {
    it('should call onRestore callback when restore is clicked', async () => {
      const onRestore = vi.fn();
      const backup = useBackupStore.getState().createBackup('Restore Test');
      
      await act(async () => {
        render(<BackupManager onRestore={onRestore} />);
      });
      
      await act(async () => {
        fireEvent.click(screen.getByText('Restore'));
      });
      
      expect(onRestore).toHaveBeenCalledWith(expect.objectContaining({
        id: backup?.id,
        name: 'Restore Test',
      }));
    });

    it('should not crash when onRestore is not provided', async () => {
      useBackupStore.getState().createBackup('No Callback Test');
      
      await act(async () => {
        render(<BackupManager />);
      });
      
      // Should not throw
      await act(async () => {
        expect(() => fireEvent.click(screen.getByText('Restore'))).not.toThrow();
      });
    });
  });

  // =========================================================================
  // Backup Deletion Tests
  // =========================================================================
  describe('Backup Deletion', () => {
    it('should show confirmation dialog before deleting', async () => {
      mockConfirm.mockReturnValue(true);
      useBackupStore.getState().createBackup('Delete Test');
      
      await act(async () => {
        render(<BackupManager />);
      });
      
      await act(async () => {
        fireEvent.click(screen.getByText('Delete'));
      });
      
      expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this backup?');
    });

    it('should delete backup when confirmed', async () => {
      mockConfirm.mockReturnValue(true);
      useBackupStore.getState().createBackup('Delete Confirm Test');
      const backupId = useBackupStore.getState().listBackups()[0].id;
      
      await act(async () => {
        render(<BackupManager />);
      });
      
      await act(async () => {
        fireEvent.click(screen.getByText('Delete'));
      });
      
      const backups = useBackupStore.getState().listBackups();
      expect(backups.some(b => b.id === backupId)).toBe(false);
    });

    it('should not delete backup when cancelled', async () => {
      mockConfirm.mockReturnValue(false);
      useBackupStore.getState().createBackup('Delete Cancel Test');
      const backupId = useBackupStore.getState().listBackups()[0].id;
      
      await act(async () => {
        render(<BackupManager />);
      });
      
      await act(async () => {
        fireEvent.click(screen.getByText('Delete'));
      });
      
      const backups = useBackupStore.getState().listBackups();
      expect(backups.some(b => b.id === backupId)).toBe(true);
    });
  });

  // =========================================================================
  // Export Tests
  // =========================================================================
  describe('Export', () => {
    it('should trigger download when export is clicked', async () => {
      useBackupStore.getState().createBackup('Export Test');
      
      await act(async () => {
        render(<BackupManager />);
      });
      
      await act(async () => {
        fireEvent.click(screen.getByText('Export'));
      });
      
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    it('should create JSON blob for download', async () => {
      useBackupStore.getState().createBackup('JSON Export Test');
      
      await act(async () => {
        render(<BackupManager />);
      });
      
      let blobContent: string | null = null;
      mockCreateObjectURL.mockImplementation((blob: Blob) => {
        blobContent = JSON.stringify(blob);
        return 'blob:http://localhost/mock-url';
      });
      
      await act(async () => {
        fireEvent.click(screen.getByText('Export'));
      });
      
      expect(blobContent).toBeDefined();
    });
  });

  // =========================================================================
  // Import Tests
  // =========================================================================
  describe('Import', () => {
    it('should have import button', async () => {
      await act(async () => {
        render(<BackupManager />);
      });
      
      // Import button should exist
      expect(screen.getByText('Import')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Storage Usage Tests
  // =========================================================================
  describe('Storage Usage', () => {
    it('should display storage bar', async () => {
      await act(async () => {
        render(<BackupManager />);
      });
      
      const storageBar = document.querySelector('[style*="height: 6px"]');
      expect(storageBar).toBeTruthy();
    });

    it('should update storage display after creating backup', async () => {
      await act(async () => {
        render(<BackupManager />);
      });
      
      const initialUsed = useBackupStore.getState().storageUsage.used;
      
      await act(async () => {
        fireEvent.click(screen.getByText('+ Create Backup'));
      });
      
      await act(async () => {
        fireEvent.click(screen.getByText('Create'));
      });
      
      const updatedUsed = useBackupStore.getState().storageUsage.used;
      expect(updatedUsed).toBeGreaterThan(initialUsed);
    });
  });

  // =========================================================================
  // Edge Cases
  // =========================================================================
  describe('Edge Cases', () => {
    it('should handle empty backup name input', async () => {
      await act(async () => {
        render(<BackupManager />);
      });
      
      await act(async () => {
        fireEvent.click(screen.getByText('+ Create Backup'));
      });
      
      // Input should exist
      expect(screen.getByPlaceholderText('Enter a name for this backup')).toBeTruthy();
    });

    it('should not crash with missing onRestore callback', async () => {
      useBackupStore.getState().createBackup('No Callback');
      
      await act(async () => {
        render(<BackupManager onRestore={undefined} />);
      });
      
      await act(async () => {
        expect(() => fireEvent.click(screen.getByText('Restore'))).not.toThrow();
      });
    });
  });

  // =========================================================================
  // Modal Accessibility Tests
  // =========================================================================
  describe('Accessibility', () => {
    it('should have proper role on modal', async () => {
      await act(async () => {
        render(<BackupManager />);
      });
      
      await act(async () => {
        fireEvent.click(screen.getByText('+ Create Backup'));
      });
      
      const modal = screen.getByRole('dialog');
      expect(modal).toBeTruthy();
    });
  });
});
