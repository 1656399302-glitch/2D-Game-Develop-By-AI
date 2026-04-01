/**
 * FactionBadge Component
 * 
 * Displays a colored badge with faction icon and tooltip.
 * Supports all 6 factions: void, inferno, storm, stellar, arcane, chaos.
 * 
 * ROUND 81 PHASE 2: New component implementation per contract D1.
 */

import React, { useState } from 'react';
import { FactionId, FACTIONS } from '../types/factions';

interface FactionBadgeProps {
  factionId: FactionId;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

// Faction icon mapping using SVG icons for visual consistency
const FACTION_ICONS: Record<FactionId, React.ReactNode> = {
  void: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" opacity="0.3" />
      <circle cx="12" cy="12" r="5" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" opacity="0.5" />
    </svg>
  ),
  inferno: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2c-2 4-6 6-6 10a6 6 0 0012 0c0-4-4-6-6-10z" />
      <path d="M12 12c-1 2-3 3-3 5a3 3 0 006 0c0-2-2-3-3-5z" fill="currentColor" opacity="0.3" />
    </svg>
  ),
  storm: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" opacity="0.3" />
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  stellar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" fill="currentColor" opacity="0.3" />
      <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
    </svg>
  ),
  arcane: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" opacity="0.5" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" opacity="0.5" />
    </svg>
  ),
  chaos: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" strokeDasharray="4 2" />
      <path d="M12 6v2M12 16v2M6 12h2M16 12h2" />
      <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.3" />
    </svg>
  ),
};

const SIZE_CLASSES = {
  sm: {
    container: 'px-2 py-0.5 text-xs gap-1',
    icon: 'w-3 h-3',
  },
  md: {
    container: 'px-3 py-1 text-sm gap-1.5',
    icon: 'w-4 h-4',
  },
  lg: {
    container: 'px-4 py-1.5 text-base gap-2',
    icon: 'w-5 h-5',
  },
};

export function FactionBadge({ factionId, size = 'md', showTooltip = true, className = '' }: FactionBadgeProps) {
  const [showInfo, setShowInfo] = useState(false);
  
  const faction = FACTIONS[factionId];
  if (!faction) {
    return null;
  }

  const sizeClasses = SIZE_CLASSES[size];

  return (
    <div className={`relative inline-flex ${className}`}>
      <div
        className={`inline-flex items-center rounded-full font-medium transition-all ${sizeClasses.container}`}
        style={{
          backgroundColor: `${faction.color}20`,
          color: faction.color,
          border: `1px solid ${faction.color}40`,
        }}
        onMouseEnter={() => showTooltip && setShowInfo(true)}
        onMouseLeave={() => showTooltip && setShowInfo(false)}
        role="img"
        aria-label={`${faction.nameCn} faction badge`}
      >
        <span className={sizeClasses.icon}>
          {FACTION_ICONS[factionId]}
        </span>
        <span className="font-medium">{faction.nameCn}</span>
      </div>

      {/* Tooltip */}
      {showTooltip && showInfo && (
        <div
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded-lg shadow-lg z-50 whitespace-nowrap"
          style={{
            backgroundColor: '#1a1a2e',
            border: `1px solid ${faction.color}40`,
            boxShadow: `0 0 12px ${faction.glowColor}`,
          }}
        >
          <div className="text-sm font-medium" style={{ color: faction.color }}>
            {faction.name}
          </div>
          <div className="text-xs text-[#9ca3af] mt-0.5">{faction.nameCn}</div>
          <div className="text-xs text-[#6b7280] mt-1 max-w-[200px]">
            {faction.description}
          </div>
          {/* Tooltip arrow */}
          <div
            className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
            style={{ borderTopColor: '#1a1a2e' }}
          />
        </div>
      )}
    </div>
  );
}

export default FactionBadge;
