import { useState, useMemo } from 'react';
import { useCodexStore } from '../../store/useCodexStore';
import { CodexEntry, PlacedModule, Connection, Rarity } from '../../types';
import { getRarityColor, getRarityLabel } from '../../utils/attributeGenerator';

interface CodexViewProps {
  onLoadToEditor: (modules: PlacedModule[], connections: Connection[]) => void;
}

type SortOption = 'newest' | 'oldest' | 'rarity' | 'name';
type FilterOption = 'all' | Rarity;

export function CodexView({ onLoadToEditor }: CodexViewProps) {
  const entries = useCodexStore((state) => state.entries);
  const removeEntry = useCodexStore((state) => state.removeEntry);
  
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<CodexEntry | null>(null);
  
  const filteredAndSortedEntries = useMemo(() => {
    let result = [...entries];
    
    // Filter
    if (filterBy !== 'all') {
      result = result.filter((e) => e.rarity === filterBy);
    }
    
    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.codexId.toLowerCase().includes(query) ||
          e.attributes.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }
    
    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'oldest':
        result.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case 'rarity':
        const rarityOrder: Record<Rarity, number> = {
          legendary: 0,
          epic: 1,
          rare: 2,
          uncommon: 3,
          common: 4,
        };
        result.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    
    return result;
  }, [entries, sortBy, filterBy, searchQuery]);
  
  const handleLoad = (entry: CodexEntry) => {
    onLoadToEditor(entry.modules, entry.connections);
  };
  
  const handleDelete = (entryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this entry from the Codex?')) {
      removeEntry(entryId);
      if (selectedEntry?.id === entryId) {
        setSelectedEntry(null);
      }
    }
  };
  
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Codex List */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#1e2a42]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[#00d4ff]">Machine Codex</h2>
              <p className="text-sm text-[#9ca3af]">{entries.length} machines recorded</p>
            </div>
            
            {/* Stats */}
            <div className="flex gap-4 text-sm">
              {(['common', 'uncommon', 'rare', 'epic', 'legendary'] as Rarity[]).map((rarity) => {
                const count = entries.filter((e) => e.rarity === rarity).length;
                return (
                  <div
                    key={rarity}
                    className="flex items-center gap-1"
                    style={{ color: getRarityColor(rarity) }}
                  >
                    <span className="text-xs">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Filters and Search */}
          <div className="flex gap-3">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, ID, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="arcane-input text-sm"
              />
            </div>
            
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="arcane-input text-sm w-32"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="rarity">Rarity</option>
              <option value="name">Name</option>
            </select>
            
            {/* Filter */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className="arcane-input text-sm w-32"
            >
              <option value="all">All Rarities</option>
              <option value="common">Common</option>
              <option value="uncommon">Uncommon</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
            </select>
          </div>
        </div>
        
        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredAndSortedEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4 opacity-20">📖</div>
              <h3 className="text-lg font-medium text-[#9ca3af] mb-2">
                {entries.length === 0 ? 'No Machines Recorded' : 'No Matching Results'}
              </h3>
              <p className="text-sm text-[#4a5568]">
                {entries.length === 0
                  ? 'Build a machine in the Editor and save it to the Codex'
                  : 'Try adjusting your search or filters'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAndSortedEntries.map((entry) => (
                <CodexCard
                  key={entry.id}
                  entry={entry}
                  isSelected={selectedEntry?.id === entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  onLoad={() => handleLoad(entry)}
                  onDelete={(e) => handleDelete(entry.id, e)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Detail Panel */}
      {selectedEntry && (
        <CodexDetailPanel
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onLoad={() => handleLoad(selectedEntry)}
          onDelete={(e) => handleDelete(selectedEntry.id, e)}
        />
      )}
    </div>
  );
}

interface CodexCardProps {
  entry: CodexEntry;
  isSelected: boolean;
  onClick: () => void;
  onLoad: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

function CodexCard({ entry, isSelected, onClick, onLoad, onDelete }: CodexCardProps) {
  const rarityColor = getRarityColor(entry.rarity);
  
  return (
    <div
      onClick={onClick}
      className={`arcane-card cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-[#00d4ff]' : ''
      }`}
      style={{ borderTopColor: rarityColor, borderTopWidth: '3px' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium text-white truncate">{entry.name}</h3>
          <p className="text-xs text-[#4a5568]">{entry.codexId}</p>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded"
          style={{
            backgroundColor: `${rarityColor}20`,
            color: rarityColor,
          }}
        >
          {getRarityLabel(entry.rarity)}
        </span>
      </div>
      
      {/* Preview */}
      <div className="aspect-video bg-[#0a0e17] rounded mb-3 flex items-center justify-center overflow-hidden">
        <div className="text-[#1e2a42]">
          <MachinePreview modules={entry.modules} />
        </div>
      </div>
      
      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {entry.attributes.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-xs px-2 py-0.5 rounded bg-[#1e2a42] text-[#9ca3af]">
            {tag}
          </span>
        ))}
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-[#4a5568]">
        <span>{entry.modules.length} modules</span>
        <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
      </div>
      
      {/* Hover actions */}
      <div className="absolute inset-0 bg-[#0a0e17]/90 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLoad();
          }}
          className="px-4 py-2 rounded-lg bg-[#00d4ff] text-[#0a0e17] font-medium hover:bg-[#00ffcc] transition-colors"
        >
          Load to Editor
        </button>
        <button
          onClick={onDelete}
          className="px-4 py-2 rounded-lg bg-[#ef4444] text-white font-medium hover:bg-[#dc2626] transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

interface CodexDetailPanelProps {
  entry: CodexEntry;
  onClose: () => void;
  onLoad: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

function CodexDetailPanel({ entry, onClose, onLoad, onDelete }: CodexDetailPanelProps) {
  const rarityColor = getRarityColor(entry.rarity);
  
  return (
    <div className="w-96 bg-[#121826] border-l border-[#1e2a42] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#1e2a42] flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#00d4ff]">Machine Details</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded hover:bg-[#1e2a42] flex items-center justify-center text-[#9ca3af]"
        >
          ✕
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title */}
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{entry.name}</h3>
          <div className="flex items-center gap-2">
            <span
              className="text-sm px-3 py-1 rounded"
              style={{
                backgroundColor: `${rarityColor}20`,
                color: rarityColor,
              }}
            >
              {getRarityLabel(entry.rarity)}
            </span>
            <span className="text-sm text-[#4a5568]">{entry.codexId}</span>
          </div>
        </div>
        
        {/* Preview */}
        <div className="aspect-square bg-[#0a0e17] rounded-lg flex items-center justify-center">
          <MachinePreview modules={entry.modules} large />
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatItem label="Stability" value={entry.attributes.stats.stability} color="#22c55e" />
          <StatItem label="Power" value={entry.attributes.stats.powerOutput} color="#f59e0b" />
          <StatItem label="Energy" value={entry.attributes.stats.energyCost} color="#00d4ff" />
          <StatItem label="Failure" value={entry.attributes.stats.failureRate} color="#ef4444" />
        </div>
        
        {/* Tags */}
        <div>
          <h4 className="text-xs font-medium text-[#9ca3af] uppercase mb-2">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {entry.attributes.tags.map((tag) => (
              <span
                key={tag}
                className="text-sm px-3 py-1 rounded-lg bg-[#1e2a42] text-[#e2e8f0]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        {/* Module List */}
        <div>
          <h4 className="text-xs font-medium text-[#9ca3af] uppercase mb-2">
            Modules ({entry.modules.length})
          </h4>
          <div className="space-y-1">
            {entry.modules.map((mod, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm px-3 py-2 bg-[#0a0e17] rounded"
              >
                <span className="text-[#00d4ff]">
                  {mod.type.split('-').map(w => w[0].toUpperCase()).join('')}
                </span>
                <span className="text-[#9ca3af]">{mod.type}</span>
                <span className="text-[#4a5568] ml-auto">
                  {Math.round(mod.x)}, {Math.round(mod.y)}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Description */}
        <div>
          <h4 className="text-xs font-medium text-[#9ca3af] uppercase mb-2">Description</h4>
          <p className="text-sm text-[#9ca3af] leading-relaxed">
            {entry.attributes.description}
          </p>
        </div>
        
        {/* Metadata */}
        <div className="text-xs text-[#4a5568]">
          <p>Created: {new Date(entry.createdAt).toLocaleString()}</p>
          <p>Connections: {entry.connections.length}</p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="p-4 border-t border-[#1e2a42] space-y-2">
        <button
          onClick={onLoad}
          className="w-full arcane-button"
        >
          Load to Editor
        </button>
        <button
          onClick={onDelete}
          className="w-full arcane-button-danger"
        >
          Delete from Codex
        </button>
      </div>
    </div>
  );
}

function StatItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-[#0a0e17] rounded-lg p-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[#9ca3af]">{label}</span>
        <span style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 bg-[#1e2a42] rounded overflow-hidden">
        <div
          className="h-full rounded"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function MachinePreview({ modules, large = false }: { modules: PlacedModule[]; large?: boolean }) {
  const scale = large ? 1 : 0.4;
  
  if (modules.length === 0) {
    return <span className="text-[#1e2a42] text-sm">Empty</span>;
  }
  
  return (
    <svg
      width={200 * scale}
      height={200 * scale}
      viewBox="0 0 200 200"
    >
      {modules.map((_, index) => {
        const x = 50 + (index % 3) * 50;
        const y = 50 + Math.floor(index / 3) * 60;
        return (
          <g key={index} transform={`translate(${x - 25}, ${y - 25})`}>
            <rect
              width="50"
              height="50"
              rx="4"
              fill="#1a1a2e"
              stroke="#00d4ff"
              strokeWidth="1"
            />
            <circle
              cx="25"
              cy="25"
              r="8"
              fill="#00d4ff"
              opacity="0.5"
            />
          </g>
        );
      })}
    </svg>
  );
}
