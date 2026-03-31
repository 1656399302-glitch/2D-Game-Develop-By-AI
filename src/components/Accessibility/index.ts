// Main accessibility layer exports
export { 
  AccessibilityLayer, 
  announceToScreenReader,
  announceMachineState,
  announceConnectionEvent,
  announceModuleOperation,
  announceError,
  SkipLink, 
  MainLandmark, 
  NavLandmark, 
  Region, 
  useHighContrast,
  AsideLandmark,
  useFocusTrapEnhanced,
  useRovingTabIndex,
} from './AccessibilityLayer';

// Focus manager exports
export { 
  FocusManager,
  useFocusTrap,
  trapFocus,
  restoreFocus,
  getFirstFocusable,
  getLastFocusable,
} from './FocusManager';

// Accessible canvas and module panel
export { AccessibleCanvas } from './AccessibleCanvas';
export { AccessibleModulePanel } from './AccessibleModulePanel';

// Mobile layout and touch enhancements
export { MobileCanvasLayout, useIsMobile, useViewportSize, TouchGestureHints } from './MobileCanvasLayout';
export { MobileTouchEnhancer } from './MobileTouchEnhancer';
