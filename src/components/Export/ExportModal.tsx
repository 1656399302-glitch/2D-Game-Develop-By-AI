import { useState, useCallback } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import { 
  exportToSVG, 
  exportToPNG, 
  exportPoster, 
  exportEnhancedPoster, 
  exportFactionCard, 
  exportSocialPoster,
  downloadFile, 
  getResolutionDimensions,
  validateDimensions,
  getDefaultDimensionsForFormat,
} from '../../utils/exportUtils';
import { generateAttributes } from '../../utils/attributeGenerator';
import { calculateFaction } from '../../utils/factionCalculator';
import { EnhancedShareCard } from './EnhancedShareCard';
import { FACTIONS } from '../../types/factions';
import { ExportResolution, ExportAspectRatio, SocialPlatform, RESOLUTION_DIMS, ASPECT_RATIO_DIMS, PLATFORM_PRESETS, PosterBackgroundColor, POSTER_BACKGROUND_PRESETS } from '../../types';

interface ExportModalProps {
  onClose: () => void;
  onPublishToGallery?: () => void;
}

type ExportFormat = 'svg' | 'png' | 'poster' | 'enhanced-poster' | 'faction-card' | 'social';

// Custom dimension type
interface CustomDimensions {
  width: number;
  height: number;
}

// Error toast state
interface ErrorToast {
  visible: boolean;
  message: string;
}

