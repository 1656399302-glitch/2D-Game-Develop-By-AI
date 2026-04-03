/**
 * Quick Fix Actions Component
 * 
 * Round 113: Circuit Validation UI Integration
 * 
 * Context menu with quick fix actions for validation errors
 */

import React, { useEffect, useRef, useState } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import { useCircuitValidation } from '../../hooks/useCircuitValidation';


// ============================================================================
// Styles
// ============================================================================

const menuStyles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    borderRadius: '10px',
    border: '1px solid rgba(233, 69, 96, 0.4)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(233, 69, 96, 0.2)',
    minWidth: '180px',
    maxWidth: '280px',
    zIndex: 9999,
    overflow: 'hidden',
    animation: 'menuSlideIn 0.2s ease-out',
  },
  header: {
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  headerIcon: {
    fontSize: '20px',
  },
  headerText: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#e94560',
    fontFamily: '"Noto Sans SC", sans-serif',
  },
  menuList: {
    padding: '8px 0',
    listStyle: 'none',
    margin: 0,
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontSize: '12px',
    color: '#f8f8f2',
    fontFamily: '"Noto Sans SC", sans-serif',
  },
  menuItemHover: {
    background: 'rgba(80, 250, 123, 0.1)',
    color: '#50fa7b',
  },
  menuItemDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  menuIcon: {
    fontSize: '16px',
    width: '24px',
    textAlign: 'center',
  },
  menuLabel: {
    flex: 1,
  },
  menuShortcut: {
    fontSize: '10px',
    opacity: 0.6,
    fontFamily: 'monospace',
  },
  footer: {
    padding: '10px 16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    fontSize: '11px',
    color: 'rgba(248, 248, 242, 0.5)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  closeButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#9ca3af',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
};

// ============================================================================
// Types
// ============================================================================

interface QuickFixActionsProps {
  /** Module instance ID to show actions for */
  moduleId: string | null;
  /** Position to show the menu */
  position: { x: number; y: number } | null;
  /** Whether the menu is visible */
  visible: boolean;
  /** Callback when menu is closed */
  onClose: () => void;
  /** Callback when an action is applied */
  onActionApplied?: () => void;
}

// ============================================================================
// Fix Action Definitions
// ============================================================================

interface FixAction {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
  disabled?: boolean;
  action: () => void | Promise<void>;
}

// ============================================================================
// Component Implementation
// ============================================================================

