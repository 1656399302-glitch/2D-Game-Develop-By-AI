import { useState, useCallback } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import { exportToSVG, exportToPNG, exportPoster, exportEnhancedPoster, downloadFile } from '../../utils/exportUtils';
import { generateAttributes } from '../../utils/attributeGenerator';

interface ExportModalProps {
  onClose: () => void;
}

type ExportFormat = 'svg' | 'png' | 'poster' | 'enhanced-poster';

export function ExportModal({ onClose }: ExportModalProps) {
  const modules = useMachineStore((state) => state.modules);
  const connections = useMachineStore((state) => state.connections);
  
  const [format, setFormat] = useState<ExportFormat>('svg');
  const [isExporting, setIsExporting] = useState(false);
  const [exportName, setExportName] = useState('arcane-machine');
  
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    
    try {
      const filename = exportName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const attributes = generateAttributes(modules, connections);
      
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
  }, [format, exportName, modules, connections, onClose]);
  
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
            </div>
          </div>
          
          {/* Filename */}
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
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 arcane-button-secondary"
          >
            Cancel
          </button>
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
      <p className="text-xs text-[#4a5568] mt-2">
        {format === 'svg' && 'Scalable Vector Graphics'}
        {format === 'png' && 'Raster Image (2x)'}
        {format === 'poster' && 'Social Share Card'}
        {format === 'enhanced-poster' && 'Deluxe Share Card'}
      </p>
    </div>
  );
}
