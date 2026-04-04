/**
 * Sub-Circuit Panel Component
 * 
 * Round 129: Sub-circuit Module System
 * 
 * Panel for managing custom sub-circuits - list view and delete functionality.
 */

import React, { useState, useCallback } from 'react';
import { useSubCircuitStore } from '../../store/useSubCircuitStore';
import { SubCircuitModule, toSubCircuitItem } from '../../types/subCircuit';

// ============================================================================
// Props Interface
// ============================================================================

export interface SubCircuitPanelProps {
  /** Callback when a sub-circuit is deleted */
  onDelete?: (subCircuitId: string) => void;
  /** Callback when sub-circuit instances should be removed from canvas */
  onRemoveInstances?: (subCircuitId: string) => void;
}

// ============================================================================
// Delete Confirmation Modal
// ============================================================================

interface DeleteConfirmModalProps {
  subCircuit: SubCircuitModule;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  subCircuit,
  onConfirm,
  onCancel,
}) => {
  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onCancel}
      data-delete-confirm-overlay
    >
      <div 
        className="bg-[#1a1a2e] border border-[#ef4444]/50 rounded-xl p-6 max-w-sm mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        data-delete-confirm-modal
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#ef4444]/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">确认删除</h3>
            <p className="text-sm text-[#9ca3af]">此操作无法撤销</p>
          </div>
        </div>
        
        {/* Message */}
        <p className="text-[#d1d5db] mb-2">
          确定要删除子电路
        </p>
        <p className="text-[#22c55e] font-semibold mb-4">
          "{subCircuit.name}"
        </p>
        <p className="text-[#9ca3af] text-sm mb-6">
          包含 {subCircuit.moduleIds.length} 个模块。删除后，画布上对应的实例也将被移除。
        </p>
        
        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg border border-[#2d3a4f] text-[#9ca3af] hover:bg-[#1e2a42] transition-colors"
            data-cancel-delete
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg bg-[#ef4444] text-white font-medium hover:bg-[#dc2626] transition-colors"
            data-confirm-delete
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Sub-Circuit Panel Component
// ============================================================================

/**
 * Sub-Circuit Panel Component
 * Displays a list of all custom sub-circuits with delete functionality
 */
export const SubCircuitPanel: React.FC<SubCircuitPanelProps> = ({
  onDelete,
  onRemoveInstances,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<SubCircuitModule | null>(null);
  
  // Get sub-circuits from store
  const subCircuits = useSubCircuitStore((state) => state.subCircuits);
  const deleteSubCircuit = useSubCircuitStore((state) => state.deleteSubCircuit);
  
  // Convert to display items
  const items = subCircuits.map(toSubCircuitItem);
  
  // Handle delete click
  const handleDeleteClick = useCallback((subCircuit: SubCircuitModule) => {
    setDeleteTarget(subCircuit);
  }, []);
  
  // Handle confirm delete
  const handleConfirmDelete = useCallback(() => {
    if (deleteTarget) {
      const result = deleteSubCircuit(deleteTarget.id);
      if (result.success) {
        onDelete?.(deleteTarget.id);
        onRemoveInstances?.(deleteTarget.id);
      }
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteSubCircuit, onDelete, onRemoveInstances]);
  
  // Handle cancel delete
  const handleCancelDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);
  
  // Format date
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  return (
    <div className="border-t border-[#1e2a42]" data-sub-circuit-panel>
      {/* Header */}
      <div className="p-3 border-b border-[#1e2a42] bg-gradient-to-r from-[#1a1a2e] to-[#121826]">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between"
          aria-expanded={isExpanded}
          data-panel-toggle
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
            <span className="text-sm font-medium text-[#8b5cf6]">自定义子电路</span>
            <span className="text-xs text-[#6b7280]">({items.length})</span>
          </span>
          <svg
            className={`w-4 h-4 text-[#6b7280] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {/* Content */}
      {isExpanded && (
        <div className="p-2">
          {items.length === 0 ? (
            /* Empty state */
            <div className="text-center py-8" data-empty-state>
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#1e2a42] flex items-center justify-center">
                <svg className="w-8 h-8 text-[#4a5568]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-sm text-[#6b7280]">暂无自定义子电路</p>
              <p className="text-xs text-[#4a5568] mt-1">选择多个模块后创建</p>
            </div>
          ) : (
            /* Sub-circuit list */
            <div className="space-y-2" data-sub-circuit-list>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a2e]/50 border border-[#1e2a42] hover:border-[#8b5cf6]/30 transition-colors"
                  data-sub-circuit-item={item.id}
                  data-sub-circuit-name={item.name}
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#8b5cf6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate" title={item.name}>
                      {item.name}
                    </p>
                    <p className="text-xs text-[#6b7280]">
                      {item.moduleCount} 个模块 · {formatDate(item.createdAt)}
                    </p>
                  </div>
                  
                  {/* Delete button */}
                  <button
                    onClick={() => {
                      const sc = subCircuits.find((s) => s.id === item.id);
                      if (sc) handleDeleteClick(sc);
                    }}
                    className="p-2 rounded-lg hover:bg-[#ef4444]/20 text-[#6b7280] hover:text-[#ef4444] transition-colors"
                    aria-label={`删除 ${item.name}`}
                    data-delete-sub-circuit={item.id}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          subCircuit={deleteTarget}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default SubCircuitPanel;
