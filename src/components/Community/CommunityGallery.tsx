import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useCommunityStore } from '../../store/useCommunityStore';
import { useMachineStore } from '../../store/useMachineStore';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { CommunityMachine, FactionFilter, RarityFilter, SortOption } from '../../data/communityGalleryData';
import { FACTIONS, FactionId } from '../../types/factions';
import { Rarity } from '../../types';
import { FavoritesPanel } from '../Favorites/FavoritesPanel';

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
  onToggleFavorite,
  isFavorite,
}: {
  machine: CommunityMachine;
  onLoad: (m: CommunityMachine) => void;
  onLike: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
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

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(machine.id);
  };

  return (
    <div
      className="bg-[#121826] border border-[#1e2a42] rounded-xl overflow-hidden hover:border-[#00d4ff]/40 transition-all group cursor-pointer"
      onClick={() => onLoad(machine)}
      role="article"
      aria-label={`${machine.attributes.name} by ${machine.author}`}
    >
      <div className="relative">
        <MachinePreview machine={machine} />
        <div
          className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold"
          style={{ backgroundColor: rarityCfg.color + '30', color: rarityCfg.color }}
        >
          {rarityCfg.label}
        </div>
        <div
          className="absolute top-2 left-2 w-2 h-2 rounded-full"
          style={{ backgroundColor: faction.color, boxShadow: `0 0 6px ${faction.color}` }}
          title={faction.nameCn}
        />
      </div>

      <div className="p-3">
        <h3 className="text-sm font-bold text-white truncate mb-1" title={machine.attributes.name}>
          {machine.attributes.name}
        </h3>

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

        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-[#6b7280]">
            by <span className="text-[#9ca3af]">{machine.authorName || machine.author}</span>
          </span>
          <span className="text-[10px] text-[#6b7280]">{formatRelativeTime(machine.publishedAt)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleFavorite}
              className={`flex items-center gap-1 text-[11px] transition-colors ${
                isFavorite ? 'text-[#ef4444]' : 'text-[#6b7280] hover:text-[#ef4444]'
              }`}
              aria-label={`${isFavorite ? 'Remove from' : 'Add to'} favorites - ${machine.attributes.name}`}
            >
              <span>{isFavorite ? '❤️' : '🤍'}</span>
            </button>
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
            <span className="flex items-center gap-1 text-[11px] text-[#6b7280]">
              <span>👁</span>
              <span>{formatCount(machine.views)}</span>
            </span>
          </div>
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
  // Tabs state
  const [activeTab, setActiveTab] = useState<'gallery' | 'favorites'>('gallery');
  
  // FIX: Use individual selectors for primitive values
  const communityMachines = useCommunityStore((s) => s.communityMachines);
  const publishedMachines = useCommunityStore((s) => s.publishedMachines);
  const searchQuery = useCommunityStore((s) => s.searchQuery);
  const factionFilter = useCommunityStore((s) => s.factionFilter);
  const rarityFilter = useCommunityStore((s) => s.rarityFilter);
  const sortOption = useCommunityStore((s) => s.sortOption);

  // FIX: Store method references in refs
  const setSearchQueryRef = useRef(useCommunityStore.getState().setSearchQuery);
  const setFactionFilterRef = useRef(useCommunityStore.getState().setFactionFilter);
  const setRarityFilterRef = useRef(useCommunityStore.getState().setRarityFilter);
  const setSortOptionRef = useRef(useCommunityStore.getState().setSortOption);
  const closeGalleryRef = useRef(useCommunityStore.getState().closeGallery);
  const likeMachineRef = useRef(useCommunityStore.getState().likeMachine);
  const viewMachineRef = useRef(useCommunityStore.getState().viewMachine);

  // Favorites store
  const favoriteIds = useFavoritesStore((s) => s.favoriteIds);
  const toggleFavoriteRef = useRef(useFavoritesStore.getState().toggleFavorite);

  // FIX: Periodically sync refs
  useEffect(() => {
    setSearchQueryRef.current = useCommunityStore.getState().setSearchQuery;
    setFactionFilterRef.current = useCommunityStore.getState().setFactionFilter;
    setRarityFilterRef.current = useCommunityStore.getState().setRarityFilter;
    setSortOptionRef.current = useCommunityStore.getState().setSortOption;
    closeGalleryRef.current = useCommunityStore.getState().closeGallery;
    likeMachineRef.current = useCommunityStore.getState().likeMachine;
    viewMachineRef.current = useCommunityStore.getState().viewMachine;
    toggleFavoriteRef.current = useFavoritesStore.getState().toggleFavorite;
  });

  const loadMachine = useMachineStore((s) => s.loadMachine);
  const modules = useMachineStore((s) => s.modules);

  const [confirmLoad, setConfirmLoad] = useState<CommunityMachine | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);

  // FIX: Use useMemo to call getState() method (not subscription)
  const filteredMachines = useMemo(() => 
    useCommunityStore.getState().getFilteredMachinesList(),
    [communityMachines, publishedMachines, searchQuery, factionFilter, rarityFilter, sortOption]
  );

  // Get favorite machines
  const favoriteMachines = useMemo(() => {
    const allMachines = [...communityMachines, ...publishedMachines];
    return favoriteIds
      .map((id) => allMachines.find((m) => m.id === id))
      .filter((m): m is CommunityMachine => m !== undefined);
  }, [favoriteIds, communityMachines, publishedMachines]);

  const hasFilters = searchQuery !== '' || factionFilter !== 'all' || rarityFilter !== 'all';
  const totalCount = communityMachines.length + publishedMachines.length;

  // FIX: Create stable callbacks using refs
  const handleLoadMachine = useCallback(
    (machine: CommunityMachine) => {
      if (modules.length > 0) {
        setConfirmLoad(machine);
      } else {
        loadMachine(machine.modules, machine.connections);
        viewMachineRef.current(machine.id);
        closeGalleryRef.current();
      }
    },
    [modules.length, loadMachine]
  );

  const handleConfirmLoad = useCallback(() => {
    if (confirmLoad) {
      loadMachine(confirmLoad.modules, confirmLoad.connections);
      viewMachineRef.current(confirmLoad.id);
      setConfirmLoad(null);
      closeGalleryRef.current();
    }
  }, [confirmLoad, loadMachine]);

  const handleCancelLoad = useCallback(() => {
    setConfirmLoad(null);
  }, []);

  // FIX: Use useCallback with refs for filter functions
  const handleSearchChange = useCallback((value: string) => {
    setSearchQueryRef.current(value);
  }, []);

  const handleFactionChange = useCallback((value: FactionFilter) => {
    setFactionFilterRef.current(value);
  }, []);

  const handleRarityChange = useCallback((value: RarityFilter) => {
    setRarityFilterRef.current(value);
  }, []);

  const handleSortChange = useCallback((value: SortOption) => {
    setSortOptionRef.current(value);
  }, []);

  const handleLike = useCallback((id: string) => {
    likeMachineRef.current(id);
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    toggleFavoriteRef.current(id);
  }, []);

  // FIX: Track views only once per gallery open session using a session-scoped ref
  // This ensures views are counted once when gallery opens, not on every filter change
  const viewsTrackedRef = useRef(false);
  
  useEffect(() => {
    // Only track views once per gallery open session
    if (!viewsTrackedRef.current) {
      viewsTrackedRef.current = true;
      // Use a small delay to ensure filteredMachines is computed
      const timeoutId = setTimeout(() => {
        const machines = useCommunityStore.getState().getFilteredMachinesList();
        machines.forEach((m) => {
          viewMachineRef.current(m.id);
        });
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, []);

  // Reset views tracked flag when gallery closes (next open will track views again)
  // This is handled by the component unmounting when gallery closes

  // Show favorites panel if that tab is active
  if (showFavorites) {
    return <FavoritesPanel onClose={() => setShowFavorites(false)} />;
  }

  return (
    <>
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div
          className="w-full max-w-4xl max-h-[85vh] bg-[#0a0e17] border border-[#1e2a42] rounded-2xl flex flex-col overflow-hidden shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-label="Community Gallery"
        >
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
              onClick={() => closeGalleryRef.current()}
              className="w-8 h-8 rounded-full bg-[#1e2a42] hover:bg-[#2d3a56] flex items-center justify-center text-[#9ca3af] hover:text-white transition-colors"
              aria-label="Close community gallery"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 px-6 py-2 border-b border-[#1e2a42] bg-[#0a0e17]">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'gallery'
                  ? 'bg-[#7c3aed] text-white'
                  : 'bg-[#1e2a42] text-[#9ca3af] hover:text-white'
              }`}
              aria-selected={activeTab === 'gallery'}
              role="tab"
            >
              🌐 All Machines
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'favorites'
                  ? 'bg-[#ef4444] text-white'
                  : 'bg-[#1e2a42] text-[#9ca3af] hover:text-white'
              }`}
              aria-selected={activeTab === 'favorites'}
              role="tab"
            >
              ❤️ My Favorites
              {favoriteIds.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-xs">
                  {favoriteIds.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === 'gallery' && (
            <>
              <div className="px-6 py-3 border-b border-[#1e2a42] bg-[#0a0e17] space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search machines, authors, tags..."
                    className="w-full bg-[#121826] border border-[#1e2a42] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-[#4a5568] focus:outline-none focus:border-[#7c3aed] transition-colors"
                    aria-label="Search community machines"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5568]" aria-hidden="true">
                    🔍
                  </span>
                  {searchQuery && (
                    <button
                      onClick={() => handleSearchChange('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-white text-xs"
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={factionFilter}
                    onChange={(e) => handleFactionChange(e.target.value as FactionFilter)}
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

                  <select
                    value={rarityFilter}
                    onChange={(e) => handleRarityChange(e.target.value as RarityFilter)}
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

                  <select
                    value={sortOption}
                    onChange={(e) => handleSortChange(e.target.value as SortOption)}
                    className="bg-[#121826] border border-[#1e2a42] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#7c3aed] transition-colors cursor-pointer ml-auto"
                    aria-label="Sort machines"
                  >
                    <option value="newest">🕐 Newest First</option>
                    <option value="most-liked">❤️ Most Liked</option>
                    <option value="most-viewed">👁 Most Viewed</option>
                  </select>
                </div>
              </div>

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
                        onLike={handleLike}
                        onToggleFavorite={handleToggleFavorite}
                        isFavorite={favoriteIds.includes(machine.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

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
                  Click the heart icon to add machines to favorites
                </p>
              </div>
            </>
          )}

          {activeTab === 'favorites' && (
            <div className="flex-1 overflow-y-auto p-6">
              {favoriteMachines.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="text-5xl mb-4">💔</div>
                  <h3 className="text-lg font-bold text-white mb-2">No Favorites Yet</h3>
                  <p className="text-sm text-[#6b7280] max-w-xs">
                    Browse machines in the gallery and click the heart icon to add them here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favoriteMachines.map((machine) => (
                    <MachineCard
                      key={machine.id}
                      machine={machine}
                      onLoad={handleLoadMachine}
                      onLike={handleLike}
                      onToggleFavorite={handleToggleFavorite}
                      isFavorite={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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
