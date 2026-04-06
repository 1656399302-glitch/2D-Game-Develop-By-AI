/**
 * Counter Panel Component
 * 
 * A dedicated panel component (sidebar-style, not modal) for viewing
 * counters with filtering, sorting, and statistics display.
 * 
 * ROUND 183: New component created for counter statistics viewing
 * Mirrors RecipePanel pattern from Round 182
 * 
 * Features:
 * - Tab-based navigation (All, Active, Overflow)
 * - Category filter dropdown (counters grouped by circuit/layer)
 * - Sort dropdown (by name, count, max value)
 * - Statistics section at top
 * - Counter list with real-time values and history
 */

import React, { useState, useMemo, useCallback } from 'react';
import { CounterStats } from './CounterStats';

// ============================================================================
// Types
// ============================================================================

export interface CounterData {
  id: string;
  label: string;
  count: number;
  maxValue: number;
  overflow: boolean;
  layerId?: string;
  layerName?: string;
  history: number[];
}

type TabType = 'all' | 'active' | 'overflow';
type SortType = 'name' | 'count' | 'maxValue';

// ============================================================================
// Compare strings for sorting (supports Chinese characters)
// ============================================================================

function compareStrings(a: string, b: string): number {
  const len = Math.min(a.length, b.length);
  
  for (let i = 0; i < len; i++) {
    const codeA = a.charCodeAt(i);
    const codeB = b.charCodeAt(i);
    if (codeA !== codeB) {
      return codeA - codeB;
    }
  }
  
  return a.length - b.length;
}

// ============================================================================
// Component
// ============================================================================

interface CounterPanelProps {
  counters: CounterData[];
  onClose?: () => void;
  onCounterClick?: (counterId: string) => void;
}

