/**
 * Canvas components module
 */

export { default as SnapToGrid } from './SnapToGrid';
export { GridDisplay, GridSnapOverlay, useSnapToGrid } from './SnapToGrid';
export { 
  snapToGrid, 
  snapValue, 
  smartSnapToGrid, 
  snapModuleToGrid,
  calculateGridLines,
  DEFAULT_GRID_SIZE,
  DEFAULT_SNAP_THRESHOLD,
} from './SnapToGrid';
