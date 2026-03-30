import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRecipeStore } from '../../store/useRecipeStore';
import { Recipe, RARITY_COLORS } from '../../types/recipes';
import { ModulePreview } from '../Modules/ModulePreview';

interface RecipeDiscoveryToastProps {
  recipe: Recipe;
  onDismiss: () => void;
  duration?: number;
}

export const RecipeDiscoveryToast: React.FC<RecipeDiscoveryToastProps> = ({
  recipe,
  onDismiss,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const rarityStyle = RARITY_COLORS[recipe.rarity];
  
  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
    
    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration]);
  
  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss();
    }, 400); // Wait for exit animation
  };
  
  return (
    <div
      className={`
        fixed bottom-6 right-6 z-50 w-80
        transition-all duration-400 ease-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div
        className="relative overflow-hidden rounded-xl border-2 shadow-2xl"
        style={{
          borderColor: rarityStyle.primary,
          boxShadow: `0 0 30px ${rarityStyle.glow}, 0 0 60px ${rarityStyle.glow}`,
          backgroundColor: '#0a0a0f',
        }}
      >
        {/* Animated background glow */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${rarityStyle.glow}, transparent 50%)`,
          }}
        />
        
        {/* Content */}
        <div className="relative p-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            {/* Discovery icon */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: `${rarityStyle.primary}20`,
                border: `2px solid ${rarityStyle.primary}`,
              }}
            >
              <svg
                className="w-5 h-5 animate-pulse"
                style={{ color: rarityStyle.primary }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            
            {/* Text */}
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wider text-purple-400 font-medium">
                Recipe Discovered
              </div>
              <div 
                className="font-bold text-lg"
                style={{ color: rarityStyle.primary }}
              >
                {recipe.name}
              </div>
            </div>
            
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="p-1 rounded hover:bg-gray-800 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Module preview */}
          <div 
            className="h-24 rounded-lg flex items-center justify-center mb-3"
            style={{ backgroundColor: `${rarityStyle.primary}10` }}
          >
            {recipe.moduleType ? (
              <div className="scale-75">
                <ModulePreview type={recipe.moduleType} isActive={true} />
              </div>
            ) : (
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${rarityStyle.primary}20` }}
              >
                <svg
                  className="w-6 h-6"
                  style={{ color: rarityStyle.primary }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>
          
          {/* Description */}
          <p className="text-sm text-gray-400 mb-3">
            {recipe.description}
          </p>
          
          {/* Rarity badge */}
          <div className="flex items-center justify-between">
            <span
              className="px-2 py-0.5 rounded text-xs uppercase tracking-wider font-bold"
              style={{
                backgroundColor: `${rarityStyle.primary}20`,
                color: rarityStyle.primary,
              }}
            >
              {recipe.rarity}
            </span>
            
            <button
              onClick={handleDismiss}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
        
        {/* Particle effects - decorative SVG */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg className="absolute w-full h-full opacity-10">
            <defs>
              <radialGradient id={`glow-${recipe.id}`}>
                <stop offset="0%" stopColor={rarityStyle.primary} />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <circle
              cx="20%"
              cy="50%"
              r="40%"
              fill={`url(#glow-${recipe.id})`}
              className="animate-pulse"
              style={{ animationDuration: '2s' }}
            />
          </svg>
        </div>
        
        {/* Progress bar */}
        <div 
          className="absolute bottom-0 left-0 h-1 transition-all"
          style={{ 
            backgroundColor: rarityStyle.primary,
            width: isVisible && !isExiting ? '100%' : '0%',
            transitionDuration: `${duration}ms`,
            transitionTimingFunction: 'linear',
          }}
        />
      </div>
    </div>
  );
};

// Toast manager component
interface ToastManagerProps {
  onRecipeDiscovered?: (recipe: Recipe) => void;
}

export const RecipeToastManager: React.FC<ToastManagerProps> = ({ onRecipeDiscovered }) => {
  // Use refs and callbacks with getState() pattern to avoid full store subscription
  const pendingDiscoveriesRef = useRef(useRecipeStore.getState().pendingDiscoveries);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  
  // Use callbacks with getState() pattern to avoid subscription-based re-renders
  const getPendingDiscoveries = useCallback(() => useRecipeStore.getState().pendingDiscoveries, []);
  const getNextPendingDiscovery = useCallback(() => useRecipeStore.getState().getNextPendingDiscovery(), []);
  const clearPendingDiscoveries = useCallback(() => useRecipeStore.getState().clearPendingDiscoveries(), []);
  const markAsSeen = useCallback((id: string) => useRecipeStore.getState().markAsSeen(id), []);
  
  // Check for pending discoveries on mount and periodically
  useEffect(() => {
    const checkForPendingDiscoveries = () => {
      const discoveries = getPendingDiscoveries();
      pendingDiscoveriesRef.current = discoveries;
      
      if (discoveries.length > 0 && !currentRecipe) {
        const recipe = getNextPendingDiscovery();
        if (recipe) {
          setCurrentRecipe(recipe);
          onRecipeDiscovered?.(recipe);
        }
      }
    };
    
    // Initial check
    checkForPendingDiscoveries();
    
    // Poll periodically to check for new discoveries (without subscribing to store)
    const intervalId = setInterval(checkForPendingDiscoveries, 1000);
    
    return () => clearInterval(intervalId);
  }, [getPendingDiscoveries, getNextPendingDiscovery, onRecipeDiscovered, currentRecipe]);
  
  const handleDismiss = () => {
    if (currentRecipe) {
      markAsSeen(currentRecipe.id);
    }
    setCurrentRecipe(null);
    
    // Check for more pending discoveries after a delay
    setTimeout(() => {
      const next = getNextPendingDiscovery();
      if (next) {
        setCurrentRecipe(next);
      } else {
        clearPendingDiscoveries();
      }
    }, 500);
  };
  
  if (!currentRecipe) return null;
  
  return (
    <RecipeDiscoveryToast
      recipe={currentRecipe}
      onDismiss={handleDismiss}
    />
  );
};

export default RecipeDiscoveryToast;
