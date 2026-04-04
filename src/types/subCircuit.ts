/**
 * Sub-Circuit Module Type Definitions
 * 
 * Round 129: Sub-circuit Module System
 * 
 * Defines types for custom sub-circuits that encapsulate multiple
 * circuit components into reusable module types.
 */

// ============================================================================
// Sub-Circuit Module Types
// ============================================================================

/**
 * Represents a custom sub-circuit module that can be placed on the canvas
 */
export interface SubCircuitModule {
  /** Unique identifier */
  id: string;
  /** User-defined name for the sub-circuit */
  name: string;
  /** IDs of the circuit nodes that make up this sub-circuit */
  moduleIds: string[];
  /** Timestamp when the sub-circuit was created */
  createdAt: number;
  /** Timestamp when the sub-circuit was last modified */
  updatedAt: number;
  /** Optional description */
  description?: string;
}

/**
 * Sub-circuit instance on the canvas
 */
export interface SubCircuitInstance {
  /** Unique identifier for this instance */
  id: string;
  /** Reference to the sub-circuit module ID */
  moduleId: string;
  /** Position on canvas */
  position: { x: number; y: number };
  /** Rotation (0, 90, 180, 270) */
  rotation: number;
  /** Custom label (defaults to module name) */
  label?: string;
}

/**
 * State for the sub-circuit store
 */
export interface SubCircuitStoreState {
  /** All registered sub-circuit modules */
  subCircuits: SubCircuitModule[];
  /** Maximum number of custom sub-circuits allowed */
  maxSubCircuits: number;
}

/**
 * Sub-circuit creation input
 */
export interface CreateSubCircuitInput {
  /** User-defined name */
  name: string;
  /** IDs of selected circuit nodes */
  moduleIds: string[];
  /** Optional description */
  description?: string;
}

/**
 * Sub-circuit creation result
 */
export interface CreateSubCircuitResult {
  /** The created sub-circuit module */
  subCircuit?: SubCircuitModule;
  /** Error message if creation failed */
  error?: string;
  /** Whether creation was successful */
  success: boolean;
}

/**
 * Sub-circuit deletion result
 */
export interface DeleteSubCircuitResult {
  /** Whether deletion was successful */
  success: boolean;
  /** Error message if deletion failed */
  error?: string;
  /** IDs of canvas instances that were removed */
  removedInstanceIds?: string[];
}

/**
 * Sub-circuit module item for UI display
 */
export interface SubCircuitItem {
  /** Sub-circuit module ID */
  id: string;
  /** Display name */
  name: string;
  /** Number of modules in this sub-circuit */
  moduleCount: number;
  /** When it was created */
  createdAt: number;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Maximum number of custom sub-circuits allowed
 */
export const MAX_CUSTOM_SUB_CIRCUITS = 20;

/**
 * Storage key for sub-circuit persistence
 */
export const SUB_CIRCUIT_STORAGE_KEY = 'arcane-subcircuits-storage';

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Validate a sub-circuit name
 */
export function isValidSubCircuitName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= 50;
}

/**
 * Check if a sub-circuit name is unique
 */
export function isNameUnique(
  name: string,
  existingSubCircuits: SubCircuitModule[]
): boolean {
  const normalizedName = name.trim().toLowerCase();
  return !existingSubCircuits.some(
    (sc) => sc.name.trim().toLowerCase() === normalizedName
  );
}

/**
 * Sort sub-circuits by creation date (newest first)
 */
export function sortByCreationDate(
  subCircuits: SubCircuitModule[]
): SubCircuitModule[] {
  return [...subCircuits].sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Create a sub-circuit item for UI display
 */
export function toSubCircuitItem(module: SubCircuitModule): SubCircuitItem {
  return {
    id: module.id,
    name: module.name,
    moduleCount: module.moduleIds.length,
    createdAt: module.createdAt,
  };
}
