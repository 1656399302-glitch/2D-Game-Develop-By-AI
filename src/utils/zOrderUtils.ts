import { PlacedModule } from '../types';

/**
 * Bring a module forward by swapping its z-order with the next higher module
 * If module is at the top, it stays at the top
 */
export function bringForward(moduleId: string, allModules: PlacedModule[]): PlacedModule[] {
  if (allModules.length <= 1) return allModules;

  // Find the index of the module to bring forward
  const moduleIndex = allModules.findIndex(m => m.instanceId === moduleId);
  if (moduleIndex === -1 || moduleIndex === allModules.length - 1) {
    // Module not found or already at the top
    return allModules;
  }

  // Swap the module with the one after it (higher z-order)
  const newModules = [...allModules];
  const temp = newModules[moduleIndex];
  newModules[moduleIndex] = newModules[moduleIndex + 1];
  newModules[moduleIndex + 1] = temp;

  return newModules;
}

/**
 * Send a module backward by swapping its z-order with the previous lower module
 * If module is at the bottom, it stays at the bottom
 */
export function sendBackward(moduleId: string, allModules: PlacedModule[]): PlacedModule[] {
  if (allModules.length <= 1) return allModules;

  // Find the index of the module to send backward
  const moduleIndex = allModules.findIndex(m => m.instanceId === moduleId);
  if (moduleIndex <= 0) {
    // Module not found or already at the bottom
    return allModules;
  }

  // Swap the module with the one before it (lower z-order)
  const newModules = [...allModules];
  const temp = newModules[moduleIndex];
  newModules[moduleIndex] = newModules[moduleIndex - 1];
  newModules[moduleIndex - 1] = temp;

  return newModules;
}

/**
 * Bring a module to the front (highest z-order)
 */
export function bringToFront(moduleId: string, allModules: PlacedModule[]): PlacedModule[] {
  if (allModules.length <= 1) return allModules;

  // Find the module to bring to front
  const moduleIndex = allModules.findIndex(m => m.instanceId === moduleId);
  if (moduleIndex === -1 || moduleIndex === allModules.length - 1) {
    // Module not found or already at the front
    return allModules;
  }

  // Remove the module from its current position and add it to the end
  const newModules = allModules.filter(m => m.instanceId !== moduleId);
  const moduleToMove = allModules[moduleIndex];
  newModules.push(moduleToMove);

  return newModules;
}

/**
 * Send a module to the back (lowest z-order)
 */
export function sendToBack(moduleId: string, allModules: PlacedModule[]): PlacedModule[] {
  if (allModules.length <= 1) return allModules;

  // Find the module to send to back
  const moduleIndex = allModules.findIndex(m => m.instanceId === moduleId);
  if (moduleIndex <= 0) {
    // Module not found or already at the back
    return allModules;
  }

  // Remove the module from its current position and add it to the beginning
  const newModules = allModules.filter(m => m.instanceId !== moduleId);
  const moduleToMove = allModules[moduleIndex];
  newModules.unshift(moduleToMove);

  return newModules;
}

/**
 * Move a module to a specific z-order position
 */
export function moveToZIndex(moduleId: string, allModules: PlacedModule[], targetIndex: number): PlacedModule[] {
  if (allModules.length <= 1) return allModules;

  const moduleIndex = allModules.findIndex(m => m.instanceId === moduleId);
  if (moduleIndex === -1) {
    return allModules;
  }

  // Clamp target index to valid range
  const clampedIndex = Math.max(0, Math.min(allModules.length - 1, targetIndex));

  // If already at the target position, return unchanged
  if (moduleIndex === clampedIndex) {
    return allModules;
  }

  // Remove the module and insert at target position
  const newModules = allModules.filter(m => m.instanceId !== moduleId);
  const moduleToMove = allModules[moduleIndex];
  newModules.splice(clampedIndex, 0, moduleToMove);

  return newModules;
}
