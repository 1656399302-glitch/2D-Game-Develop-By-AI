/**
 * Collection Statistics Panel Component
 * 
 * Displays visual statistics about the user's machine collection:
 * - Rarity distribution (pie/bar chart)
 * - Faction composition breakdown
 * - Module usage statistics
 * - Collection completion percentage
 * - Average machine complexity
 */

import { useMemo, useEffect } from 'react';
import { useCodexStore } from '../../store/useCodexStore';
import { useMachineTagsStore } from '../../store/useMachineTagsStore';
import { Rarity, ModuleType } from '../../types';
import { FACTIONS, FactionId } from '../../types/factions';

// Rarity display config
const RARITY_CONFIG: Record<Rarity, { color: string; label: string; icon: string }> = {
  common: { color: '#9ca3af', label: 'Common', icon: '⚪' },
  uncommon: { color: '#22c55e', label: 'Uncommon', icon: '🟢' },
  rare: { color: '#3b82f6', label: 'Rare', icon: '🔵' },
  epic: { color: '#a855f7', label: 'Epic', icon: '🟣' },
  legendary: { color: '#f59e0b', label: 'Legendary', icon: '🟡' },
};

// Faction colors
const FACTION_COLORS: Record<string, string> = {
  arcane: '#a855f7',
  void: '#7c3aed',
  inferno: '#f97316',
  storm: '#22d3ee',
  stellar: '#fcd34d',
  temporal: '#22d3ee',
  dimensional: '#06b6d4',
};

// Module type labels
const MODULE_LABELS: Record<ModuleType, string> = {
  'core-furnace': 'Core Furnace',
  'energy-pipe': 'Energy Pipe',
  'gear': 'Gear',
  'rune-node': 'Rune Node',
  'shield-shell': 'Shield Shell',
  'trigger-switch': 'Trigger Switch',
  'output-array': 'Output Array',
  'amplifier-crystal': 'Amplifier Crystal',
  'stabilizer-core': 'Stabilizer Core',
  'void-siphon': 'Void Siphon',
  'phase-modulator': 'Phase Modulator',
  'resonance-chamber': 'Resonance Chamber',
  'fire-crystal': 'Fire Crystal',
  'lightning-conductor': 'Lightning Conductor',
  'void-arcane-gear': 'Void Arcane Gear',
  'inferno-blazing-core': 'Inferno Blazing Core',
  'storm-thundering-pipe': 'Storm Thundering Pipe',
  'stellar-harmonic-crystal': 'Stellar Harmonic Crystal',
  'temporal-distorter': 'Temporal Distorter',
  'arcane-matrix-grid': 'Arcane Matrix Grid',
  'ether-infusion-chamber': 'Ether Infusion Chamber',
};

