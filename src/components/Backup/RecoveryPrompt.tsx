/**
 * RecoveryPrompt Component
 * 
 * Crash recovery modal that appears when unsaved changes are detected
 * on page reload.
 * 
 * Round 169: Circuit Persistence Backup System
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useBackupStore } from '../../store/backupStore';

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    animation: 'fadeIn 0.3s ease',
  },
  modal: {
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    padding: '32px',
    maxWidth: '480px',
    width: '90%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    border: '1px solid #333',
    animation: 'slideUp 0.3s ease',
  },
  icon: {
    width: '64px',
    height: '64px',
    margin: '0 auto 20px',
    display: 'block',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: '12px',
    fontFamily: 'monospace',
  },
  description: {
    fontSize: '14px',
    color: '#888',
    textAlign: 'center',
    marginBottom: '24px',
    lineHeight: 1.6,
    fontFamily: 'monospace',
  },
  autoSaveInfo: {
    backgroundColor: '#252540',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  autoSaveIcon: {
    width: '32px',
    height: '32px',
    flexShrink: 0,
  },
  autoSaveDetails: {
    flex: 1,
  },
  autoSaveTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '4px',
    fontFamily: 'monospace',
  },
  autoSaveMeta: {
    fontSize: '12px',
    color: '#888',
    fontFamily: 'monospace',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  button: {
    padding: '14px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  restoreButton: {
    backgroundColor: '#22c55e',
    color: '#fff',
  },
  freshButton: {
    backgroundColor: '#333',
    color: '#fff',
  },
  importButton: {
    backgroundColor: 'transparent',
    color: '#888',
    border: '1px solid #444',
  },
  secondary: {
    fontSize: '12px',
    color: '#666',
    textAlign: 'center',
    marginTop: '16px',
  },
};

// ============================================================================
// Icons
// ============================================================================

const WarningIcon: React.FC = () => (
  <svg
    style={styles.icon as React.CSSProperties}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#f59e0b"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const RestoreIcon: React.FC = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

const FreshIcon: React.FC = () => (
  <svg
    width="18"
    height="18"
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

const AutoSaveIcon: React.FC = () => (
  <svg
    style={styles.autoSaveIcon as React.CSSProperties}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#00d9ff"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const ImportIcon: React.FC = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format timestamp to readable string
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  
  return date.toLocaleString();
}

// ============================================================================
// Main Component
// ============================================================================

interface RecoveryPromptProps {
  /** Whether the prompt is visible */
  isVisible: boolean;
  /** Callback when restore is selected */
  onRestore: () => void;
  /** Callback when start fresh is selected */
  onStartFresh: () => void;
  /** Callback when import is selected */
  onImport?: () => void;
}

export const RecoveryPrompt: React.FC<RecoveryPromptProps> = ({
  isVisible,
  onRestore,
  onStartFresh,
  onImport,
}) => {
  // Get auto-save data - always call hooks at the top
  const autoSave = useBackupStore((state) => state.autoSave);
  const clearAutoSave = useBackupStore((state) => state.clearAutoSave);
  const clearUnsavedChanges = useBackupStore((state) => state.clearUnsavedChanges);

  // Local state for import modal
  const [showImportModal, setShowImportModal] = useState(false);

  // Handlers - define before the early return to ensure hooks are called consistently
  const handleRestore = useCallback(() => {
    clearUnsavedChanges();
    onRestore();
  }, [clearUnsavedChanges, onRestore]);

  const handleStartFresh = useCallback(() => {
    clearAutoSave();
    clearUnsavedChanges();
    onStartFresh();
  }, [clearAutoSave, clearUnsavedChanges, onStartFresh]);

  const handleImport = useCallback(() => {
    setShowImportModal(true);
  }, []);

  const handleImportFile = useCallback(() => {
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
          clearAutoSave();
          clearUnsavedChanges();
          setShowImportModal(false);
          alert(`Successfully imported: ${backup.name}`);
        } else {
          alert('Failed to import. Invalid backup file format.');
        }
      } catch (error) {
        alert('Failed to import. Error reading file.');
      }
    };
    
    input.click();
  }, [clearAutoSave, clearUnsavedChanges]);

  // Use a derived value instead of early return after hooks
  const shouldRender = isVisible && autoSave;

  // Add keyboard listener
  useEffect(() => {
    if (!shouldRender) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleStartFresh();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shouldRender, handleStartFresh]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (!shouldRender) return;
    
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [shouldRender]);

  // Don't render if not visible or no auto-save data
  if (!shouldRender) {
    return null;
  }

  return (
    <>
      <div style={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="recovery-title">
        <div style={styles.modal}>
          {/* Warning Icon */}
          <WarningIcon />
          
          {/* Title */}
          <h2 id="recovery-title" style={styles.title}>
            Unsaved Changes Detected
          </h2>
          
          {/* Description */}
          <p style={styles.description}>
            It looks like your previous session ended unexpectedly. 
            We found an auto-saved version of your circuit that you can restore.
          </p>
          
          {/* Auto-save Info */}
          <div style={styles.autoSaveInfo}>
            <AutoSaveIcon />
            <div style={styles.autoSaveDetails}>
              <div style={styles.autoSaveTitle}>
                {autoSave.name || 'Auto-saved Circuit'}
              </div>
              <div style={styles.autoSaveMeta}>
                Saved {formatTimestamp(autoSave.timestamp)}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div style={styles.actions}>
            <button
              style={{ ...styles.button, ...styles.restoreButton }}
              onClick={handleRestore}
              autoFocus
            >
              <RestoreIcon />
              Restore Previous Session
            </button>
            
            <button
              style={{ ...styles.button, ...styles.freshButton }}
              onClick={handleStartFresh}
            >
              <FreshIcon />
              Start Fresh (Discard)
            </button>
            
            {onImport && (
              <button
                style={{ ...styles.button, ...styles.importButton }}
                onClick={handleImport}
              >
                <ImportIcon />
                Import Backup File
              </button>
            )}
          </div>
          
          {/* Secondary Text */}
          <p style={styles.secondary}>
            Press ESC to start fresh without saving
          </p>
        </div>
      </div>

      {/* Import Confirmation Modal */}
      {showImportModal && (
        <div style={styles.overlay} onClick={() => setShowImportModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ ...styles.title, fontSize: '18px' }}>
              Import Backup
            </h3>
            <p style={styles.description}>
              This will import a previously exported backup file. 
              Your current auto-saved data will be replaced.
            </p>
            <div style={styles.actions}>
              <button
                style={{ ...styles.button, ...styles.restoreButton }}
                onClick={handleImportFile}
              >
                Choose File to Import
              </button>
              <button
                style={{ ...styles.button, ...styles.freshButton }}
                onClick={() => setShowImportModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecoveryPrompt;