export const CounterPanel: React.FC<CounterPanelProps> = ({
  counters,
  onClose,
  onCounterClick,
}) => {
  // Tab state: 'all', 'active', 'overflow'
  const [activeTab, setActiveTab] = useState<TabType>('all');
  
  // Category filter state
  const [layerFilter, setLayerFilter] = useState<string | null>(null);
  
  // Sort state
  const [sortBy, setSortBy] = useState<SortType>('name');

  // Filter counters based on tab and layer
  const filteredCounters = useMemo(() => {
    let filtered = [...counters];
    
    // Apply tab filter
    if (activeTab === 'active') {
      filtered = filtered.filter((c) => c.count > 0);
    } else if (activeTab === 'overflow') {
      filtered = filtered.filter((c) => c.overflow);
    }
    
    // Apply layer filter
    if (layerFilter !== null) {
      filtered = filtered.filter((c) => c.layerId === layerFilter);
    }
    
    return filtered;
  }, [counters, activeTab, layerFilter]);

  // Sort counters based on sort type
  const sortedCounters = useMemo(() => {
    const sorted = [...filteredCounters];
    
    switch (sortBy) {
      case 'name':
        // Sort alphabetically by label
        sorted.sort((a, b) => compareStrings(a.label, b.label));
        break;
        
      case 'count':
        // Sort by count descending
        sorted.sort((a, b) => b.count - a.count);
        break;
        
      case 'maxValue':
        // Sort by max value descending
        sorted.sort((a, b) => b.maxValue - a.maxValue);
        break;
    }
    
    return sorted;
  }, [filteredCounters, sortBy]);

  // Get unique layers for filter dropdown
  const layers = useMemo(() => {
    const layerMap = new Map<string, string>();
    for (const counter of counters) {
      if (counter.layerId) {
        layerMap.set(counter.layerId, counter.layerName || counter.layerId);
      }
    }
    return Array.from(layerMap.entries()).map(([id, name]) => ({ id, name }));
  }, [counters]);

  // Tab click handler
  const handleTabClick = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  // Layer filter change handler
  const handleLayerChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'all') {
      setLayerFilter(null);
    } else {
      setLayerFilter(value);
    }
  }, []);

  // Sort change handler
  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortType);
  }, []);

  // Counter click handler
  const handleCounterClick = useCallback((counterId: string) => {
    onCounterClick?.(counterId);
  }, [onCounterClick]);

  return (
    <div
      className="
        fixed inset-y-0 right-0 z-[1050]
        w-full max-w-md
        bg-gradient-to-br from-[#1a1a2e] via-[#121826] to-[#0a0e17]
        border-l border-[#22c55e]/30
        shadow-2xl shadow-green-900/20
        flex flex-col
      "
      data-testid="counter-panel"
    >
      {/* Header */}
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#22c55e]/20 flex items-center justify-center text-xl">
              🔢
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">计数器</h2>
              <p className="text-sm text-[#9ca3af]">
                计数器面板
              </p>
            </div>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-[#6b7280] hover:text-white"
              aria-label="关闭"
              data-close-panel
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 5l10 10M15 5l-10 10" />
              </svg>
            </button>
          )}
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 mb-4">
          <button
            onClick={() => handleTabClick('all')}
            className={`
              flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === 'all'
                ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/40'
                : 'bg-[#0a0e17] text-[#6b7280] border border-[#1e2a42] hover:bg-[#1e2a42]'
              }
            `}
            data-testid="counter-tab-all"
          >
            全部
          </button>
          <button
            onClick={() => handleTabClick('active')}
            className={`
              flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === 'active'
                ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/40'
                : 'bg-[#0a0e17] text-[#6b7280] border border-[#1e2a42] hover:bg-[#1e2a42]'
              }
            `}
            data-testid="counter-tab-active"
          >
            激活
          </button>
          <button
            onClick={() => handleTabClick('overflow')}
            className={`
              flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === 'overflow'
                ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/40'
                : 'bg-[#0a0e17] text-[#6b7280] border border-[#1e2a42] hover:bg-[#1e2a42]'
              }
            `}
            data-testid="counter-tab-overflow"
          >
            溢出
          </button>
        </div>

        {/* Filters row */}
        <div className="flex gap-2 mb-4">
          {/* Layer filter */}
          <select
            value={layerFilter ?? 'all'}
            onChange={handleLayerChange}
            className="
              flex-1 px-3 py-2 rounded-lg text-sm
              bg-[#0a0e17] text-[#9ca3af]
              border border-[#1e2a42]
              focus:outline-none focus:border-[#22c55e]/40
              cursor-pointer
            "
            data-testid="counter-category-filter"
          >
            <option value="all">全部层</option>
            {layers.map((layer) => (
              <option key={layer.id} value={layer.id}>
                {layer.name}
              </option>
            ))}
          </select>

          {/* Sort select */}
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="
              flex-1 px-3 py-2 rounded-lg text-sm
              bg-[#0a0e17] text-[#9ca3af]
              border border-[#1e2a42]
              focus:outline-none focus:border-[#22c55e]/40
              cursor-pointer
            "
            data-testid="counter-sort-select"
          >
            <option value="name">按名称</option>
            <option value="count">按计数</option>
            <option value="maxValue">按最大值</option>
          </select>
        </div>
      </div>

      {/* Statistics section */}
      <div className="px-4 pb-4">
        <CounterStats counters={counters} />
      </div>

      {/* Counter list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4" data-testid="counter-list">
        {sortedCounters.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {sortedCounters.map((counter) => (
              <div
                key={counter.id}
                className="
                  p-4 bg-[#0a0e17]/50 rounded-xl border border-[#1e2a42]
                  hover:border-[#22c55e]/30 transition-colors cursor-pointer
                "
                onClick={() => handleCounterClick(counter.id)}
                data-testid={`counter-item-${counter.id}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{counter.label}</span>
                  {counter.overflow && (
                    <span className="px-2 py-0.5 text-xs rounded bg-[#f59e0b]/20 text-[#f59e0b]">
                      溢出
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span 
                      className={`text-2xl font-mono font-bold ${
                        counter.count > 0 ? 'text-[#22c55e]' : 'text-[#6b7280]'
                      }`}
                    >
                      {counter.count}
                    </span>
                    <span className="text-sm text-[#6b7280]">/ {counter.maxValue}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div 
                      className="w-16 h-2 bg-[#1e2a42] rounded-full overflow-hidden"
                    >
                      <div
                        className={`h-full transition-all duration-300 ${
                          counter.overflow 
                            ? 'bg-[#f59e0b]' 
                            : counter.count > 0 
                            ? 'bg-[#22c55e]' 
                            : 'bg-[#6b7280]'
                        }`}
                        style={{ width: `${Math.min((counter.count / counter.maxValue) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* History section */}
                {counter.history.length > 0 && (
                  <div 
                    className="mt-3 pt-3 border-t border-[#1e2a42]"
                    data-testid={`counter-history-${counter.id}`}
                  >
                    <span className="text-xs text-[#6b7280] mb-2 block">历史记录</span>
                    <div className="flex gap-1 flex-wrap">
                      {counter.history.map((value, index) => (
                        <span 
                          key={index}
                          className="px-2 py-0.5 text-xs font-mono bg-[#1e2a42] rounded text-[#9ca3af]"
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div 
            className="flex flex-col items-center justify-center py-12 text-center"
            data-testid="counter-empty-state"
          >
            <div className="w-16 h-16 rounded-full bg-[#1e2a42] flex items-center justify-center mb-4">
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#4a5568" 
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8" />
              </svg>
            </div>
            <p className="text-[#6b7280] text-sm">
              {activeTab === 'active' 
                ? '暂无激活的计数器' 
                : activeTab === 'overflow'
                ? '暂无溢出的计数器'
                : '暂无计数器'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CounterPanel;
