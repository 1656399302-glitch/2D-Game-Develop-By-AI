/**
 * Counter Data Hook
 * 
 * ROUND 183: New hook for accessing counter data from circuit simulation
 * 
 * Provides counter data including:
 * - Current count, max value, and overflow state
 * - History of recent values (last 5)
 * 
 * Accesses:
 * - Counter nodes from useCircuitCanvasStore
 * - Counter states from circuitSimulator
 */

import { useMemo, useRef, useEffect, useState } from 'react';
import { useCircuitCanvasStore } from '../store/useCircuitCanvasStore';
import { getAllCounterStates } from '../engine/circuitSimulator';
import type { CounterData } from '../components/Circuit/CounterPanel';

// ============================================================================
// Constants
// ============================================================================

const MAX_HISTORY_LENGTH = 5;

interface CounterHistoryEntry {
  count: number;
  timestamp: number;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to get counter data from the circuit simulation
 */
export function useCounterData(): CounterData[] {
  // Get all gate nodes from the circuit canvas store
  const nodes = useCircuitCanvasStore((state) => state.nodes);
  
  // History storage - use ref to persist across renders
  const historyRef = useRef<Map<string, CounterHistoryEntry[]>>(new Map());
  
  // Current tick for forcing re-renders
  const [currentTick, setCurrentTick] = useState(0);
  
  // Force re-render periodically to update counter display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTick((t) => t + 1);
    }, 100); // Update every 100ms
    return () => clearInterval(interval);
  }, []);
  
  // Get counter nodes (gates with gateType === 'COUNTER')
  const counterNodes = useMemo(() => {
    return nodes.filter((node): node is typeof node & { type: 'gate'; gateType: 'COUNTER' } => 
      node.type === 'gate' && node.gateType === 'COUNTER'
    );
  }, [nodes]);
  
  // Get layers from the store
  const layers = useCircuitCanvasStore((state) => state.layers);
  
  // Build counter data with history
  const counterData: CounterData[] = useMemo(() => {
    // Get counter states from the circuit simulator
    const counterStates = getAllCounterStates();
    
    return counterNodes.map((node) => {
      const layer = layers.find((l) => l.id === node.layerId);
      
      // Get counter state from the circuit simulator
      const state = counterStates.get(node.id);
      
      const count = state?.count ?? 0;
      const maxValue = state?.maxValue ?? (node.parameters?.maxValue as number) ?? 8;
      const overflow = state?.overflow ?? false;
      
      // Update history if count changed
      const history = historyRef.current.get(node.id) || [];
      const lastEntry = history[0];
      
      if (!lastEntry || lastEntry.count !== count) {
        // Add new entry at the beginning
        const newEntry: CounterHistoryEntry = {
          count,
          timestamp: Date.now(),
        };
        history.unshift(newEntry);
        
        // Keep only last MAX_HISTORY_LENGTH entries
        if (history.length > MAX_HISTORY_LENGTH) {
          history.pop();
        }
        
        historyRef.current.set(node.id, history);
      }
      
      return {
        id: node.id,
        label: node.label || '计数器',
        count,
        maxValue,
        overflow,
        layerId: node.layerId,
        layerName: layer?.name,
        history: history.map((h) => h.count),
      };
    });
  }, [counterNodes, layers, currentTick]);
  
  return counterData;
}

export default useCounterData;
