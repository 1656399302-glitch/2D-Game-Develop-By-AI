/**
 * Canvas Effects Component
 * 
 * Provides visual effects for the canvas during machine activation:
 * - Camera shake effect (subtle shake during activation)
 * - Focus zoom effect (zoom in/out to focus on machine)
 * - Glitch effects (for failure/overload modes)
 * 
 * Round 109: Canvas Visual Effects Enhancement
 */

import { useEffect, useRef, useMemo, ReactNode } from 'react';
import { gsap } from 'gsap';
import { useMachineStore } from '../../store/useMachineStore';

interface CanvasEffectsProps {
  /** Whether effects are active */
  active?: boolean;
  /** Canvas zoom level (for focus effect) */
  viewport?: { x: number; y: number; zoom: number };
  /** Children to wrap with effects */
  children?: ReactNode;
  /** CSS class */
  className?: string;
}

/**
 * Calculate shake offset using smooth noise
 */
function calculateShakeOffset(
  time: number,
  intensity: number,
  frequency: number = 15
): { x: number; y: number } {
  // Multiple sine waves for organic movement
  const x =
    Math.sin(time * frequency) * intensity +
    Math.sin(time * frequency * 1.3) * intensity * 0.5 +
    Math.sin(time * frequency * 0.7) * intensity * 0.3;
  
  const y =
    Math.cos(time * frequency) * intensity +
    Math.cos(time * frequency * 1.3) * intensity * 0.5 +
    Math.cos(time * frequency * 0.7) * intensity * 0.3;
  
  return { x, y };
}

/**
 * Camera Shake Effect
 * 
 * Applies subtle shake to the canvas container during activation.
 * Shake intensity varies based on machine state.
 */
interface CameraShakeProps {
  active: boolean;
  machineState: 'idle' | 'charging' | 'active' | 'overload' | 'failure' | 'shutdown';
  powerOutput?: number;
  children: ReactNode;
  className?: string;
}

function CameraShake({
  active,
  machineState,
  powerOutput = 50,
  children,
  className = '',
}: CameraShakeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  // Calculate shake intensity based on machine state
  const shakeConfig = useMemo(() => {
    switch (machineState) {
      case 'failure':
        return { intensity: 8, frequency: 20, decay: 0.1 };
      case 'overload':
        return { intensity: 6, frequency: 15, decay: 0.05 };
      case 'active':
        return { intensity: 3, frequency: 12, decay: 0.02 };
      case 'charging':
        return { intensity: 2, frequency: 10, decay: 0.01 };
      default:
        return { intensity: 0, frequency: 10, decay: 0 };
    }
  }, [machineState]);
  
  // Adjust intensity based on power output
  const adjustedIntensity = useMemo(() => {
    const powerModifier = 0.8 + (powerOutput / 100) * 0.4;
    return shakeConfig.intensity * powerModifier;
  }, [shakeConfig.intensity, powerOutput]);
  
  useEffect(() => {
    if (!active || adjustedIntensity === 0) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (containerRef.current) {
        gsap.set(containerRef.current, { x: 0, y: 0 });
      }
      return;
    }
    
    startTimeRef.current = performance.now();
    
    const animate = (timestamp: number) => {
      if (!containerRef.current) return;
      
      const elapsed = (timestamp - startTimeRef.current) / 1000; // Convert to seconds
      const decay = Math.max(0.1, 1 - elapsed * shakeConfig.decay);
      
      const offset = calculateShakeOffset(
        elapsed,
        adjustedIntensity * decay,
        shakeConfig.frequency
      );
      
      // Add random jitter for more organic feel
      const jitterX = (Math.random() - 0.5) * adjustedIntensity * 0.3 * decay;
      const jitterY = (Math.random() - 0.5) * adjustedIntensity * 0.3 * decay;
      
      gsap.set(containerRef.current, {
        x: offset.x + jitterX,
        y: offset.y + jitterY,
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (containerRef.current) {
        gsap.set(containerRef.current, { x: 0, y: 0 });
      }
    };
  }, [active, adjustedIntensity, shakeConfig]);
  
  return (
    <div ref={containerRef} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  );
}

/**
 * Focus Zoom Effect
 * 
 * Zooms the canvas to focus on the machine during activation.
 * Subtle zoom effect (1.0 → 1.02 → 1.0).
 */
interface FocusZoomProps {
  active: boolean;
  targetZoom?: number;
  duration?: number;
  children: ReactNode;
  className?: string;
}

function FocusZoom({
  active,
  targetZoom = 1.02,
  duration = 800,
  children,
  className = '',
}: FocusZoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gsapCtxRef = useRef<gsap.Context | null>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create GSAP context
    gsapCtxRef.current = gsap.context(() => {
      if (active) {
        // Zoom in
        gsap.fromTo(
          containerRef.current,
          { scale: 1 },
          {
            scale: targetZoom,
            duration: duration / 1000 / 2, // Half duration for zoom in
            ease: 'power2.out',
          }
        );
      } else {
        // Zoom out
        gsap.to(containerRef.current, {
          scale: 1,
          duration: duration / 1000 / 2, // Half duration for zoom out
          ease: 'power2.in',
        });
      }
    }, containerRef);
    
    return () => {
      gsapCtxRef.current?.revert();
    };
  }, [active, targetZoom, duration]);
  
  return (
    <div ref={containerRef} className={className} style={{ willChange: 'transform', transformOrigin: 'center center' }}>
      {children}
    </div>
  );
}

