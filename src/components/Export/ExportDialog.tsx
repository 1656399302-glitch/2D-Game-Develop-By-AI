/**
 * ExportDialog Component - Round 95
 * Enhanced dialog with format selection (PNG/SVG) and quality presets (Standard/High)
 */
import React, { useState, useCallback } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import { FACTIONS } from '../../types/factions';
import { generateAttributes } from '../../utils/attributeGenerator';
import { calculateFaction } from '../../utils/factionCalculator';
import { CodexCardExport } from './CodexCardExport';
import { exportAsCodexCard, downloadCodexCard, ExportFormat, ExportQuality } from '../../services/exportService';

interface ExportDialogProps {
  onClose: () => void;
}

/** AC-EXPORT-001: Export dialog opens and allows format selection */
export const ExportDialog: React.FC<ExportDialogProps> = ({ onClose }) => {
  const modules = useMachineStore(state => state.modules);
  const connections = useMachineStore(state => state.connections);

  const [format, setFormat] = useState<ExportFormat>('svg');
  const [quality, setQuality] = useState<ExportQuality>('standard');
  const [isExporting, setIsExporting] = useState(false);

  // Calculate faction and attributes
  const dominantFaction = calculateFaction(modules);
  const factionId = dominantFaction || 'stellar';
  const faction = FACTIONS[factionId];
  const attributes = generateAttributes(modules, connections);

  const handleExport = useCallback(async () => {
    if (modules.length === 0) {
      alert('Please add some modules to export.');
      return;
    }

    setIsExporting(true);
    try {
      const result = await exportAsCodexCard(modules, connections, attributes, faction, format, quality);
      const ext = format === 'svg' ? 'svg' : 'png';
      const mime = format === 'svg' ? 'image/svg+xml' : 'image/png';
      const filename = `${attributes.name.replace(/\s+/g, '-').toLowerCase()}-codex-card.${ext}`;
      downloadCodexCard(result, filename, mime);
      setTimeout(onClose, 500);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [modules, connections, attributes, faction, format, quality, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Export CodexCard"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      data-testid="export-dialog"
    >
      <div className="w-full max-w-2xl bg-[#121826] border border-[#1e2a42] rounded-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#00d4ff]">Export CodexCard</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-[#1e2a42] hover:bg-[#2d3a56] flex items-center justify-center text-[#9ca3af] hover:text-white transition-colors"
            data-testid="close-dialog-button"
          >
            ✕
          </button>
        </div>

        {/* Preview - AC-EXPORT-002: Shows all required elements */}
        {modules.length > 0 && (
          <div className="mb-4 rounded-lg overflow-hidden border border-[#1e2a42]">
            <CodexCardExport
              modules={modules}
              connections={connections}
              attributes={attributes}
              faction={faction}
              className="max-h-80 overflow-hidden"
            />
          </div>
        )}

        {modules.length === 0 && (
          <div className="mb-4 p-8 text-center text-[#9ca3af] bg-[#0a0e17] rounded-lg">
            Add modules to see preview
          </div>
        )}

        {/* Format Selection - AC-EXPORT-001 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#9ca3af] mb-2">
            Export Format
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              role="radio"
              aria-checked={format === 'svg'}
              onClick={() => setFormat('svg')}
              className={`p-3 rounded-lg border transition-all text-center ${
                format === 'svg'
                  ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]'
                  : 'border-[#1e2a42] hover:border-[#00d4ff]/50 text-white'
              }`}
              data-testid="format-svg"
            >
              <div className="text-2xl mb-1">📐</div>
              <div className="text-sm font-medium">SVG</div>
              <div className="text-xs text-[#4a5568]">Vector</div>
            </button>
            <button
              role="radio"
              aria-checked={format === 'png'}
              onClick={() => setFormat('png')}
              className={`p-3 rounded-lg border transition-all text-center ${
                format === 'png'
                  ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]'
                  : 'border-[#1e2a42] hover:border-[#00d4ff]/50 text-white'
              }`}
              data-testid="format-png"
            >
              <div className="text-2xl mb-1">🖼</div>
              <div className="text-sm font-medium">PNG</div>
              <div className="text-xs text-[#4a5568]">Raster</div>
            </button>
          </div>
        </div>

        {/* Quality Preset - AC-EXPORT-001 */}
        {format === 'png' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">
              Quality Preset
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                role="radio"
                aria-checked={quality === 'standard'}
                onClick={() => setQuality('standard')}
                className={`p-3 rounded-lg border transition-all text-center ${
                  quality === 'standard'
                    ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]'
                    : 'border-[#1e2a42] hover:border-[#00d4ff]/50 text-white'
                }`}
                data-testid="quality-standard"
              >
                <div className="text-sm font-medium">Standard</div>
                <div className="text-xs text-[#4a5568]">800×1000px</div>
              </button>
              <button
                role="radio"
                aria-checked={quality === 'high'}
                onClick={() => setQuality('high')}
                className={`p-3 rounded-lg border transition-all text-center ${
                  quality === 'high'
                    ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]'
                    : 'border-[#1e2a42] hover:border-[#00d4ff]/50 text-white'
                }`}
                data-testid="quality-high"
              >
                <div className="text-sm font-medium">High</div>
                <div className="text-xs text-[#4a5568]">1600×2000px</div>
              </button>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-[#4a5568] bg-[#0a0e17] rounded-lg p-3 mb-4">
          {format === 'svg' && (
            <p>SVG export includes vector graphics, best for further editing. Scalable to any size.</p>
          )}
          {format === 'png' && (
            <p>
              PNG export creates a {quality === 'high' ? 'high-resolution (2x)' : 'standard'} raster image.
              {quality === 'standard' ? ' 800×1000px' : ' 1600×2000px'}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-[#1e2a42] hover:bg-[#2d3a56] text-white rounded-lg transition-colors"
            data-testid="cancel-button"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || modules.length === 0}
            className="flex-1 px-4 py-2 bg-[#00d4ff] hover:bg-[#00b8e6] text-black font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            data-testid="export-button"
          >
            {isExporting ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>📤 Export CodexCard</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;