// Bar Chart Component
function BarChart({ 
  data, 
  maxValue,
}: { 
  data: Array<{ label: string; value: number; color: string }>;
  maxValue: number;
}) {
  if (data.length === 0) return null;
  
  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="w-24 text-sm text-[#9ca3af] truncate">{item.label}</div>
          <div className="flex-1 h-6 bg-[#1e2a42] rounded overflow-hidden">
            <div
              className="h-full transition-all duration-500 flex items-center justify-end pr-2"
              style={{
                width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                backgroundColor: item.color,
                minWidth: item.value > 0 ? '24px' : '0',
              }}
            >
              {item.value > 0 && (
                <span className="text-xs font-bold text-white whitespace-nowrap">
                  {item.value}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Pie Chart Component (simplified)
function PieChart({ 
  data,
  size = 120,
}: { 
  data: Array<{ label: string; value: number; color: string }>;
  size?: number;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0) {
    return (
      <div 
        className="rounded-full bg-[#1e2a42] flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-xs text-[#6b7280]">No data</span>
      </div>
    );
  }
  
  // Create SVG segments
  const segments: Array<{
    path: string;
    color: string;
    label: string;
    percentage: number;
  }> = [];
  
  let currentAngle = 0;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 5;
  
  data.forEach((item) => {
    const percentage = item.value / total;
    const angle = percentage * 360;
    
    if (angle > 0) {
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);
      
      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY + radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY + radius * Math.sin(endRad);
      
      const largeArc = angle > 180 ? 1 : 0;
      
      const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      
      segments.push({
        path,
        color: item.color,
        label: item.label,
        percentage: Math.round(percentage * 100),
      });
      
      currentAngle = endAngle;
    }
  });
  
  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size}>
        {segments.map((seg, i) => (
          <path
            key={i}
            d={seg.path}
            fill={seg.color}
            stroke="#0a0e17"
            strokeWidth="2"
            className="hover:opacity-80 transition-opacity cursor-pointer"
          >
            <title>{`${seg.label}: ${seg.percentage}%`}</title>
          </path>
        ))}
        {/* Center circle for donut effect */}
        <circle cx={centerX} cy={centerY} r={radius * 0.5} fill="#121826" />
      </svg>
      
      {/* Legend */}
      <div className="space-y-1">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[#9ca3af]">{item.label}</span>
            <span className="text-white font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  icon,
  color,
  subtext,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  subtext?: string;
}) {
  return (
    <div
      className="p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42]"
      style={{
        boxShadow: `0 0 20px ${color}10`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-[#9ca3af]">{label}</span>
        <span className="text-xl" aria-hidden="true">{icon}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className="text-3xl font-bold"
          style={{ color }}
        >
          {value}
        </span>
        {subtext && (
          <span className="text-sm text-[#6b7280]">{subtext}</span>
        )}
      </div>
    </div>
  );
}

interface CollectionStatsPanelProps {
  onClose?: () => void;
}

export function CollectionStatsPanel({ onClose }: CollectionStatsPanelProps) {
  // Get codex entries
  const entries = useCodexStore((state) => state.entries);
  const getMachineTags = useMachineTagsStore((s) => s.getAllTags);
  const allTags = getMachineTags();
  
  // Calculate statistics
  const stats = useMemo(() => {
    const totalMachines = entries.length;
    
    // Rarity distribution
    const rarityDistribution: Record<Rarity, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    };
    
    // Faction distribution
    const factionDistribution: Record<string, number> = {};
    
    // Module usage
    const moduleUsage: Record<string, number> = {};
    
    let totalModules = 0;
    let totalConnections = 0;
    
    entries.forEach((entry) => {
      // Count rarity
      rarityDistribution[entry.rarity]++;
      
      // Count modules and connections
      totalModules += entry.modules.length;
      totalConnections += entry.connections.length;
      
      // Count module types
      entry.modules.forEach((mod) => {
        moduleUsage[mod.type] = (moduleUsage[mod.type] || 0) + 1;
      });
      
      // Infer faction from tags
      const factionTags = entry.attributes.tags.filter((tag) =>
        ['arcane', 'void', 'inferno', 'storm', 'stellar', 'temporal', 'dimensional'].includes(tag)
      );
      if (factionTags.length > 0) {
        factionDistribution[factionTags[0]] = (factionDistribution[factionTags[0]] || 0) + 1;
      }
    });
    
    // Calculate average complexity
    const averageComplexity = totalMachines > 0 ? (totalModules / totalMachines).toFixed(1) : '0';
    
    // Calculate completion percentage (based on unique module types collected)
    const uniqueModulesUsed = Object.keys(moduleUsage).length;
    const totalPossibleModules = Object.keys(MODULE_LABELS).length;
    const completionPercentage = Math.round((uniqueModulesUsed / totalPossibleModules) * 100);
    
    return {
      totalMachines,
      rarityDistribution,
      factionDistribution,
      moduleUsage,
      averageComplexity,
      completionPercentage,
      totalModules,
      totalConnections,
    };
  }, [entries]);
  
  // Prepare rarity chart data
  const rarityChartData = Object.entries(stats.rarityDistribution)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      label: RARITY_CONFIG[key as Rarity].label,
      value,
      color: RARITY_CONFIG[key as Rarity].color,
    }))
    .sort((a, b) => {
      const order = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
      return order.indexOf(a.label.toLowerCase()) - order.indexOf(b.label.toLowerCase());
    });
  
  // Prepare faction chart data
  const factionChartData = Object.entries(stats.factionDistribution)
    .map(([key, value]) => ({
      label: FACTIONS[key as FactionId]?.nameCn || key,
      value,
      color: FACTION_COLORS[key] || '#6b7280',
    }))
    .sort((a, b) => b.value - a.value);
  
  // Prepare module usage chart data (top 10)
  const moduleChartData = Object.entries(stats.moduleUsage)
    .map(([key, value]) => ({
      label: MODULE_LABELS[key as ModuleType] || key,
      value,
      color: '#00d4ff',
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
  
  const maxModuleValue = Math.max(...moduleChartData.map((d) => d.value), 1);
  const maxRarityValue = Math.max(...rarityChartData.map((d) => d.value), 1);
  
  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  return (
    <div
      className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl mx-4 my-8 bg-gradient-to-br from-[#1a1a2e] via-[#121826] to-[#0a0e17] rounded-2xl border border-[#00d4ff]/30 shadow-2xl shadow-cyan-900/20 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00d4ff] via-[#7c3aed] to-[#00d4ff]" />

        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#00d4ff]/20 flex items-center justify-center text-xl">
                📊
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Collection Statistics</h2>
                <p className="text-sm text-[#9ca3af]">
                  Insights into your machine collection
                </p>
              </div>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-[#6b7280] hover:text-white"
                aria-label="Close statistics panel"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 5l10 10M15 5l-10 10" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 max-h-[70vh] overflow-y-auto space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total Machines"
              value={stats.totalMachines}
              icon="📦"
              color="#00d4ff"
            />
            <StatCard
              label="Total Modules"
              value={stats.totalModules}
              icon="⚙️"
              color="#22d3ee"
            />
            <StatCard
              label="Total Connections"
              value={stats.totalConnections}
              icon="🔗"
              color="#a855f7"
            />
            <StatCard
              label="Unique Tags"
              value={allTags.length}
              icon="🏷️"
              color="#f59e0b"
            />
          </div>

          {/* Complexity & Completion */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#9ca3af]">Average Complexity</span>
                <span className="text-lg">📏</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-[#22c55e]">
                  {stats.averageComplexity}
                </span>
                <span className="text-sm text-[#6b7280]">modules/machine</span>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#9ca3af]">Module Coverage</span>
                <span className="text-lg">🎯</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-[#a855f7]">
                  {stats.completionPercentage}%
                </span>
                <span className="text-sm text-[#6b7280] mb-1">
                  ({Object.keys(stats.moduleUsage).length}/{Object.keys(MODULE_LABELS).length} types)
                </span>
              </div>
              <div className="mt-2 h-2 bg-[#1e2a42] rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500 bg-gradient-to-r from-[#a855f7] to-[#7c3aed]"
                  style={{ width: `${stats.completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Rarity Distribution */}
          <div className="p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42]">
            <h3 className="text-sm font-medium text-[#9ca3af] mb-4">Rarity Distribution</h3>
            {rarityChartData.length === 0 ? (
              <div className="text-center py-8 text-[#6b7280]">
                <div className="text-3xl mb-2">📊</div>
                <p>No machines yet</p>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center gap-6">
                <PieChart data={rarityChartData} size={140} />
                <div className="flex-1">
                  <BarChart
                    data={rarityChartData.map((d) => ({
                      label: d.label,
                      value: d.value,
                      color: d.color,
                    }))}
                    maxValue={maxRarityValue}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Faction Composition */}
          <div className="p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42]">
            <h3 className="text-sm font-medium text-[#9ca3af] mb-4">Faction Composition</h3>
            {factionChartData.length === 0 ? (
              <div className="text-center py-8 text-[#6b7280]">
                <div className="text-3xl mb-2">⚔️</div>
                <p>No faction data yet</p>
              </div>
            ) : (
              <BarChart
                data={factionChartData.map((d) => ({
                  label: d.label,
                  value: d.value,
                  color: d.color,
                }))}
                maxValue={Math.max(...factionChartData.map((d) => d.value), 1)}
              />
            )}
          </div>

          {/* Module Usage */}
          <div className="p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42]">
            <h3 className="text-sm font-medium text-[#9ca3af] mb-4">Module Usage (Top 10)</h3>
            {moduleChartData.length === 0 ? (
              <div className="text-center py-8 text-[#6b7280]">
                <div className="text-3xl mb-2">⚙️</div>
                <p>No module usage data yet</p>
              </div>
            ) : (
              <BarChart
                data={moduleChartData}
                maxValue={maxModuleValue}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CollectionStatsPanel;
