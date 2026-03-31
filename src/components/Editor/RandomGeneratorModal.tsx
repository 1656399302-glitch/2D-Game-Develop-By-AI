/**
 * Random Generator Modal Component
 * 
 * UI for enhanced random generation with:
 * - Theme selection (8 themed presets)
 * - Complexity controls (module count slider)
 * - Connection density controls
 * - Generation preview
 * - Validation status
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRandomGenerator } from '../../hooks/useRandomGenerator';
import {
  GenerationTheme,
  ConnectionDensity,
  THEME_DISPLAY_INFO,
  getAllThemes,
  GenerationResult,
} from '../../utils/randomGenerator';

/**
 * Theme button component
 */
function ThemeButton({
  theme,
  isSelected,
  onClick,
}: {
  theme: GenerationTheme;
  isSelected: boolean;
  onClick: () => void;
}) {
  const info = THEME_DISPLAY_INFO[theme];
  
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center p-3 rounded-lg border transition-all
        ${isSelected
          ? 'border-[#00d4ff] bg-[#00d4ff]/10 shadow-[0_0_10px_rgba(0,212,255,0.3)]'
          : 'border-[#2d3a4f] bg-[#1a2235] hover:border-[#4a5568] hover:bg-[#252f45]'
        }
      `}
      aria-pressed={isSelected}
      aria-label={`选择${info.name}主题: ${info.description}`}
    >
      <span className="text-2xl mb-1">{info.icon}</span>
      <span className={`text-sm font-medium ${isSelected ? 'text-[#00d4ff]' : 'text-white'}`}>
        {info.name}
      </span>
    </button>
  );
}

/**
 * Slider component for module count
 */
function ModuleCountSlider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="text-sm text-[#9ca3af]">{label}</label>
        <span className="text-sm font-mono text-[#00d4ff]">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full h-2 bg-[#1e2a42] rounded-lg appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-[#00d4ff]
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:shadow-[0_0_5px_rgba(0,212,255,0.5)]
          [&::-webkit-slider-thumb]:transition-transform
          [&::-webkit-slider-thumb]:hover:scale-110"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
      <div className="flex justify-between text-xs text-[#4a5568]">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

/**
 * Connection density selector
 */
function DensitySelector({
  value,
  onChange,
}: {
  value: ConnectionDensity;
  onChange: (value: ConnectionDensity) => void;
}) {
  const options: { value: ConnectionDensity; label: string; description: string }[] = [
    { value: 'low', label: '稀疏', description: '较少连接' },
    { value: 'medium', label: '适中', description: '平衡连接' },
    { value: 'high', label: '密集', description: '大量连接' },
  ];
  
  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            flex-1 px-3 py-2 rounded-lg border text-center transition-all
            ${value === option.value
              ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]'
              : 'border-[#2d3a4f] bg-[#1a2235] text-[#9ca3af] hover:border-[#4a5568]'
            }
          `}
          aria-pressed={value === option.value}
        >
          <div className="text-sm font-medium">{option.label}</div>
          <div className="text-xs opacity-60">{option.description}</div>
        </button>
      ))}
    </div>
  );
}

/**
 * Validation status display
 */
