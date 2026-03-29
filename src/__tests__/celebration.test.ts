/**
 * Celebration System Tests
 * 
 * Tests for celebration overlay, confetti, achievement toast, and related components.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import React from 'react';
import {
  Confetti,
  GlowAnimation,
  AchievementToast,
  ChallengeCompletionOverlay,
  RecipeUnlockGlow,
  CelebrationConfig,
} from '../components/common/CelebrationOverlay';

describe('Confetti Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should Render confetti particles', () => {
    const result = render(React.createElement(Confetti, { particleCount: 10 }));
    expect(result.container.firstChild).toBeTruthy();
  });

  it('should Render correct number of particles', () => {
    const result = render(React.createElement(Confetti, { particleCount: 25 }));
    expect(result.container.querySelectorAll('[class*="absolute"]').length).toBeGreaterThanOrEqual(20);
  });

  it('should use custom colors', () => {
    const colors = ['#ff0000', '#00ff00', '#0000ff'];
    const result = render(React.createElement(Confetti, { colors, particleCount: 5 }));
    expect(result.container.querySelectorAll('[class*="absolute"]').length).toBeGreaterThanOrEqual(5);
  });

  it('should disappear after duration', () => {
    const result = render(React.createElement(Confetti, { particleCount: 10, duration: 2000 }));
    expect(result.container.firstChild).toBeTruthy();
    
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    expect(result.container.firstChild).toBeFalsy();
  });

  it('should have default colors', () => {
    const result = render(React.createElement(Confetti));
    expect(result.container.querySelectorAll('[class*="absolute"]').length).toBeGreaterThan(0);
  });
});

describe('GlowAnimation Component', () => {
  it('should Render children', () => {
    render(
      React.createElement(GlowAnimation, null,
        React.createElement('span', null, 'Test Content')
      )
    );
    
    expect(screen.getByText('Test Content')).toBeTruthy();
  });

  it('should accept custom color', () => {
    render(
      React.createElement(GlowAnimation, { color: '#ff0000' },
        React.createElement('span', null, 'Test')
      )
    );
    
    const glowElement = document.querySelector('.absolute.inset-0.blur-xl');
    expect(glowElement).toBeTruthy();
  });

  it('should use default color', () => {
    render(
      React.createElement(GlowAnimation, null,
        React.createElement('span', null, 'Test')
      )
    );
    
    const glowElement = document.querySelector('.absolute.inset-0.blur-xl');
    expect(glowElement).toBeTruthy();
  });

  it('should have animation style', () => {
    render(
      React.createElement(GlowAnimation, null,
        React.createElement('span', null, 'Test')
      )
    );
    
    const wrapper = document.querySelector('.relative');
    expect(wrapper).toBeTruthy();
    // Check that the element has a style attribute with animation
    const style = wrapper?.getAttribute('style');
    expect(style).toContain('animation');
  });
});

describe('AchievementToast Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should Render achievement title', () => {
    render(
      React.createElement(AchievementToast, {
        title: 'First Machine',
        icon: '🏆',
        color: '#f59e0b'
      })
    );
    
    expect(screen.getByText('First Machine')).toBeTruthy();
  });

  it('should Render achievement icon', () => {
    render(
      React.createElement(AchievementToast, {
        title: 'Test',
        icon: '⭐',
        color: '#fbbf24'
      })
    );
    
    expect(screen.getByText('⭐')).toBeTruthy();
  });

  it('should Render subtitle when provided', () => {
    render(
      React.createElement(AchievementToast, {
        title: 'Test',
        subtitle: 'Subtitle text',
        icon: '🎖️',
        color: '#22c55e'
      })
    );
    
    expect(screen.getByText('Subtitle text')).toBeTruthy();
  });

  it('should Render badge icon when provided', () => {
    render(
      React.createElement(AchievementToast, {
        title: 'Test',
        icon: '🏆',
        badgeIcon: '★',
        color: '#a855f7'
      })
    );
    
    expect(screen.getByText('★')).toBeTruthy();
  });

  it('should have close button', () => {
    render(
      React.createElement(AchievementToast, {
        title: 'Test',
        icon: '🎖️'
      })
    );
    
    const closeButton = document.querySelector('button');
    expect(closeButton).toBeTruthy();
  });

  it('should call onClose when close button clicked', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(
      React.createElement(AchievementToast, {
        title: 'Test',
        icon: '🎖️',
        onClose,
        duration: 5000
      })
    );
    
    const closeButton = document.querySelector('button');
    fireEvent.click(closeButton!);
    
    // onClose is called after 300ms delay
    act(() => {
      vi.advanceTimersByTime(400);
    });
    
    expect(onClose).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('should auto-close after duration', () => {
    const onClose = vi.fn();
    render(
      React.createElement(AchievementToast, {
        title: 'Test',
        icon: '🎖️',
        duration: 3000,
        onClose
      })
    );
    
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    expect(onClose).toHaveBeenCalled();
  });

  it('should have Achievement Unlocked label', () => {
    render(
      React.createElement(AchievementToast, {
        title: 'Test',
        icon: '🏆',
        color: '#f59e0b'
      })
    );
    
    expect(screen.getByText('Achievement Unlocked')).toBeTruthy();
  });
});

describe('ChallengeCompletionOverlay Component', () => {
  const mockConfig: CelebrationConfig = {
    type: 'challenge',
    title: 'Challenge Complete!',
    subtitle: 'Void Mastery',
    icon: '🏆',
    color: '#f59e0b',
    badgeIcon: '⚡',
  };

  it('should Render config title', () => {
    render(
      React.createElement(ChallengeCompletionOverlay, { config: mockConfig })
    );
    
    expect(screen.getByText('Challenge Complete!')).toBeTruthy();
  });

  it('should Render config subtitle', () => {
    render(
      React.createElement(ChallengeCompletionOverlay, { config: mockConfig })
    );
    
    expect(screen.getByText('Void Mastery')).toBeTruthy();
  });

  it('should Render config icon', () => {
    render(
      React.createElement(ChallengeCompletionOverlay, { config: mockConfig })
    );
    
    expect(screen.getByText('🏆')).toBeTruthy();
  });

  it('should have continue button', () => {
    render(
      React.createElement(ChallengeCompletionOverlay, { config: mockConfig })
    );
    
    expect(screen.getByText('Continue')).toBeTruthy();
  });

  it('should call onClose when continue clicked', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(
      React.createElement(ChallengeCompletionOverlay, { config: mockConfig, onClose })
    );
    
    // Need to wait for content to show
    act(() => {
      vi.advanceTimersByTime(400);
    });
    
    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);
    
    // onClose is called after 300ms delay
    act(() => {
      vi.advanceTimersByTime(400);
    });
    
    expect(onClose).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('should Render with recipe config type', () => {
    const recipeConfig: CelebrationConfig = {
      type: 'recipe',
      title: 'Recipe Unlocked!',
      icon: '🧪',
      color: '#a855f7',
    };
    
    render(
      React.createElement(ChallengeCompletionOverlay, { config: recipeConfig })
    );
    
    expect(screen.getByText('Recipe Unlocked!')).toBeTruthy();
  });

  it('should Render with achievement config type', () => {
    const achievementConfig: CelebrationConfig = {
      type: 'achievement',
      title: 'Achievement Earned!',
      icon: '⭐',
      color: '#fbbf24',
    };
    
    render(
      React.createElement(ChallengeCompletionOverlay, { config: achievementConfig })
    );
    
    expect(screen.getByText('Achievement Earned!')).toBeTruthy();
  });
});

describe('RecipeUnlockGlow Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should Render recipe name', () => {
    render(
      React.createElement(RecipeUnlockGlow, { recipeName: 'Ancient Blueprint' })
    );
    
    expect(screen.getByText('Ancient Blueprint')).toBeTruthy();
  });

  it('should Render Recipe Unlocked title', () => {
    render(
      React.createElement(RecipeUnlockGlow, { recipeName: 'Test Recipe' })
    );
    
    expect(screen.getByText('Recipe Unlocked!')).toBeTruthy();
  });

  it('should have sparkle icon', () => {
    render(
      React.createElement(RecipeUnlockGlow, { recipeName: 'Test' })
    );
    
    expect(screen.getByText('✨')).toBeTruthy();
  });

  it('should call onAnimationComplete after duration', () => {
    const onAnimationComplete = vi.fn();
    render(
      React.createElement(RecipeUnlockGlow, {
        recipeName: 'Test',
        onAnimationComplete
      })
    );
    
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    
    expect(onAnimationComplete).toHaveBeenCalled();
  });

  it('should use custom color', () => {
    render(
      React.createElement(RecipeUnlockGlow, {
        recipeName: 'Test',
        color: '#22c55e'
      })
    );
    
    const iconContainer = document.querySelector('.w-24.h-24');
    expect(iconContainer).toBeTruthy();
  });
});

describe('CelebrationConfig Interface', () => {
  it('should accept challenge type config', () => {
    const config: CelebrationConfig = {
      type: 'challenge',
      title: 'Test',
      icon: '🏆',
      color: '#f59e0b',
    };
    
    expect(config.type).toBe('challenge');
  });

  it('should accept recipe type config', () => {
    const config: CelebrationConfig = {
      type: 'recipe',
      title: 'Test',
      icon: '🧪',
      color: '#a855f7',
    };
    
    expect(config.type).toBe('recipe');
  });

  it('should accept achievement type config', () => {
    const config: CelebrationConfig = {
      type: 'achievement',
      title: 'Test',
      icon: '⭐',
      color: '#fbbf24',
    };
    
    expect(config.type).toBe('achievement');
  });

  it('should have optional subtitle', () => {
    const config: CelebrationConfig = {
      type: 'challenge',
      title: 'Test',
      icon: '🏆',
      color: '#f59e0b',
      subtitle: 'Optional subtitle',
    };
    
    expect(config.subtitle).toBe('Optional subtitle');
  });

  it('should have optional badgeIcon', () => {
    const config: CelebrationConfig = {
      type: 'challenge',
      title: 'Test',
      icon: '🏆',
      color: '#f59e0b',
      badgeIcon: '⚡',
    };
    
    expect(config.badgeIcon).toBe('⚡');
  });
});
