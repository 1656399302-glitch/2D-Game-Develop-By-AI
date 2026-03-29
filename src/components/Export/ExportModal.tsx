import { useState, useCallback } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import { exportToSVG, exportToPNG, exportPoster, exportEnhancedPoster, exportFactionCard, downloadFile } from '../../utils/exportUtils';
import { generateAttributes } from '../../utils/attributeGenerator';
import { calculateFaction } from '../../utils/factionCalculator';
import { EnhancedShareCard } from './EnhancedShareCard';
import { FACTIONS } from '../../types/factions';

interface ExportModalProps {
  onClose: () => void;
}

type ExportFormat = 'svg' | 'png' | 'poster' | 'enhanced-poster' | 'faction-card';

export function ExportModal({ onClose }: ExportModalProps) {
  const modules = useMachineStore((state) => state.modules);
  const connections = useMachineStore((state) => state.connections);
  
  const [format, setFormat] = useState<ExportFormat>('svg');
  const [showFactionCard, setShowFactionCard] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportName, setExportName] = useState('arcane-machine');
  
  // Calculate faction and attributes for EnhancedShareCard
  const dominantFaction = calculateFaction(modules);
  const factionId = dominantFaction || 'stellar'; // Default to stellar if no faction modules
  const faction = FACTIONS[factionId];
  const attributes = generateAttributes(modules, connections);
  
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    
    try {
      const filename = exportName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      
      switch (format) {
        case 'svg':
          const svgContent = exportToSVG(modules, connections, {
            format: 'svg',
          });
          downloadFile(svgContent, `${filename}.svg`, 'image/svg+xml');
          break;
          
        case 'png':
          const pngBlob = await exportToPNG(modules, connections, {
            format: 'png',
            scale: 2,
          });
          downloadFile(pngBlob, `${filename}.png`, 'image/png');
          break;
          
        case 'poster':
          const posterContent = exportPoster(modules, connections, attributes);
          downloadFile(posterContent, `${filename}-poster.svg`, 'image/svg+xml');
          break;
          
        case 'enhanced-poster':
          const enhancedContent = exportEnhancedPoster(modules, connections, attributes);
          downloadFile(enhancedContent, `${filename}-enhanced-poster.svg`, 'image/svg+xml');
          break;
          
        case 'faction-card':
          // This case is handled by EnhancedShareCard directly
          break;
      }
      
      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      alert('Export failed. Please try again.');
    }
  }, [format, exportName, modules, connections, attributes, onClose]);
  
  const handleFactionCardExportSVG = useCallback(() => {
    const factionCardContent = exportFactionCard(modules, connections, attributes, faction);
    downloadFile(factionCardContent, `${attributes.name.replace(/\s+/g, '-').toLowerCase()}-share-card.svg`, 'image/svg+xml');
  }, [modules, connections, attributes, faction]);
  
  const handleFactionCardExportPNG = useCallback(async () => {
    const factionCardContent = exportFactionCard(modules, connections, attributes, faction);
    // Convert SVG to PNG using canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = 800;
    canvas.height = 600;
    
    const img = new Image();
    const svgBlob = new Blob([factionCardContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (!blob) return;
        downloadFile(blob, `${attributes.name.replace(/\s+/g, '-').toLowerCase()}-share-card.png`, 'image/png');
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    
    img.src = url;
  }, [modules, connections, attributes, faction]);
  
  // If showing faction card, render EnhancedShareCard
  if (showFactionCard) {
    return (
      <EnhancedShareCard
        faction={factionId}
        attributes={attributes}
        modules={modules}
        connections={connections}
        onExportSVG={handleFactionCardExportSVG}
        onExportPNG={handleFactionCardExportPNG}
        onClose={() => setShowFactionCard(false)}
      />
    );
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#121826] border border-[#1e2a42] rounded-xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#00d4ff]">Export Machine</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1e2a42] hover:bg-[#2d3a56] flex items-center justify-center text-[#9ca3af] hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* Preview */}
        <div className="aspect-video bg-[#0a0e17] rounded-lg mb-6 flex items-center justify-center overflow-hidden">
          <ExportPreview format={format} />
        </div>
        
        {/* Options */}
        <div className="space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <FormatButton
                format="svg"
                label="SVG"
                description="Vector"
                icon="📐"
                selected={format === 'svg'}
                onClick={() => setFormat('svg')}
              />
              <FormatButton
                format="png"
                label="PNG"
                description="Raster"
                icon="🖼"
                selected={format === 'png'}
                onClick={() => setFormat('png')}
              />
              <FormatButton
                format="poster"
                label="Poster"
                description="Share card"
                icon="🎨"
                selected={format === 'poster'}
                onClick={() => setFormat('poster')}
              />
              <FormatButton
                format="enhanced-poster"
                label="Enhanced"
                description="Deluxe card"
                icon="✨"
                selected={format === 'enhanced-poster'}
                onClick={() => setFormat('enhanced-poster')}
              />
              <FormatButton
                format="faction-card"
                label="Faction Card"
                description="Branded export"
                icon="⚔"
                selected={format === 'faction-card'}
                onClick={() => setFormat('faction-card')}
              />
            </div>
          </div>
          
          {/* Filename */}
          {format !== 'faction-card' && (
            <div>
              <label className="block text-sm font-medium text-[#9ca3af] mb-2">
                Filename
              </label>
              <input
                type="text"
                value={exportName}
                onChange={(e) => setExportName(e.target.value)}
                className="arcane-input"
                placeholder="arcane-machine"
              />
            </div>
          )}
          
          {/* Info */}
          <div className="text-xs text-[#4a5568] bg-[#0a0e17] rounded-lg p-3">
            {format === 'svg' && (
              <p>SVG export includes all modules, connections, and animations. Best for further editing in vector software.</p>
            )}
            {format === 'png' && (
              <p>PNG export creates a high-resolution raster image at 2x scale (minimum 800x600px).</p>
            )}
            {format === 'poster' && (
              <p>Poster export creates a styled share card with machine preview, stats, and decorative border.</p>
            )}
            {format === 'enhanced-poster' && (
              <p>Enhanced poster includes decorative corners, ornate name styling, attribute icons, and faction emblem.</p>
            )}
            {format === 'faction-card' && (
              <p>Faction Card export creates a branded share card with faction-colored border and theming based on your machine's dominant faction.</p>
            )}
          </div>
          
          {/* Faction Preview for Faction Card */}
          {format === 'faction-card' && (
            <div className="mt-2 p-3 rounded-lg border" style={{ borderColor: faction.color + '40', backgroundColor: faction.color + '10' }}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{faction.icon}</span>
                <div>
                  <div className="text-sm font-medium" style={{ color: faction.color }}>
                    {faction.nameCn} - {faction.name}
                  </div>
                  <div className="text-xs text-[#9ca3af]">
                    Dominant faction based on your machine's module composition
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 arcane-button-secondary"
          >
            Cancel
          </button>
          {format === 'faction-card' ? (
            <button
              onClick={() => setShowFactionCard(true)}
              className="flex-1 arcane-button flex items-center justify-center gap-2"
            >
              ⚔ Open Faction Card
            </button>
          ) : (
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 arcane-button flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>
                  <span className="spinner" />
                  Exporting...
                </>
              ) : (
                <>📤 Export {format === 'enhanced-poster' ? 'Enhanced' : format.toUpperCase()}</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface FormatButtonProps {
  format: ExportFormat;
  label: string;
  description: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
}

function FormatButton({ label, description, icon, selected, onClick }: FormatButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-lg border transition-all text-center ${
        selected
          ? 'border-[#00d4ff] bg-[#00d4ff]/10'
          : 'border-[#1e2a42] hover:border-[#00d4ff]/50'
      }`}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-sm font-medium ${selected ? 'text-[#00d4ff]' : 'text-white'}`}>
        {label}
      </div>
      <div className="text-xs text-[#4a5568]">{description}</div>
    </button>
  );
}

function ExportPreview({ format }: { format: ExportFormat }) {
  return (
    <div className="text-center">
      {format === 'svg' && (
        <svg width="120" height="80" viewBox="0 0 120 80">
          <rect x="10" y="10" width="30" height="30" fill="#1a1a2e" stroke="#00d4ff" strokeWidth="2" rx="4"/>
          <rect x="50" y="25" width="40" height="15" fill="#2d1b4e" stroke="#7c3aed" strokeWidth="2" rx="2"/>
          <circle x1="25" y1="25" r="8" fill="#00d4ff" opacity="0.5"/>
          <path d="M25,25 L70,32" stroke="#00ffcc" strokeWidth="2" strokeDasharray="4,2"/>
        </svg>
      )}
      {format === 'png' && (
        <svg width="120" height="80" viewBox="0 0 120 80">
          <rect x="5" y="5" width="110" height="70" fill="#0a0e17" stroke="#1e2a42" strokeWidth="1" rx="4"/>
          <rect x="20" y="20" width="25" height="25" fill="#1a1a2e" stroke="#00d4ff" strokeWidth="2" rx="3"/>
          <rect x="55" y="25" width="35" height="12" fill="#2d1b4e" stroke="#7c3aed" strokeWidth="1.5" rx="2"/>
          <circle x="32" cy="32" r="6" fill="#00d4ff" opacity="0.6"/>
          <path d="M32,32 L72,31" stroke="#00ffcc" strokeWidth="1.5" strokeDasharray="3,2"/>
        </svg>
      )}
      {format === 'poster' && (
        <svg width="100" height="140" viewBox="0 0 100 140">
          <rect x="5" y="5" width="90" height="130" fill="#0a0e17" stroke="#00d4ff" strokeWidth="1.5" rx="4"/>
          <rect x="10" y="10" width="80" height="80" fill="#121826" stroke="#7c3aed" strokeWidth="0.5" rx="2"/>
          <rect x="20" y="100" width="60" height="8" fill="#1e2a42" rx="2"/>
          <rect x="20" y="115" width="45" height="6" fill="#1e2a42" rx="1"/>
          <rect x="20" y="125" width="55" height="6" fill="#1e2a42" rx="1"/>
          <rect x="15" y="30" width="20" height="20" fill="#1a1a2e" stroke="#00d4ff" strokeWidth="1" rx="2"/>
          <rect x="40" y="35" width="30" height="10" fill="#2d1b4e" stroke="#7c3aed" strokeWidth="0.5" rx="1"/>
          <text x="50" y="50" textAnchor="middle" fontSize="6" fill="#ffd700">MACHINE</text>
        </svg>
      )}
      {format === 'enhanced-poster' && (
        <svg width="100" height="140" viewBox="0 0 100 140">
          <rect x="5" y="5" width="90" height="130" fill="#0a0e17" stroke="#00d4ff" strokeWidth="1.5" rx="4"/>
          {/* Decorative corners */}
          <path d="M5,20 L5,5 L20,5" fill="none" stroke="#ffd700" strokeWidth="2"/>
          <path d="M80,5 L95,5 L95,20" fill="none" stroke="#ffd700" strokeWidth="2"/>
          <path d="M95,120 L95,135 L80,135" fill="none" stroke="#ffd700" strokeWidth="2"/>
          <path d="M20,135 L5,135 L5,120" fill="none" stroke="#ffd700" strokeWidth="2"/>
          {/* Inner border */}
          <rect x="10" y="10" width="80" height="80" fill="#121826" stroke="#7c3aed" strokeWidth="0.5" rx="2"/>
          {/* Module preview */}
          <rect x="15" y="30" width="20" height="20" fill="#1a1a2e" stroke="#00d4ff" strokeWidth="1" rx="2"/>
          <rect x="40" y="35" width="30" height="10" fill="#2d1b4e" stroke="#7c3aed" strokeWidth="0.5" rx="1"/>
          {/* Name with decorative elements */}
          <text x="50" y="18" textAnchor="middle" fontSize="7" fill="#ffd700" fontFamily="serif">★ MACHINE NAME ★</text>
          {/* Stats with icons */}
          <text x="20" y="102" fontSize="5" fill="#4ade80">◆ STABILITY: 85%</text>
          <text x="20" y="110" fontSize="5" fill="#f59e0b">⚡ POWER: 72</text>
          <text x="20" y="118" fontSize="5" fill="#ef4444">⚠ FAILURE: 15%</text>
          {/* Tags */}
          <text x="20" y="128" fontSize="5" fill="#a855f7">Tags: arcane, amplifying</text>
          {/* Faction emblem placeholder */}
          <circle cx="75" cy="105" r="8" fill="none" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2,2"/>
          <text x="75" y="107" textAnchor="middle" fontSize="5" fill="#fbbf24">⚗</text>
        </svg>
      )}
      {format === 'faction-card' && (
        <svg width="100" height="140" viewBox="0 0 100 140">
          {/* Faction-branded card */}
          <rect x="5" y="5" width="90" height="130" fill="#0a0e17" stroke="url(#factionPreviewGradient)" strokeWidth="3" rx="6"/>
          <defs>
            <linearGradient id="factionPreviewGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa"/>
              <stop offset="50%" stopColor="#7c3aed"/>
              <stop offset="100%" stopColor="#a78bfa"/>
            </linearGradient>
          </defs>
          {/* Corner decorations */}
          <circle cx="15" cy="15" r="4" fill="#a78bfa" opacity="0.8"/>
          <circle cx="85" cy="15" r="4" fill="#a78bfa" opacity="0.8"/>
          <circle cx="15" cy="125" r="4" fill="#a78bfa" opacity="0.8"/>
          <circle cx="85" cy="125" r="4" fill="#a78bfa" opacity="0.8"/>
          {/* Faction badge */}
          <rect x="15" y="20" width="70" height="25" rx="4" fill="#a78bfa" opacity="0.2" stroke="#a78bfa" strokeWidth="1"/>
          <text x="50" y="37" textAnchor="middle" fontSize="8" fill="#a78bfa">⚔ 深渊派系</text>
          {/* Title */}
          <text x="50" y="75" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">VOID RESONATOR</text>
          {/* Rarity */}
          <rect x="25" y="85" width="50" height="15" rx="3" fill="#a855f7" opacity="0.2"/>
          <text x="50" y="95" textAnchor="middle" fontSize="7" fill="#a855f7">EPIC</text>
          {/* Module preview */}
          <rect x="20" y="105" width="60" height="25" rx="3" fill="#1a1a2e" stroke="#a78bfa" strokeWidth="0.5"/>
        </svg>
      )}
      <p className="text-xs text-[#4a5568] mt-2">
        {format === 'svg' && 'Scalable Vector Graphics'}
        {format === 'png' && 'Raster Image (2x)'}
        {format === 'poster' && 'Social Share Card'}
        {format === 'enhanced-poster' && 'Deluxe Share Card'}
        {format === 'faction-card' && 'Faction-Branded Card'}
      </p>
    </div>
  );
}
