/**
 * Machine Statistics Store
 * 
 * Zustand store for machine-specific statistics.
 * Provides real-time analytics for the current machine on canvas.
 */

import { create } from 'zustand';
import { useMachineStore } from './useMachineStore';
import {
  calculateMachineStatistics,
  MachineStatistics,
  EnergyFlowResult,
  ComplexityFactors,
} from '../utils/statisticsUtils';

interface MachineStatsState {
  // Panel visibility
  isPanelOpen: boolean;
  
  // Current tab
  activeTab: 'overview' | 'energy' | 'complexity' | 'recommendations';
  
  // Cached statistics
  statistics: MachineStatistics | null;
  
  // Actions
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  setActiveTab: (tab: 'overview' | 'energy' | 'complexity' | 'recommendations') => void;
  refreshStatistics: () => void;
}

export const useMachineStatsStore = create<MachineStatsState>((set, get) => ({
  isPanelOpen: false,
  activeTab: 'overview',
  statistics: null,
  
  openPanel: () => {
    const { refreshStatistics } = get();
    refreshStatistics();
    set({ isPanelOpen: true });
  },
  
  closePanel: () => {
    set({ isPanelOpen: false });
  },
  
  togglePanel: () => {
    const { isPanelOpen, refreshStatistics, closePanel } = get();
    if (isPanelOpen) {
      closePanel();
    } else {
      refreshStatistics();
      set({ isPanelOpen: true });
    }
  },
  
  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },
  
  refreshStatistics: () => {
    const modules = useMachineStore.getState().modules;
    const connections = useMachineStore.getState().connections;
    const statistics = calculateMachineStatistics(modules, connections);
    set({ statistics });
  },
}));

// Selector hooks for specific statistics (for optimized re-renders)
export const useMachineStats = () => {
  const stats = useMachineStatsStore((state) => state.statistics);
  return stats;
};

export const useStatsPanelOpen = () => {
  return useMachineStatsStore((state) => state.isPanelOpen);
};

export const useStatsActiveTab = () => {
  return useMachineStatsStore((state) => state.activeTab);
};

export const useModuleCount = () => {
  const modules = useMachineStore((state) => state.modules);
  return modules.length;
};

export const useConnectionCount = () => {
  const connections = useMachineStore((state) => state.connections);
  return connections.length;
};

export const useEnergyFlowStats = (): EnergyFlowResult[] => {
  const stats = useMachineStatsStore((state) => state.statistics);
  return stats?.energyFlows || [];
};

export const useComplexityFactors = (): ComplexityFactors | null => {
  const stats = useMachineStatsStore((state) => state.statistics);
  return stats?.complexityFactors || null;
};

export const useComplexityScore = (): number => {
  const stats = useMachineStatsStore((state) => state.statistics);
  return stats?.complexityScore || 0;
};

export const useMachineFaction = (): string => {
  const stats = useMachineStatsStore((state) => state.statistics);
  return stats?.factionName || 'None';
};

export const useMachineStability = (): number => {
  const stats = useMachineStatsStore((state) => state.statistics);
  return stats?.stability || 0;
};

export const useMachinePower = (): number => {
  const stats = useMachineStatsStore((state) => state.statistics);
  return stats?.power || 0;
};

export const useMachineHealth = (): number => {
  const stats = useMachineStatsStore((state) => state.statistics);
  return stats?.machineHealth || 0;
};

export const usePerformancePrediction = (): number => {
  const stats = useMachineStatsStore((state) => state.statistics);
  return stats?.performancePrediction || 0;
};

export default useMachineStatsStore;
