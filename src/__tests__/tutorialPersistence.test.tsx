import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import React from 'react';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

describe('Welcome Modal Persistence', () => {
  const TUTORIAL_STORAGE_KEY = 'arcane-codex-tutorial';
  
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    cleanup();
  });

  describe('getInitialTutorialState', () => {
    it('should return default state when localStorage is empty', async () => {
      const { getInitialTutorialState } = await import('../components/Tutorial/WelcomeModal');
      
      const result = getInitialTutorialState();
      
      expect(result.hasSeenWelcome).toBe(false);
      expect(result.isTutorialEnabled).toBe(true);
    });

    it('should return hasSeenWelcome=true when user has skipped tutorial', async () => {
      // Simulate user previously skipped tutorial
      localStorageMock.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify({
        state: { hasSeenWelcome: true, isTutorialEnabled: false },
        version: 0
      }));
      
      const { getInitialTutorialState } = await import('../components/Tutorial/WelcomeModal');
      
      const result = getInitialTutorialState();
      
      expect(result.hasSeenWelcome).toBe(true);
      expect(result.isTutorialEnabled).toBe(false);
    });

    it('should return hasSeenWelcome=false for new user', async () => {
      // No localStorage entry means new user
      const { getInitialTutorialState } = await import('../components/Tutorial/WelcomeModal');
      
      const result = getInitialTutorialState();
      
      expect(result.hasSeenWelcome).toBe(false);
      expect(result.isTutorialEnabled).toBe(true);
    });

    it('should handle corrupted localStorage gracefully', async () => {
      localStorageMock.setItem(TUTORIAL_STORAGE_KEY, 'invalid json');
      
      const { getInitialTutorialState } = await import('../components/Tutorial/WelcomeModal');
      
      const result = getInitialTutorialState();
      
      // Should return defaults on error
      expect(result.hasSeenWelcome).toBe(false);
      expect(result.isTutorialEnabled).toBe(true);
    });

    it('should handle missing state object in localStorage', async () => {
      localStorageMock.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify({
        version: 0
        // Missing state object
      }));
      
      const { getInitialTutorialState } = await import('../components/Tutorial/WelcomeModal');
      
      const result = getInitialTutorialState();
      
      // Should return defaults when state is missing
      expect(result.hasSeenWelcome).toBe(false);
      expect(result.isTutorialEnabled).toBe(true);
    });
  });

  describe('WelcomeModal should not render after skip', () => {
    it('should not render modal when hasSeenWelcome is true in localStorage', async () => {
      // Pre-populate localStorage with user who skipped
      localStorageMock.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify({
        state: { hasSeenWelcome: true, isTutorialEnabled: false },
        version: 0
      }));
      
      const { WelcomeModal } = await import('../components/Tutorial/WelcomeModal');
      const { container } = render(
        <WelcomeModal 
          onStartTutorial={vi.fn()} 
          onSkip={vi.fn()} 
        />
      );
      
      // Modal should not render because user already saw it
      expect(container.firstChild).toBeNull();
    });
  });
});
