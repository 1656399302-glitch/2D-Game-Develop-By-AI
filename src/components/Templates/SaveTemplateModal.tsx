/**
 * Save Template Modal Component
 * 
 * Allows users to save the current editor state as a named template
 * with category selection. Enforces the 50 module size limit.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTemplateStore } from '../../store/useTemplateStore';
import { useMachineStore } from '../../store/useMachineStore';
import { 
  TemplateCategory, 
  TemplateGridSettings,
  MAX_TEMPLATE_MODULES,
  MAX_TEMPLATE_NAME_LENGTH,
} from '../../types/templates';

// Category options for selection
const CATEGORIES: Array<{ key: Exclude<TemplateCategory, 'all'>; label: string; icon: string; description: string }> = [
  { key: 'starter', label: '入门', icon: '📘', description: '适合初学者的基础模板' },
  { key: 'combat', label: '战斗', icon: '⚔️', description: '专注于攻击和战斗能力' },
  { key: 'energy', label: '能量', icon: '⚡', description: '能量生成、存储和传输' },
  { key: 'defense', label: '防御', icon: '🛡️', description: '防护和稳定性设计' },
  { key: 'custom', label: '自定义', icon: '🔧', description: '自定义特殊用途模板' },
];

export interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (templateId: string) => void;
}

export function SaveTemplateModal({ isOpen, onClose, onSuccess }: SaveTemplateModalProps) {
  // Store methods
  const addTemplate = useTemplateStore((s) => s.addTemplate);
  
  // Editor state
  const modules = useMachineStore((s) => s.modules);
  const connections = useMachineStore((s) => s.connections);
  const viewport = useMachineStore((s) => s.viewport);
  const gridEnabled = useMachineStore((s) => s.gridEnabled);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Exclude<TemplateCategory, 'all'>>('custom');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Input ref for focus
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Calculate current module count
  const moduleCount = modules.length;
  const connectionCount = connections.length;
  const isOverLimit = moduleCount > MAX_TEMPLATE_MODULES;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setCategory('custom');
      setDescription('');
      setError(null);
      setIsSaving(false);
      
      // Focus name input after a short delay
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle save
  const handleSave = useCallback(() => {
    setError(null);
    
    // Validate name
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('请输入模板名称');
      nameInputRef.current?.focus();
      return;
    }
    
    if (trimmedName.length > MAX_TEMPLATE_NAME_LENGTH) {
      setError(`模板名称不能超过 ${MAX_TEMPLATE_NAME_LENGTH} 个字符`);
      return;
    }
    
    // Validate module count
    if (moduleCount > MAX_TEMPLATE_MODULES) {
      setError(`此模板包含 ${moduleCount} 个模块，最多只能有 ${MAX_TEMPLATE_MODULES} 个`);
      return;
    }
    
    // Prepare grid settings
    const gridSettings: TemplateGridSettings = {
      gridEnabled,
    };
    
    setIsSaving(true);
    
    // Attempt to add template
    const result = addTemplate(
      trimmedName,
      category,
      modules,
      connections,
      viewport,
      gridSettings
    );
    
    if (result.success && result.template) {
      onSuccess?.(result.template.id);
      onClose();
    } else {
      setError(result.error || '保存模板失败');
      setIsSaving(false);
    }
  }, [name, category, modules, connections, viewport, gridEnabled, addTemplate, onClose, onSuccess]);

  // Handle keyboard submit
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isOverLimit && !isSaving) {
        handleSave();
      }
    }
  }, [handleSave, isOverLimit, isSaving]);

  // Handle close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-md bg-[#0a0e17] border border-[#1e2a42] rounded-2xl flex flex-col overflow-hidden shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Save Template"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a42] bg-[#121826]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/20 flex items-center justify-center">
              <span className="text-lg">💾</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">保存模板</h2>
              <p className="text-xs text-[#6b7280]">将当前机器保存为可复用的模板</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1e2a42] hover:bg-[#2d3a56] flex items-center justify-center text-[#9ca3af] hover:text-white transition-colors"
            aria-label="Close save template dialog"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-5">
          {/* Machine summary */}
          <div className="bg-[#121826] rounded-lg p-3 border border-[#1e2a42]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6b7280]">当前机器</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className={moduleCount > MAX_TEMPLATE_MODULES ? 'text-[#ef4444]' : 'text-[#00d4ff]'}>
                    📦 {moduleCount}
                  </span>
                  <span className="text-[#4a5568]">/</span>
                  <span className="text-[#4a5568]">{MAX_TEMPLATE_MODULES}</span>
                </span>
                <span className="text-[#00ffcc]">🔗 {connectionCount}</span>
              </div>
            </div>
            
            {/* Module count warning */}
            {isOverLimit && (
              <div className="mt-2 p-2 rounded bg-[#7f1d1d]/30 border border-[#ef4444]/30">
                <p className="text-xs text-[#fca5a5] flex items-center gap-1">
                  <span>⚠️</span>
                  <span>
                    此模板有 <strong>{moduleCount}</strong> 个模块，超过限制 
                    (<strong>{MAX_TEMPLATE_MODULES}</strong>)。请移除 {moduleCount - MAX_TEMPLATE_MODULES} 个模块后再试。
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Template name */}
          <div>
            <label 
              htmlFor="template-name" 
              className="block text-sm font-medium text-[#9ca3af] mb-2"
            >
              模板名称 <span className="text-[#ef4444]">*</span>
            </label>
            <input
              ref={nameInputRef}
              id="template-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="例如：基础能量放大器"
              maxLength={MAX_TEMPLATE_NAME_LENGTH}
              className={`w-full bg-[#121826] border rounded-lg px-3 py-2 text-sm text-white placeholder-[#4a5568] focus:outline-none transition-colors ${
                error && error.includes('名称')
                  ? 'border-[#ef4444] focus:border-[#ef4444]'
                  : 'border-[#1e2a42] focus:border-[#f59e0b]'
              }`}
              aria-describedby={error ? 'template-name-error' : undefined}
              aria-invalid={!!(error && error.includes('名称'))}
            />
            <div className="flex justify-between mt-1">
              {error && error.includes('名称') ? (
                <p id="template-name-error" className="text-xs text-[#ef4444]">
                  {error}
                </p>
              ) : (
                <span />
              )}
              <p className="text-xs text-[#4a5568]">
                {name.length}/{MAX_TEMPLATE_NAME_LENGTH}
              </p>
            </div>
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">
              模板类别
            </label>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.key;
                
                
                return (
                  <button
                    key={cat.key}
                    onClick={() => setCategory(cat.key)}
                    className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-[#f59e0b] bg-[#f59e0b]/10'
                        : 'border-[#1e2a42] bg-[#121826] hover:border-[#2d3a4f] hover:bg-[#1e2a42]'
                    }`}
                    aria-pressed={isSelected}
                    title={cat.description}
                  >
                    <span className="text-xl mb-1">{cat.icon}</span>
                    <span className={`text-xs ${
                      isSelected ? 'text-[#f59e0b]' : 'text-[#9ca3af]'
                    }`}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description (optional) */}
          <div>
            <label 
              htmlFor="template-description" 
              className="block text-sm font-medium text-[#9ca3af] mb-2"
            >
              描述 <span className="text-[#4a5568]">(可选)</span>
            </label>
            <textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简要描述这个模板的用途..."
              rows={2}
              maxLength={200}
              className="w-full bg-[#121826] border border-[#1e2a42] rounded-lg px-3 py-2 text-sm text-white placeholder-[#4a5568] focus:outline-none focus:border-[#f59e0b] transition-colors resize-none"
            />
          </div>

          {/* Error message */}
          {error && !error.includes('名称') && (
            <div className="p-3 rounded-lg bg-[#7f1d1d]/30 border border-[#ef4444]/30">
              <p className="text-sm text-[#fca5a5] flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1e2a42] bg-[#121826] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-[#1e2a42] text-[#9ca3af] rounded-lg hover:bg-[#2d3a56] hover:text-white transition-colors text-sm"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={isOverLimit || isSaving || !name.trim()}
            className="flex-1 px-4 py-2 bg-[#f59e0b] text-[#0a0e17] rounded-lg hover:bg-[#d97706] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-[#0a0e17]/30 border-t-[#0a0e17] rounded-full animate-spin" />
                <span>保存中...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>保存模板</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SaveTemplateModal;
