/**
 * Circuit Challenge Store
 * 
 * Round 175: Circuit Challenge System Integration
 * 
 * Zustand store for managing circuit challenge mode state.
 * This store handles:
 * - Active challenge tracking
 * - Challenge mode toggle
 * - Canvas state preservation/restoration
 * - Input/output node configurations
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CircuitChallenge,
  CIRCUIT_CHALLENGES,
  getCircuitChallengeById,
} from '../data/circuitChallenges';
import { OutputTarget } from '../types/challenge';
import { useCircuitCanvasStore } from './useCircuitCanvasStore';

// ============================================================================
// Types
// ============================================================================

/**
 * Challenge input configuration with node IDs
 */
export interface ChallengeNodeConfig {
  id: string;
  label: string;
  defaultState: boolean;
  nodeId?: string; // Set when node is created on canvas
}

/**
 * Challenge mode state
 */
interface CircuitChallengeState {
  /** Whether challenge mode is currently active */
  isChallengeMode: boolean;
  
  /** Currently active challenge ID */
  activeChallengeId: string | null;
  
  /** Input configurations for active challenge */
  challengeInputConfigs: ChallengeNodeConfig[];
  
  /** Expected output states for active challenge */
  challengeOutputExpectations: OutputTarget[];
  
  /** Preserved circuit state when entering challenge mode */
  preservedCanvasState: PreservedCanvasState | null;
  
  /** Challenge mode UI visibility */
  isPanelOpen: boolean;
}

/**
 * Preserved canvas state for restoration
 */
interface PreservedCanvasState {
  nodes: unknown[];
  wires: unknown[];
  junctions: unknown[];
  layers: unknown[];
  activeLayerId: string | null;
}

/**
 * Store actions
 */
interface CircuitChallengeActions {
  /** Open the challenge panel */
  openPanel: () => void;
  
  /** Close the challenge panel */
  closePanel: () => void;
  
  /** Toggle challenge panel visibility */
  togglePanel: () => void;
  
  /** Start a circuit challenge */
  startChallenge: (challengeId: string) => boolean;
  
  /** Exit challenge mode and restore previous state */
  exitChallenge: () => void;
  
  /** Check if a challenge is completed */
  isChallengeCompleted: (challengeId: string) => boolean;
  
  /** Mark a challenge as completed */
  markChallengeCompleted: (challengeId: string) => void;
  
  /** Get all circuit challenges */
  getAllChallenges: () => CircuitChallenge[];
  
  /** Get active challenge details */
  getActiveChallenge: () => CircuitChallenge | null;
  
  /** Update input config node ID after canvas setup */
  setInputNodeId: (configId: string, nodeId: string) => void;
  
  /** Reset challenge mode state */
  resetChallengeMode: () => void;
}

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEY = 'arcane-codex-circuit-challenge-store';
const COMPLETED_CHALLENGES_KEY = 'arcane-codex-circuit-challenges-completed';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Load completed challenges from localStorage
 */
