/**
 * Export Service - Round 115
 * CodexCard export system using unified export utilities
 * Imports from unifiedExportUtils.ts to eliminate duplicate code
 */

// Import all functions from unified module - single source of truth
export {
  generateCodexCardSVG,
  generateCodexCardPNG,
  exportAsCodexCard,
  downloadCodexCard,
  validateDimensions,
  clampDimensions,
  getDefaultDimensionsForFormat,
  FORMAT_PRESETS,
  POSTER_WIDTH,
  POSTER_HEIGHT,
} from '../utils/unifiedExportUtils';

// Re-export types for convenience
export type { ExportFormat, ExportQuality } from '../utils/unifiedExportUtils';
