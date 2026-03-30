/**
 * Community Gallery Panel
 * 
 * A gallery panel where users can browse community-created machines,
 * search/filter results, and load machines into the editor.
 */

import { useCallback, useEffect, useState } from 'react';
import { useCommunityStore } from '../../store/useCommunityStore';
import { useMachineStore } from '../../store/useMachineStore';
import { CommunityMachine, FactionFilter, RarityFilter, SortOption } from '../../data/communityGalleryData';
import { FACTIONS, FactionId } from '../../types/factions';
import { Rarity } from '../../types';

// Rarity display config
const RARITY_CONFIG: Record<Rarity, { color: string; label: string }> = {
  common: { color: '#9ca3af', label: 'Common' },
  uncommon: { color: '#22c55e', label: 'Uncommon' },
  rare: { color: '#3b82f6', label: 'Rare' },
  epic: { color: '#a855f7', label: 'Epic' },
  legendary: { color: '#f59e0b', label: 'Legendary' },
};

// Format relative time
function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

// Format number with K suffix
function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

// Mini machine preview SVG
function MachinePreview({ machine }: { machine: CommunityMachine }) {
  const faction = FACTIONS[machine.dominantFaction];
  const previewWidth = 160;
  const previewHeight = 100;

  // Calculate bounding box
  if (machine.modules.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0e17]">
        <span className="text-xs text-[#4a5568]">Empty</span>
      </div>
    );
  }

  const xPositions = machine.modules.map((m) => m.x);
  const yPositions = machine.modules.map((m) => m.y);
  const minX = Math.min(...xPositions);
  const minY = Math.min(...yPositions);
  const maxX = Math.max(...xPositions) + 60;
  const maxY = Math.max(...yPositions) + 60;
  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;
  const scale = Math.min((previewWidth - 20) / contentWidth, (previewHeight - 20) / contentHeight, 1);
  const offsetX = (previewWidth - contentWidth * scale) / 2 - minX * scale;
  const offsetY = (previewHeight - contentHeight * scale) / 2 - minY * scale;

  return (
    <svg width={previewWidth} height={previewHeight} className="block">
      <rect width={previewWidth} height={previewHeight} fill="#0a0e17" />
      {/* Draw connections */}
      {machine.connections.map((conn) => {
        const sourceModule = machine.modules.find((m) => m.instanceId === conn.sourceModuleId);
        const targetModule = machine.modules.find((m) => m.instanceId === conn.targetModuleId);
        if (!sourceModule || !targetModule) return null;

        const sx = sourceModule.x * scale + offsetX + 40 * scale;
        const sy = sourceModule.y * scale + offsetY + 40 * scale;
        const tx = targetModule.x * scale + offsetX + 40 * scale;
        const ty = targetModule.y * scale + offsetY + 40 * scale;

        return (
          <line
            key={conn.id}
            x1={sx}
            y1={sy}
            x2={tx}
            y2={ty}
            stroke={faction.color}
            strokeWidth={1.5 * scale}
            opacity={0.6}
          />
        );
      })}
      {/* Draw modules */}
      {machine.modules.map((mod) => {
        const mx = mod.x * scale + offsetX;
        const my = mod.y * scale + offsetY;
        const size = Math.max(20 * scale, 16);
        return (
          <rect
            key={mod.id}
            x={mx + 40 * scale - size / 2}
            y={my + 40 * scale - size / 2}
            width={size}
            height={size}
            fill={faction.color}
            opacity={0.8}
            rx={2}
          />
        );
      })}
    </svg>
  );
}

