/**
 * BackupManager Component
 * 
 * UI component for managing circuit backups.
 * Allows viewing, restoring, deleting, and importing/exporting backups.
 * 
 * Round 169: Circuit Persistence Backup System
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useBackupStore, BackupData } from '../../store/backupStore';

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#1a1a2e',
    borderRadius: '8px',
    color: '#e0e0e0',
    fontFamily: 'monospace',
    maxWidth: '600px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #333',
    paddingBottom: '12px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#00d9ff',
    margin: 0,
  },
  storageInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#888',
  },
  storageBar: {
    width: '100px',
    height: '6px',
    backgroundColor: '#333',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  storageBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  backupList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '400px',
    overflowY: 'auto',
  },
  backupItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#252540',
    borderRadius: '6px',
    border: '1px solid #333',
    transition: 'border-color 0.2s ease',
  },
  backupInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  backupName: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#fff',
  },
  backupMeta: {
    display: 'flex',
    gap: '12px',
    fontSize: '11px',
    color: '#888',
  },
  backupActions: {
    display: 'flex',
    gap: '8px',
  },
  button: {
    padding: '6px 12px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    fontFamily: 'inherit',
    transition: 'background-color 0.2s ease',
  },
  restoreButton: {
    backgroundColor: '#22c55e',
    color: '#fff',
  },
  exportButton: {
    backgroundColor: '#3b82f6',
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    color: '#fff',
  },
  emptyState: {
    textAlign: 'center',
    padding: '32px',
    color: '#666',
    fontSize: '14px',
  },
  actionBar: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  createBackupButton: {
    backgroundColor: '#8b5cf6',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    padding: '24px',
    borderRadius: '8px',
    maxWidth: '400px',
    width: '90%',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #333',
    backgroundColor: '#252540',
    color: '#fff',
    fontSize: '14px',
    fontFamily: 'inherit',
    marginTop: '8px',
    boxSizing: 'border-box',
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format timestamp to readable string
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

/**
 * Get storage bar color based on usage percentage
 */
function getStorageBarColor(usagePercent: number): string {
  if (usagePercent < 0.5) return '#22c55e';
  if (usagePercent < 0.8) return '#f59e0b';
  return '#ef4444';
}

// ============================================================================
// Sub-components
// ============================================================================

interface BackupItemProps {
  backup: BackupData;
  onRestore: (id: string) => void;
  onExport: (id: string) => void;
  onDelete: (id: string) => void;
}

const BackupItem: React.FC<BackupItemProps> = ({ backup, onRestore, onExport, onDelete }) => {
  return (
    <div style={styles.backupItem}>
      <div style={styles.backupInfo}>
        <div style={styles.backupName}>
          {backup.name || (backup.isAutoSave ? 'Auto-save' : `Backup ${backup.id.slice(0, 8)}`)}
        </div>
        <div style={styles.backupMeta}>
          <span>{formatTimestamp(backup.timestamp)}</span>
          <span>{formatBytes(backup.sizeBytes)}</span>
        </div>
      </div>
      <div style={styles.backupActions}>
        <button
          style={{ ...styles.button, ...styles.restoreButton }}
          onClick={() => onRestore(backup.id)}
          title="Restore this backup"
        >
          Restore
        </button>
        <button
          style={{ ...styles.button, ...styles.exportButton }}
          onClick={() => onExport(backup.id)}
          title="Export as JSON"
        >
          Export
        </button>
        <button
          style={{ ...styles.button, ...styles.deleteButton }}
          onClick={() => onDelete(backup.id)}
          title="Delete this backup"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

interface CreateBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

const CreateBackupModal: React.FC<CreateBackupModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(name.trim() || `Backup ${new Date().toLocaleString()}`);
    setName('');
    onClose();
  };

  return (
    <div style={styles.modal} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="create-backup-title">
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ ...styles.title, marginTop: 0 }}>Create Backup</h3>
        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: '14px', color: '#888' }}>
            Backup Name (optional)
            <input
              type="text"
              style={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name for this backup"
              autoFocus
            />
          </label>
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              style={{ ...styles.button, backgroundColor: '#333' }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ ...styles.button, ...styles.createBackupButton }}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

interface BackupManagerProps {
  /** Callback when a backup is restored */
  onRestore?: (backup: BackupData) => void;
  /** Whether to show auto-saves in the list */
  showAutoSaves?: boolean;
}

export const BackupManager: React.FC<BackupManagerProps> = ({
  onRestore,
  showAutoSaves = false,
}) => {
  // Get store state and actions
  const backups = useBackupStore((state) => state.backups);
  const storageUsage = useBackupStore((state) => state.storageUsage);
  const createBackup = useBackupStore((state) => state.createBackup);
  const restoreBackup = useBackupStore((state) => state.restoreBackup);
  const deleteBackup = useBackupStore((state) => state.deleteBackup);
  const exportBackup = useBackupStore((state) => state.exportBackup);

  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter backups based on options
  const displayedBackups = useMemo(() => {
    if (showAutoSaves) {
      return backups;
    }
    return backups.filter((b) => !b.isAutoSave);
  }, [backups, showAutoSaves]);

  // Handlers
  const handleRestore = useCallback((id: string) => {
    const backup = restoreBackup(id);
    if (backup && onRestore) {
      onRestore(backup);
    }
  }, [restoreBackup, onRestore]);

  const handleExport = useCallback((id: string) => {
    const json = exportBackup(id);
    if (json) {
      // Create download
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `circuit-backup-${id.slice(0, 8)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [exportBackup]);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this backup?')) {
      deleteBackup(id);
    }
  }, [deleteBackup]);

  const handleCreate = useCallback((name: string) => {
    createBackup(name);
  }, [createBackup]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const backup = useBackupStore.getState().importBackup(text);
        if (backup) {
          alert(`Successfully imported backup: ${backup.name}`);
        } else {
          alert('Failed to import backup. Invalid file format.');
        }
      } catch (error) {
        alert('Failed to import backup. Error reading file.');
      }
    };
    
    input.click();
  }, []);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Backup Manager</h2>
        <div style={styles.storageInfo}>
          <span>{formatBytes(storageUsage.used)} / {formatBytes(storageUsage.available)}</span>
          <div style={styles.storageBar}>
            <div
              style={{
                ...styles.storageBarFill,
                width: `${Math.min(storageUsage.usagePercent * 100, 100)}%`,
                backgroundColor: getStorageBarColor(storageUsage.usagePercent),
              }}
            />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div style={styles.actionBar}>
        <button
          style={styles.createBackupButton}
          onClick={() => setIsModalOpen(true)}
        >
          + Create Backup
        </button>
        <button
          style={{ ...styles.button, backgroundColor: '#3b82f6', color: '#fff' }}
          onClick={handleImport}
        >
          Import
        </button>
      </div>

      {/* Backup List */}
      <div style={styles.backupList}>
        {displayedBackups.length === 0 ? (
          <div style={styles.emptyState}>
            No backups yet. Create one to protect your circuit designs!
          </div>
        ) : (
          displayedBackups.map((backup) => (
            <BackupItem
              key={backup.id}
              backup={backup}
              onRestore={handleRestore}
              onExport={handleExport}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Create Backup Modal */}
      <CreateBackupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
};

export default BackupManager;