function ValidationStatus({ result }: { result: GenerationResult | null }) {
  if (!result) {
    return (
      <div className="p-4 rounded-lg bg-[#1a2235] border border-[#2d3a4f]">
        <div className="text-sm text-[#4a5568] text-center">
          点击"随机生成"预览机器
        </div>
      </div>
    );
  }
  
  const { validation, complexity, theme } = result;
  const themeInfo = THEME_DISPLAY_INFO[theme];
  
  return (
    <div className="space-y-3">
      {/* Overall status */}
      <div className={`
        p-3 rounded-lg border flex items-center gap-2
        ${validation.valid
          ? 'border-[#22c55e]/50 bg-[#22c55e]/10 text-[#22c55e]'
          : 'border-[#ef4444]/50 bg-[#ef4444]/10 text-[#ef4444]'
        }
      `}>
        <span className="text-lg">
          {validation.valid ? '✅' : '⚠️'}
        </span>
        <span className="font-medium">
          {validation.valid ? '验证通过' : '验证失败'}
        </span>
      </div>
      
      {/* Complexity stats */}
      <div className="p-3 rounded-lg bg-[#1a2235] border border-[#2d3a4f]">
        <div className="text-xs text-[#4a5568] mb-2">复杂度统计</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#9ca3af]">模块数:</span>
            <span className="text-white font-mono">{complexity.moduleCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9ca3af]">连接数:</span>
            <span className="text-white font-mono">{complexity.connectionCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9ca3af]">连接密度:</span>
            <span className="text-white font-mono">{complexity.connectionDensity.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9ca3af]">主题:</span>
            <span className="text-white">{themeInfo.name}</span>
          </div>
        </div>
      </div>
      
      {/* Validation details */}
      <div className="p-3 rounded-lg bg-[#1a2235] border border-[#2d3a4f]">
        <div className="text-xs text-[#4a5568] mb-2">验证详情</div>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <span>{validation.hasCore ? '✅' : '❌'}</span>
            <span className={validation.hasCore ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
              包含核心炉心
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>{validation.noOverlaps ? '✅' : '❌'}</span>
            <span className={validation.noOverlaps ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
              无模块重叠
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>{validation.allConnectionsValid ? '✅' : '❌'}</span>
            <span className={validation.allConnectionsValid ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
              连接有效
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>{validation.hasValidEnergyFlow ? '✅' : '❌'}</span>
            <span className={validation.hasValidEnergyFlow ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
              能量流动有效
            </span>
          </div>
        </div>
      </div>
      
      {/* Errors */}
      {validation.errors.length > 0 && (
        <div className="p-3 rounded-lg bg-[#ef4444]/5 border border-[#ef4444]/30">
          <div className="text-xs text-[#ef4444] mb-1">错误:</div>
          <ul className="text-xs text-[#fca5a5] space-y-1">
            {validation.errors.map((error, idx) => (
              <li key={idx}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <div className="p-3 rounded-lg bg-[#f59e0b]/5 border border-[#f59e0b]/30">
          <div className="text-xs text-[#f59e0b] mb-1">警告:</div>
          <ul className="text-xs text-[#fcd34d] space-y-1">
            {validation.warnings.map((warning, idx) => (
              <li key={idx}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Random Generator Modal Component
 */
export function RandomGeneratorModal({
  isOpen,
  onClose,
  onGenerate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (result: GenerationResult) => void;
}) {
  const hook = useRandomGenerator();
  const modalRef = useRef<HTMLDivElement>(null);
  const [previewResult, setPreviewResult] = useState<GenerationResult | null>(null);
  
  // Handle escape key
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
  
  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }
  }, [isOpen]);
  
  // Handle preview generation
  const handlePreview = useCallback(() => {
    const result = hook.generate();
    setPreviewResult(result);
  }, [hook]);
  
  // Handle apply
  const handleApply = useCallback(() => {
    if (previewResult) {
      onGenerate(previewResult);
      hook.applyToCanvas(previewResult);
      onClose();
    } else {
      // Generate and apply directly
      hook.generateAndApply();
    }
  }, [previewResult, onGenerate, hook, onClose]);
  
  // Reset preview when modal opens with new settings
  useEffect(() => {
    if (isOpen) {
      setPreviewResult(null);
    }
  }, [isOpen, hook.selectedTheme, hook.connectionDensity, hook.moduleCountMin, hook.moduleCountMax]);
  
  if (!isOpen) return null;
  
  const themes = getAllThemes();
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="random-generator-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl bg-[#0a0e17] border border-[#1e2a42] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a42] bg-[#121826]">
          <h2 id="random-generator-title" className="text-lg font-bold text-[#00d4ff] flex items-center gap-2">
            <span>🎲</span>
            <span>随机锻造</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#9ca3af] hover:text-white hover:bg-[#1e2a42] transition-colors"
            aria-label="关闭"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
          {/* Theme Selection */}
          <section>
            <h3 className="text-sm font-medium text-[#9ca3af] mb-3">选择主题</h3>
            <div className="grid grid-cols-4 gap-2">
              {themes.map((theme) => (
                <ThemeButton
                  key={theme}
                  theme={theme}
                  isSelected={hook.selectedTheme === theme}
                  onClick={() => hook.setTheme(theme)}
                />
              ))}
            </div>
            {hook.selectedTheme && (
              <p className="mt-2 text-xs text-[#4a5568]">
                {THEME_DISPLAY_INFO[hook.selectedTheme].description}
              </p>
            )}
          </section>
          
          {/* Complexity Controls */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-[#9ca3af]">复杂度控制</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <ModuleCountSlider
                label="最小模块数"
                value={hook.moduleCountMin}
                min={2}
                max={hook.moduleCountMax - 1}
                onChange={(value) => hook.setModuleCountRange(value, hook.moduleCountMax)}
              />
              <ModuleCountSlider
                label="最大模块数"
                value={hook.moduleCountMax}
                min={hook.moduleCountMin + 1}
                max={15}
                onChange={(value) => hook.setModuleCountRange(hook.moduleCountMin, value)}
              />
            </div>
          </section>
          
          {/* Connection Density */}
          <section>
            <h3 className="text-sm font-medium text-[#9ca3af] mb-3">连接密度</h3>
            <DensitySelector
              value={hook.connectionDensity}
              onChange={hook.setConnectionDensity}
            />
          </section>
          
          {/* Preview */}
          <section>
            <h3 className="text-sm font-medium text-[#9ca3af] mb-3">预览</h3>
            <ValidationStatus result={previewResult} />
          </section>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#1e2a42] bg-[#121826]">
          <button
            onClick={handlePreview}
            disabled={hook.isGenerating}
            className="px-4 py-2 rounded-lg bg-[#1e2a42] text-[#9ca3af] hover:bg-[#2d3a4f] hover:text-white transition-colors disabled:opacity-50"
          >
            {hook.isGenerating ? '生成中...' : '预览'}
          </button>
          <button
            onClick={handleApply}
            disabled={hook.isGenerating}
            className="px-6 py-2 rounded-lg bg-[#00d4ff]/20 text-[#00d4ff] hover:bg-[#00d4ff]/30 border border-[#00d4ff]/50 transition-colors disabled:opacity-50 font-medium"
          >
            {hook.isGenerating ? '生成中...' : '生成并应用'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RandomGeneratorModal;