/**
 * Glitch Distortion Effect
 * 
 * Applies glitch/distortion effects to the canvas for failure modes.
 */
interface GlitchDistortionProps {
  active: boolean;
  intensity?: number; // 0-1
  children: ReactNode;
  className?: string;
}

function GlitchDistortion({
  active,
  intensity = 0.5,
  children,
  className = '',
}: GlitchDistortionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gsapCtxRef = useRef<gsap.Context | null>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    gsapCtxRef.current = gsap.context(() => {
      if (active) {
        // Random horizontal shift
        gsap.to(containerRef.current, {
          x: () => (Math.random() - 0.5) * 20 * intensity,
          duration: 0.05,
          repeat: -1,
          yoyo: true,
          ease: 'none',
        });
        
        // Random scale distortion
        gsap.to(containerRef.current, {
          scaleX: () => 1 + (Math.random() - 0.5) * 0.02 * intensity,
          scaleY: () => 1 + (Math.random() - 0.5) * 0.02 * intensity,
          duration: 0.03,
          repeat: -1,
          yoyo: true,
          ease: 'none',
        });
        
        // Opacity flicker
        gsap.to(containerRef.current, {
          opacity: () => 0.8 + Math.random() * 0.2,
          duration: 0.1,
          repeat: -1,
          yoyo: true,
          ease: 'none',
        });
      } else {
        // Reset all transforms
        gsap.killTweensOf(containerRef.current);
        gsap.set(containerRef.current, {
          x: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
        });
      }
    }, containerRef);
    
    return () => {
      gsapCtxRef.current?.revert();
    };
  }, [active, intensity]);
  
  return (
    <div ref={containerRef} className={className} style={{ willChange: 'transform, opacity' }}>
      {children}
    </div>
  );
}

/**
 * Combined Canvas Effects Component
 */
export function CanvasEffects({
  active = false,
  className = '',
  children,
}: CanvasEffectsProps) {
  const machineState = useMachineStore((state) => state.machineState);
  const generatedAttributes = useMachineStore((state) => state.generatedAttributes);
  
  // Calculate power output from generated attributes
  const powerOutput = useMemo(() => {
    if (!generatedAttributes) return 50;
    return generatedAttributes.stats?.powerOutput || 50;
  }, [generatedAttributes]);
  
  // Determine which effects to apply based on machine state
  const shouldShake = active && ['charging', 'active', 'overload', 'failure'].includes(machineState);
  const shouldZoom = active && machineState === 'charging';
  const shouldGlitch = machineState === 'failure' || machineState === 'overload';
  
  // Calculate glitch intensity
  const glitchIntensity = useMemo(() => {
    if (machineState === 'failure') return 0.8;
    if (machineState === 'overload') return 0.5;
    return 0;
  }, [machineState]);
  
  return (
    <div className={`canvas-effects ${className}`} style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Glitch distortion (outermost) */}
      <GlitchDistortion active={shouldGlitch} intensity={glitchIntensity}>
        {/* Focus zoom effect */}
        <FocusZoom active={shouldZoom}>
          {/* Camera shake (innermost) */}
          <CameraShake
            active={shouldShake}
            machineState={machineState}
            powerOutput={powerOutput}
          >
            {children}
          </CameraShake>
        </FocusZoom>
      </GlitchDistortion>
    </div>
  );
}

export default CanvasEffects;
