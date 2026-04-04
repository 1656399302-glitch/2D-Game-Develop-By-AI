/**
 * Layers Module for E2E Testing
 * 
 * Round 127: Multi-layer support for circuit canvas
 * 
 * This module provides a clean interface for E2E tests to interact
 * with the layer state management in useMachineStore.
 * Exposed via window.__machineStore for Playwright tests.
 */

/**
 * Get the current machine store from window
 */
export function getMachineStore() {
  if (typeof window !== 'undefined' && (window as any).__machineStore) {
    return (window as any).__machineStore;
  }
  throw new Error('Machine store not exposed on window. Ensure main.tsx exposes __machineStore.');
}

/**
 * Get current layers from the store
 */
export function getLayers() {
  return getMachineStore().getState().layers;
}

/**
 * Get the active layer ID
 */
export function getActiveLayerId() {
  return getMachineStore().getState().activeLayerId;
}

/**
 * Add a new layer
 */
export function addLayer(name?: string): string {
  return getMachineStore().getState().addLayer(name);
}

/**
 * Remove a layer by ID
 */
export function removeLayer(id: string): boolean {
  return getMachineStore().getState().removeLayer(id);
}

/**
 * Rename a layer
 */
export function renameLayer(id: string, name: string): void {
  getMachineStore().getState().renameLayer(id, name);
}

/**
 * Set the active layer by ID
 */
export function setActiveLayer(id: string): void {
  getMachineStore().getState().setActiveLayer(id);
}

/**
 * Move components to a target layer
 */
export function moveComponentsToLayer(componentIds: string[], targetLayerId: string): void {
  getMachineStore().getState().moveComponentsToLayer(componentIds, targetLayerId);
}

/**
 * Get components on the active layer
 */
export function getActiveLayerComponents() {
  return getMachineStore().getState().getActiveLayerComponents();
}

/**
 * Get wires on the active layer
 */
export function getActiveLayerWires() {
  return getMachineStore().getState().getActiveLayerWires();
}

/**
 * Get the number of layers
 */
export function getLayerCount(): number {
  return getMachineStore().getState().layers.length;
}

/**
 * Check if a layer is visible
 */
export function isLayerVisible(layerId: string): boolean {
  const layer = getLayers().find(l => l.id === layerId);
  return layer ? layer.visible : false;
}

/**
 * Toggle layer visibility by directly setting the state
 * (used when visibility toggle in LayersPanel isn't accessible via UI)
 */
export function setLayerVisibility(layerId: string, visible: boolean): void {
  const store = getMachineStore();
  store.setState((state: any) => ({
    layers: state.layers.map((l: any) =>
      l.id === layerId ? { ...l, visible } : l
    ),
  }));
}
