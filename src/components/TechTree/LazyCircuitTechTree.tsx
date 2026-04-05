/**
 * Lazy Circuit Tech Tree Component
 * 
 * Lazy-loaded wrapper for TechTreePanel that manages internal open state.
 * This component is loaded on-demand to optimize bundle size.
 * 
 * Props:
 * - onClose: Callback to close the panel
 * 
 * ROUND 137: Initial implementation - connects TechTreePanel to app toolbar
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';

const TechTreePanel = lazy(() => import('./TechTreePanel'));

interface LazyCircuitTechTreeProps {
  onClose: () => void;
}

/**
 * Loading fallback component
 */
function LoadingFallback() {
  return (
    <div 
      className="flex items-center justify-center bg-[#121826]"
      style={{ height: '600px' }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-[#9ca3af]">加载科技树...</span>
      </div>
    </div>
  );
}

/**
 * Circuit Tech Tree wrapper component
 * Manages internal isOpen state and renders TechTreePanel
 */
export const LazyCircuitTechTree: React.FC<LazyCircuitTechTreeProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  // Handle close from parent
  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TechTreePanel isOpen={isOpen} onClose={handleClose} />
    </Suspense>
  );
};

export default LazyCircuitTechTree;
