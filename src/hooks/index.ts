/**
 * Editor hooks module
 */

export { useEditorHistory, cloneHistoryState, compareHistoryStates } from './useEditorHistory';
export type { HistoryState, EditorHistoryActions, HistoryActionType, HistoryAction, ActionGroup } from './useEditorHistory';

export { useCopyPaste, createModuleInstance, createConnectionInstance, validateClipboardData, getClipboardBounds } from './useCopyPaste';
export type { ClipboardData, CopyPasteActions, UseCopyPasteOptions } from './useCopyPaste';

// Round 111: Energy Connection System + Module Animation Hooks
export { useConnectionPoints, getConnectionPointsForModule, getConnectionPointsForModuleInstance, getInputPointsForModule, getOutputPointsForModule, findConnectionPoint, canPortAcceptConnection, getAvailablePorts, calculatePortWorldPosition } from './useConnectionPoints';
export type { } from './useConnectionPoints';

export { useEnergyConnections, validateConnectionAttempt, createConnectionPathData } from './useEnergyConnections';
export type { } from './useEnergyConnections';

export { useModuleAnimation, getModuleAnimationConfig, machineStateToAnimationState } from './useModuleAnimation';
export type { AnimationState, AnimationKeyframe, AnimationPhaseConfig, ModuleAnimationConfig, ModuleAnimationState } from './useModuleAnimation';
