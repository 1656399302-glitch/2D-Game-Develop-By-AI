/**
 * Duplicate Detection Utility
 * 
 * Compares machine structures to detect potential duplicates.
 * Uses structural hashing and similarity scoring.
 */

import { PlacedModule, Connection, DuplicateCheckResult, MachineSignature } from '../types';

const DEFAULT_THRESHOLD = 80; // 80% similarity triggers warning

/**
 * Create a signature for a machine based on its structure
 */
export function createMachineSignature(
  modules: PlacedModule[],
  connections: Connection[]
): MachineSignature {
  // Sort module types for consistent hashing
  const sortedModuleTypes = [...modules]
    .map((m) => m.type)
    .sort();
  
  const moduleTypeHash = sortedModuleTypes.join(',');
  
  // Create connection pattern hash
  const connectionPairs = connections
    .map((c) => {
      const sourceModule = modules.find((m) => m.instanceId === c.sourceModuleId);
      const targetModule = modules.find((m) => m.instanceId === c.targetModuleId);
      if (!sourceModule || !targetModule) return '';
      return `${sourceModule.type}->${targetModule.type}`;
    })
    .filter(Boolean)
    .sort();
  
  const connectionPatternHash = connectionPairs.join('|');
  
  return {
    moduleTypes: moduleTypeHash,
    connectionCount: connections.length,
    moduleCount: modules.length,
    moduleTypeHash,
    connectionPatternHash,
  };
}

/**
 * Count occurrences of each module type
 */
function countModuleTypes(modules: PlacedModule[]): Record<string, number> {
  const counts: Record<string, number> = {};
  
  for (const module of modules) {
    counts[module.type] = (counts[module.type] || 0) + 1;
  }
  
  return counts;
}

/**
 * Calculate similarity between two machine signatures (0-100%)
 */
export function calculateSignatureSimilarity(
  sig1: MachineSignature,
  sig2: MachineSignature
): number {
  // Different module count is a major factor
  const moduleCountDiff = Math.abs(sig1.moduleCount - sig2.moduleCount);
  const maxModuleCount = Math.max(sig1.moduleCount, sig2.moduleCount, 1);
  const moduleCountSimilarity = Math.max(0, 100 - (moduleCountDiff / maxModuleCount) * 100);
  
  // Different connection count is also a major factor
  const connectionCountDiff = Math.abs(sig1.connectionCount - sig2.connectionCount);
  const maxConnectionCount = Math.max(sig1.connectionCount, sig2.connectionCount, 1);
  const connectionCountSimilarity = Math.max(0, 100 - (connectionCountDiff / maxConnectionCount) * 100);
  
  // Module type overlap (Jaccard similarity)
  const moduleTypes1 = new Set(sig1.moduleTypes.split(',').filter(Boolean));
  const moduleTypes2 = new Set(sig2.moduleTypes.split(',').filter(Boolean));
  
  const intersection = new Set([...moduleTypes1].filter((x) => moduleTypes2.has(x)));
  const union = new Set([...moduleTypes1, ...moduleTypes2]);
  const moduleTypeSimilarity = union.size > 0 ? (intersection.size / union.size) * 100 : 100;
  
  // Weighted average: 40% module count, 30% connection count, 30% module types
  const totalSimilarity =
    moduleCountSimilarity * 0.4 +
    connectionCountSimilarity * 0.3 +
    moduleTypeSimilarity * 0.3;
  
  return Math.round(totalSimilarity);
}

/**
 * Check if a machine is a duplicate of any in a list of existing machines
 */
