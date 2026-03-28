import { describe, it, expect, beforeEach } from 'vitest';
import { useMachineStore } from '../store/useMachineStore';

describe('Zoom Controls', () => {
  beforeEach(() => {
    // Reset store to initial state
    useMachineStore.setState({
      modules: [],
      connections: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      selectedModuleId: null,
      selectedConnectionId: null,
      history: [{ modules: [], connections: [] }],
      historyIndex: 0,
    });
  });

  describe('zoomIn', () => {
    it('should increase zoom by 0.1', () => {
      const { zoomIn, viewport } = useMachineStore.getState();
      zoomIn();
      expect(useMachineStore.getState().viewport.zoom).toBe(viewport.zoom + 0.1);
    });

    it('should cap zoom at 2.0', () => {
      const { zoomIn } = useMachineStore.getState();
      // Zoom in multiple times
      for (let i = 0; i < 20; i++) {
        zoomIn();
      }
      expect(useMachineStore.getState().viewport.zoom).toBeLessThanOrEqual(2.0);
    });
  });

  describe('zoomOut', () => {
    it('should decrease zoom by 0.1', () => {
      const { zoomOut, viewport } = useMachineStore.getState();
      zoomOut();
      expect(useMachineStore.getState().viewport.zoom).toBe(viewport.zoom - 0.1);
    });

    it('should floor at 0.1', () => {
      const { zoomOut } = useMachineStore.getState();
      // Zoom out multiple times
      for (let i = 0; i < 20; i++) {
        zoomOut();
      }
      expect(useMachineStore.getState().viewport.zoom).toBeGreaterThanOrEqual(0.1);
    });
  });

  describe('resetViewport', () => {
    it('should reset zoom to 1.0', () => {
      const { resetViewport, zoomIn } = useMachineStore.getState();
      zoomIn();
      zoomIn();
      resetViewport();
      expect(useMachineStore.getState().viewport.zoom).toBe(1.0);
    });

    it('should reset position to (0, 0)', () => {
      const { resetViewport, setViewport } = useMachineStore.getState();
      setViewport({ x: 100, y: 200 });
      resetViewport();
      expect(useMachineStore.getState().viewport.x).toBe(0);
      expect(useMachineStore.getState().viewport.y).toBe(0);
    });
  });

  describe('zoomToFit', () => {
    it('should reset viewport when no modules exist', () => {
      const { zoomToFit, setViewport } = useMachineStore.getState();
      setViewport({ x: 100, y: 200, zoom: 2 });
      zoomToFit();
      const viewport = useMachineStore.getState().viewport;
      expect(viewport.zoom).toBe(1);
      expect(viewport.x).toBe(0);
      expect(viewport.y).toBe(0);
    });

    it('should adjust viewport to fit modules with padding', () => {
      const { zoomToFit, addModule } = useMachineStore.getState();
      // Add modules spread apart
      addModule('core-furnace', 200, 200);
      addModule('gear', 400, 400);
      zoomToFit();
      const viewport = useMachineStore.getState().viewport;
      // Should have adjusted zoom and position
      expect(viewport.zoom).toBeGreaterThan(0);
      expect(viewport.zoom).toBeLessThanOrEqual(2.0);
    });
  });
});
