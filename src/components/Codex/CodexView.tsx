import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useCodexStore } from '../../store/useCodexStore';
import { useMachineTagsStore } from '../../store/useMachineTagsStore';
import { CodexEntry, PlacedModule, Connection, Rarity } from '../../types';
import { getRarityColor, getRarityLabel } from '../../utils/attributeGenerator';
import { MachineTagEditor } from './MachineTagEditor';
import { FactionBadge } from '../FactionBadge';
import { getComplexityDetails, getComplexityColor } from '../../utils/complexityAnalyzer';
import { MODULE_TO_FACTION, FactionId } from '../../types/factions';

interface CodexViewProps {
  onLoadToEditor: (modules: PlacedModule[], connections: Connection[]) => void;
}

type SortOption = 'newest' | 'oldest' | 'rarity' | 'name';
type FilterOption = 'all' | Rarity;

export function CodexView({ onLoadToEditor }: CodexViewProps) {
  const entries = useCodexStore((state) => state.entries);

  // FIX: Store method reference in ref
  const removeEntryRef = useRef(useCodexStore.getState().removeEntry);

  // FIX: Periodically sync ref
  useEffect(() => {
    removeEntryRef.current = useCodexStore.getState().removeEntry;
  });

  // FIX: Create stable callback using ref
  const handleDeleteEntry = useCallback((entryId: string) => {
    removeEntryRef.current(entryId);
  }, []);

  // Tag filter state
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<CodexEntry | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [editingTagsFor, setEditingTagsFor] = useState<string | null>(null);

  // Get all tags from machine tags store
  const allTags = useMachineTagsStore((s) => s.getAllTags)();
  const getTags = useMachineTagsStore((s) => s.getTags);

  const filteredAndSortedEntries = useMemo(() => {
    let result = [...entries];

    // Filter by tag first
    if (tagFilter) {
      result = result.filter((e) => {
        const entryTags = getTags(e.id);
        return entryTags.includes(tagFilter);
      });
    }

    if (filterBy !== 'all') {
      result = result.filter((e) => e.rarity === filterBy);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.codexId.toLowerCase().includes(query) ||
          e.attributes.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

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
  }, [entries, sortBy, filterBy, searchQuery, tagFilter, getTags]);

  const handleLoad = (entry: CodexEntry) => {
    onLoadToEditor(entry.modules, entry.connections);
  };

  const handleDelete = (entryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this entry from the Codex?')) {
      handleDeleteEntry(entryId);
      if (selectedEntry?.id === entryId) {
        setSelectedEntry(null);
      }
    }
  };

  const handleEditTags = (entryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTagsFor(entryId);
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

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs text-[#6b7280]">Filter by tag:</span>
              <button
                onClick={() => setTagFilter(null)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  tagFilter === null
                    ? 'bg-[#7c3aed] text-white'
                    : 'bg-[#1e2a42] text-[#9ca3af] hover:text-white'
                }`}
              >
                All
              </button>
              {allTags.slice(0, 10).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setTagFilter(tag === tagFilter ? null : tag)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    tagFilter === tag
                      ? 'bg-[#7c3aed] text-white'
                      : 'bg-[#1e2a42] text-[#9ca3af] hover:text-white'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
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
                  onEditTags={(e) => handleEditTags(entry.id, e)}
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
          onEditTags={(e) => handleEditTags(selectedEntry.id, e)}
        />
      )}

      {/* Tag Editor Modal */}
      {editingTagsFor && (
        <MachineTagEditor
          machineId={editingTagsFor}
          onClose={() => setEditingTagsFor(null)}
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
  onEditTags: (e: React.MouseEvent) => void;
}

function CodexCard({ entry, isSelected, onClick, onLoad, onDelete, onEditTags }: CodexCardProps) {
  const rarityColor = getRarityColor(entry.rarity);
  const tags = useMachineTagsStore((s) => s.getTags)(entry.id);

  // Calculate complexity tier for this entry (ROUND 81 D7)
  const complexityDetails = getComplexityDetails(entry.modules, entry.connections);
  const complexityColor = getComplexityColor(complexityDetails.tier);

  // Determine faction from modules (ROUND 81 D7)
  const dominantFaction = getDominantFaction(entry.modules);

  return (
    <div
      onClick={onClick}
      className={`arcane-card cursor-pointer transition-all relative ${
        isSelected ? 'ring-2 ring-[#00d4ff]' : ''
      }`}
      style={{ borderTopColor: rarityColor, borderTopWidth: '3px' }}
    >
      {/* Header with Faction Badge (ROUND 81 D7) */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white truncate">{entry.name}</h3>
          <p className="text-xs text-[#4a5568]">{entry.codexId}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{
              backgroundColor: `${rarityColor}20`,
              color: rarityColor,
            }}
          >
            {getRarityLabel(entry.rarity)}
          </span>
          {/* Complexity Tier Badge (ROUND 81 D7) */}
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{
              backgroundColor: `${complexityColor}20`,
              color: complexityColor,
            }}
          >
            {complexityDetails.tier}
          </span>
        </div>
      </div>

      {/* Faction Badge (ROUND 81 D7) */}
      {dominantFaction && (
        <div className="mb-3">
          <FactionBadge factionId={dominantFaction} size="sm" showTooltip={false} />
        </div>
      )}

      {/* Preview */}
      <div className="aspect-video bg-[#0a0e17] rounded mb-3 flex items-center justify-center overflow-hidden">
        <div className="text-[#1e2a42]">
          <MachinePreview modules={entry.modules} />
        </div>
      </div>

      {/* Tags (from machine tags store) */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded bg-[#7c3aed]/20 text-[#a78bfa]">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Original Tags */}
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
      <div className="absolute inset-0 bg-[#0a0e17]/90 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg flex-wrap">
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
          onClick={onEditTags}
          className="px-4 py-2 rounded-lg bg-[#7c3aed] text-white font-medium hover:bg-[#6d28d9] transition-colors"
        >
          🏷️ Tags
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
  onEditTags: (e: React.MouseEvent) => void;
}

function CodexDetailPanel({ entry, onClose, onLoad, onDelete, onEditTags }: CodexDetailPanelProps) {
  const rarityColor = getRarityColor(entry.rarity);
  const tags = useMachineTagsStore((s) => s.getTags)(entry.id);
  const addEntryToCodex = useCodexStore((s) => s.addEntry);

  // Calculate complexity tier (ROUND 81 D7)
  const complexityDetails = getComplexityDetails(entry.modules, entry.connections);
  const complexityColor = getComplexityColor(complexityDetails.tier);

  // Determine faction (ROUND 81 D7)
  const dominantFaction = getDominantFaction(entry.modules);

  // Handle duplicate (ROUND 81 D7)
  const handleDuplicate = useCallback(() => {
    // Create a copy with "(Copy)" suffix
    addEntryToCodex(
      entry.name + ' (Copy)',
      entry.modules,
      entry.connections,
      entry.attributes
    );
  }, [entry, addEntryToCodex]);

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
          <div className="flex items-center gap-2 flex-wrap">
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

        {/* Faction Badge and Complexity (ROUND 81 D7) */}
        <div className="flex items-center gap-3">
          {dominantFaction && <FactionBadge factionId={dominantFaction} size="md" />}
          <span
            className="text-sm px-3 py-1 rounded"
            style={{
              backgroundColor: `${complexityColor}20`,
              color: complexityColor,
            }}
          >
            {complexityDetails.tier}
          </span>
        </div>

        {/* Preview */}
        <div className="aspect-square bg-[#0a0e17] rounded-lg flex items-center justify-center">
          <MachinePreview modules={entry.modules} large />
        </div>

        {/* Custom Tags Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-[#a78bfa] uppercase">My Tags</h4>
            <button
              onClick={onEditTags}
              className="text-xs px-2 py-1 rounded bg-[#7c3aed]/20 text-[#a78bfa] hover:bg-[#7c3aed]/40 transition-colors"
            >
              Edit Tags
            </button>
          </div>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-sm px-3 py-1 rounded-lg bg-[#7c3aed]/20 text-[#a78bfa]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#4a5568] italic">No custom tags yet</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatItem label="Stability" value={entry.attributes.stats.stability} color="#22c55e" />
          <StatItem label="Power" value={entry.attributes.stats.powerOutput} color="#f59e0b" />
          <StatItem label="Energy" value={entry.attributes.stats.energyCost} color="#00d4ff" />
          <StatItem label="Failure" value={entry.attributes.stats.failureRate} color="#ef4444" />
        </div>

        {/* Generated Tags */}
        <div>
          <h4 className="text-xs font-medium text-[#9ca3af] uppercase mb-2">Attribute Tags</h4>
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

        {/* Complexity Details (ROUND 81 D7) */}
        <div>
          <h4 className="text-xs font-medium text-[#9ca3af] uppercase mb-2">Complexity Analysis</h4>
          <div className="bg-[#0a0e17] rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#9ca3af]">Modules:</span>
              <span className="text-white">{complexityDetails.moduleCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9ca3af]">Connections:</span>
              <span className="text-white">{complexityDetails.connectionCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9ca3af]">Density:</span>
              <span className="text-white">{complexityDetails.connectionDensity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9ca3af]">Rare Modules:</span>
              <span className="text-white">{complexityDetails.rareModuleCount}</span>
            </div>
            {complexityDetails.bonuses.length > 0 && (
              <div className="pt-2 border-t border-[#1e2a42]">
                <span className="text-[#9ca3af] block mb-1">Bonuses:</span>
                {complexityDetails.bonuses.map((bonus, i) => (
                  <span key={i} className="block text-xs text-[#a78bfa]">+ {bonus}</span>
                ))}
              </div>
            )}
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
          onClick={handleDuplicate}
          className="w-full arcane-button-secondary"
        >
          Duplicate Entry
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

/**
 * Get dominant faction from module types (ROUND 81 D7)
 */
function getDominantFaction(modules: PlacedModule[]): FactionId | null {
  const factionCounts: Record<string, number> = {};
  
  modules.forEach((module) => {
    const faction = MODULE_TO_FACTION[module.type];
    if (faction) {
      factionCounts[faction] = (factionCounts[faction] || 0) + 1;
    }
  });
  
  let dominantFaction: string | null = null;
  let maxCount = 0;
  
  Object.entries(factionCounts).forEach(([faction, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantFaction = faction;
    }
  });
  
  return dominantFaction as FactionId | null;
}

export default CodexView;
