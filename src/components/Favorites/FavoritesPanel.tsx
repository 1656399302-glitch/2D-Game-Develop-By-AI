/**
 * Favorites Panel Component
 * 
 * Displays user's favorited community machines in a dedicated view.
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useCommunityStore } from '../../store/useCommunityStore';
import { useMachineStore } from '../../store/useMachineStore';
import { CommunityMachine } from '../../data/communityGalleryData';
import { FACTIONS } from '../../types/factions';
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
function FavoriteCard({
  machine,
  onLoad,
  onRemove,
}: {
  machine: CommunityMachine;
  onLoad: (m: CommunityMachine) => void;
  onRemove: (id: string) => void;
}) {
  const faction = FACTIONS[machine.dominantFaction];
  const rarityCfg = RARITY_CONFIG[machine.attributes.rarity];

  return (
    <div
      className="bg-[#121826] border border-[#1e2a42] rounded-xl overflow-hidden hover:border-[#ef4444]/40 transition-all group cursor-pointer relative"
      onClick={() => onLoad(machine)}
      role="article"
      aria-label={`${machine.attributes.name} by ${machine.author}`}
    >
      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(machine.id);
        }}
        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-[#0a0e17]/80 hover:bg-[#ef4444] flex items-center justify-center text-[#ef4444] hover:text-white transition-colors"
        aria-label={`Remove ${machine.attributes.name} from favorites`}
      >
        ❤️
      </button>

      <div className="relative">
        <MachinePreview machine={machine} />
        <div
          className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-bold"
          style={{ backgroundColor: rarityCfg.color + '30', color: rarityCfg.color }}
        >
          {rarityCfg.label}
        </div>
        <div
          className="absolute top-2 left-20 w-2 h-2 rounded-full"
          style={{ backgroundColor: faction.color, boxShadow: `0 0 6px ${faction.color}` }}
          title={faction.nameCn}
        />
      </div>

      <div className="p-3">
        <h3 className="text-sm font-bold text-white truncate mb-1 pr-8" title={machine.attributes.name}>
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
            <span className="flex items-center gap-1 text-[11px] text-[#ef4444]">
              <span>❤️</span>
              <span>{formatCount(machine.likes)}</span>
            </span>
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
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">💔</div>
      <h3 className="text-lg font-bold text-white mb-2">No Favorites Yet</h3>
      <p className="text-sm text-[#6b7280] max-w-xs">
        Browse the Community Gallery and click the heart icon on machines you love to save them here.
      </p>
    </div>
  );
}

interface FavoritesPanelProps {
  onClose: () => void;
}

export function FavoritesPanel({ onClose }: FavoritesPanelProps) {
  // Subscribe to favorites store
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  
  // Get community machines
  const communityMachines = useCommunityStore((s) => s.communityMachines);
  const publishedMachines = useCommunityStore((s) => s.publishedMachines);
  
  // Load machine action
  const loadMachine = useMachineStore((s) => s.loadMachine);
  const modules = useMachineStore((s) => s.modules);
  
  // Store method references
  const removeFavoriteRef = useRef(useFavoritesStore.getState().removeFavorite);
  const closeGalleryRef = useRef(useCommunityStore.getState().closeGallery);
  const viewMachineRef = useRef(useCommunityStore.getState().viewMachine);
  
  // Sync refs periodically
  useEffect(() => {
    removeFavoriteRef.current = useFavoritesStore.getState().removeFavorite;
    closeGalleryRef.current = useCommunityStore.getState().closeGallery;
    viewMachineRef.current = useCommunityStore.getState().viewMachine;
  });
  
  const [confirmLoad, setConfirmLoad] = useState<CommunityMachine | null>(null);
  
  // Get favorite machines
  const favoriteMachines = useMemo(() => {
    const allMachines = [...communityMachines, ...publishedMachines];
    return favoriteIds
      .map((id) => allMachines.find((m) => m.id === id))
      .filter((m): m is CommunityMachine => m !== undefined);
  }, [favoriteIds, communityMachines, publishedMachines]);
  
  // Handle load machine
  const handleLoadMachine = useCallback(
    (machine: CommunityMachine) => {
      if (modules.length > 0) {
        setConfirmLoad(machine);
      } else {
        loadMachine(machine.modules, machine.connections);
        viewMachineRef.current(machine.id);
        onClose();
      }
    },
    [modules.length, loadMachine, onClose]
  );
  
  const handleConfirmLoad = useCallback(() => {
    if (confirmLoad) {
      loadMachine(confirmLoad.modules, confirmLoad.connections);
      viewMachineRef.current(confirmLoad.id);
      setConfirmLoad(null);
      onClose();
    }
  }, [confirmLoad, loadMachine, onClose]);
  
  const handleCancelLoad = useCallback(() => {
    setConfirmLoad(null);
  }, []);
  
  // Handle remove favorite
  const handleRemoveFavorite = useCallback((id: string) => {
    removeFavoriteRef.current(id);
  }, []);
  
  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div
          className="w-full max-w-4xl max-h-[85vh] bg-[#0a0e17] border border-[#ef4444]/30 rounded-2xl flex flex-col overflow-hidden shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-label="My Favorites"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a42] bg-[#121826]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#ef4444]/20 flex items-center justify-center">
                <span className="text-lg">❤️</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">My Favorites</h2>
                <p className="text-xs text-[#6b7280]">{favoriteMachines.length} machines favorited</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#1e2a42] hover:bg-[#2d3a56] flex items-center justify-center text-[#9ca3af] hover:text-white transition-colors"
              aria-label="Close favorites panel"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {favoriteMachines.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteMachines.map((machine) => (
                  <FavoriteCard
                    key={machine.id}
                    machine={machine}
                    onLoad={handleLoadMachine}
                    onRemove={handleRemoveFavorite}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-[#1e2a42] bg-[#121826]">
            <p className="text-xs text-[#6b7280] text-center">
              Favorites are saved locally and persist across browser sessions
            </p>
          </div>
        </div>
      </div>

      {/* Confirm Load Dialog */}
      {confirmLoad && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[#121826] border border-[#ef4444]/40 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Load Favorite Machine?</h3>
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
                className="flex-1 px-4 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-colors text-sm font-medium"
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

export default FavoritesPanel;
