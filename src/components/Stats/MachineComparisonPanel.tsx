/**
 * Machine Comparison Panel Component
 * 
 * Displays side-by-side comparison of two selected machines.
 * AC1: Machine comparison panel renders correctly with attribute differences.
 */

import React, { useState } from 'react';
import { useComparisonStore, useSavedComparisons } from '../../store/useComparisonStore';
import { useCodexStore } from '../../store/useCodexStore';
import { compareMachines, RARITY_COLORS, RARITY_LABELS } from '../../utils/statisticsAnalyzer';
import { CodexEntry } from '../../types';

interface MachineComparisonPanelProps {
  onClose?: () => void;
}

export const MachineComparisonPanel: React.FC<MachineComparisonPanelProps> = ({ onClose }) => {
  const codexEntries = useCodexStore((state) => state.entries);
  const selectedMachineA = useComparisonStore((state) => state.selectedMachineA);
  const selectedMachineB = useComparisonStore((state) => state.selectedMachineB);
  const selectMachineA = useComparisonStore((state) => state.selectMachineA);
  const selectMachineB = useComparisonStore((state) => state.selectMachineB);
  const swapMachines = useComparisonStore((state) => state.swapMachines);
  const clearSelection = useComparisonStore((state) => state.clearSelection);
  const saveComparison = useComparisonStore((state) => state.saveComparison);
  const savedComparisons = useSavedComparisons();
  const removeComparison = useComparisonStore((state) => state.removeComparison);
  const loadComparison = useComparisonStore((state) => state.loadComparison);

  const [showMachineSelector, setShowMachineSelector] = useState<'A' | 'B' | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [comparisonName, setComparisonName] = useState('');

  const hasBothSelected = selectedMachineA !== null && selectedMachineB !== null;
  const comparison = hasBothSelected ? compareMachines(selectedMachineA!, selectedMachineB!) : null;

  const handleSelectMachine = (entry: CodexEntry) => {
    if (showMachineSelector === 'A') {
      selectMachineA(entry);
    } else if (showMachineSelector === 'B') {
      selectMachineB(entry);
    }
    setShowMachineSelector(null);
  };

  const handleSaveComparison = () => {
    if (comparisonName.trim()) {
      saveComparison(comparisonName.trim());
    } else {
      saveComparison();
    }
    setSaveDialogOpen(false);
    setComparisonName('');
  };

  return (
    <div
      data-testid="machine-comparison-panel"
      className="fixed inset-0 z-[1060] flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl mx-4 my-8 bg-gradient-to-br from-[#1a1a2e] via-[#121826] to-[#0a0e17] rounded-2xl border border-[#a855f7]/30 shadow-2xl shadow-purple-900/20 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#a855f7] via-[#22d3ee] to-[#a855f7]" />

        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#a855f7]/20 flex items-center justify-center text-xl">
                ⚖️
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">机器对比</h2>
                <p className="text-sm text-[#9ca3af]">
                  选择两台机器进行对比分析
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasBothSelected && (
                <button
                  data-testid="save-comparison-button"
                  onClick={() => setSaveDialogOpen(true)}
                  className="px-3 py-2 rounded-lg bg-[#a855f7]/20 text-[#a855f7] hover:bg-[#a855f7]/30 transition-colors text-sm"
                >
                  保存对比
                </button>
              )}
              {onClose && (
                <button
                  data-testid="comparison-close-button"
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-[#6b7280] hover:text-white"
                  aria-label="关闭"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 5l10 10M15 5l-10 10" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Machine Selection Area */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-4">
            {/* Machine A Selection */}
            <div className="flex-1">
              <button
                data-testid="select-machine-a-button"
                onClick={() => setShowMachineSelector('A')}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  selectedMachineA
                    ? 'border-[#22c55e] bg-[#22c55e]/10'
                    : 'border-dashed border-[#1e2a42] hover:border-[#22c55e]/50'
                }`}
              >
                {selectedMachineA ? (
                  <div className="text-left">
                    <div 
                      data-testid="machine-a-name"
                      className="font-bold text-white"
                      style={{ color: RARITY_COLORS[selectedMachineA.rarity] }}
                    >
                      {selectedMachineA.name}
                    </div>
                    <div className="text-xs text-[#9ca3af] mt-1">
                      {selectedMachineA.modules.length} 模块 · {selectedMachineA.connections.length} 连接
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-[#6b7280]">
                    <span className="text-2xl block mb-1">📦</span>
                    <span>选择机器 A</span>
                  </div>
                )}
              </button>
            </div>

            {/* Swap Button */}
            <button
              data-testid="swap-machines-button"
              onClick={swapMachines}
              disabled={!hasBothSelected}
              className={`p-3 rounded-lg transition-colors ${
                hasBothSelected
                  ? 'bg-[#1e2a42] hover:bg-[#22c55e]/20 text-[#22c55e]'
                  : 'bg-[#0a0e17] text-[#4a5568] cursor-not-allowed'
              }`}
              title="交换机器"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 5l-4 5 4 5M13 15l4-5-4-5M3 10h14" />
              </svg>
            </button>

            {/* Machine B Selection */}
            <div className="flex-1">
              <button
                data-testid="select-machine-b-button"
                onClick={() => setShowMachineSelector('B')}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  selectedMachineB
                    ? 'border-[#3b82f6] bg-[#3b82f6]/10'
                    : 'border-dashed border-[#1e2a42] hover:border-[#3b82f6]/50'
                }`}
              >
                {selectedMachineB ? (
                  <div className="text-left">
                    <div 
                      data-testid="machine-b-name"
                      className="font-bold text-white"
                      style={{ color: RARITY_COLORS[selectedMachineB.rarity] }}
                    >
                      {selectedMachineB.name}
                    </div>
                    <div className="text-xs text-[#9ca3af] mt-1">
                      {selectedMachineB.modules.length} 模块 · {selectedMachineB.connections.length} 连接
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-[#6b7280]">
                    <span className="text-2xl block mb-1">📦</span>
                    <span>选择机器 B</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {hasBothSelected && (
            <button
              data-testid="clear-selection-button"
              onClick={clearSelection}
              className="mt-3 text-sm text-[#6b7280] hover:text-white transition-colors"
            >
              清除选择
            </button>
          )}
        </div>

        {/* Comparison Results */}
        {comparison && (
          <div className="px-6 pb-6">
            <div 
              data-testid="comparison-results"
              className="p-6 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42]"
            >
              <h3 className="text-lg font-bold text-white mb-4">属性对比</h3>
              
              <div className="space-y-4">
                {/* Score Comparison */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#9ca3af] w-24">综合评分</span>
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-1 text-right">
                      <span className="text-lg font-bold text-[#22c55e]">
                        {comparison.machineA.score.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-20 text-center">
                      <span 
                        data-testid="score-diff"
                        className={`text-sm font-bold ${
                          comparison.differences.scoreDiff > 0 
                            ? 'text-[#22c55e]' 
                            : comparison.differences.scoreDiff < 0 
                            ? 'text-[#ef4444]' 
                            : 'text-[#9ca3af]'
                        }`}
                      >
                        {comparison.differences.scoreDiff > 0 ? '+' : ''}
                        {comparison.differences.scoreDiff.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-lg font-bold text-[#3b82f6]">
                        {comparison.machineB.score.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stability Comparison */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#9ca3af] w-24">稳定性</span>
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-1 text-right">
                      <span className="text-lg font-bold text-[#22c55e]">
                        {comparison.machineA.stability}
                      </span>
                    </div>
                    <div className="w-20 text-center">
                      <span 
                        data-testid="stability-diff"
                        className={`text-sm font-bold ${
                          comparison.differences.stabilityDiff > 0 
                            ? 'text-[#22c55e]' 
                            : comparison.differences.stabilityDiff < 0 
                            ? 'text-[#ef4444]' 
                            : 'text-[#9ca3af]'
                        }`}
                      >
                        {comparison.differences.stabilityDiff > 0 ? '+' : ''}
                        {comparison.differences.stabilityDiff}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-lg font-bold text-[#3b82f6]">
                        {comparison.machineB.stability}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Power Comparison */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#9ca3af] w-24">功率输出</span>
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-1 text-right">
                      <span className="text-lg font-bold text-[#22c55e]">
                        {comparison.machineA.power}
                      </span>
                    </div>
                    <div className="w-20 text-center">
                      <span 
                        data-testid="power-diff"
                        className={`text-sm font-bold ${
                          comparison.differences.powerDiff > 0 
                            ? 'text-[#22c55e]' 
                            : comparison.differences.powerDiff < 0 
                            ? 'text-[#ef4444]' 
                            : 'text-[#9ca3af]'
                        }`}
                      >
                        {comparison.differences.powerDiff > 0 ? '+' : ''}
                        {comparison.differences.powerDiff}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-lg font-bold text-[#3b82f6]">
                        {comparison.machineB.power}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Energy Cost Comparison */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#9ca3af] w-24">能耗</span>
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-1 text-right">
                      <span className="text-lg font-bold text-[#22c55e]">
                        {comparison.machineA.energyCost.toFixed(1)}
                      </span>
                    </div>
                    <div className="w-20 text-center">
                      <span 
                        data-testid="energy-cost-diff"
                        className={`text-sm font-bold ${
                          comparison.differences.energyCostDiff > 0 
                            ? 'text-[#ef4444]' 
                            : comparison.differences.energyCostDiff < 0 
                            ? 'text-[#22c55e]' 
                            : 'text-[#9ca3af]'
                        }`}
                      >
                        {comparison.differences.energyCostDiff > 0 ? '+' : ''}
                        {comparison.differences.energyCostDiff.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-lg font-bold text-[#3b82f6]">
                        {comparison.machineB.energyCost.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Machine Selector Modal */}
        {showMachineSelector && (
          <div
            className="absolute inset-0 bg-black/60 flex items-center justify-center z-10"
            onClick={() => setShowMachineSelector(null)}
          >
            <div
              className="w-full max-w-md mx-4 bg-[#1a1a2e] rounded-xl border border-[#1e2a42] p-4 max-h-[60vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-white mb-4">
                选择机器 {showMachineSelector}
              </h3>
              
              {codexEntries.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#6b7280]">图鉴中暂无机器</p>
                  <p className="text-xs text-[#4a5568] mt-1">请先保存一些机器到图鉴</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {codexEntries.map((entry) => (
                    <button
                      key={entry.id}
                      data-testid={`select-machine-option-${entry.id}`}
                      onClick={() => handleSelectMachine(entry)}
                      disabled={
                        (showMachineSelector === 'A' && selectedMachineB?.id === entry.id) ||
                        (showMachineSelector === 'B' && selectedMachineA?.id === entry.id)
                      }
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        (showMachineSelector === 'A' && selectedMachineB?.id === entry.id) ||
                        (showMachineSelector === 'B' && selectedMachineA?.id === entry.id)
                          ? 'bg-[#1e2a42]/50 text-[#4a5568] cursor-not-allowed'
                          : 'bg-[#0a0e17] hover:bg-[#22c55e]/10 text-white'
                      }`}
                    >
                      <div 
                        className="font-bold"
                        style={{ color: RARITY_COLORS[entry.rarity] }}
                      >
                        {entry.name}
                      </div>
                      <div className="text-xs text-[#6b7280] mt-1">
                        {RARITY_LABELS[entry.rarity]} · {entry.modules.length} 模块 · 
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Save Comparison Dialog */}
        {saveDialogOpen && (
          <div
            className="absolute inset-0 bg-black/60 flex items-center justify-center z-10"
            onClick={() => setSaveDialogOpen(false)}
          >
            <div
              className="w-full max-w-sm mx-4 bg-[#1a1a2e] rounded-xl border border-[#1e2a42] p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-white mb-4">保存对比</h3>
              
              <input
                type="text"
                data-testid="comparison-name-input"
                value={comparisonName}
                onChange={(e) => setComparisonName(e.target.value)}
                placeholder="输入对比名称（可选）"
                className="w-full px-3 py-2 rounded-lg bg-[#0a0e17] border border-[#1e2a42] text-white placeholder-[#6b7280] focus:outline-none focus:border-[#a855f7]"
              />
              
              <div className="flex gap-2 mt-4">
                <button
                  data-testid="cancel-save-button"
                  onClick={() => setSaveDialogOpen(false)}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#1e2a42] text-[#9ca3af] hover:bg-[#1e2a42]/80 transition-colors"
                >
                  取消
                </button>
                <button
                  data-testid="confirm-save-button"
                  onClick={handleSaveComparison}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#a855f7] text-white hover:bg-[#a855f7]/80 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Saved Comparisons List (P1) */}
        {savedComparisons.length > 0 && (
          <div className="px-6 pb-6">
            <h3 className="text-sm font-medium text-[#9ca3af] mb-3">已保存的对比</h3>
            <div className="flex flex-wrap gap-2">
              {savedComparisons.map((comp) => (
                <button
                  key={comp.id}
                  data-testid={`saved-comparison-${comp.id}`}
                  onClick={() => loadComparison(comp.id)}
                  className="px-3 py-2 rounded-lg bg-[#1e2a42] hover:bg-[#a855f7]/20 text-sm text-white transition-colors flex items-center gap-2"
                >
                  <span>{comp.name || '未命名对比'}</span>
                  <span
                    className="text-[#6b7280] hover:text-[#ef4444] transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeComparison(comp.id);
                    }}
                  >
                    ×
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MachineComparisonPanel;
