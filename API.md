# Arcane Machine Codex Workshop - API Reference

This document describes the public API for the Arcane Machine Codex Workshop application.

## Table of Contents

- [Stores](#stores)
- [Hooks](#hooks)
- [Utilities](#utilities)
- [Components](#components)

---

## Stores

### useMachineStore

The central store for managing the machine editor canvas, modules, and connections.

```typescript
import { useMachineStore } from './store/useMachineStore';
```

#### State Properties

| Property | Type | Description |
|----------|------|-------------|
| `modules` | `PlacedModule[]` | Array of modules on the canvas |
| `connections` | `Connection[]` | Array of energy connections |
| `selectedModuleId` | `string \| null` | Currently selected module |
| `selectedConnectionId` | `string \| null` | Currently selected connection |
| `machineState` | `MachineState` | Current activation state |
| `showActivation` | `boolean` | Whether activation overlay is shown |
| `viewport` | `ViewportState` | Current zoom and pan state |
| `gridEnabled` | `boolean` | Whether grid snapping is enabled |

#### Actions

##### Module Management

```typescript
// Add a new module to the canvas
addModule(type: ModuleType, x: number, y: number): void

// Remove a module by instance ID
removeModule(instanceId: string): void

// Update module position
updateModulePosition(instanceId: string, x: number, y: number): void

// Update module rotation
updateModuleRotation(instanceId: string, rotation: number): void

// Update module scale
updateModuleScale(instanceId: string, scale: number): void

// Flip module horizontally
updateModuleFlip(instanceId: string): void

// Select a module
selectModule(instanceId: string | null): void

// Duplicate a module
duplicateModule(instanceId: string): void

// Batch update multiple modules
updateModulesBatch(updates: Array<{ instanceId: string; x?: number; y?: number }>): void
```

##### Connection Management

```typescript
// Start creating a connection from a port
startConnection(moduleId: string, portId: string): void

// Update connection preview endpoint
updateConnectionPreview(x: number, y: number): void

// Complete connection to target port
completeConnection(targetModuleId: string, targetPortId: string): void

// Cancel connection creation
cancelConnection(): void

// Remove a connection
removeConnection(connectionId: string): void

// Set connection error message
setConnectionError(error: string | null): void
```

##### Machine State

```typescript
// Set machine activation state
setMachineState(state: MachineState): void

// Show/hide activation overlay
setShowActivation(show: boolean): void

// Activate failure mode
activateFailureMode(): void

// Activate overload mode
activateOverloadMode(): void
```

##### Viewport

```typescript
// Update viewport properties
setViewport(viewport: Partial<ViewportState>): void

// Reset to default view
resetViewport(): void

// Zoom in
zoomIn(): void

// Zoom out
zoomOut(): void

// Fit all modules in view
zoomToFit(): void
```

##### History

```typescript
// Undo last action
undo(): void

// Redo last undone action
redo(): void

// Save current state to history
saveToHistory(): void
```

##### Activation Zoom

```typescript
// Start activation zoom animation
startActivationZoom(): void

// Update zoom progress
updateActivationZoom(currentTime: number): ViewportState

// End activation zoom
endActivationZoom(): void

// Set activation module index
setActivationModuleIndex(index: number): void
```

##### Clipboard

```typescript
// Copy selected module
copySelected(): void

// Paste clipboard contents
pasteModules(): void
```

##### Canvas Management

```typescript
// Clear all modules and connections
clearCanvas(): void

// Load machine from saved data
loadMachine(modules: PlacedModule[], connections: Connection[]): void

// Toggle grid snapping
toggleGrid(): void
```

##### Persistence

```typescript
// Restore saved canvas state
restoreSavedState(): void

// Start with fresh canvas
startFresh(): void

// Mark state as loaded
markStateAsLoaded(): void
```

##### Modals

```typescript
// Show/hide export modal
setShowExportModal(show: boolean): void

// Show/hide codex modal
setShowCodexModal(show: boolean): void
```

##### Random Generator

```typescript
// Set generated machine attributes
setGeneratedAttributes(attributes: GeneratedAttributes | null): void

// Show random forge toast
showRandomForgeToast(message: string): void

// Hide random forge toast
hideRandomForgeToast(): void
```

---

### useCodexStore

Store for managing the machine codex collection.

```typescript
import { useCodexStore } from './store/useCodexStore';
```

#### State Properties

| Property | Type | Description |
|----------|------|-------------|
| `entries` | `CodexEntry[]` | Array of saved codex entries |

#### Actions

```typescript
// Add a new machine to the codex
addEntry(
  name: string,
  modules: PlacedModule[],
  connections: Connection[],
  attributes: GeneratedAttributes
): CodexEntry

// Remove entry by ID
removeEntry(id: string): void

// Get entry by ID
getEntry(id: string): CodexEntry | undefined

// Get entries filtered by rarity
getEntriesByRarity(rarity: Rarity): CodexEntry[]

// Get total entry count
getEntryCount(): number
```

---

### useActivationStore

Store for managing machine activation states and effects.

```typescript
import { useActivationStore } from './store/useActivationStore';
```

#### State Properties

| Property | Type | Description |
|----------|------|-------------|
| `isActive` | `boolean` | Whether machine is currently active |
| `activationPhase` | `string` | Current phase in activation sequence |
| `modulesActivated` | `string[]` | IDs of activated modules |

#### Actions

```typescript
// Start machine activation
startActivation(): void

// Stop activation
stopActivation(): void

// Reset activation state
resetActivation(): void
```

---

### useFactionStore

Store for managing faction reputation and technology unlocks.

```typescript
import { useFactionStore } from './store/useFactionStore';
```

#### State Properties

| Property | Type | Description |
|----------|------|-------------|
| `factions` | `Faction[]` | Array of all factions |
| `reputation` | `Record<string, number>` | Reputation per faction |
| `unlockedTech` | `Record<string, string[]>` | Unlocked tech per faction |

#### Actions

```typescript
// Add reputation to faction
addReputation(factionId: string, amount: number): void

// Check if tech is unlocked
isTechUnlocked(factionId: string, techId: string): boolean

// Unlock technology
unlockTech(factionId: string, techId: string): void

// Reset all faction progress
resetFactions(): void
```

---

### useSelectionStore

Store for managing multi-selection state.

```typescript
import { useSelectionStore } from './store/useSelectionStore';
```

#### State Properties

| Property | Type | Description |
|----------|------|-------------|
| `selectedIds` | `Set<string>` | Set of selected module/connection IDs |
| `isMultiSelecting` | `boolean` | Whether in multi-select mode |

#### Actions

```typescript
// Add to selection
addToSelection(id: string): void

// Remove from selection
removeFromSelection(id: string): void

// Toggle selection
toggleSelection(id: string): void

// Clear all selections
clearSelection(): void

// Start multi-select mode
startMultiSelect(): void

// End multi-select mode
endMultiSelect(): void
```

---

### useSettingsStore

Store for application settings and preferences.

```typescript
import { useSettingsStore } from './store/useSettingsStore';
```

#### State Properties

| Property | Type | Description |
|----------|------|-------------|
| `theme` | `string` | UI theme |
| `gridSize` | `number` | Grid cell size |
| `snapToGrid` | `boolean` | Whether to snap to grid |
| `showLabels` | `boolean` | Whether to show module labels |

#### Actions

```typescript
// Update setting
setSetting(key: string, value: any): void

// Reset to defaults
resetSettings(): void
```

---

## Hooks

### useModuleDrag

Hook for handling module drag interactions.

```typescript
import { useModuleDrag } from './hooks/useModuleDrag';

const { handlers, isDragging, dragOffset } = useModuleDrag({
  onDragStart: (moduleId) => {},
  onDragMove: (moduleId, x, y) => {},
  onDragEnd: (moduleId) => {},
});
```

### useKeyboardShortcuts

Hook for registering keyboard shortcuts.

```typescript
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

useKeyboardShortcuts({
  onDelete: () => {},
  onUndo: () => {},
  onRedo: () => {},
  onCopy: () => {},
  onPaste: () => {},
});
```

### useActivation

Hook for managing machine activation state and animations.

```typescript
import { useActivation } from './hooks/useActivation';

const { 
  state, 
  isAnimating, 
  start, 
  stop, 
  progress 
} = useActivation();
```

---

## Utilities

### attributeGenerator

Generate machine attributes from modules and connections.

```typescript
import { generateAttributes } from './utils/attributeGenerator';

const attributes = generateAttributes(modules, connections);
// Returns: GeneratedAttributes
```

### exportUtils

Export machines to various formats.

```typescript
import { exportToSVG, exportToPNG, exportPoster } from './utils/exportUtils';

// Export as SVG
const svg = exportToSVG(modules, connections, options);

// Export as PNG
await exportToPNG(svgElement, options);

// Export poster card
const posterSvg = exportPoster(entry, options);
```

### randomGenerator

Generate random machine configurations.

```typescript
import { generateWithTheme } from './utils/randomGenerator';

const machine = generateWithTheme({ theme: 'void' });
// Returns: { modules, connections, theme, validation }
```

### connectionEngine

Calculate connection paths between modules.

```typescript
import { calculateConnectionPath, updatePathsForModule } from './utils/connectionEngine';

const path = calculateConnectionPath(modules, sourceId, sourcePortId, targetId, targetPortId);
```

---

## Components

### Editor Components

- `Canvas` - Main editing canvas
- `ModulePanel` - Module selection sidebar
- `PropertiesPanel` - Module property editor
- `Toolbar` - Editing tools toolbar
- `LayersPanel` - Z-order management

### Module Components

- `CoreFurnace` - Core power module
- `Gear` - Mechanical gear
- `EnergyPipe` - Energy conduit
- `RuneNode` - Magical inscription
- `AmplifierCrystal` - Energy amplifier
- `ShieldCasing` - Protective shell

### UI Components

- `CodexView` - Collection browser
- `ActivationOverlay` - Activation animation overlay
- `ExportModal` - Export options dialog
- `SettingsPanel` - Settings interface
- `FactionPanel` - Faction management

---

## Type Definitions

### MachineState

```typescript
type MachineState = 'idle' | 'charging' | 'active' | 'overload' | 'failure' | 'shutdown';
```

### ModuleType

```typescript
type ModuleType = 
  | 'core-furnace'
  | 'gear'
  | 'energy-pipe'
  | 'rune-node'
  | 'amplifier-crystal'
  | 'lightning-conductor'
  | 'fire-crystal'
  | 'shield-casing'
  | 'trigger-switch'
  | 'output-array';
```

### Rarity

```typescript
type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
```

### PortType

```typescript
type PortType = 'input' | 'output';
```

---

## Examples

### Adding a Module

```typescript
const { addModule } = useMachineStore.getState();
addModule('core-furnace', 100, 100);
```

### Creating a Connection

```typescript
const { startConnection, completeConnection } = useMachineStore.getState();
const modules = useMachineStore.getState().modules;

// Find ports
const sourcePort = modules[0].ports.find(p => p.type === 'output');
const targetPort = modules[1].ports.find(p => p.type === 'input');

// Create connection
startConnection(modules[0].instanceId, sourcePort.id);
completeConnection(modules[1].instanceId, targetPort.id);
```

### Saving to Codex

```typescript
const machineStore = useMachineStore.getState();
const codexStore = useCodexStore.getState();

const attributes = generateAttributes(machineStore.modules, machineStore.connections);
codexStore.addEntry('My Machine', machineStore.modules, machineStore.connections, attributes);
```

### Activating Machine

```typescript
const { setMachineState, setShowActivation } = useMachineStore.getState();
setShowActivation(true);
setMachineState('charging');
// Transitions to 'active' after charging animation
```