function loadCompletedChallenges(): string[] {
  try {
    const stored = localStorage.getItem(COMPLETED_CHALLENGES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load completed circuit challenges:', e);
  }
  return [];
}

/**
 * Save completed challenges to localStorage
 */
function saveCompletedChallenges(challenges: string[]): void {
  try {
    localStorage.setItem(COMPLETED_CHALLENGES_KEY, JSON.stringify(challenges));
  } catch (e) {
    console.warn('Failed to save completed circuit challenges:', e);
  }
}

/**
 * Preserve current canvas state
 */
function preserveCanvasState(): PreservedCanvasState {
  const store = useCircuitCanvasStore.getState();
  
  return {
    nodes: JSON.parse(JSON.stringify(store.nodes)),
    wires: JSON.parse(JSON.stringify(store.wires)),
    junctions: JSON.parse(JSON.stringify(store.junctions)),
    layers: JSON.parse(JSON.stringify(store.layers)),
    activeLayerId: store.activeLayerId,
  };
}

/**
 * Restore canvas state
 */
function restoreCanvasState(state: PreservedCanvasState | null): void {
  if (!state) return;
  
  const store = useCircuitCanvasStore.getState();
  
  store.clearCircuitCanvas();
  
  // Restore nodes (cast to any to avoid type issues with dynamic data)
  const nodesArray = state.nodes as Array<{
    type: string;
    position: { x: number; y: number };
    gateType?: string;
    label?: string;
    parameters?: Record<string, unknown>;
  }>;
  
  for (const node of nodesArray) {
    store.addCircuitNode(
      node.type as 'input' | 'output' | 'gate',
      node.position.x,
      node.position.y,
      node.gateType as 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'XNOR' | undefined,
      node.label,
      node.parameters
    );
  }
  
  // Note: Wires would need to be restored after nodes are created
  // For simplicity, we just restore the structure
}

/**
 * Setup canvas with challenge inputs/outputs
 */
function setupChallengeCanvas(challenge: CircuitChallenge): void {
  const store = useCircuitCanvasStore.getState();
  
  // Clear existing circuit
  store.clearCircuitCanvas();
  
  // Calculate positions for input nodes (left side)
  const inputStartY = 100;
  const inputSpacing = 80;
  
  // Create input nodes
  const inputNodeIds: string[] = [];
  challenge.inputConfigs.forEach((config, index) => {
    const node = store.addCircuitNode(
      'input',
      50,
      inputStartY + index * inputSpacing,
      undefined,
      config.label
    );
    inputNodeIds.push(node.id);
    
    // Set initial state if needed
    if (config.defaultState) {
      store.toggleCircuitInput(node.id);
    }
  });
  
  // Calculate position for output node (right side)
  const outputY = 100 + (challenge.inputConfigs.length - 1) * inputSpacing / 2;
  
  // Create output node
  store.addCircuitNode(
    'output',
    500,
    outputY,
    undefined,
    '输出'
  );
}

// ============================================================================
// Store Implementation
// ============================================================================

type CircuitChallengeStore = CircuitChallengeState & CircuitChallengeActions;

export const useCircuitChallengeStore = create<CircuitChallengeStore>()(
  persist(
    (set, get) => ({
      // ===== Initial State =====
      isChallengeMode: false,
      activeChallengeId: null,
      challengeInputConfigs: [],
      challengeOutputExpectations: [],
      preservedCanvasState: null,
      isPanelOpen: false,

      // ===== Panel Actions =====
      
      openPanel: () => {
        set({ isPanelOpen: true });
      },
      
      closePanel: () => {
        set({ isPanelOpen: false });
      },
      
      togglePanel: () => {
        set((state) => ({ isPanelOpen: !state.isPanelOpen }));
      },

      // ===== Challenge Mode Actions =====
      
      startChallenge: (challengeId: string) => {
        const challenge = getCircuitChallengeById(challengeId);
        
        if (!challenge) {
          console.warn(`Circuit challenge not found: ${challengeId}`);
          return false;
        }
        
        // Preserve current canvas state
        const preservedState = preserveCanvasState();
        
        // Setup challenge input configs with node IDs
        const inputConfigs: ChallengeNodeConfig[] = challenge.inputConfigs.map((config) => ({
          ...config,
          nodeId: undefined, // Will be set after canvas setup
        }));
        
        // Get output expectations from challenge objectives
        const outputExpectations: OutputTarget[] = challenge.objectives
          .filter((obj) => obj.objectiveType === 'output' && obj.outputTarget)
          .map((obj) => obj.outputTarget!);
        
        set({
          isChallengeMode: true,
          activeChallengeId: challengeId,
          challengeInputConfigs: inputConfigs,
          challengeOutputExpectations: outputExpectations,
          preservedCanvasState: preservedState,
          isPanelOpen: false,
        });
        
        // Setup canvas with challenge inputs/outputs
        setupChallengeCanvas(challenge);
        
        return true;
      },
      
      exitChallenge: () => {
        const { preservedCanvasState } = get();
        
        // Restore canvas state
        restoreCanvasState(preservedCanvasState);
        
        // Reset challenge mode state
        set({
          isChallengeMode: false,
          activeChallengeId: null,
          challengeInputConfigs: [],
          challengeOutputExpectations: [],
          preservedCanvasState: null,
        });
      },
      
      isChallengeCompleted: (challengeId: string) => {
        const completed = loadCompletedChallenges();
        return completed.includes(challengeId);
      },
      
      markChallengeCompleted: (challengeId: string) => {
        const completed = loadCompletedChallenges();
        
        if (!completed.includes(challengeId)) {
          completed.push(challengeId);
          saveCompletedChallenges(completed);
        }
      },
      
      getAllChallenges: () => {
        return CIRCUIT_CHALLENGES;
      },
      
      getActiveChallenge: () => {
        const { activeChallengeId } = get();
        if (!activeChallengeId) return null;
        return getCircuitChallengeById(activeChallengeId) || null;
      },
      
      setInputNodeId: (configId: string, nodeId: string) => {
        set((state) => ({
          challengeInputConfigs: state.challengeInputConfigs.map((config) =>
            config.id === configId ? { ...config, nodeId } : config
          ),
        }));
      },
      
      resetChallengeMode: () => {
        set({
          isChallengeMode: false,
          activeChallengeId: null,
          challengeInputConfigs: [],
          challengeOutputExpectations: [],
          preservedCanvasState: null,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      partialize: (state) => ({
        // Only persist panel open state, not challenge mode
        isPanelOpen: state.isPanelOpen,
      }),
    }
  )
);

// ============================================================================
// Selectors
// ============================================================================

/**
 * Select whether challenge mode is active
 */
export const selectIsChallengeMode = (state: CircuitChallengeStore) => state.isChallengeMode;

/**
 * Select active challenge ID
 */
export const selectActiveChallengeId = (state: CircuitChallengeStore) => state.activeChallengeId;

/**
 * Select challenge input configurations
 */
export const selectChallengeInputConfigs = (state: CircuitChallengeStore) => state.challengeInputConfigs;

/**
 * Select challenge output expectations
 */
export const selectChallengeOutputExpectations = (state: CircuitChallengeStore) => state.challengeOutputExpectations;

/**
 * Select whether panel is open
 */
export const selectIsPanelOpen = (state: CircuitChallengeStore) => state.isPanelOpen;

/**
 * Select whether challenge is completed
 */
export const selectIsChallengeCompleted = (challengeId: string) => (state: CircuitChallengeStore) =>
  state.isChallengeCompleted(challengeId);

export default useCircuitChallengeStore;