export function ExportModal({ onClose, onPublishToGallery }: ExportModalProps) {
  const modules = useMachineStore((state) => state.modules);
  const connections = useMachineStore((state) => state.connections);
  
  // Filename state persists across format changes - key requirement AC4
  const [format, setFormat] = useState<ExportFormat>('svg');
  const [showFactionCard, setShowFactionCard] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportName, setExportName] = useState('arcane-machine');
  
  // P0 options
  const [resolution, setResolution] = useState<ExportResolution>('2x');
  const [transparentBackground, setTransparentBackground] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<ExportAspectRatio>('default');
  
  // AC4: Watermark/username support
  const [username, setUsername] = useState('');
  const [includeWatermark, setIncludeWatermark] = useState(false);
  
  // AC2/AC3/AC3b: Social platform selection
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);
  
  // Round 78: Background color selector for enhanced poster
  const [backgroundColor, setBackgroundColor] = useState<PosterBackgroundColor>('dark');
  
  // Round 115: Custom dimension inputs for poster formats
  const [customDimensions, setCustomDimensions] = useState<CustomDimensions>({
    width: 800,
    height: 1000,
  });
  const [widthError, setWidthError] = useState<string | null>(null);
  const [heightError, setHeightError] = useState<string | null>(null);
  
  // Round 115: Error toast state
  const [errorToast, setErrorToast] = useState<ErrorToast>({ visible: false, message: '' });
  
  // Calculate faction and attributes for EnhancedShareCard
  const dominantFaction = calculateFaction(modules);
  const factionId = dominantFaction || 'stellar'; // Default to stellar if no faction modules
  const faction = FACTIONS[factionId];
  const attributes = generateAttributes(modules, connections);
  
  // Get expected output dimensions for current settings - used in AC5
  const getExpectedDimensions = useCallback(() => {
    // Use custom dimensions if valid
    if (format === 'poster' || format === 'enhanced-poster' || format === 'social') {
      const dims = validateDimensions(customDimensions.width, customDimensions.height);
      if (dims.isValid) {
        return { width: customDimensions.width, height: customDimensions.height };
      }
    }
    
    if (format === 'png') {
      return getResolutionDimensions(modules, resolution);
    }
    if (format === 'poster' || format === 'enhanced-poster') {
      return ASPECT_RATIO_DIMS[aspectRatio];
    }
    if (format === 'social' && selectedPlatform) {
      const preset = PLATFORM_PRESETS[selectedPlatform];
      return { width: preset.width, height: preset.height };
    }
    return { width: 800, height: 600 };
  }, [format, resolution, aspectRatio, modules, selectedPlatform, customDimensions]);
  
  const expectedDims = getExpectedDimensions();
  
  // Handle custom dimension input change with validation
  const handleDimensionChange = useCallback((
    field: 'width' | 'height',
    value: string
  ) => {
    const numValue = parseInt(value, 10);
    const newValue = isNaN(numValue) ? 0 : numValue;
    
    // Update the dimension and validate using the new value
    setCustomDimensions(prev => {
      const newWidth = field === 'width' ? newValue : prev.width;
      const newHeight = field === 'height' ? newValue : prev.height;
      
      // Set error state based on validation
      if (field === 'width') {
        const validation = validateDimensions(newValue, prev.height);
        setWidthError(validation.isValid ? null : validation.errorMessage || null);
      } else {
        const validation = validateDimensions(prev.width, newValue);
        setHeightError(validation.isValid ? null : validation.errorMessage || null);
      }
      
      return {
        width: newWidth,
        height: newHeight,
      };
    });
  }, []);
  
  // Handle format change - reset dimensions for social format
  const handlePlatformSelect = useCallback((platform: SocialPlatform) => {
    setFormat('social');
    setSelectedPlatform(platform);
    // Round 115: Reset dimensions when switching to social format
    const defaults = getDefaultDimensionsForFormat(platform);
    setCustomDimensions(defaults);
    setWidthError(null);
    setHeightError(null);
  }, []);
  
  // Handle aspect ratio change for poster formats
  const handleAspectRatioChange = useCallback((newRatio: ExportAspectRatio) => {
    setAspectRatio(newRatio);
    // Round 115: Reset dimensions when switching aspect ratios
    const dims = ASPECT_RATIO_DIMS[newRatio];
    setCustomDimensions({ width: dims.width, height: dims.height });
    setWidthError(null);
    setHeightError(null);
  }, []);
  
  // Show error toast
  const showError = useCallback((message: string) => {
    setErrorToast({ visible: true, message });
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setErrorToast({ visible: false, message: '' });
    }, 5000);
  }, []);
  
  // Dismiss error toast
  const dismissError = useCallback(() => {
    setErrorToast({ visible: false, message: '' });
  }, []);
  
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    
    try {
      // Round 115: Validate custom dimensions before export
      if (format === 'poster' || format === 'enhanced-poster' || format === 'social') {
        const validation = validateDimensions(customDimensions.width, customDimensions.height);
        if (!validation.isValid) {
          showError(validation.errorMessage || 'Invalid dimensions. Please check your values.');
          setIsExporting(false);
          return;
        }
      }
      
      const sanitizedName = exportName.replace(/[^a-z0-9]/gi, '-').toLowerCase().replace(/-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
      
      switch (format) {
        case 'svg':
          const svgContent = exportToSVG(modules, connections, {
            format: 'svg',
          });
          downloadFile(svgContent, `${sanitizedName}.svg`, 'image/svg+xml');
          break;
          
        case 'png':
          const pngBlob = await exportToPNG(modules, connections, {
            scale: resolution,
            transparentBackground: transparentBackground,
          });
          downloadFile(pngBlob, `${sanitizedName}.png`, 'image/png');
          break;
          
        case 'poster':
          const posterContent = exportPoster(modules, connections, attributes, aspectRatio);
          downloadFile(posterContent, `${sanitizedName}-${aspectRatio}-poster.svg`, 'image/svg+xml');
          break;
          
        case 'enhanced-poster':
          // Round 78: Pass background color option to export
          const enhancedContent = exportEnhancedPoster(modules, connections, attributes, aspectRatio, {
            username: includeWatermark ? username : undefined,
            backgroundColor: backgroundColor,
            factionColor: faction.color,
          });
          downloadFile(enhancedContent, `${sanitizedName}-${aspectRatio}-enhanced-poster.svg`, 'image/svg+xml');
          break;
          
        case 'social':
          if (selectedPlatform) {
            const socialContent = exportSocialPoster(
              modules, 
              connections, 
              attributes, 
              selectedPlatform, 
              { username: includeWatermark ? username : undefined }
            );
            const preset = PLATFORM_PRESETS[selectedPlatform];
            const extension = preset.name.toLowerCase().replace(/[^a-z]/g, '');
            downloadFile(socialContent, `${sanitizedName}-${extension}-poster.svg`, 'image/svg+xml');
          }
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
      // Round 115: Show user-visible error toast instead of just alert
      showError('Export failed. Try reducing image size or changing format.');
      setIsExporting(false);
    }
  }, [format, exportName, modules, connections, attributes, onClose, resolution, transparentBackground, aspectRatio, selectedPlatform, username, includeWatermark, backgroundColor, faction, customDimensions, showError]);
  
  const handleFactionCardExportSVG = useCallback(() => {
    const factionCardContent = exportFactionCard(modules, connections, attributes, faction);
    downloadFile(factionCardContent, `${attributes.name.replace(/\s+/g, '-').toLowerCase()}-share-card.svg`, 'image/svg+xml');
  }, [modules, connections, attributes, faction]);
  
  const handleFactionCardExportPNG = useCallback(async () => {
    const factionCardContent = exportFactionCard(modules, connections, attributes, faction);
    // Convert SVG to PNG using canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Round 117 Fix: Show user-visible error when canvas context is not available
    if (!ctx) {
      showError('Failed to create canvas context. Faction card PNG export is not available in this browser.');
      return;
    }
    
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
        if (!blob) {
          showError('Failed to generate PNG blob. Please try exporting as SVG instead.');
          return;
        }
        downloadFile(blob, `${attributes.name.replace(/\s+/g, '-').toLowerCase()}-share-card.png`, 'image/png');
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    
    img.onerror = () => {
      showError('Failed to load faction card image. Please try exporting as SVG instead.');
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  }, [modules, connections, attributes, faction, showError]);
  
  const handlePublishToGallery = useCallback(() => {
    if (onPublishToGallery) {
      onPublishToGallery();
      onClose();
    }
  }, [onPublishToGallery, onClose]);
  
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
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Export Machine"
      aria-labelledby="export-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg bg-[#121826] border border-[#1e2a42] rounded-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 id="export-modal-title" className="text-xl font-bold text-[#00d4ff]">Export Machine</h2>
          <button
            onClick={onClose}
            aria-label="Close export dialog"
            className="w-8 h-8 rounded-full bg-[#1e2a42] hover:bg-[#2d3a56] flex items-center justify-center text-[#9ca3af] hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* Round 115: Error Toast */}
        {errorToast.visible && (
          <div 
            className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg flex items-center justify-between"
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-center gap-2">
              <span className="text-red-400">⚠</span>
              <span className="text-sm text-red-200">{errorToast.message}</span>
            </div>
            <button
              onClick={dismissError}
              className="text-red-400 hover:text-red-300"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}
        
        {/* Preview */}
        <div className="aspect-video bg-[#0a0e17] rounded-lg mb-4 flex items-center justify-center overflow-hidden">
          <ExportPreview format={format} platform={selectedPlatform} dimensions={expectedDims} />
        </div>
        
        {/* Options */}
        <div className="space-y-4">
          {/* AC1: Format Selection with 8 options (5 existing + 3 new social presets) */}
          <div role="tablist" aria-label="Export format">
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">
              Export Format (8 options)
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
              {/* AC1: New social presets - 3 additional options */}
              <FormatButton
                format="social-twitter"
                label="Twitter/X"
                description="16:9 - 1200×675"
                icon="𝕏"
                selected={format === 'social' && selectedPlatform === 'twitter'}
                onClick={() => handlePlatformSelect('twitter')}
                platform="twitter"
              />
              <FormatButton
                format="social-instagram"
                label="Instagram"
                description="1:1 - 1080×1080"
                icon="📷"
                selected={format === 'social' && selectedPlatform === 'instagram'}
                onClick={() => handlePlatformSelect('instagram')}
                platform="instagram"
              />
              <FormatButton
                format="social-discord"
                label="Discord"
                description="3:2 - 600×400"
                icon="💬"
                selected={format === 'social' && selectedPlatform === 'discord'}
                onClick={() => handlePlatformSelect('discord')}
                platform="discord"
              />
            </div>
          </div>
          
          {/* AC2/AC3/AC3b: Social Platform Preview when social format selected */}
          {format === 'social' && selectedPlatform && (
            <div className="p-3 bg-[#0a0e17] rounded-lg border border-[#1e2a42]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{PLATFORM_PRESETS[selectedPlatform].icon}</span>
                  <span className="text-sm font-medium text-white">{PLATFORM_PRESETS[selectedPlatform].nameCn}</span>
                </div>
                <span className="text-xs text-[#9ca3af]">{PLATFORM_PRESETS[selectedPlatform].aspectRatio}</span>
              </div>
            </div>
          )}
          
          {/* P0: Resolution Selector - Only for PNG */}
          {format === 'png' && (
            <div>
              <label className="block text-sm font-medium text-[#9ca3af] mb-2">
                分辨率 (Resolution)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['1x', '2x', '4x'] as ExportResolution[]).map((res) => {
                  const dims = RESOLUTION_DIMS[res];
                  const expectedSize = `${dims.scaled}×${Math.round(dims.scaled * 0.75)}px`;
                  return (
                    <button
                      key={res}
                      role="button"
                      aria-label={`Resolution ${res}`}
                      aria-pressed={resolution === res}
                      onClick={() => setResolution(res)}
                      className={`p-2 rounded-lg border transition-all text-center ${
                        resolution === res
                          ? 'border-[#00d4ff] bg-[#00d4ff]/10 selected'
                          : 'border-[#1e2a42] hover:border-[#00d4ff]/50'
                      }`}
                    >
                      <div className={`text-sm font-bold ${resolution === res ? 'text-[#00d4ff]' : 'text-white'}`}>
                        {res}
                      </div>
                      <div className="text-xs text-[#4a5568]">{expectedSize}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* P0: Transparent Background Toggle - Only for PNG */}
          {format === 'png' && (
            <div className="flex items-center gap-3 p-3 bg-[#0a0e17] rounded-lg border border-[#1e2a42]">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  role="checkbox"
                  aria-checked={transparentBackground}
                  aria-label="transparent background"
                  checked={transparentBackground}
                  onChange={(e) => setTransparentBackground(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#1e2a42] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00d4ff]"></div>
              </label>
              <div>
                <div className="text-sm font-medium text-white">透明背景</div>
                <div className="text-xs text-[#4a5568]">Transparent Background</div>
              </div>
            </div>
          )}
          
          {/* P0: Aspect Ratio Selector - For Poster formats */}
          {(format === 'poster' || format === 'enhanced-poster') && (
            <div>
              <label className="block text-sm font-medium text-[#9ca3af] mb-2">
                纵横比 (Aspect Ratio)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['default', 'square', 'portrait', 'landscape'] as ExportAspectRatio[]).map((ratio) => {
                  const dims = ASPECT_RATIO_DIMS[ratio];
                  const labels: Record<ExportAspectRatio, string> = {
                    'default': '默认 (Default)',
                    'square': '方形 (Square)',
                    'portrait': '纵向 (Portrait)',
                    'landscape': '横向 (Landscape)',
                  };
                  return (
                    <button
                      key={ratio}
                      role="button"
                      aria-label={labels[ratio]}
                      aria-pressed={aspectRatio === ratio}
                      onClick={() => handleAspectRatioChange(ratio)}
                      className={`p-2 rounded-lg border transition-all text-center ${
                        aspectRatio === ratio
                          ? 'border-[#00d4ff] bg-[#00d4ff]/10 selected'
                          : 'border-[#1e2a42] hover:border-[#00d4ff]/50'
                      }`}
                    >
                      <div className={`text-sm font-medium ${aspectRatio === ratio ? 'text-[#00d4ff]' : 'text-white'}`}>
                        {labels[ratio]}
                      </div>
                      <div className="text-xs text-[#4a5568]">{dims.width}×{dims.height}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Round 115: Custom Dimensions Input - For poster and social formats */}
          {(format === 'poster' || format === 'enhanced-poster' || format === 'social') && (
            <div>
              <label className="block text-sm font-medium text-[#9ca3af] mb-2">
                自定义尺寸 (Custom Dimensions)
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* Width Input */}
                <div>
                  <label htmlFor="custom-width" className="block text-xs text-[#6b7280] mb-1">
                    宽度 (Width)
                  </label>
                  <input
                    id="custom-width"
                    type="number"
                    role="spinbutton"
                    aria-label="Custom width in pixels"
                    aria-describedby={widthError ? 'width-error' : undefined}
                    aria-invalid={!!widthError}
                    value={customDimensions.width}
                    onChange={(e) => handleDimensionChange('width', e.target.value)}
                    min={400}
                    max={2000}
                    className={`w-full bg-[#0a0e17] border rounded-lg px-3 py-2 text-white placeholder-[#4a5568] focus:outline-none transition-colors ${
                      widthError 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-[#1e2a42] focus:border-[#00d4ff]'
                    }`}
                    placeholder="800"
                  />
                  {widthError && (
                    <p id="width-error" className="mt-1 text-xs text-red-400" role="alert">
                      {widthError}
                    </p>
                  )}
                </div>
                
                {/* Height Input */}
                <div>
                  <label htmlFor="custom-height" className="block text-xs text-[#6b7280] mb-1">
                    高度 (Height)
                  </label>
                  <input
                    id="custom-height"
                    type="number"
                    role="spinbutton"
                    aria-label="Custom height in pixels"
                    aria-describedby={heightError ? 'height-error' : undefined}
                    aria-invalid={!!heightError}
                    value={customDimensions.height}
                    onChange={(e) => handleDimensionChange('height', e.target.value)}
                    min={400}
                    max={2000}
                    className={`w-full bg-[#0a0e17] border rounded-lg px-3 py-2 text-white placeholder-[#4a5568] focus:outline-none transition-colors ${
                      heightError 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-[#1e2a42] focus:border-[#00d4ff]'
                    }`}
                    placeholder="1000"
                  />
                  {heightError && (
                    <p id="height-error" className="mt-1 text-xs text-red-400" role="alert">
                      {heightError}
                    </p>
                  )}
                </div>
              </div>
              <p className="mt-1 text-xs text-[#4a5568]">
                范围: 400-2000px (Range: 400-2000px)
              </p>
            </div>
          )}
          
          {/* Round 78: Background Color Selector - For enhanced poster */}
          {format === 'enhanced-poster' && (
            <div>
              <label className="block text-sm font-medium text-[#9ca3af] mb-2">
                背景颜色 (Background Color) - 5 options
              </label>
              <div className="grid grid-cols-5 gap-2">
                {POSTER_BACKGROUND_PRESETS.map((preset) => {
                  const isSelected = backgroundColor === preset.id;
                  const borderColor = preset.id === 'faction' ? faction.color : undefined;
                  return (
                    <button
                      key={preset.id}
                      role="button"
                      aria-label={preset.nameCn}
                      aria-pressed={isSelected}
                      onClick={() => setBackgroundColor(preset.id)}
                      className={`p-2 rounded-lg border transition-all text-center ${
                        isSelected
                          ? 'border-[#00d4ff] bg-[#00d4ff]/10'
                          : 'border-[#1e2a42] hover:border-[#00d4ff]/50'
                      }`}
                      style={isSelected && borderColor ? { borderColor } : {}}
                      title={preset.description}
                    >
                      {/* Color preview swatch */}
                      <div
                        className="w-full h-8 rounded-md mb-1"
                        style={{
                          background: preset.id === 'faction'
                            ? `linear-gradient(135deg, ${faction.color}40, #1a1a2e)`
                            : `linear-gradient(135deg, ${preset.gradient.start}, ${preset.gradient.end})`,
                          border: `1px solid ${isSelected ? '#00d4ff' : '#2d3a56'}`,
                        }}
                      />
                      <div className={`text-xs font-medium ${isSelected ? 'text-[#00d4ff]' : 'text-white'}`}>
                        {preset.nameCn}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="mt-1 text-xs text-[#4a5568]">
                选择导出海报的背景颜色主题
              </p>
            </div>
          )}
          
          {/* AC4: Username/Watermark Input - For poster, enhanced-poster, and social formats */}
          {(format === 'poster' || format === 'enhanced-poster' || format === 'social') && (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  role="textbox"
                  aria-label="username"
                  name="username"
                  data-testid="username-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1 bg-[#0a0e17] border border-[#1e2a42] rounded-lg px-3 py-2 text-white placeholder-[#4a5568] focus:outline-none focus:border-[#00d4ff] transition-colors"
                  placeholder="Author (optional)"
                />
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    role="checkbox"
                    aria-checked={includeWatermark}
                    aria-label="include watermark"
                    data-testid="watermark-toggle"
                    checked={includeWatermark}
                    onChange={(e) => setIncludeWatermark(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#1e2a42] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00d4ff]"></div>
                </label>
              </div>
              <div className="text-xs text-[#4a5568]">
                水印将显示在导出图片的右下角 (Watermark will appear in bottom-right of exported image)
              </div>
            </div>
          )}
          
          {/* P0: Filename Input - Persists across format changes - AC4 requirement */}
          {format !== 'faction-card' && (
            <div>
              <label className="block text-sm font-medium text-[#9ca3af] mb-2">
                文件名 (Filename)
              </label>
              <input
                type="text"
                role="textbox"
                aria-label="filename"
                name="filename"
                value={exportName}
                onChange={(e) => setExportName(e.target.value)}
                className="w-full bg-[#0a0e17] border border-[#1e2a42] rounded-lg px-3 py-2 text-white placeholder-[#4a5568] focus:outline-none focus:border-[#00d4ff] transition-colors"
                placeholder="arcane-machine"
              />
              <div className="mt-1 text-xs text-[#4a5568]">
                当前文件名将保持不变，即使切换导出格式
              </div>
            </div>
          )}
          
          {/* P0: Output Dimensions Preview with data-testid - AC5 requirement */}
          <div className="p-3 bg-[#0a0e17] rounded-lg border border-[#1e2a42]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#9ca3af]">输出尺寸 (Output Size)</span>
              <span 
                className="text-sm font-mono text-[#00d4ff]"
                data-testid="dimension-indicator"
              >
                {expectedDims.width} × {expectedDims.height} px
              </span>
            </div>
          </div>
          
          {/* Info */}
          <div className="text-xs text-[#4a5568] bg-[#0a0e17] rounded-lg p-3">
            {format === 'svg' && (
              <p>SVG export includes all modules, connections, and animations. Best for further editing in vector software.</p>
            )}
            {format === 'png' && (
              <p>PNG export creates a high-resolution raster image at {resolution} scale. Transparent background removes the dark background.</p>
            )}
            {format === 'poster' && (
              <p>Poster export creates a styled share card with machine preview, stats, and decorative border at {aspectRatio} aspect ratio.</p>
            )}
            {format === 'enhanced-poster' && (
              <p>Enhanced poster includes decorative corners, ornate name styling, attribute icons, and faction emblem at {aspectRatio} aspect ratio. Now with custom background colors!</p>
            )}
            {format === 'faction-card' && (
              <p>Faction Card export creates a branded share card with faction-colored border and theming based on your machine's dominant faction.</p>
            )}
            {format === 'social' && selectedPlatform && (
              <p>{PLATFORM_PRESETS[selectedPlatform].name} optimized export at {PLATFORM_PRESETS[selectedPlatform].width}×{PLATFORM_PRESETS[selectedPlatform].height}px with platform-specific styling.</p>
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
          
          {/* Publish to Gallery Button */}
          {onPublishToGallery && (
            <div className="pt-2 border-t border-[#1e2a42]">
              <button
                onClick={handlePublishToGallery}
                className="w-full px-4 py-3 rounded-lg bg-[#7c3aed]/20 text-[#a78bfa] border border-[#7c3aed]/40 hover:bg-[#7c3aed]/30 transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-xl">🌐</span>
                <span className="font-medium">Publish to Community Gallery</span>
              </button>
              <p className="mt-1 text-xs text-[#4a5568] text-center">
                Share your machine with the community (session-scoped)
              </p>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-[#1e2a42] hover:bg-[#2d3a56] text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          {format === 'faction-card' ? (
            <button
              onClick={() => setShowFactionCard(true)}
              className="flex-1 px-4 py-2 bg-[#00d4ff] hover:bg-[#00b8e6] text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              ⚔ Open Faction Card
            </button>
          ) : (
            <button
              onClick={handleExport}
              disabled={isExporting || !!widthError || !!heightError}
              className="flex-1 px-4 py-2 bg-[#00d4ff] hover:bg-[#00b8e6] text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Exporting...
                </>
              ) : (
                <>📤 Export {format === 'enhanced-poster' ? 'Enhanced' : (format === 'social' && selectedPlatform ? PLATFORM_PRESETS[selectedPlatform].name : format.toUpperCase())}</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface FormatButtonProps {
  format: string;
  label: string;
  description: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
  platform?: SocialPlatform;
}

function FormatButton({ label, description, icon, selected, onClick, platform }: FormatButtonProps) {
  const platformColors: Record<string, string> = {
    twitter: '#1DA1F2',
    instagram: '#E4405F',
    discord: '#5865F2',
  };
  const borderColor = platform ? platformColors[platform] || '#1e2a42' : undefined;
  
  return (
    <button
      role="tab"
      aria-selected={selected}
      aria-label={label}
      onClick={onClick}
      className={`p-3 rounded-lg border transition-all text-center ${
        selected
          ? `border-[#00d4ff] bg-[#00d4ff]/10`
          : platform && borderColor
            ? `border-[${borderColor}]/40 hover:border-[${borderColor}]/60`
            : 'border-[#1e2a42] hover:border-[#00d4ff]/50'
      }`}
      style={platform && selected ? { borderColor: borderColor } : (platform && !selected ? { borderColor: `${borderColor}40` } : {})}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-sm font-medium ${selected ? 'text-[#00d4ff]' : 'text-white'}`}>
        {label}
      </div>
      <div className="text-xs text-[#4a5568]">{description}</div>
    </button>
  );
}

interface ExportPreviewProps {
  format: string;
  platform?: SocialPlatform | null;
  dimensions?: { width: number; height: number };
}

function ExportPreview({ format, platform, dimensions }: ExportPreviewProps) {
  // AC1: Show preview for all 8 formats including new social presets
  // AC-115-004: Preview updates to reflect custom dimensions
  const previewDims = dimensions || { width: 100, height: 140 };
  
  // Calculate preview aspect ratio
  const aspectRatio = previewDims.width / previewDims.height;
  const maxPreviewWidth = 100;
  const maxPreviewHeight = 140;
  
  let previewWidth: number;
  let previewHeight: number;
  
  if (aspectRatio > 1) {
    // Wider than tall
    previewWidth = maxPreviewWidth;
    previewHeight = maxPreviewWidth / aspectRatio;
  } else {
    // Taller than wide or square
    previewHeight = maxPreviewHeight;
    previewWidth = maxPreviewHeight * aspectRatio;
  }
  
  if (format === 'social' && platform) {
    const preset = PLATFORM_PRESETS[platform];
    const isLandscape = platform === 'twitter';
    const isSquare = platform === 'instagram';
    const socialPreviewWidth = isSquare ? 100 : (isLandscape ? 140 : 120);
    const socialPreviewHeight = isSquare ? 100 : (isLandscape ? 80 : 80);
    
    return (
      <svg width={socialPreviewWidth} height={socialPreviewHeight} viewBox={`0 0 ${socialPreviewWidth} ${socialPreviewHeight}`}>
        <rect x="2" y="2" width={socialPreviewWidth - 4} height={socialPreviewHeight - 4} fill="#0a0e17" stroke={preset.accentColor} strokeWidth="2" rx="4"/>
        {/* Social preview elements */}
        <rect x={socialPreviewWidth * 0.1} y={socialPreviewHeight * 0.1} width={socialPreviewWidth * 0.8} height={socialPreviewHeight * 0.5} fill="#121826" rx="2"/>
        <circle cx={socialPreviewWidth * 0.3} cy={socialPreviewHeight * 0.35} r="10" fill="#1a1a2e" stroke="#00d4ff" strokeWidth="1"/>
        <rect x={socialPreviewWidth * 0.5} y={socialPreviewHeight * 0.25} width={socialPreviewWidth * 0.35} height={socialPreviewHeight * 0.2} fill="#2d1b4e" rx="1"/>
        {/* Watermark area */}
        <text x={socialPreviewWidth * 0.9} y={socialPreviewHeight * 0.95} textAnchor="end" fontSize="6" fill="#4a5568" opacity="0.6">@{platform}</text>
      </svg>
    );
  }
  
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
      {(format === 'poster' || format === 'enhanced-poster' || format === 'social') && (
        <svg 
          width={previewWidth} 
          height={previewHeight} 
          viewBox={`0 0 ${previewDims.width} ${previewDims.height}`}
        >
          <rect x="5" y="5" width={previewDims.width - 10} height={previewDims.height - 10} fill="#0a0e17" stroke="#00d4ff" strokeWidth="2" rx="6"/>
          {/* Decorative corners */}
          <path d="M5,40 L5,5 L40,5" fill="none" stroke="#ffd700" strokeWidth="2"/>
          <path d={`${previewDims.width - 5},5 L${previewDims.width - 40},5 L${previewDims.width - 5},40`} fill="none" stroke="#ffd700" strokeWidth="2"/>
          <path d={`5,${previewDims.height - 5} L5,${previewDims.height - 40} L40,${previewDims.height - 5}`} fill="none" stroke="#ffd700" strokeWidth="2"/>
          <path d={`${previewDims.width - 5},${previewDims.height - 40} L${previewDims.width - 40},${previewDims.height - 5} L${previewDims.width - 5},${previewDims.height - 5}`} fill="none" stroke="#ffd700" strokeWidth="2"/>
          {/* Machine preview area */}
          <rect x={previewDims.width * 0.08} y={previewDims.height * 0.15} width={previewDims.width * 0.84} height={previewDims.height * 0.45} fill="#121826" stroke="#7c3aed" strokeWidth="1" rx="4"/>
          {/* Module preview */}
          <rect x={previewDims.width * 0.15} y={previewDims.height * 0.25} width={previewDims.width * 0.2} height={previewDims.height * 0.25} fill="#1a1a2e" stroke="#00d4ff" strokeWidth="1" rx="2"/>
          <rect x={previewDims.width * 0.45} y={previewDims.height * 0.32} width={previewDims.width * 0.35} height={previewDims.height * 0.1} fill="#2d1b4e" stroke="#7c3aed" strokeWidth="0.5" rx="1"/>
          {/* Name with decorative elements */}
          <text x={previewDims.width / 2} y={previewDims.height * 0.08} textAnchor="middle" fontSize={previewDims.width * 0.06} fill="#ffd700" fontFamily="serif">★ MACHINE ★</text>
          {/* Stats preview */}
          <rect x={previewDims.width * 0.1} y={previewDims.height * 0.65} width={previewDims.width * 0.35} height={previewDims.height * 0.06} fill="#1e2a42" rx="2"/>
          <rect x={previewDims.width * 0.1} y={previewDims.height * 0.75} width={previewDims.width * 0.3} height={previewDims.height * 0.06} fill="#1e2a42" rx="2"/>
          <rect x={previewDims.width * 0.5} y={previewDims.height * 0.65} width={previewDims.width * 0.4} height={previewDims.height * 0.25} fill="#1e2a42" rx="2"/>
          {/* Dimension indicator */}
          <text x={previewDims.width / 2} y={previewDims.height * 0.95} textAnchor="middle" fontSize={previewDims.width * 0.035} fill="#4a5568">
            {previewDims.width}×{previewDims.height}
          </text>
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
        {(format === 'social') && platform && `${PLATFORM_PRESETS[platform].name} Optimized`}
      </p>
    </div>
  );
}

export default ExportModal;
