/**
 * Enhanced Share Card Component
 * 
 * Generates faction-branded export cards with themed borders and decorations.
 * Supports SVG and PNG export formats.
 */

import React, { useRef, useCallback } from 'react';
import { FACTIONS, FactionId } from '../../types/factions';
import { GeneratedAttributes, PlacedModule, Connection, AttributeTag } from '../../types';

interface EnhancedShareCardProps {
  faction: FactionId;
  attributes: GeneratedAttributes;
  modules: PlacedModule[];
  connections: Connection[];
  onExportSVG?: () => void;
  onExportPNG?: () => void;
  onClose?: () => void;
}

export const EnhancedShareCard: React.FC<EnhancedShareCardProps> = ({
  faction,
  attributes,
  modules,
  connections,
  onExportSVG,
  onExportPNG,
  onClose,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const factionConfig = FACTIONS[faction];
  
  // Rarity color
  const rarityColors: Record<string, { primary: string; secondary: string; glow: string }> = {
    common: { primary: '#9ca3af', secondary: '#6b7280', glow: 'rgba(156, 163, 175, 0.3)' },
    uncommon: { primary: '#22c55e', secondary: '#16a34a', glow: 'rgba(34, 197, 94, 0.3)' },
    rare: { primary: '#3b82f6', secondary: '#2563eb', glow: 'rgba(59, 130, 246, 0.3)' },
    epic: { primary: '#a855f7', secondary: '#9333ea', glow: 'rgba(168, 85, 247, 0.3)' },
    legendary: { primary: '#f59e0b', secondary: '#d97706', glow: 'rgba(245, 158, 11, 0.3)' },
  };
  
  const rarityColor = rarityColors[attributes.rarity] || rarityColors.common;
  
  const handleExportSVG = useCallback(() => {
    if (!cardRef.current) return;
    
    // Create SVG from the card element
    const svgElement = cardRef.current.querySelector('svg');
    if (!svgElement) return;
    
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${attributes.name.replace(/\s+/g, '-').toLowerCase()}-share-card.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    onExportSVG?.();
  }, [cardRef, attributes, onExportSVG]);
  
  const handleExportPNG = useCallback(async () => {
    if (!cardRef.current) return;
    
    // Use html2canvas-like approach with SVG-to-canvas
    const svgElement = cardRef.current.querySelector('svg');
    if (!svgElement) return;
    
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = 800;
    canvas.height = 600;
    
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${attributes.name.replace(/\s+/g, '-').toLowerCase()}-share-card.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        onExportPNG?.();
      }, 'image/png');
    };
    
    img.src = url;
  }, [cardRef, attributes, onExportPNG]);
  
  return (
    <div
      className="
        fixed inset-0 z-[1050] flex items-center justify-center
        bg-black/80 backdrop-blur-sm
        overflow-y-auto
      "
      onClick={onClose}
    >
      <div
        className="
          relative w-full max-w-2xl mx-4 my-8
          overflow-hidden
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Preview card */}
        <div
          ref={cardRef}
          className="relative rounded-2xl overflow-hidden"
          style={{
            boxShadow: `0 0 40px ${factionConfig.glowColor}`,
          }}
        >
          {/* SVG Card */}
          <svg
            width="800"
            height="600"
            viewBox="0 0 800 600"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background */}
            <defs>
              <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1a1a2e" />
                <stop offset="50%" stopColor="#121826" />
                <stop offset="100%" stopColor="#0a0e17" />
              </linearGradient>
              <linearGradient id="factionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={factionConfig.color} />
                <stop offset="50%" stopColor={factionConfig.secondaryColor} />
                <stop offset="100%" stopColor={factionConfig.color} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Card background */}
            <rect width="800" height="600" fill="url(#cardBg)" />
            
            {/* Decorative grid pattern */}
            <g opacity="0.1">
              {Array.from({ length: 20 }).map((_, i) => (
                <line
                  key={`h${i}`}
                  x1="0"
                  y1={i * 30}
                  x2="800"
                  y2={i * 30}
                  stroke={factionConfig.color}
                  strokeWidth="0.5"
                />
              ))}
              {Array.from({ length: 27 }).map((_, i) => (
                <line
                  key={`v${i}`}
                  x1={i * 30}
                  y1="0"
                  x2={i * 30}
                  y2="600"
                  stroke={factionConfig.color}
                  strokeWidth="0.5"
                />
              ))}
            </g>
            
            {/* Outer border */}
            <rect
              x="10"
              y="10"
              width="780"
              height="580"
              fill="none"
              stroke="url(#factionGradient)"
              strokeWidth="3"
              rx="20"
            />
            
            {/* Inner border */}
            <rect
              x="25"
              y="25"
              width="750"
              height="550"
              fill="none"
              stroke={factionConfig.color}
              strokeWidth="1"
              opacity="0.5"
              rx="15"
            />
            
            {/* Corner decorations */}
            {[
              { x: 30, y: 30, rotate: 0 },
              { x: 770, y: 30, rotate: 90 },
              { x: 770, y: 570, rotate: 180 },
              { x: 30, y: 570, rotate: 270 },
            ].map((pos, i) => (
              <g key={i} transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rotate})`}>
                <circle cx="0" cy="0" r="8" fill={factionConfig.color} opacity="0.8" />
                <circle cx="0" cy="0" r="4" fill="#0a0e17" />
              </g>
            ))}
            
            {/* Faction badge - top left */}
            <g transform="translate(50, 50)">
              <rect
                width="120"
                height="40"
                rx="8"
                fill={factionConfig.color}
                opacity="0.2"
              />
              <rect
                width="120"
                height="40"
                rx="8"
                fill="none"
                stroke={factionConfig.color}
                strokeWidth="2"
              />
              <text
                x="60"
                y="26"
                textAnchor="middle"
                fill={factionConfig.color}
                fontSize="16"
                fontWeight="bold"
              >
                {factionConfig.icon} {factionConfig.nameCn}
              </text>
            </g>
            
            {/* Rarity badge - top right */}
            <g transform="translate(650, 50)">
              <rect
                width="100"
                height="40"
                rx="8"
                fill={rarityColor.primary}
                opacity="0.2"
              />
              <rect
                width="100"
                height="40"
                rx="8"
                fill="none"
                stroke={rarityColor.primary}
                strokeWidth="2"
              />
              <text
                x="50"
                y="26"
                textAnchor="middle"
                fill={rarityColor.primary}
                fontSize="14"
                fontWeight="bold"
                filter="url(#glow)"
              >
                {rarityColor.primary.toUpperCase()}
              </text>
            </g>
            
            {/* Title */}
            <text
              x="400"
              y="150"
              textAnchor="middle"
              fill="white"
              fontSize="36"
              fontWeight="bold"
              filter="url(#glow)"
            >
              {attributes.name}
            </text>
            
            {/* Machine preview area */}
            <g transform="translate(200, 180)">
              <rect
                width="400"
                height="200"
                rx="10"
                fill="#0a0e17"
                opacity="0.5"
              />
              <rect
                width="400"
                height="200"
                rx="10"
                fill="none"
                stroke={factionConfig.color}
                strokeWidth="1"
                opacity="0.3"
              />
              
              {/* Simplified module preview */}
              {modules.slice(0, 6).map((module, i) => (
                <circle
                  key={module.instanceId}
                  cx={80 + (i % 4) * 100}
                  cy={60 + Math.floor(i / 4) * 80}
                  r="30"
                  fill={factionConfig.color}
                  opacity="0.3"
                />
              ))}
              
              {/* Connection lines */}
              {connections.slice(0, 4).map((conn) => (
                <line
                  key={conn.id}
                  x1={100}
                  y1="160"
                  x2="200"
                  y2="220"
                  stroke={factionConfig.color}
                  strokeWidth="2"
                  opacity="0.5"
                />
              ))}
            </g>
            
            {/* Stats panel */}
            <g transform="translate(50, 420)">
              <rect
                width="700"
                height="120"
                rx="10"
                fill="#0a0e17"
                opacity="0.8"
              />
              <rect
                width="700"
                height="120"
                rx="10"
                fill="none"
                stroke={factionConfig.color}
                strokeWidth="1"
                opacity="0.3"
              />
              
              {/* Stats */}
              {[
                { label: '稳定性', value: attributes.stats.stability, max: 100, color: '#22c55e' },
                { label: '输出功率', value: attributes.stats.powerOutput, max: 100, color: '#3b82f6' },
                { label: '能耗', value: attributes.stats.energyCost, max: 100, color: '#f59e0b' },
                { label: '故障率', value: attributes.stats.failureRate, max: 100, color: '#ef4444' },
              ].map((stat, i) => (
                <g key={stat.label} transform={`translate(${i * 175}, 20)`}>
                  <text x="87.5" y="0" textAnchor="middle" fill="#9ca3af" fontSize="12">
                    {stat.label}
                  </text>
                  <text x="87.5" y="35" textAnchor="middle" fill={stat.color} fontSize="24" fontWeight="bold">
                    {stat.value}
                  </text>
                  <rect x="10" y="50" width="155" height="8" rx="4" fill="#1e2a42" />
                  <rect x="10" y="50" width={155 * (stat.value / stat.max)} height="8" rx="4" fill={stat.color} />
                </g>
              ))}
              
              {/* Tags */}
              <text x="20" y="100" fill="#9ca3af" fontSize="11">
                属性标签:
              </text>
              {attributes.tags.map((tag: AttributeTag, i: number) => (
                <g key={tag} transform={`translate(${100 + i * 80}, 90)`}>
                  <rect width="70" height="22" rx="4" fill={factionConfig.color} opacity="0.2" />
                  <text x="35" y="15" textAnchor="middle" fill={factionConfig.color} fontSize="11">
                    #{tag}
                  </text>
                </g>
              ))}
            </g>
            
            {/* Footer */}
            <text
              x="400"
              y="570"
              textAnchor="middle"
              fill="#6b7280"
              fontSize="12"
            >
              ARCANE MACHINE CODEX • {attributes.codexId}
            </text>
          </svg>
        </div>
        
        {/* Export buttons */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            onClick={handleExportSVG}
            className="
              px-6 py-3 rounded-xl font-medium
              bg-[#7c3aed] text-white
              hover:bg-[#6d28d9]
              transition-colors
              flex items-center gap-2
            "
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 15v3h14v-3M7 12V3h6v9M10 3v9" />
            </svg>
            导出 SVG
          </button>
          
          <button
            onClick={handleExportPNG}
            className="
              px-6 py-3 rounded-xl font-medium
              bg-[#22c55e] text-white
              hover:bg-[#16a34a]
              transition-colors
              flex items-center gap-2
            "
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="14" height="14" rx="2" />
              <circle cx="7" cy="7" r="2" />
              <path d="M3 13l4-4 3 3 2-2 5 5" />
            </svg>
            导出 PNG
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="
                px-6 py-3 rounded-xl font-medium
                bg-[#1e2a42] text-[#9ca3af]
                hover:bg-[#2d3a52]
                hover:text-white
                transition-colors
              "
            >
              关闭
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedShareCard;
