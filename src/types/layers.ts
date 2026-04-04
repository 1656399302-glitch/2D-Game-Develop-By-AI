/**
 * Layer System Type Definitions
 * 
 * Round 127: Multi-layer support for circuit canvas
 * 
 * Provides layer abstraction for organizing circuit components
 * into separate visual layers with independent visibility.
 */

export interface Layer {
  /** Unique layer identifier */
  id: string;
  /** Display name for the layer */
  name: string;
  /** Whether the layer is visible on the canvas */
  visible: boolean;
  /** Color identifier for layer tab/tab differentiation */
  color: string;
  /** Display order (lower = rendered first) */
  order: number;
}

/** Default layer colors palette */
export const LAYER_COLORS: string[] = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#a855f7', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#ec4899', // pink
];

/**
 * Get a color for a layer based on its index
 */
export function getLayerColor(index: number): string {
  return LAYER_COLORS[index % LAYER_COLORS.length];
}
