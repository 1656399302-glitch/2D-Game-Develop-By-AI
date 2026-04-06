/**
 * BackupButton Component
 * 
 * Toolbar button for creating manual backups.
 * Shows a dropdown with backup options.
 * 
 * Round 169: Circuit Persistence Backup System
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useBackupStore } from '../../store/backupStore';

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    display: 'inline-block',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    backgroundColor: '#252540',
    border: '1px solid #333',
    borderRadius: '6px',
    color: '#e0e0e0',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'monospace',
    transition: 'all 0.2s ease',
  },
  buttonHover: {
    backgroundColor: '#333',
    borderColor: '#444',
  },
  buttonActive: {
    backgroundColor: '#333',
    borderColor: '#00d9ff',
  },
  icon: {
    width: '16px',
    height: '16px',
    flexShrink: 0,
  },
  chevron: {
    width: '12px',
    height: '12px',
    marginLeft: '4px',
    transition: 'transform 0.2s ease',
  },
  chevronOpen: {
    transform: 'rotate(180deg)',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '4px',
    minWidth: '200px',
    backgroundColor: '#1a1a2e',
    border: '1px solid #333',
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
    zIndex: 1000,
    overflow: 'hidden',
    animation: 'fadeIn 0.15s ease',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    color: '#e0e0e0',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'monospace',
    transition: 'background-color 0.15s ease',
    border: 'none',
    background: 'none',
    width: '100%',
    textAlign: 'left',
  },
  dropdownItemHover: {
    backgroundColor: '#252540',
  },
  dropdownDivider: {
    height: '1px',
    backgroundColor: '#333',
    margin: '4px 0',
  },
  badge: {
    marginLeft: 'auto',
    padding: '2px 6px',
    borderRadius: '10px',
    fontSize: '10px',
    backgroundColor: '#333',
    color: '#888',
  },
  badgeWarning: {
    backgroundColor: '#f59e0b',
    color: '#000',
  },
  backupNameInput: {
    display: 'flex',
    gap: '8px',
    padding: '10px 14px',
    backgroundColor: '#252540',
    borderTop: '1px solid #333',
  },
  input: {
    flex: 1,
    padding: '6px 10px',
    borderRadius: '4px',
    border: '1px solid #333',
    backgroundColor: '#1a1a2e',
    color: '#fff',
    fontSize: '12px',
    fontFamily: 'inherit',
  },
  inputButton: {
    padding: '6px 12px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#8b5cf6',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '12px',
    fontFamily: 'inherit',
  },
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginBottom: '8px',
    padding: '6px 10px',
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    opacity: 0,
    transition: 'opacity 0.2s ease',
  },
  tooltipVisible: {
    opacity: 1,
  },
};

// ============================================================================
// Icons
// ============================================================================

const BackupIcon: React.FC = () => (
  <svg
    style={styles.icon as React.CSSProperties}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const CreateIcon: React.FC = () => (
  <svg
    style={styles.icon as React.CSSProperties}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ManageIcon: React.FC = () => (
  <svg
    style={styles.icon as React.CSSProperties}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const ExportIcon: React.FC = () => (
  <svg
    style={styles.icon as React.CSSProperties}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const ChevronIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <svg
    style={{
      ...styles.chevron,
      ...(isOpen ? styles.chevronOpen : {}),
    }}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ============================================================================
// Main Component
// ============================================================================

interface BackupButtonProps {
  /** Callback when manage is clicked */
  onManage?: () => void;
  /** Callback when backup is created */
  onBackupCreated?: (backupId: string) => void;
  /** Show backup count badge */
  showBadge?: boolean;
  /** Tooltip text */
  tooltip?: string;
}

export const BackupButton: React.FC<BackupButtonProps> = ({
  onManage,
  onBackupCreated,
  showBadge = true,
  tooltip = 'Backup',
}) => {
  // Local state
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [backupName, setBackupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get store state
  const backupCount = useBackupStore((state) => state.backups.filter(b => !b.isAutoSave).length);
  const hasUnsavedChanges = useBackupStore((state) => state.hasUnsavedChanges);
  const createBackup = useBackupStore((state) => state.createBackup);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Focus input when creating backup
  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  // Handlers
  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
    setIsCreating(false);
  }, []);

  const handleCreateBackup = useCallback(() => {
    setIsCreating(true);
  }, []);

  const handleSubmitBackup = useCallback(() => {
    const name = backupName.trim() || `Backup ${new Date().toLocaleString()}`;
    const backup = createBackup(name);
    if (backup && onBackupCreated) {
      onBackupCreated(backup.id);
    }
    setBackupName('');
    setIsCreating(false);
    setIsOpen(false);
  }, [backupName, createBackup, onBackupCreated]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitBackup();
    } else if (e.key === 'Escape') {
      setIsCreating(false);
    }
  }, [handleSubmitBackup]);

  const handleManage = useCallback(() => {
    setIsOpen(false);
    if (onManage) {
      onManage();
    }
  }, [onManage]);

  const handleExport = useCallback(() => {
    setIsOpen(false);
    // Trigger file download of latest backup
    const backups = useBackupStore.getState().backups.filter(b => !b.isAutoSave);
    if (backups.length > 0) {
      const latest = backups[0];
      const json = useBackupStore.getState().exportBackup(latest.id);
      if (json) {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `circuit-backup-${latest.name || latest.id.slice(0, 8)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
  }, []);

  return (
    <div
      ref={containerRef}
      style={styles.container}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip */}
      <div style={{
        ...styles.tooltip,
        ...(isHovered && !isOpen ? styles.tooltipVisible : {}),
      }}>
        {tooltip}
        {hasUnsavedChanges && ' (unsaved changes)'}
      </div>

      {/* Main Button */}
      <button
        style={{
          ...styles.button,
          ...(isHovered ? styles.buttonHover : {}),
          ...(isOpen ? styles.buttonActive : {}),
        }}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <BackupIcon />
        <span>Backup</span>
        <ChevronIcon isOpen={isOpen} />
        {showBadge && backupCount > 0 && (
          <span style={{
            ...styles.badge,
            ...(hasUnsavedChanges ? styles.badgeWarning : {}),
          }}>
            {backupCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={styles.dropdown} role="menu">
          {/* Create Backup Option */}
          <button
            style={{
              ...styles.dropdownItem,
              ...(isCreating ? { backgroundColor: '#252540' } : {}),
            }}
            onClick={handleCreateBackup}
          >
            <CreateIcon />
            <span>Create Backup</span>
          </button>

          {/* Backup Name Input */}
          {isCreating && (
            <div style={styles.backupNameInput as React.CSSProperties}>
              <input
                ref={inputRef}
                type="text"
                style={styles.input}
                value={backupName}
                onChange={(e) => setBackupName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Backup name (optional)"
              />
              <button
                style={styles.inputButton}
                onClick={handleSubmitBackup}
              >
                Save
              </button>
            </div>
          )}

          <div style={styles.dropdownDivider} />

          {/* Manage Backups */}
          <button
            style={styles.dropdownItem}
            onClick={handleManage}
          >
            <ManageIcon />
            <span>Manage Backups</span>
            {showBadge && backupCount > 0 && (
              <span style={styles.badge}>{backupCount}</span>
            )}
          </button>

          {/* Export Latest */}
          <button
            style={styles.dropdownItem}
            onClick={handleExport}
          >
            <ExportIcon />
            <span>Export Latest</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default BackupButton;
