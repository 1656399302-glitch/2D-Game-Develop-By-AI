/**
 * Circuit Persistence Module
 * 
 * Round 151: Circuit Persistence System
 * 
 * Provides localStorage-based persistence for circuit designs.
 * Supports multiple circuit slots, auto-save, and corruption recovery.
 * 
 * P0 Deliverables:
 * - Circuit state persistence methods
 * - Multiple circuit slots (up to 5 recent circuits)
 * - Auto-save on state changes
 * - Restore circuit on page load
 * - Clear persistence
 * 
 * Key Features:
 * - Storage size checking before save
 * - Corrupted data recovery (try-catch parse)
 * - Multiple slot support
 * - Metadata storage (name, timestamps, node/wire counts)
 */

import { PlacedCircuitNode, CircuitWire, CircuitJunction, CircuitLayer } from '../types/circuitCanvas';

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_PREFIX = 'arcane-circuit';

export const CIRCUIT_STORAGE_KEYS = {
  /** Current working circuit (auto-saved) */
  CURRENT: `${STORAGE_PREFIX}-current`,
  
  /** Recent circuits list (metadata only) */
  RECENT_LIST: `${STORAGE_PREFIX}-recent-list`,
  
  /** Individual slot storage (format: arcane-circuit-slot-{index}) */
  SLOT_PREFIX: `${STORAGE_PREFIX}-slot`,
  
  /** Storage metadata */
  METADATA: `${STORAGE_PREFIX}-metadata`,
} as const;

/** Maximum number of recent circuit slots */
export const MAX_RECENT_SLOTS = 5;

/** Maximum storage size warning threshold (4MB) */
const STORAGE_SIZE_WARNING_MB = 4;

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Circuit state data structure for persistence
 */
export interface CircuitPersistenceData {
  /** Circuit nodes */
  nodes: PlacedCircuitNode[];
  
  /** Circuit wires */
  wires: CircuitWire[];
  
  /** Junction points (Round 144) */
  junctions: CircuitJunction[];
  
  /** Circuit layers (Round 144) */
  layers: CircuitLayer[];
  
  /** Active layer ID */
  activeLayerId: string | null;
  
  /** Saved timestamp */
  savedAt: number;
  
  /** Version for future migrations */
  version: number;
}

/**
 * Circuit metadata for recent circuits list
 */
export interface CircuitMetadata {
  /** Unique circuit ID */
  id: string;
  
  /** User-provided circuit name */
  name: string;
  
  /** Node count */
  nodeCount: number;
  
  /** Wire count */
  wireCount: number;
  
  /** Junction count */
  junctionCount: number;
  
  /** Timestamp when circuit was saved */
  timestamp: number;
  
  /** Slot index (0-4) */
  slotIndex: number;
}

/**
 * Recent circuits list storage structure
 */
export interface RecentCircuitsStorage {
  /** List of circuit metadata */
  circuits: CircuitMetadata[];
  
  /** Last updated timestamp */
  updatedAt: number;
  
  /** Version for future migrations */
  version: number;
}

/**
 * Storage result for save operations
 */
export interface SaveResult {
  /** Whether save was successful */
  success: boolean;
  
  /** Error message if save failed */
  error?: string;
  
