/**
 * Create Sub-Circuit Modal Component
 * 
 * Round 129: Sub-circuit Module System
 * Round 132: Fixed to accept selectedModuleIds and create sub-circuit
 * 
 * Modal for naming and creating sub-circuits from selected modules.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSubCircuitStore } from '../../store/useSubCircuitStore';
import { CreateSubCircuitResult, isValidSubCircuitName } from '../../types/subCircuit';

// ============================================================================
// Props Interface
// ============================================================================

export interface CreateSubCircuitModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Number of selected modules */
  selectedModuleCount: number;
  /** IDs of selected modules to include in the sub-circuit */
  selectedModuleIds?: string[];
  /** Callback when sub-circuit is created */
  onCreated?: (result: CreateSubCircuitResult) => void;
  /** Callback when modal is closed */
  onClose: () => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Create Sub-Circuit Modal Component
 */
export const CreateSubCircuitModal: React.FC<CreateSubCircuitModalProps> = ({
  isOpen,
  selectedModuleCount,
  selectedModuleIds = [],
  onCreated,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Get store actions
  const createSubCircuit = useSubCircuitStore((state) => state.createSubCircuit);
  const isNameTaken = useSubCircuitStore((state) => state.isNameTaken);
  const canCreateMore = useSubCircuitStore((state) => state.canCreateMore);
  
  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure modal is rendered
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setDescription('');
      setError(null);
      setIsCreating(false);
    }
  }, [isOpen]);
  
  // Validate name as user types
  useEffect(() => {
    if (name && !isValidSubCircuitName(name)) {
      setError('名称长度必须在1-50个字符之间');
    } else if (name && isNameTaken(name)) {
      setError(`名称 "${name}" 已被使用`);
    } else {
      setError(null);
    }
  }, [name, isNameTaken]);
  
  // Handle name input change
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);
  
  // Handle description input change
  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  }, []);
  
  // Handle create - ROUND 132 FIX: Actually create the sub-circuit in the store
  const handleCreate = useCallback(() => {
    // Validate
    if (!name.trim()) {
      setError('请输入子电路名称');
      return;
    }
    
    if (!isValidSubCircuitName(name)) {
      setError('名称长度必须在1-50个字符之间');
      return;
    }
    
    if (isNameTaken(name)) {
      setError(`名称 "${name}" 已被使用`);
      return;
    }
    
    if (!canCreateMore()) {
      setError('已达到最大数量限制（20个）');
      return;
    }
    
    if (selectedModuleIds.length < 2) {
      setError('子电路至少需要包含2个模块');
      return;
    }
    
    // Create sub-circuit with selected module IDs
    setIsCreating(true);
    
    const result = createSubCircuit({
      name: name.trim(),
      moduleIds: selectedModuleIds,
      description: description.trim() || undefined,
    });
    
    if (result.success) {
      // Notify parent of successful creation
      onCreated?.(result);
      onClose();
    } else {
      // Show error from store
      setError(result.error || '创建子电路失败');
      setIsCreating(false);
    }
  }, [name, description, selectedModuleIds, createSubCircuit, isNameTaken, canCreateMore, onCreated, onClose]);
  
  // Handle key press
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreate();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [handleCreate, onClose]);
  
  // Handle overlay click
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);
  
  // Don't render if not open
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      data-create-subcircuit-modal
    >
      <div 
        className="bg-[#1a1a2e] border border-[#8b5cf6]/30 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-sub-circuit-title"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#8b5cf6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <h2 id="create-sub-circuit-title" className="text-lg font-semibold text-white">
              创建子电路
            </h2>
            <p className="text-sm text-[#9ca3af]">
              将 {selectedModuleCount} 个模块封装为可复用模块
            </p>
          </div>
        </div>
        
        {/* Module count info */}
        {selectedModuleIds.length < 2 && (
          <div className="mb-4 p-3 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30">
            <p className="text-sm text-[#f59e0b]">
              ⚠️ 子电路至少需要 2 个模块，请先选择多个模块
            </p>
          </div>
        )}
        
        {/* Name input */}
        <div className="mb-4">
          <label 
            htmlFor="sub-circuit-name" 
            className="block text-sm font-medium text-[#d1d5db] mb-2"
          >
            子电路名称 <span className="text-[#ef4444]">*</span>
          </label>
          <input
            ref={inputRef}
            id="sub-circuit-name"
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="例如：My Adder, 4位加法器"
            maxLength={50}
            className={`
              w-full px-4 py-2.5 rounded-lg 
              bg-[#121826] border text-white
              placeholder-[#4a5568]
              focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50 focus:border-[#8b5cf6]
              transition-colors
              ${error ? 'border-[#ef4444]' : 'border-[#2d3a4f]'}
            `}
            disabled={isCreating}
            data-sub-circuit-name-input
          />
          <p className="mt-1 text-xs text-[#6b7280]">
            {name.length}/50 字符
          </p>
        </div>
        
        {/* Description input (optional) */}
        <div className="mb-6">
          <label 
            htmlFor="sub-circuit-description" 
            className="block text-sm font-medium text-[#d1d5db] mb-2"
          >
            描述 <span className="text-[#4a5568]">(可选)</span>
          </label>
          <textarea
            id="sub-circuit-description"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="简要描述这个子电路的功能..."
            rows={2}
            maxLength={200}
            className="w-full px-4 py-2.5 rounded-lg bg-[#121826] border border-[#2d3a4f] text-white placeholder-[#4a5568] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50 focus:border-[#8b5cf6] transition-colors resize-none"
            disabled={isCreating}
            data-sub-circuit-description-input
          />
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/30" data-error-message>
            <p className="text-sm text-[#ef4444] flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isCreating}
            className="flex-1 px-4 py-2.5 rounded-lg border border-[#2d3a4f] text-[#9ca3af] hover:bg-[#1e2a42] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-cancel-create
          >
            取消
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || !!error || selectedModuleIds.length < 2 || isCreating}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#8b5cf6] text-white font-medium hover:bg-[#7c3aed] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-confirm-create
          >
            {isCreating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                创建中...
              </span>
            ) : (
              '创建'
            )}
          </button>
        </div>
        
        {/* Help text */}
        <p className="mt-4 text-xs text-[#4a5568] text-center">
          按 Enter 创建，Esc 取消
        </p>
      </div>
    </div>
  );
};

export default CreateSubCircuitModal;
