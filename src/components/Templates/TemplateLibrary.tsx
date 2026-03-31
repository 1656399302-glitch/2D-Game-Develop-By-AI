/**
 * Template Library Modal Component
 * 
 * Allows users to browse, search, filter, and load saved templates.
 * Implements the confirmation flow for non-empty editor state.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTemplateStore } from '../../store/useTemplateStore';
import { useMachineStore } from '../../store/useMachineStore';
import { 
  Template, 
  TemplateCategory, 
  TEMPLATE_CATEGORY_CONFIG,
} from '../../types/templates';

// Category tabs configuration
const CATEGORIES: Array<{ key: TemplateCategory; label: string; icon: string }> = [
  { key: 'all', label: '全部', icon: '📚' },
  { key: 'starter', label: '入门', icon: '📘' },
  { key: 'combat', label: '战斗', icon: '⚔️' },
  { key: 'energy', label: '能量', icon: '⚡' },
  { key: 'defense', label: '防御', icon: '🛡️' },
  { key: 'custom', label: '自定义', icon: '🔧' },
];

// Format relative time
function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return `${Math.floor(days / 7)}周前`;
}

// Template card component
function TemplateCard({
  template,
  onLoad,
  onDelete,
  onRename,
  onToggleFavorite,
  onDuplicate,
}: {
  template: Template;
  onLoad: (template: Template) => void;
  onDelete: (template: Template) => void;
  onRename: (template: Template) => void;
  onToggleFavorite: (template: Template) => void;
  onDuplicate: (template: Template) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const categoryConfig = TEMPLATE_CATEGORY_CONFIG[template.category];

  return (
    <div
      className="bg-[#121826] border border-[#1e2a42] rounded-xl overflow-hidden hover:border-[#00d4ff]/40 transition-all group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={`Template: ${template.name}`}
    >
      {/* Preview area */}
      <div className="relative h-24 bg-[#0a0e17] overflow-hidden">
        {/* Mini preview placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-4xl opacity-20">{categoryConfig.icon}</div>
        </div>
        
        {/* Category badge */}
        <div
          className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1"
          style={{ backgroundColor: categoryConfig.color + '30', color: categoryConfig.color }}
        >
          <span>{categoryConfig.icon}</span>
          <span>{categoryConfig.label}</span>
        </div>

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(template);
          }}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            template.isFavorite
              ? 'bg-[#f59e0b]/30 text-[#f59e0b]'
              : 'bg-[#1e2a42]/80 text-[#6b7280] hover:text-[#f59e0b]'
          }`}
          aria-label={template.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {template.isFavorite ? '★' : '☆'}
        </button>

        {/* Hover actions overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2">
            <button
              onClick={() => onLoad(template)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#00d4ff] text-[#0a0e17] hover:bg-[#00d4ff]/80 transition-colors"
              aria-label={`Load template: ${template.name}`}
            >
              加载
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(template);
              }}
              className="px-2 py-1.5 rounded-lg text-xs bg-[#1e2a42] text-[#9ca3af] hover:text-white hover:bg-[#2d3a4f] transition-colors"
              aria-label={`Duplicate template: ${template.name}`}
            >
              复制
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRename(template);
              }}
              className="px-2 py-1.5 rounded-lg text-xs bg-[#1e2a42] text-[#9ca3af] hover:text-white hover:bg-[#2d3a4f] transition-colors"
              aria-label={`Rename template: ${template.name}`}
            >
              重命名
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(template);
              }}
              className="px-2 py-1.5 rounded-lg text-xs bg-[#7f1d1d]/50 text-[#fca5a5] hover:bg-[#7f1d1d] transition-colors"
              aria-label={`Delete template: ${template.name}`}
            >
              删除
            </button>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="p-3">
        <h3 className="text-sm font-bold text-white truncate mb-1" title={template.name}>
          {template.name}
        </h3>
        
        <div className="flex items-center gap-3 text-[10px] text-[#6b7280]">
          <span className="flex items-center gap-1">
            <span>📦</span>
            <span>{template.moduleCount} 模块</span>
          </span>
          <span className="flex items-center gap-1">
            <span>🔗</span>
            <span>{template.connectionCount} 连接</span>
          </span>
        </div>

        <div className="mt-2 text-[10px] text-[#4a5568]">
          更新于 {formatRelativeTime(template.updatedAt)}
        </div>
      </div>
    </div>
  );
}

// Empty state component
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{hasFilters ? '🔍' : '📋'}</div>
      <h3 className="text-lg font-bold text-white mb-2">
        {hasFilters ? '没有找到模板' : '还没有保存的模板'}
      </h3>
      <p className="text-sm text-[#6b7280] max-w-xs">
        {hasFilters
          ? '尝试调整搜索条件或筛选类别'
          : '在编辑器中构建机器后，点击"保存模板"来创建你的第一个模板'}
      </p>
    </div>
  );
}

// Confirmation dialog for load with non-empty editor
function LoadConfirmationDialog({
  template,
  onConfirm,
  onCancel,
}: {
  template: Template;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-[#121826] border border-[#f59e0b]/40 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#f59e0b]/20 flex items-center justify-center">
            <span className="text-xl">⚠️</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-white">加载模板?</h3>
            <p className="text-xs text-[#6b7280]">此操作无法撤销</p>
          </div>
        </div>
        
        <p className="text-sm text-[#9ca3af] mb-4">
          加载 <strong className="text-white">{template.name}</strong> 将替换你当前的工作区。
          所有未保存的更改将会丢失。
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-[#1e2a42] text-white rounded-lg hover:bg-[#2d3a56] transition-colors text-sm"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-[#f59e0b] text-[#0a0e17] rounded-lg hover:bg-[#d97706] transition-colors text-sm font-medium"
          >
            加载模板
          </button>
        </div>
      </div>
    </div>
  );
}

// Delete confirmation dialog
function DeleteConfirmationDialog({
  template,
  onConfirm,
  onCancel,
}: {
  template: Template;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-[#121826] border border-[#ef4444]/40 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#ef4444]/20 flex items-center justify-center">
            <span className="text-xl">🗑️</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-white">删除模板?</h3>
            <p className="text-xs text-[#6b7280]">此操作无法撤销</p>
          </div>
        </div>
        
        <p className="text-sm text-[#9ca3af] mb-4">
          确定要删除模板 <strong className="text-white">{template.name}</strong> 吗?
          此操作无法恢复。
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-[#1e2a42] text-white rounded-lg hover:bg-[#2d3a56] transition-colors text-sm"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-colors text-sm font-medium"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
}

// Rename dialog
function RenameDialog({
  template,
  onConfirm,
  onCancel,
}: {
  template: Template;
  onConfirm: (newName: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(template.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && name.trim() !== template.name) {
      onConfirm(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-[#121826] border border-[#00d4ff]/40 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <h3 className="text-base font-bold text-white mb-4">重命名模板</h3>
        
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="输入模板名称..."
            maxLength={100}
            className="w-full bg-[#0a0e17] border border-[#1e2a42] rounded-lg px-3 py-2 text-sm text-white placeholder-[#4a5568] focus:outline-none focus:border-[#00d4ff] transition-colors mb-4"
            aria-label="Template name"
          />
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-[#1e2a42] text-white rounded-lg hover:bg-[#2d3a56] transition-colors text-sm"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!name.trim() || name.trim() === template.name}
              className="flex-1 px-4 py-2 bg-[#00d4ff] text-[#0a0e17] rounded-lg hover:bg-[#00d4ff]/80 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main Template Library component
export interface TemplateLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSaveModal?: () => void;
}

export function TemplateLibrary({ isOpen, onClose, onOpenSaveModal }: TemplateLibraryProps) {
  // Store state
  const templates = useTemplateStore((s) => s.templates);
  const removeTemplate = useTemplateStore((s) => s.removeTemplate);
  const updateTemplate = useTemplateStore((s) => s.updateTemplate);
  const toggleFavorite = useTemplateStore((s) => s.toggleFavorite);
  const duplicateTemplate = useTemplateStore((s) => s.duplicateTemplate);
  const loadTemplate = useTemplateStore((s) => s.loadTemplate);

  // Editor state to check if workspace has content
  const modules = useMachineStore((s) => s.modules);

  // UI state
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Dialog state
  const [confirmLoadTemplate, setConfirmLoadTemplate] = useState<Template | null>(null);
  const [confirmDeleteTemplate, setConfirmDeleteTemplate] = useState<Template | null>(null);
  const [renameTemplate, setRenameTemplate] = useState<Template | null>(null);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return useTemplateStore.getState().getFilteredTemplates({
      category: activeCategory,
      searchQuery: searchQuery,
      favoritesOnly: showFavoritesOnly,
    });
  }, [templates, activeCategory, searchQuery, showFavoritesOnly]);

  const hasFilters = searchQuery !== '' || activeCategory !== 'all' || showFavoritesOnly;

  // Handle load template
  const handleLoad = useCallback((template: Template) => {
    // Check if editor has content
    if (modules.length > 0) {
      // Show confirmation dialog
      setConfirmLoadTemplate(template);
    } else {
      // Empty editor - load directly
      loadTemplate(template.id);
      onClose();
    }
  }, [modules.length, loadTemplate, onClose]);

  const handleConfirmLoad = useCallback(() => {
    if (confirmLoadTemplate) {
      loadTemplate(confirmLoadTemplate.id);
      setConfirmLoadTemplate(null);
      onClose();
    }
  }, [confirmLoadTemplate, loadTemplate, onClose]);

  const handleCancelLoad = useCallback(() => {
    setConfirmLoadTemplate(null);
  }, []);

  // Handle delete template
  const handleDelete = useCallback((template: Template) => {
    setConfirmDeleteTemplate(template);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (confirmDeleteTemplate) {
      removeTemplate(confirmDeleteTemplate.id);
      setConfirmDeleteTemplate(null);
    }
  }, [confirmDeleteTemplate, removeTemplate]);

  const handleCancelDelete = useCallback(() => {
    setConfirmDeleteTemplate(null);
  }, []);

  // Handle rename template
  const handleRename = useCallback((template: Template) => {
    setRenameTemplate(template);
  }, []);

  const handleConfirmRename = useCallback((newName: string) => {
    if (renameTemplate) {
      updateTemplate(renameTemplate.id, { name: newName });
      setRenameTemplate(null);
    }
  }, [renameTemplate, updateTemplate]);

  const handleCancelRename = useCallback(() => {
    setRenameTemplate(null);
  }, []);

  // Handle duplicate template
  const handleDuplicate = useCallback((template: Template) => {
    duplicateTemplate(template.id);
  }, [duplicateTemplate]);

  // Handle toggle favorite
  const handleToggleFavorite = useCallback((template: Template) => {
    toggleFavorite(template.id);
  }, [toggleFavorite]);

  // Keyboard handler for closing modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmLoadTemplate || confirmDeleteTemplate || renameTemplate) {
          // Close dialogs first
          setConfirmLoadTemplate(null);
          setConfirmDeleteTemplate(null);
          setRenameTemplate(null);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, confirmLoadTemplate, confirmDeleteTemplate, renameTemplate, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div
          className="w-full max-w-4xl max-h-[85vh] bg-[#0a0e17] border border-[#1e2a42] rounded-2xl flex flex-col overflow-hidden shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-label="Template Library"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a42] bg-[#121826]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/20 flex items-center justify-center">
                <span className="text-lg">📋</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">模板库</h2>
                <p className="text-xs text-[#6b7280]">
                  {templates.length} 个已保存的模板
                  {templates.length >= 50 && (
                    <span className="ml-2 text-[#f59e0b]">(接近上限)</span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#1e2a42] hover:bg-[#2d3a56] flex items-center justify-center text-[#9ca3af] hover:text-white transition-colors"
              aria-label="Close template library"
            >
              ✕
            </button>
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-1 px-6 py-2 border-b border-[#1e2a42] bg-[#0a0e17] overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  activeCategory === cat.key
                    ? 'bg-[#f59e0b] text-[#0a0e17]'
                    : 'bg-[#1e2a42] text-[#9ca3af] hover:text-white hover:bg-[#2d3a4f]'
                }`}
                aria-selected={activeCategory === cat.key}
                role="tab"
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
            
            {/* Favorites filter */}
            <div className="ml-auto">
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                  showFavoritesOnly
                    ? 'bg-[#f59e0b] text-[#0a0e17]'
                    : 'bg-[#1e2a42] text-[#9ca3af] hover:text-white hover:bg-[#2d3a4f]'
                }`}
                aria-pressed={showFavoritesOnly}
              >
                <span>{showFavoritesOnly ? '★' : '☆'}</span>
                <span>仅收藏</span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="px-6 py-3 border-b border-[#1e2a42] bg-[#0a0e17]">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索模板..."
                className="w-full bg-[#121826] border border-[#1e2a42] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-[#4a5568] focus:outline-none focus:border-[#f59e0b] transition-colors"
                aria-label="Search templates"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5568]" aria-hidden="true">
                🔍
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-white text-xs"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Template grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredTemplates.length === 0 ? (
              <EmptyState hasFilters={hasFilters} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onLoad={handleLoad}
                    onDelete={handleDelete}
                    onRename={handleRename}
                    onToggleFavorite={handleToggleFavorite}
                    onDuplicate={handleDuplicate}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-[#1e2a42] bg-[#121826] flex items-center justify-between">
            <p className="text-xs text-[#6b7280]">
              显示 {filteredTemplates.length} / {templates.length} 个模板
              {modules.length > 0 && (
                <span className="ml-2 text-[#f59e0b]">
                  (编辑器中有 {modules.length} 个模块)
                </span>
              )}
            </p>
            
            <button
              onClick={onOpenSaveModal}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#f59e0b] text-[#0a0e17] hover:bg-[#d97706] transition-colors flex items-center gap-2"
              aria-label="Save current machine as template"
            >
              <span>+</span>
              <span>保存当前模板</span>
            </button>
          </div>
        </div>
      </div>

      {/* Load confirmation dialog */}
      {confirmLoadTemplate && (
        <LoadConfirmationDialog
          template={confirmLoadTemplate}
          onConfirm={handleConfirmLoad}
          onCancel={handleCancelLoad}
        />
      )}

      {/* Delete confirmation dialog */}
      {confirmDeleteTemplate && (
        <DeleteConfirmationDialog
          template={confirmDeleteTemplate}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}

      {/* Rename dialog */}
      {renameTemplate && (
        <RenameDialog
          template={renameTemplate}
          onConfirm={handleConfirmRename}
          onCancel={handleCancelRename}
        />
      )}
    </>
  );
}

export default TemplateLibrary;