  /** Saved slot index */
  slotIndex?: number;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if localStorage is available
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * Calculate storage size in bytes
 */
export const calculateStorageSize = (data: string): number => {
  return new Blob([data]).size;
};

/**
 * Check if data size is within safe limits
 */
export const isStorageSizeSafe = (data: string): { safe: boolean; sizeMB: number } => {
  const sizeInBytes = calculateStorageSize(data);
  const sizeInMB = sizeInBytes / (1024 * 1024);
  return {
    safe: sizeInMB < STORAGE_SIZE_WARNING_MB,
    sizeMB: sizeInMB,
  };
};

/**
 * Generate a unique circuit ID
 */
export const generateCircuitId = (): string => {
  return `circuit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get slot key for a given index
 */
export const getSlotKey = (slotIndex: number): string => {
  return `${CIRCUIT_STORAGE_KEYS.SLOT_PREFIX}-${slotIndex}`;
};

// ============================================================================
// Recent Circuits List Management
// ============================================================================

/**
 * Load recent circuits list from localStorage
 */
export const loadRecentCircuits = (): RecentCircuitsStorage => {
  try {
    const stored = localStorage.getItem(CIRCUIT_STORAGE_KEYS.RECENT_LIST);
    if (!stored) {
      return { circuits: [], updatedAt: 0, version: 1 };
    }
    
    const data = JSON.parse(stored) as RecentCircuitsStorage;
    
    // Validate structure
    if (!Array.isArray(data.circuits)) {
      console.warn('Invalid recent circuits format in localStorage');
      return { circuits: [], updatedAt: 0, version: 1 };
    }
    
    return data;
  } catch (error) {
    console.error('Failed to load recent circuits from localStorage:', error);
    return { circuits: [], updatedAt: 0, version: 1 };
  }
};

/**
 * Save recent circuits list to localStorage
 */
export const saveRecentCircuits = (circuits: RecentCircuitsStorage): boolean => {
  try {
    const serialized = JSON.stringify(circuits);
    localStorage.setItem(CIRCUIT_STORAGE_KEYS.RECENT_LIST, serialized);
    return true;
  } catch (error) {
    console.error('Failed to save recent circuits list to localStorage:', error);
    return false;
  }
};

/**
 * Add or update a circuit in the recent list
 */
export const updateRecentCircuit = (metadata: CircuitMetadata): void => {
  const recent = loadRecentCircuits();
  
  // Find existing entry with same ID
  const existingIndex = recent.circuits.findIndex(c => c.id === metadata.id);
  
  if (existingIndex >= 0) {
    // Update existing entry
    recent.circuits[existingIndex] = metadata;
  } else {
    // Add new entry at the beginning
    recent.circuits.unshift(metadata);
  }
  
  // Sort by timestamp (newest first)
  recent.circuits.sort((a, b) => b.timestamp - a.timestamp);
  
  // Limit to max slots
  if (recent.circuits.length > MAX_RECENT_SLOTS) {
    const removed = recent.circuits.splice(MAX_RECENT_SLOTS);
    
    // Clean up removed slot data
    removed.forEach(circuit => {
      try {
        localStorage.removeItem(getSlotKey(circuit.slotIndex));
      } catch {
        // Ignore cleanup errors
      }
    });
  }
  
  // Update slot indices
  recent.circuits.forEach((circuit, index) => {
    circuit.slotIndex = index;
  });
  
  recent.updatedAt = Date.now();
  saveRecentCircuits(recent);
};

/**
 * Remove a circuit from the recent list
 */
export const removeRecentCircuit = (circuitId: string): void => {
  const recent = loadRecentCircuits();
  const removed = recent.circuits.filter(c => c.id === circuitId);
  
  recent.circuits = recent.circuits.filter(c => c.id !== circuitId);
  
  // Update slot indices
  recent.circuits.forEach((circuit, index) => {
    circuit.slotIndex = index;
  });
  
  recent.updatedAt = Date.now();
  saveRecentCircuits(recent);
  
  // Clean up removed slot data
  removed.forEach(circuit => {
    try {
      localStorage.removeItem(getSlotKey(circuit.slotIndex));
    } catch {
      // Ignore cleanup errors
    }
  });
};

/**
 * Get recent circuits metadata list
 */
export const getRecentCircuits = (): CircuitMetadata[] => {
  return loadRecentCircuits().circuits;
};

// ============================================================================
// Circuit State Persistence
// ============================================================================

/**
 * Save circuit state to localStorage
 */
export const saveCircuitState = (
  nodes: PlacedCircuitNode[],
  wires: CircuitWire[],
  junctions: CircuitJunction[] = [],
  layers: CircuitLayer[] = [],
  activeLayerId: string | null = null,
  circuitId?: string,
  name?: string
): SaveResult => {
  if (!isLocalStorageAvailable()) {
    return { success: false, error: 'localStorage not available' };
  }
  
  const id = circuitId || generateCircuitId();
  const timestamp = Date.now();
  
  const data: CircuitPersistenceData = {
    nodes,
    wires,
    junctions,
    layers,
    activeLayerId,
    savedAt: timestamp,
    version: 1,
  };
  
  // Serialize and check size
  let serialized: string;
  try {
    serialized = JSON.stringify(data);
  } catch (error) {
    return { success: false, error: 'Failed to serialize circuit data' };
  }
  
  // Check storage size
  const { safe, sizeMB } = isStorageSizeSafe(serialized);
  if (!safe) {
    console.warn(`Circuit state is ${sizeMB.toFixed(2)}MB, which may exceed localStorage limits.`);
  }
  
  // Determine which slot to use
  const recent = loadRecentCircuits();
  let slotIndex: number;
  
  if (circuitId) {
    // Find existing circuit slot
    const existing = recent.circuits.find(c => c.id === circuitId);
    if (existing) {
      // Re-save to same slot
      slotIndex = existing.slotIndex;
    } else {
      // New circuit - find an unused slot
      const usedSlots = new Set(recent.circuits.map(c => c.slotIndex));
      slotIndex = 0;
      while (usedSlots.has(slotIndex)) {
        slotIndex++;
      }
    }
  } else {
    // Use first slot for current working circuit
    slotIndex = 0;
  }
  
  // Save to slot
  try {
    localStorage.setItem(getSlotKey(slotIndex), serialized);
  } catch (error) {
    console.error('Failed to save circuit state to localStorage:', error);
    return { success: false, error: 'Failed to write to localStorage' };
  }
  
  // Update recent circuits metadata
  const metadata: CircuitMetadata = {
    id,
    name: name || `Circuit ${slotIndex + 1}`,
    nodeCount: nodes.length,
    wireCount: wires.length,
    junctionCount: junctions.length,
    timestamp,
    slotIndex,
  };
  
  updateRecentCircuit(metadata);
  
  // Also save as current
  try {
    localStorage.setItem(CIRCUIT_STORAGE_KEYS.CURRENT, serialized);
  } catch {
    // Non-critical if this fails
  }
  
  return { success: true, slotIndex };
};

/**
 * Load circuit state from localStorage
 */
export const loadCircuitState = (slotIndex?: number): CircuitPersistenceData | null => {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage not available');
    return null;
  }
  
  const key = slotIndex !== undefined
    ? getSlotKey(slotIndex)
    : CIRCUIT_STORAGE_KEYS.CURRENT;
  
  try {
    const serialized = localStorage.getItem(key);
    if (!serialized) {
      return null;
    }
    
    const data = JSON.parse(serialized) as CircuitPersistenceData;
    
    // Validate structure
    if (!Array.isArray(data.nodes) || !Array.isArray(data.wires)) {
      console.warn('Invalid circuit state format in localStorage');
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to load circuit state from localStorage:', error);
    return null;
  }
};

/**
 * Load circuit state by circuit ID
 */
export const loadCircuitStateById = (circuitId: string): CircuitPersistenceData | null => {
  const recent = loadRecentCircuits();
  const metadata = recent.circuits.find(c => c.id === circuitId);
  
  if (!metadata) {
    return null;
  }
  
  return loadCircuitState(metadata.slotIndex);
};

/**
 * Clear circuit state from localStorage
 */
export const clearCircuitState = (slotIndex?: number): boolean => {
  if (!isLocalStorageAvailable()) {
    return false;
  }
  
  try {
    if (slotIndex !== undefined) {
      // Clear specific slot
      const key = getSlotKey(slotIndex);
      localStorage.removeItem(key);
      
      // Remove from recent list
      const recent = loadRecentCircuits();
      const metadata = recent.circuits.find(c => c.slotIndex === slotIndex);
      if (metadata) {
        removeRecentCircuit(metadata.id);
      }
    } else {
      // Clear all circuit data
      localStorage.removeItem(CIRCUIT_STORAGE_KEYS.CURRENT);
      localStorage.removeItem(CIRCUIT_STORAGE_KEYS.RECENT_LIST);
      
      // Clear all slots
      for (let i = 0; i < MAX_RECENT_SLOTS; i++) {
        localStorage.removeItem(getSlotKey(i));
      }
    }
    
    return true;
  } catch (error) {
    console.error('Failed to clear circuit state from localStorage:', error);
    return false;
  }
};

/**
 * Clear a specific circuit by ID
 */
export const clearCircuitById = (circuitId: string): boolean => {
  return clearCircuitState() && removeRecentCircuit(circuitId) === undefined;
};

// ============================================================================
// Storage Info
// ============================================================================

/**
 * Get storage statistics
 */
export const getStorageInfo = (): {
  usedBytes: number;
  available: boolean;
  circuitCount: number;
} => {
  if (!isLocalStorageAvailable()) {
    return { usedBytes: 0, available: false, circuitCount: 0 };
  }
  
  let usedBytes = 0;
  
  // Count all circuit-related keys
  for (const key of Object.values(CIRCUIT_STORAGE_KEYS)) {
    const value = localStorage.getItem(key);
    if (value) {
      usedBytes += calculateStorageSize(value);
    }
  }
  
  // Count slot keys
  for (let i = 0; i < MAX_RECENT_SLOTS; i++) {
    const value = localStorage.getItem(getSlotKey(i));
    if (value) {
      usedBytes += calculateStorageSize(value);
    }
  }
  
  const recent = loadRecentCircuits();
  
  return {
    usedBytes,
    available: true,
    circuitCount: recent.circuits.length,
  };
};

// ============================================================================
// Storage Event Listener
// ============================================================================

/**
 * Listen for storage changes from other tabs
 */
export const createStorageListener = (
  callback: (event: StorageEvent) => void
): (() => void) => {
  const handler = (event: StorageEvent) => {
    // Only handle circuit-related keys
    if (event.key?.startsWith(STORAGE_PREFIX)) {
      callback(event);
    }
  };
  
  window.addEventListener('storage', handler);
  
  return () => {
    window.removeEventListener('storage', handler);
  };
};
