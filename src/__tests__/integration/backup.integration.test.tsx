/**
 * Backup Integration Tests
 * 
 * Tests the integration of backup components (BackupButton, RecoveryPrompt, BackupManager)
 * into the main application UI.
 * 
 * Round 170: Circuit Persistence Backup System Integration
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.location
const originalLocation = window.location;
Object.defineProperty(window, 'location', {
  value: { ...originalLocation, reload: vi.fn() },
  writable: true,
});

// Import after mocks are set up
import { BackupButton } from '../../components/Backup/BackupButton';
import { RecoveryPrompt } from '../../components/Backup/RecoveryPrompt';
import { BackupManager } from '../../components/Backup/BackupManager';
import { useBackupStore } from '../../store/backupStore';

// Helper to reset backup store
function resetBackupStore() {
  const store = useBackupStore.getState();
  // Clear all backups
  store.backups.forEach(backup => {
    store.deleteBackup(backup.id);
  });
  store.clearAutoSave();
  store.clearUnsavedChanges();
}

describe('BackupButton Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    resetBackupStore();
  });

  afterEach(() => {
    cleanup();
  });

  it('should Render Backup button in toolbar', () => {
    const mockOnManage = vi.fn();
    render(<BackupButton onManage={mockOnManage} />);
    
    const backupButton = screen.getByRole('button', { name: /backup/i });
    expect(backupButton).toBeInTheDocument();
    expect(backupButton).toHaveTextContent('Backup');
  });

  it('should open dropdown menu when clicked', async () => {
    const mockOnManage = vi.fn();
    render(<BackupButton onManage={mockOnManage} />);
    
    const backupButton = screen.getByRole('button', { name: /backup/i });
    
    await act(async () => {
      fireEvent.click(backupButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Create Backup')).toBeInTheDocument();
    });
  });

  it('should have Manage Backups option in dropdown', async () => {
    render(<BackupButton onManage={vi.fn()} />);
    
    const backupButton = screen.getByRole('button', { name: /backup/i });
    
    await act(async () => {
      fireEvent.click(backupButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Manage Backups')).toBeInTheDocument();
    });
  });

  it('should call onManage callback when Manage Backups is clicked', async () => {
    const mockOnManage = vi.fn();
    render(<BackupButton onManage={mockOnManage} />);
    
    const backupButton = screen.getByRole('button', { name: /backup/i });
    
    await act(async () => {
      fireEvent.click(backupButton);
    });
    
    await waitFor(() => {
      const manageButton = screen.getByText('Manage Backups');
      fireEvent.click(manageButton);
    });
    
    expect(mockOnManage).toHaveBeenCalledTimes(1);
  });

  it('should close dropdown when clicking outside', async () => {
    render(<BackupButton onManage={vi.fn()} />);
    
    const backupButton = screen.getByRole('button', { name: /backup/i });
    
    await act(async () => {
      fireEvent.click(backupButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Create Backup')).toBeInTheDocument();
    });
    
    // Click outside
    await act(async () => {
      fireEvent.mouseDown(document.body);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Create Backup')).not.toBeInTheDocument();
    });
  });

  it('should show backup count badge when backups exist', () => {
    // Create a backup first
    useBackupStore.getState().createBackup('Test Backup');
    
    render(<BackupButton onManage={vi.fn()} />);
    
    const backupButton = screen.getByRole('button', { name: /backup/i });
    expect(backupButton).toBeInTheDocument();
  });
});

describe('RecoveryPrompt Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    resetBackupStore();
  });

  afterEach(() => {
    cleanup();
  });

  it('should Render RecoveryPrompt when isVisible is true and autoSave exists', () => {
    // Create auto-save data
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

  it('should have Restore and Start Fresh buttons', () => {
    useBackupStore.getState().createBackup();
    
    render(
      <RecoveryPrompt
        isVisible={true}
        onRestore={vi.fn()}
        onStartFresh={vi.fn()}
      />
    );
    
    expect(screen.getByText('Restore Previous Session')).toBeInTheDocument();
    expect(screen.getByText('Start Fresh (Discard)')).toBeInTheDocument();
  });

  it('should call onRestore when Restore button is clicked', async () => {
    const mockOnRestore = vi.fn();
    useBackupStore.getState().createBackup();
    
    render(
      <RecoveryPrompt
        isVisible={true}
        onRestore={mockOnRestore}
        onStartFresh={vi.fn()}
      />
    );
    
    const restoreButton = screen.getByText('Restore Previous Session');
    
    await act(async () => {
      fireEvent.click(restoreButton);
    });
    
    expect(mockOnRestore).toHaveBeenCalledTimes(1);
  });

  it('should call onStartFresh when Start Fresh button is clicked', async () => {
    const mockOnStartFresh = vi.fn();
    useBackupStore.getState().createBackup();
    
    render(
      <RecoveryPrompt
        isVisible={true}
        onRestore={vi.fn()}
        onStartFresh={mockOnStartFresh}
      />
    );
    
    const freshButton = screen.getByText('Start Fresh (Discard)');
    
    await act(async () => {
      fireEvent.click(freshButton);
    });
    
    expect(mockOnStartFresh).toHaveBeenCalledTimes(1);
  });
});

describe('BackupManager Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    resetBackupStore();
  });

  afterEach(() => {
    cleanup();
  });

  it('should Render BackupManager component', () => {
    render(<BackupManager />);
    
    expect(screen.getByText('Backup Manager')).toBeInTheDocument();
  });

  it('should show empty state when no backups exist', () => {
    render(<BackupManager />);
    
    expect(screen.getByText(/no backups yet/i)).toBeInTheDocument();
  });

  it('should display backups when they exist', async () => {
    // Create some backups
    useBackupStore.getState().createBackup('First Backup');
    useBackupStore.getState().createBackup('Second Backup');
    
    render(<BackupManager />);
    
    await waitFor(() => {
      expect(screen.getByText('First Backup')).toBeInTheDocument();
      expect(screen.getByText('Second Backup')).toBeInTheDocument();
    });
  });

  it('should have Create Backup and Import buttons', () => {
    render(<BackupManager />);
    
    expect(screen.getByText('+ Create Backup')).toBeInTheDocument();
    expect(screen.getByText('Import')).toBeInTheDocument();
  });

  it('should show storage usage information', () => {
    render(<BackupManager />);
    
    // Should show storage info with format like "X KB / Y KB"
    expect(screen.getByText(/\/\s*\d+\s*(KB|MB|B)/)).toBeInTheDocument();
  });

  it('should open Create Backup modal when Create Backup is clicked', async () => {
    render(<BackupManager />);
    
    const createButton = screen.getByText('+ Create Backup');
    
    await act(async () => {
      fireEvent.click(createButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Backup Name (optional)')).toBeInTheDocument();
    });
  });

  it('should allow creating a backup via modal', async () => {
    render(<BackupManager />);
    
    const createButton = screen.getByText('+ Create Backup');
    
    await act(async () => {
      fireEvent.click(createButton);
    });
    
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/enter a name/i);
      const createButton = screen.getByText('Create');
      
      act(() => {
        fireEvent.change(input, { target: { value: 'New Test Backup' } });
        fireEvent.click(createButton);
      });
    });
    
    await waitFor(() => {
      expect(screen.getByText('New Test Backup')).toBeInTheDocument();
    });
  });

  it('should allow deleting a backup', async () => {
    // Create a backup first
    useBackupStore.getState().createBackup('To Delete');
    
    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => true);
    
    render(<BackupManager />);
    
    await waitFor(() => {
      expect(screen.getByText('To Delete')).toBeInTheDocument();
    });
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    
    await act(async () => {
      fireEvent.click(deleteButton);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('To Delete')).not.toBeInTheDocument();
    });
    
    // Restore confirm
    window.confirm = originalConfirm;
  });
});

describe('Integration: Full Backup Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    resetBackupStore();
  });

  afterEach(() => {
    cleanup();
  });

  it('should allow creating backup via BackupButton and viewing in BackupManager', async () => {
    const mockOnManage = vi.fn();
    
    // Render BackupButton
    render(<BackupButton onManage={mockOnManage} />);
    
    // Open dropdown
    const backupButton = screen.getByRole('button', { name: /backup/i });
    
    await act(async () => {
      fireEvent.click(backupButton);
    });
    
    // Click Create Backup
    await waitFor(() => {
      const createButton = screen.getByText('Create Backup');
      fireEvent.click(createButton);
    });
    
    // Enter backup name
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/optional/i);
      act(() => {
        fireEvent.change(input, { target: { value: 'My Circuit Backup' } });
      });
    });
    
    // Submit
    await act(async () => {
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);
    });
    
    // Verify backup was created
    await waitFor(() => {
      expect(useBackupStore.getState().backups.length).toBeGreaterThan(0);
    });
  });

  it('should detect crash recovery when autoSave exists', () => {
    // Create auto-save (no name = auto-save)
    useBackupStore.getState().createBackup();
    
    const autoSave = useBackupStore.getState().autoSave;
    expect(autoSave).not.toBeNull();
    expect(autoSave?.isAutoSave).toBe(true);
  });

  it('should show RecoveryPrompt when crash recovery data exists', () => {
    // Create auto-save
    useBackupStore.getState().createBackup();
    
    render(
      <RecoveryPrompt
        isVisible={true}
        onRestore={vi.fn()}
        onStartFresh={vi.fn()}
      />
    );
    
    expect(screen.getByText('Unsaved Changes Detected')).toBeInTheDocument();
    expect(screen.getByText('Restore Previous Session')).toBeInTheDocument();
  });
});