export const QuickFixActions: React.FC<QuickFixActionsProps> = ({
  moduleId,
  position,
  visible,
  onClose,
  onActionApplied,
}) => {
  const modules = useMachineStore((state) => state.modules);
  const connections = useMachineStore((state) => state.connections);
  const addModule = useMachineStore((state) => state.addModule);
  const completeConnection = useMachineStore((state) => state.completeConnection);
  const removeConnection = useMachineStore((state) => state.removeConnection);
  
  const { validationResult } = useCircuitValidation();
  
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Get errors affecting this module
  const affectedErrors = validationResult?.errors.filter((e) =>
    e.affectedModuleIds.includes(moduleId || '')
  ) || [];

  // Get the primary error for this module
  const primaryError = affectedErrors[0];

  // Find the module
  const module = modules.find((m) => m.instanceId === moduleId);

  // Find compatible modules for connection
  const compatibleModules = modules.filter((m) => {
    if (m.instanceId === moduleId) return false;
    // Check if there's an available input port
    const hasInputPort = m.ports.some((p) => p.type === 'input');
    // Check if not already connected from this module
    const notConnected = !connections.some(
      (c) => c.sourceModuleId === moduleId && c.targetModuleId === m.instanceId
    );
    return hasInputPort && notConnected;
  });

  // Build fix actions based on error type
  const fixActions: FixAction[] = React.useMemo(() => {
    if (!primaryError || !module) return [];

    const actions: FixAction[] = [];

    switch (primaryError.code) {
      case 'ISLAND_MODULES': {
        // Action: Add connection to nearest compatible module
        if (compatibleModules.length > 0 && module) {
          const moduleOutputPorts = module.ports.filter((p) => p.type === 'output');
          if (moduleOutputPorts.length > 0) {
            const targetModule = compatibleModules[0];
            const targetInputPorts = targetModule.ports.filter((p) => p.type === 'input');
            if (targetInputPorts.length > 0) {
              actions.push({
                id: 'add-connection',
                label: '添加连接',
                icon: '🔗',
                shortcut: 'C',
                action: async () => {
                  // This will be handled by the connection system
                  completeConnection(targetModule.instanceId, targetInputPorts[0].id);
                  onActionApplied?.();
                },
              });
            }
          }
        }
        
        // Action: Connect from another module
        if (module.ports.some((p) => p.type === 'input')) {
          const sourceModules = modules.filter((m) => {
            if (m.instanceId === moduleId) return false;
            const hasOutput = m.ports.some((p) => p.type === 'output');
            const notConnected = !connections.some(
              (c) => c.sourceModuleId === m.instanceId && c.targetModuleId === moduleId
            );
            return hasOutput && notConnected;
          });
          
          if (sourceModules.length > 0) {
            const sourceModule = sourceModules[0];
            const sourceOutputPorts = sourceModule.ports.filter((p) => p.type === 'output');
            const targetInputPorts = module.ports.filter((p) => p.type === 'input');
            
            if (sourceOutputPorts.length > 0 && targetInputPorts.length > 0) {
              actions.push({
                id: 'connect-from',
                label: `从 ${sourceModule.type} 连接`,
                icon: '↩️',
                action: async () => {
                  completeConnection(moduleId!, targetInputPorts[0].id);
                  onActionApplied?.();
                },
              });
            }
          }
        }
        
        // Action: Delete isolated module
        actions.push({
          id: 'delete-module',
          label: '删除模块',
          icon: '🗑️',
          shortcut: 'Del',
          action: () => {
            useMachineStore.getState().removeModule(moduleId!);
            onActionApplied?.();
          },
        });
        break;
      }

      case 'LOOP_DETECTED': {
        // Action: Remove the problematic connection
        if (primaryError.affectedConnectionIds && primaryError.affectedConnectionIds.length > 0) {
          actions.push({
            id: 'remove-cycle-connection',
            label: '移除循环连接',
            icon: '✂️',
            action: async () => {
              const connId = primaryError.affectedConnectionIds![0];
              removeConnection(connId);
              onActionApplied?.();
            },
          });
        }
        
        // Action: Highlight cycle connections
        actions.push({
          id: 'highlight-cycle',
          label: '高亮循环路径',
          icon: '🔦',
          action: () => {
            // Emit event for canvas to highlight connections
            window.dispatchEvent(
              new CustomEvent('highlight-connections', {
                detail: { connectionIds: primaryError.affectedConnectionIds || [] },
              })
            );
            onActionApplied?.();
          },
        });
        break;
      }

      case 'UNREACHABLE_OUTPUT': {
        // Action: Add core module
        actions.push({
          id: 'add-core',
          label: '添加核心炉心',
          icon: '🔥',
          action: () => {
            addModule('core-furnace', module.x + 100, module.y);
            onActionApplied?.();
          },
        });
        
        // Action: Add pipe from existing core
        const coreModules = modules.filter((m) => m.type === 'core-furnace');
        if (coreModules.length > 0) {
          const core = coreModules[0];
          actions.push({
            id: 'connect-to-core',
            label: `连接到 ${core.type}`,
            icon: '⚡',
            action: async () => {
              const coreOutput = core.ports.find((p) => p.type === 'output');
              const moduleInput = module.ports.find((p) => p.type === 'input');
              if (coreOutput && moduleInput) {
                completeConnection(moduleId!, moduleInput.id);
                onActionApplied?.();
              }
            },
          });
        }
        break;
      }

      case 'CIRCUIT_INCOMPLETE': {
        // Action: Add core module
        actions.push({
          id: 'add-core',
          label: '添加核心炉心',
          icon: '🔥',
          action: () => {
            addModule('core-furnace', 400, 300);
            onActionApplied?.();
          },
        });
        break;
      }
    }

    // Add generic "View Details" action
    actions.push({
      id: 'view-details',
      label: '查看详情',
      icon: '📋',
      action: () => {
        // Could open validation details panel
        onActionApplied?.();
      },
    });

    return actions;
  }, [
    primaryError,
    module,
    moduleId,
    modules,
    connections,
    compatibleModules,
    completeConnection,
    removeConnection,
    addModule,
    onActionApplied,
  ]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!visible) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [visible, onClose]);

  // Adjust position to stay within viewport
  const adjustedPosition = React.useMemo(() => {
    if (!position) return null;
    
    const menuWidth = 280;
    const menuHeight = 200;
    const padding = 10;
    
    let x = position.x;
    let y = position.y;
    
    // Adjust horizontal position
    if (x + menuWidth > window.innerWidth - padding) {
      x = window.innerWidth - menuWidth - padding;
    }
    if (x < padding) {
      x = padding;
    }
    
    // Adjust vertical position
    if (y + menuHeight > window.innerHeight - padding) {
      y = window.innerHeight - menuHeight - padding;
    }
    if (y < padding) {
      y = padding;
    }
    
    return { x, y };
  }, [position]);

  if (!visible || !position || !moduleId) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      style={{
        ...menuStyles.container,
        left: `${adjustedPosition?.x || position.x}px`,
        top: `${adjustedPosition?.y || position.y}px`,
      }}
      className="quick-fix-actions-menu"
      role="menu"
      aria-label="快速修复操作"
    >
      <style>
        {`
          @keyframes menuSlideIn {
            from {
              opacity: 0;
              transform: translateY(-10px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>

      {/* Header */}
      <div style={menuStyles.header}>
        <span style={menuStyles.headerIcon}>🔧</span>
        <span style={menuStyles.headerText}>
          修复: {module?.type || '未知模块'}
        </span>
        <button
          style={menuStyles.closeButton}
          onClick={onClose}
          aria-label="关闭"
        >
          ×
        </button>
      </div>

      {/* Error info */}
      {primaryError && (
        <div
          style={{
            padding: '8px 16px',
            fontSize: '11px',
            color: '#e94560',
            background: 'rgba(233, 69, 96, 0.1)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <span style={{ fontFamily: 'monospace', marginRight: '8px' }}>
            {primaryError.code}
          </span>
          <span style={{ opacity: 0.8 }}>
            {primaryError.message}
          </span>
        </div>
      )}

      {/* Actions list */}
      <ul style={menuStyles.menuList}>
        {fixActions.map((action) => (
          <li
            key={action.id}
            style={{
              ...menuStyles.menuItem,
              ...(hoveredItem === action.id && !action.disabled
                ? menuStyles.menuItemHover
                : {}),
              ...(action.disabled ? menuStyles.menuItemDisabled : {}),
            }}
            onClick={() => {
              if (!action.disabled) {
                action.action();
                onClose();
              }
            }}
            onMouseEnter={() => setHoveredItem(action.id)}
            onMouseLeave={() => setHoveredItem(null)}
            role="menuitem"
            aria-disabled={action.disabled}
          >
            <span style={menuStyles.menuIcon}>{action.icon}</span>
            <span style={menuStyles.menuLabel}>{action.label}</span>
            {action.shortcut && (
              <span style={menuStyles.menuShortcut}>{action.shortcut}</span>
            )}
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div style={menuStyles.footer}>
        点击操作应用修复
      </div>
    </div>
  );
};

// ============================================================================
// Export Default
// ============================================================================

export default QuickFixActions;
