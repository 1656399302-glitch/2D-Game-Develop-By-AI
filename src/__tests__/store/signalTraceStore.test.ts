/**
 * SignalTraceStore Tests
 * 
 * Round 149: Circuit Signal Visualization
 * 
 * Unit tests for the signal trace store functionality.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSignalTraceStore } from '../../store/signalTraceStore';

// Reset store before each test
beforeEach(() => {
  useSignalTraceStore.setState({
    traces: [],
    metadata: {
      stepCount: 0,
      signalNames: [],
      isRecording: false,
      maxSteps: 100,
    },
  });
});

describe('SignalTraceStore', () => {
  describe('Initial State', () => {
    it('should have empty traces array on initialization', () => {
      const state = useSignalTraceStore.getState();
      expect(state.traces).toEqual([]);
    });

    it('should have zero step count on initialization', () => {
      const state = useSignalTraceStore.getState();
      expect(state.metadata.stepCount).toBe(0);
    });

    it('should not be recording on initialization', () => {
      const state = useSignalTraceStore.getState();
      expect(state.metadata.isRecording).toBe(false);
    });

    it('should have default maxSteps of 100', () => {
      const state = useSignalTraceStore.getState();
      expect(state.metadata.maxSteps).toBe(100);
    });
  });

  describe('recordStep', () => {
    it('should record a single step with signals', () => {
      const signals = { A: true, B: false, OUT: false };
      useSignalTraceStore.getState().recordStep(signals);

      const state = useSignalTraceStore.getState();
      expect(state.traces).toHaveLength(1);
      expect(state.traces[0].step).toBe(0);
      expect(state.traces[0].signals).toEqual(signals);
    });

    it('should increment step index for each record', () => {
      useSignalTraceStore.getState().recordStep({ A: true });
      useSignalTraceStore.getState().recordStep({ A: false });
      useSignalTraceStore.getState().recordStep({ A: true });

      const state = useSignalTraceStore.getState();
      expect(state.traces).toHaveLength(3);
      expect(state.traces[0].step).toBe(0);
      expect(state.traces[1].step).toBe(1);
      expect(state.traces[2].step).toBe(2);
    });

    it('should update stepCount in metadata', () => {
      useSignalTraceStore.getState().recordStep({ A: true });
      useSignalTraceStore.getState().recordStep({ A: false });

      const state = useSignalTraceStore.getState();
      expect(state.metadata.stepCount).toBe(2);
    });

    it('should add timestamp to each trace entry', () => {
      const beforeTime = Date.now();
      useSignalTraceStore.getState().recordStep({ A: true });
      const afterTime = Date.now();

      const state = useSignalTraceStore.getState();
      expect(state.traces[0].timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(state.traces[0].timestamp).toBeLessThanOrEqual(afterTime);
    });

    it('should handle multiple signals in a single step', () => {
      const signals = {
        InputA: true,
        InputB: true,
        AND_OUT: true,
        OR_OUT: true,
        NOT_OUT: false,
      };
      useSignalTraceStore.getState().recordStep(signals);

      const state = useSignalTraceStore.getState();
      expect(Object.keys(state.traces[0].signals)).toHaveLength(5);
    });
  });

  describe('clearTraces', () => {
    it('should clear all traces', () => {
      useSignalTraceStore.getState().recordStep({ A: true });
      useSignalTraceStore.getState().recordStep({ A: false });
      useSignalTraceStore.getState().clearTraces();

      const state = useSignalTraceStore.getState();
      expect(state.traces).toEqual([]);
    });

    it('should reset stepCount to 0', () => {
      useSignalTraceStore.getState().recordStep({ A: true });
      useSignalTraceStore.getState().clearTraces();

      const state = useSignalTraceStore.getState();
      expect(state.metadata.stepCount).toBe(0);
    });

    it('should preserve signalNames when clearing', () => {
      useSignalTraceStore.getState().setSignalNames(['A', 'B']);
      useSignalTraceStore.getState().recordStep({ A: true });
      useSignalTraceStore.getState().clearTraces();

      const state = useSignalTraceStore.getState();
      expect(state.metadata.signalNames).toEqual(['A', 'B']);
    });
  });

  describe('startRecording / stopRecording', () => {
    it('should set isRecording to true when startRecording is called', () => {
      useSignalTraceStore.getState().startRecording();

      const state = useSignalTraceStore.getState();
      expect(state.metadata.isRecording).toBe(true);
    });

    it('should set isRecording to false when stopRecording is called', () => {
      useSignalTraceStore.getState().startRecording();
      useSignalTraceStore.getState().stopRecording();

      const state = useSignalTraceStore.getState();
      expect(state.metadata.isRecording).toBe(false);
    });

    it('should allow toggling recording state', () => {
      expect(useSignalTraceStore.getState().metadata.isRecording).toBe(false);
      
      useSignalTraceStore.getState().startRecording();
      expect(useSignalTraceStore.getState().metadata.isRecording).toBe(true);
      
      useSignalTraceStore.getState().stopRecording();
      expect(useSignalTraceStore.getState().metadata.isRecording).toBe(false);
    });
  });

  describe('setSignalNames', () => {
    it('should set signal names', () => {
      useSignalTraceStore.getState().setSignalNames(['A', 'B', 'OUT']);

      const state = useSignalTraceStore.getState();
      expect(state.metadata.signalNames).toEqual(['A', 'B', 'OUT']);
    });

    it('should overwrite previous signal names', () => {
      useSignalTraceStore.getState().setSignalNames(['A', 'B']);
      useSignalTraceStore.getState().setSignalNames(['X', 'Y', 'Z']);

      const state = useSignalTraceStore.getState();
      expect(state.metadata.signalNames).toEqual(['X', 'Y', 'Z']);
    });
  });

  describe('getTrace', () => {
    it('should return all traces', () => {
      useSignalTraceStore.getState().recordStep({ A: true });
      useSignalTraceStore.getState().recordStep({ A: false });
      useSignalTraceStore.getState().recordStep({ A: true });

      const traces = useSignalTraceStore.getState().getTrace();
      expect(traces).toHaveLength(3);
    });

    it('should return empty array when no traces', () => {
      const traces = useSignalTraceStore.getState().getTrace();
      expect(traces).toEqual([]);
    });
  });

  describe('getStepCount', () => {
    it('should return current step count', () => {
      expect(useSignalTraceStore.getState().getStepCount()).toBe(0);
      
      useSignalTraceStore.getState().recordStep({ A: true });
      expect(useSignalTraceStore.getState().getStepCount()).toBe(1);
      
      useSignalTraceStore.getState().recordStep({ A: false });
      expect(useSignalTraceStore.getState().getStepCount()).toBe(2);
    });
  });

  describe('getLatestTrace', () => {
    it('should return the most recent trace', () => {
      useSignalTraceStore.getState().recordStep({ A: true, step: 'first' });
      useSignalTraceStore.getState().recordStep({ A: false, step: 'second' });
      useSignalTraceStore.getState().recordStep({ A: true, step: 'third' });

      const latest = useSignalTraceStore.getState().getLatestTrace();
      expect(latest?.step).toBe(2);
      expect(latest?.signals.step).toBe('third');
    });

    it('should return null when no traces', () => {
      const latest = useSignalTraceStore.getState().getLatestTrace();
      expect(latest).toBeNull();
    });
  });

  describe('getSignalHistory', () => {
    it('should return history for a specific signal', () => {
      useSignalTraceStore.getState().recordStep({ A: true, B: false });
      useSignalTraceStore.getState().recordStep({ A: false, B: true });
      useSignalTraceStore.getState().recordStep({ A: true, B: true });

      const historyA = useSignalTraceStore.getState().getSignalHistory('A');
      expect(historyA).toEqual([true, false, true]);

      const historyB = useSignalTraceStore.getState().getSignalHistory('B');
      expect(historyB).toEqual([false, true, true]);
    });

    it('should return empty array for non-existent signal', () => {
      useSignalTraceStore.getState().recordStep({ A: true });

      const history = useSignalTraceStore.getState().getSignalHistory('NONEXISTENT');
      expect(history).toEqual([]);
    });

    it('should return false for missing signals in history', () => {
      useSignalTraceStore.getState().recordStep({ A: true });
      useSignalTraceStore.getState().recordStep({ A: false, B: true });

      const historyB = useSignalTraceStore.getState().getSignalHistory('B');
      expect(historyB).toEqual([false, true]);
    });
  });

  describe('AND gate simulation trace', () => {
    it('should correctly trace AND gate behavior', () => {
      // Step 0: Both inputs LOW
      useSignalTraceStore.getState().recordStep({
        InputA: false,
        InputB: false,
        AND_OUT: false,
      });

      // Step 1: InputA HIGH, InputB LOW
      useSignalTraceStore.getState().recordStep({
        InputA: true,
        InputB: false,
        AND_OUT: false,
      });

      // Step 2: InputA LOW, InputB HIGH
      useSignalTraceStore.getState().recordStep({
        InputA: false,
        InputB: true,
        AND_OUT: false,
      });

      // Step 3: Both HIGH
      useSignalTraceStore.getState().recordStep({
        InputA: true,
        InputB: true,
        AND_OUT: true,
      });

      const state = useSignalTraceStore.getState();
      expect(state.traces).toHaveLength(4);

      // Verify AND gate truth table
      const andHistory = state.getSignalHistory('AND_OUT');
      expect(andHistory).toEqual([false, false, false, true]);
    });
  });

  describe('Memory management', () => {
    it('should respect maxSteps limit', () => {
      // Set a small maxSteps
      useSignalTraceStore.setState((state) => ({
        metadata: { ...state.metadata, maxSteps: 5 },
      }));

      // Record 10 steps
      for (let i = 0; i < 10; i++) {
        useSignalTraceStore.getState().recordStep({ step: i });
      }

      const state = useSignalTraceStore.getState();
      expect(state.traces).toHaveLength(5);
      // Should keep the last 5 entries
      expect(state.traces[0].signals.step).toBe(5);
      expect(state.traces[4].signals.step).toBe(9);
    });

    it('should reindex steps after trimming', () => {
      useSignalTraceStore.setState((state) => ({
        metadata: { ...state.metadata, maxSteps: 3 },
      }));

      useSignalTraceStore.getState().recordStep({ step: 0 });
      useSignalTraceStore.getState().recordStep({ step: 1 });
      useSignalTraceStore.getState().recordStep({ step: 2 });
      useSignalTraceStore.getState().recordStep({ step: 3 });

      const state = useSignalTraceStore.getState();
      expect(state.traces[0].step).toBe(0);
      expect(state.traces[1].step).toBe(1);
      expect(state.traces[2].step).toBe(2);
    });
  });

  describe('Multiple signals tracking', () => {
    it('should track 4+ time steps for a simple circuit', () => {
      // Simulate a circuit with 2 inputs and 1 AND gate for 4 steps
      useSignalTraceStore.getState().recordStep({ A: false, B: false, OUT: false });
      useSignalTraceStore.getState().recordStep({ A: true, B: false, OUT: false });
      useSignalTraceStore.getState().recordStep({ A: false, B: true, OUT: false });
      useSignalTraceStore.getState().recordStep({ A: true, B: true, OUT: true });

      const state = useSignalTraceStore.getState();
      expect(state.traces.length).toBeGreaterThanOrEqual(4);
    });
  });
});