// Individual machine card
function MachineCard({
  machine,
  onLoad,
  onLike,
}: {
  machine: CommunityMachine;
  onLoad: (m: CommunityMachine) => void;
  onLike: (id: string) => void;
}) {
  const faction = FACTIONS[machine.dominantFaction];
  const rarityCfg = RARITY_CONFIG[machine.attributes.rarity];
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLiked) {
      onLike(machine.id);
      setIsLiked(true);
    }
  };

  return (
    <div
      className="bg-[#121826] border border-[#1e2a42] rounded-xl overflow-hidden hover:border-[#00d4ff]/40 transition-all group cursor-pointer"
      onClick={() => onLoad(machine)}
      role="article"
      aria-label={`${machine.attributes.name} by ${machine.author}`}
    >
      {/* Preview */}
      <div className="relative">
        <MachinePreview machine={machine} />
        {/* Rarity badge */}
        <div
          className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold"
          style={{ backgroundColor: rarityCfg.color + '30', color: rarityCfg.color }}
        >
          {rarityCfg.label}
        </div>
        {/* Faction indicator */}
        <div
          className="absolute top-2 left-2 w-2 h-2 rounded-full"
          style={{ backgroundColor: faction.color, boxShadow: `0 0 6px ${faction.color}` }}
          title={faction.nameCn}
        />
      </div>

      {/* Info */}
      <div className="p-3">
        {/* Name */}
        <h3 className="text-sm font-bold text-white truncate mb-1" title={machine.attributes.name}>
          {machine.attributes.name}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {machine.attributes.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{ backgroundColor: faction.color + '20', color: faction.color }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Author and time */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-[#6b7280]">
            by <span className="text-[#9ca3af]">{machine.authorName || machine.author}</span>
          </span>
          <span className="text-[10px] text-[#6b7280]">{formatRelativeTime(machine.publishedAt)}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Like button */}
            <button
              onClick={handleLike}
              disabled={isLiked}
              className={`flex items-center gap-1 text-[11px] transition-colors ${
                isLiked ? 'text-[#ef4444]' : 'text-[#6b7280] hover:text-[#ef4444]'
              }`}
              aria-label={`Like ${machine.attributes.name} - ${machine.likes + (isLiked ? 1 : 0)} likes`}
            >
              <span>{isLiked ? '❤️' : '🤍'}</span>
              <span>{formatCount(machine.likes + (isLiked ? 1 : 0))}</span>
            </button>
            {/* View count */}
            <span className="flex items-center gap-1 text-[11px] text-[#6b7280]">
              <span>👁</span>
              <span>{formatCount(machine.views)}</span>
            </span>
          </div>
          {/* Load button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLoad(machine);
            }}
            className="px-2 py-1 rounded text-[11px] font-medium bg-[#00d4ff]/20 text-[#00d4ff] hover:bg-[#00d4ff]/40 transition-colors"
            aria-label={`Load ${machine.attributes.name} into editor`}
          >
            Load
          </button>
        </div>
      </div>
    </div>
  );
}

// Empty state
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">🔍</div>
      <h3 className="text-lg font-bold text-white mb-2">
        {hasFilters ? 'No machines found' : 'No machines yet'}
      </h3>
      <p className="text-sm text-[#6b7280] max-w-xs">
        {hasFilters
          ? 'Try adjusting your search or filters to find more community machines.'
          : 'Be the first to publish a machine to the community gallery!'}
      </p>
    </div>
  );
}

export function CommunityGallery() {
  const communityMachines = useCommunityStore((s) => s.communityMachines);
  const publishedMachines = useCommunityStore((s) => s.publishedMachines);
  const getFilteredMachinesList = useCommunityStore((s) => s.getFilteredMachinesList);
  const searchQuery = useCommunityStore((s) => s.searchQuery);
  const factionFilter = useCommunityStore((s) => s.factionFilter);
  const rarityFilter = useCommunityStore((s) => s.rarityFilter);
  const sortOption = useCommunityStore((s) => s.sortOption);
  const setSearchQuery = useCommunityStore((s) => s.setSearchQuery);
  const setFactionFilter = useCommunityStore((s) => s.setFactionFilter);
  const setRarityFilter = useCommunityStore((s) => s.setRarityFilter);
  const setSortOption = useCommunityStore((s) => s.setSortOption);
  const closeGallery = useCommunityStore((s) => s.closeGallery);
  const likeMachine = useCommunityStore((s) => s.likeMachine);
  const viewMachine = useCommunityStore((s) => s.viewMachine);

  const loadMachine = useMachineStore((s) => s.loadMachine);
  const modules = useMachineStore((s) => s.modules);

  const [confirmLoad, setConfirmLoad] = useState<CommunityMachine | null>(null);
  const filteredMachines = getFilteredMachinesList();
  const hasFilters = searchQuery !== '' || factionFilter !== 'all' || rarityFilter !== 'all';

  const totalCount = communityMachines.length + publishedMachines.length;

  const handleLoadMachine = useCallback(
    (machine: CommunityMachine) => {
      if (modules.length > 0) {
        // Show confirmation dialog
        setConfirmLoad(machine);
      } else {
        // No modules in workspace, load directly
        loadMachine(machine.modules, machine.connections);
        viewMachine(machine.id);
        closeGallery();
      }
    },
    [modules.length, loadMachine, viewMachine, closeGallery]
  );

  const handleConfirmLoad = useCallback(() => {
    if (confirmLoad) {
      loadMachine(confirmLoad.modules, confirmLoad.connections);
      viewMachine(confirmLoad.id);
      setConfirmLoad(null);
      closeGallery();
    }
  }, [confirmLoad, loadMachine, viewMachine, closeGallery]);

  const handleCancelLoad = useCallback(() => {
    setConfirmLoad(null);
  }, []);

  // Track views when gallery opens
  useEffect(() => {
    filteredMachines.forEach((m) => {
      viewMachine(m.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div
          className="w-full max-w-4xl max-h-[85vh] bg-[#0a0e17] border border-[#1e2a42] rounded-2xl flex flex-col overflow-hidden shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-label="Community Gallery"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a42] bg-[#121826]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#7c3aed]/20 flex items-center justify-center">
                <span className="text-lg">🌐</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Community Gallery</h2>
                <p className="text-xs text-[#6b7280]">{totalCount} machines shared by the community</p>
              </div>
            </div>
            <button
              onClick={closeGallery}
              className="w-8 h-8 rounded-full bg-[#1e2a42] hover:bg-[#2d3a56] flex items-center justify-center text-[#9ca3af] hover:text-white transition-colors"
              aria-label="Close community gallery"
            >
              ✕
            </button>
          </div>

          {/* Filters */}
          <div className="px-6 py-3 border-b border-[#1e2a42] bg-[#0a0e17] space-y-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search machines, authors, tags..."
                className="w-full bg-[#121826] border border-[#1e2a42] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-[#4a5568] focus:outline-none focus:border-[#7c3aed] transition-colors"
                aria-label="Search community machines"
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

            {/* Filter row */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Faction filter */}
              <select
                value={factionFilter}
                onChange={(e) => setFactionFilter(e.target.value as FactionFilter)}
                className="bg-[#121826] border border-[#1e2a42] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#7c3aed] transition-colors cursor-pointer"
                aria-label="Filter by faction"
              >
                <option value="all">⚔ All Factions</option>
                {(Object.keys(FACTIONS) as FactionId[]).map((fid) => (
                  <option key={fid} value={fid}>
                    {FACTIONS[fid].icon} {FACTIONS[fid].nameCn}
                  </option>
                ))}
              </select>

              {/* Rarity filter */}
              <select
                value={rarityFilter}
                onChange={(e) => setRarityFilter(e.target.value as RarityFilter)}
                className="bg-[#121826] border border-[#1e2a42] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#7c3aed] transition-colors cursor-pointer"
                aria-label="Filter by rarity"
              >
                <option value="all">✨ All Rarities</option>
                {(Object.keys(RARITY_CONFIG) as Rarity[]).map((r) => (
                  <option key={r} value={r}>
                    {RARITY_CONFIG[r].label}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="bg-[#121826] border border-[#1e2a42] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#7c3aed] transition-colors cursor-pointer ml-auto"
                aria-label="Sort machines"
              >
                <option value="newest">🕐 Newest First</option>
                <option value="most-liked">❤️ Most Liked</option>
                <option value="most-viewed">👁 Most Viewed</option>
              </select>
            </div>
          </div>

          {/* Machine Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredMachines.length === 0 ? (
              <EmptyState hasFilters={hasFilters} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMachines.map((machine) => (
                  <MachineCard
                    key={machine.id}
                    machine={machine}
                    onLoad={handleLoadMachine}
                    onLike={likeMachine}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-[#1e2a42] bg-[#121826] flex items-center justify-between">
            <p className="text-xs text-[#6b7280]">
              Showing {filteredMachines.length} of {totalCount} machines
              {publishedMachines.length > 0 && (
                <span className="ml-2 text-[#7c3aed]">
                  ({publishedMachines.length} published this session)
                </span>
              )}
            </p>
            <p className="text-xs text-[#4a5568]">
              Published machines are session-scoped only
            </p>
          </div>
        </div>
      </div>

      {/* Load confirmation modal */}
      {confirmLoad && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[#121826] border border-[#7c3aed]/40 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Load Community Machine?</h3>
            <p className="text-sm text-[#9ca3af] mb-4">
              Loading <strong className="text-white">{confirmLoad.attributes.name}</strong> will replace your current workspace. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelLoad}
                className="flex-1 px-4 py-2 bg-[#1e2a42] text-white rounded-lg hover:bg-[#2d3a56] transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLoad}
                className="flex-1 px-4 py-2 bg-[#7c3aed] text-white rounded-lg hover:bg-[#6d28d9] transition-colors text-sm font-medium"
              >
                Load Machine
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CommunityGallery;