export function checkDuplicate(
  modules: PlacedModule[],
  connections: Connection[],
  existingMachines: Array<{ id: string; name: string; modules: PlacedModule[]; connections: Connection[] }>,
  threshold: number = DEFAULT_THRESHOLD
): DuplicateCheckResult {
  // Handle empty machines
  if (modules.length === 0) {
    return {
      isDuplicate: false,
      similarity: 0,
      existingMachineId: null,
      existingMachineName: null,
      threshold,
    };
  }
  
  const currentSignature = createMachineSignature(modules, connections);
  let highestSimilarity = 0;
  let mostSimilarMachine: typeof existingMachines[0] | null = null;
  
  for (const machine of existingMachines) {
    // Skip comparing machine to itself
    const existingSignature = createMachineSignature(machine.modules, machine.connections);
    const similarity = calculateSignatureSimilarity(currentSignature, existingSignature);
    
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      mostSimilarMachine = machine;
    }
  }
  
  return {
    isDuplicate: highestSimilarity >= threshold,
    similarity: highestSimilarity,
    existingMachineId: mostSimilarMachine?.id || null,
    existingMachineName: mostSimilarMachine?.name || null,
    threshold,
  };
}

/**
 * Quick hash-based check for identical machines
 * Returns true if machines appear to be identical (100% similarity)
 */
export function isIdenticalMachine(
  machine1: { modules: PlacedModule[]; connections: Connection[] },
  machine2: { modules: PlacedModule[]; connections: Connection[] }
): boolean {
  // Quick checks first
  if (machine1.modules.length !== machine2.modules.length) return false;
  if (machine1.connections.length !== machine2.connections.length) return false;
  if (machine1.modules.length === 0) return true; // Both empty
  
  // Compare module types (counts must match)
  const types1 = countModuleTypes(machine1.modules);
  const types2 = countModuleTypes(machine2.modules);
  
  const allTypes = new Set([...Object.keys(types1), ...Object.keys(types2)]);
  for (const type of allTypes) {
    if ((types1[type] || 0) !== (types2[type] || 0)) return false;
  }
  
  // For identical machines with same structure
  const sig1 = createMachineSignature(machine1.modules, machine1.connections);
  const sig2 = createMachineSignature(machine2.modules, machine2.connections);
  
  return sig1.moduleTypeHash === sig2.moduleTypeHash && 
         sig1.connectionPatternHash === sig2.connectionPatternHash;
}

/**
 * Get similarity details for display
 */
export function getSimilarityDetails(
  modules: PlacedModule[],
  connections: Connection[],
  existingMachine: { modules: PlacedModule[]; connections: Connection[] }
): {
  moduleCountDiff: number;
  connectionCountDiff: number;
  moduleTypeMatch: number;
  overallSimilarity: number;
} {
  const currentSig = createMachineSignature(modules, connections);
  const existingSig = createMachineSignature(existingMachine.modules, existingMachine.connections);
  
  const moduleCountDiff = Math.abs(currentSig.moduleCount - existingSig.moduleCount);
  const connectionCountDiff = Math.abs(currentSig.connectionCount - existingSig.connectionCount);
  
  const types1 = new Set(currentSig.moduleTypes.split(',').filter(Boolean));
  const types2 = new Set(existingSig.moduleTypes.split(',').filter(Boolean));
  const intersection = new Set([...types1].filter((x) => types2.has(x)));
  const union = new Set([...types1, ...types2]);
  const moduleTypeMatch = union.size > 0 ? Math.round((intersection.size / union.size) * 100) : 100;
  
  const overallSimilarity = calculateSignatureSimilarity(currentSig, existingSig);
  
  return {
    moduleCountDiff,
    connectionCountDiff,
    moduleTypeMatch,
    overallSimilarity,
  };
}

/**
 * Check if new modules/connections should trigger a duplicate warning
 */
export function shouldWarnDuplicate(
  modules: PlacedModule[],
  connections: Connection[],
  existingMachines: Array<{ id: string; name: string; modules: PlacedModule[]; connections: Connection[] }>,
  threshold: number = DEFAULT_THRESHOLD
): boolean {
  const result = checkDuplicate(modules, connections, existingMachines, threshold);
  return result.isDuplicate;
}
