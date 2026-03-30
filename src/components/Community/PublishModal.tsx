/**
 * Publish Modal
 * 
 * Confirmation dialog for publishing the current machine to the Community Gallery.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useCommunityStore } from '../../store/useCommunityStore';
import { FACTIONS } from '../../types/factions';
import { Rarity } from '../../types';

const RARITY_CONFIG: Record<Rarity, { color: string; label: string }> = {
  common: { color: '#9ca3af', label: 'Common' },
  uncommon: { color: '#22c55e', label: 'Uncommon' },
  rare: { color: '#3b82f6', label: 'Rare' },
  epic: { color: '#a855f7', label: 'Epic' },
  legendary: { color: '#f59e0b', label: 'Legendary' },
};

// Mini preview for the machine being published
function PublishPreview({ machine }: { machine: NonNullable<ReturnType<typeof useCommunityStore.getState>['pendingMachine']> }) {
  const faction = FACTIONS[machine.dominantFaction];

  if (machine.modules.length === 0) {
    return (
      <div className="w-full h-32 bg-[#0a0e17] rounded-lg flex items-center justify-center">
        <span className="text-xs text-[#6b7280]">No modules to preview</span>
      </div>
    );
  }

  const previewWidth = 320;
  const previewHeight = 120;
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
    <svg width={previewWidth} height={previewHeight} className="block rounded-lg">
      <rect width={previewWidth} height={previewHeight} fill="#0a0e17" rx="8" />
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
            strokeWidth={2 * scale}
            opacity={0.7}
          />
        );
      })}
      {machine.modules.map((mod) => {
        const mx = mod.x * scale + offsetX;
        const my = mod.y * scale + offsetY;
        const size = Math.max(24 * scale, 20);
        return (
          <rect
            key={mod.id}
            x={mx + 40 * scale - size / 2}
            y={my + 40 * scale - size / 2}
            width={size}
            height={size}
            fill={faction.color}
            opacity={0.85}
            rx={3}
          />
        );
      })}
    </svg>
  );
}

export function PublishModal() {
  const pendingMachine = useCommunityStore((s) => s.pendingMachine);

  // FIX: Store method references in refs
  const closePublishModalRef = useRef(useCommunityStore.getState().closePublishModal);
  const publishMachineRef = useRef(useCommunityStore.getState().publishMachine);

  // FIX: Periodically sync refs
  useEffect(() => {
    closePublishModalRef.current = useCommunityStore.getState().closePublishModal;
    publishMachineRef.current = useCommunityStore.getState().publishMachine;
  });

  const [authorName, setAuthorName] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // FIX: Create stable callbacks using refs
  const handlePublish = useCallback(() => {
    if (!pendingMachine) return;
    setIsPublishing(true);

    setTimeout(() => {
      publishMachineRef.current(authorName);
      setIsPublishing(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
      }, 1500);
    }, 600);
  }, [pendingMachine, authorName]);

  const handleClose = useCallback(() => {
    if (!isPublishing) {
      closePublishModalRef.current();
    }
  }, [isPublishing]);

  if (!pendingMachine) return null;

  const faction = FACTIONS[pendingMachine.dominantFaction];
  const rarityCfg = RARITY_CONFIG[pendingMachine.attributes.rarity];

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-[#121826] border border-[#22c55e]/40 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center">
          <div className="text-6xl mb-4 animate-bounce">✨</div>
          <h3 className="text-xl font-bold text-white mb-2">Published!</h3>
          <p className="text-sm text-[#9ca3af]">
            Your machine is now visible in the Community Gallery.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-md bg-[#0a0e17] border border-[#1e2a42] rounded-2xl overflow-hidden shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Publish to Community Gallery"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a42] bg-[#121826]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#7c3aed]/20 flex items-center justify-center">
              <span className="text-lg">🌐</span>
            </div>
            <h2 className="text-lg font-bold text-white">Publish to Gallery</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isPublishing}
            className="w-8 h-8 rounded-full bg-[#1e2a42] hover:bg-[#2d3a56] flex items-center justify-center text-[#9ca3af] hover:text-white transition-colors disabled:opacity-50"
            aria-label="Close publish dialog"
          >
            ✕
          </button>
        </div>

        {/* Preview */}
        <div className="px-6 pt-4">
          <div className="relative">
            <PublishPreview machine={pendingMachine} />
            {/* Rarity badge */}
            <div
              className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold"
              style={{ backgroundColor: rarityCfg.color + '30', color: rarityCfg.color }}
            >
              {rarityCfg.label}
            </div>
          </div>
        </div>

        {/* Machine info */}
        <div className="px-6 pt-3 pb-2">
          <div className="bg-[#121826] rounded-lg p-3 border border-[#1e2a42]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white">{pendingMachine.attributes.name}</h3>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{faction.icon}</span>
                <span className="text-xs" style={{ color: faction.color }}>
                  {faction.nameCn}
                </span>
              </div>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              <div className="text-center">
                <div className="text-xs text-[#22c55e] font-medium">{pendingMachine.attributes.stats.stability}%</div>
                <div className="text-[10px] text-[#6b7280]">Stability</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-[#f59e0b] font-medium">{pendingMachine.attributes.stats.powerOutput}</div>
                <div className="text-[10px] text-[#6b7280]">Power</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-[#3b82f6] font-medium">{pendingMachine.attributes.stats.energyCost}</div>
                <div className="text-[10px] text-[#6b7280]">Energy</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-[#ef4444] font-medium">{pendingMachine.attributes.stats.failureRate}%</div>
                <div className="text-[10px] text-[#6b7280]">Failure</div>
              </div>
            </div>
            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {pendingMachine.attributes.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                  style={{ backgroundColor: faction.color + '20', color: faction.color }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Author name input */}
        <div className="px-6 pb-4">
          <label className="block text-sm font-medium text-[#9ca3af] mb-2">
            Display Name (optional)
          </label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Anonymous"
            maxLength={32}
            className="w-full bg-[#121826] border border-[#1e2a42] rounded-lg px-3 py-2 text-sm text-white placeholder-[#4a5568] focus:outline-none focus:border-[#7c3aed] transition-colors"
            aria-label="Author display name"
            disabled={isPublishing}
          />
          <p className="mt-1.5 text-xs text-[#4a5568]">
            Leave blank to publish anonymously. You can be found by this name in the gallery.
          </p>
        </div>

        {/* Warning */}
        <div className="px-6 pb-4">
          <div className="bg-[#78350f]/20 border border-[#f97316]/30 rounded-lg px-3 py-2 text-xs text-[#f97316]/80">
            ⚠ Published machines are session-scoped only. They will be lost on page refresh or browser restart.
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={handleClose}
            disabled={isPublishing}
            className="flex-1 px-4 py-2.5 bg-[#1e2a42] text-white rounded-lg hover:bg-[#2d3a56] transition-colors text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex-1 px-4 py-2.5 bg-[#7c3aed] text-white rounded-lg hover:bg-[#6d28d9] transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPublishing ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Publishing...
              </>
            ) : (
              <>🌐 Publish to Gallery</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PublishModal;
