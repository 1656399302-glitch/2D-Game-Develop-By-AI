import { useRef, useEffect, useMemo } from 'react';
import { Connection, PlacedModule } from '../../types';
import { calculateActivationChoreography } from '../../utils/activationChoreographer';

interface EnergyPulseVisualizerProps {
  connections: Connection[];
  modules: PlacedModule[];
  isActive: boolean;
  startTime: number;
  pulseSpeed?: number; // pixels per second
  pulseColor?: string;
}

interface PulseWave {
  id: string;
  connectionId: string;
  startOffset: number; // 0-1 representing position along path
  opacity: number;
  scale: number;
}

export function EnergyPulseVisualizer({
  connections,
  modules,
  isActive,
  startTime,
  pulseSpeed = 400,
  pulseColor = '#00ffcc',
}: EnergyPulseVisualizerProps) {
  const containerRef = useRef<SVGGElement>(null);
  // Use refs for all animation state to avoid setState in animation loop
  const activeWavesRef = useRef<PulseWave[]>([]);
  const animationRef = useRef<number | null>(null);
  const waveIdCounter = useRef(0);
  // Store dependencies in refs to access latest values without causing re-renders
  const connectionsRef = useRef(connections);
  const pulseSpeedRef = useRef(pulseSpeed);
  const isActiveRef = useRef(isActive);
  const startTimeRef = useRef(startTime);

  // Update refs when props change
  useEffect(() => {
    connectionsRef.current = connections;
    pulseSpeedRef.current = pulseSpeed;
    isActiveRef.current = isActive;
    startTimeRef.current = startTime;
  }, [connections, pulseSpeed, isActive, startTime]);
  
  // Calculate choreography for timing
  const choreography = useMemo(() => {
    return calculateActivationChoreography(modules, connections, 200, 100);
  }, [modules, connections]);
  
  // Get connection path data for a connection
  const getConnectionPath = (connectionId: string): string | null => {
    const conn = connectionsRef.current.find(c => c.id === connectionId);
    return conn?.pathData || null;
  };
  
  // Get path length for a connection
  const getPathLength = (pathData: string): number => {
    // Estimate path length from path data
    // For simple paths like "M x1 y1 C x2 y2 x3 y3 x4 y4"
    const numbers = pathData.match(/[\d.-]+/g);
    if (!numbers || numbers.length < 4) return 200;
    
    let length = 0;
    for (let i = 2; i < numbers.length - 2; i += 2) {
      const x1 = parseFloat(numbers[i - 2] || '0');
      const y1 = parseFloat(numbers[i - 1] || '0');
      const x2 = parseFloat(numbers[i] || '0');
      const y2 = parseFloat(numbers[i + 1] || '0');
      const dx = x2 - x1;
      const dy = y2 - y1;
      length += Math.sqrt(dx * dx + dy * dy);
    }
    
    return length || 200;
  };
  
  // Start new wave on a connection (updates ref only, no setState)
  const startWave = (connectionId: string) => {
    const newWave: PulseWave = {
      id: `pulse-${connectionId}-${waveIdCounter.current++}`,
      connectionId,
      startOffset: 0,
      opacity: 1,
      scale: 1,
    };
    activeWavesRef.current = [...activeWavesRef.current, newWave];
  };
  
  // Animation loop - uses refs only, no setState
  useEffect(() => {
    if (!isActive) {
      activeWavesRef.current = [];
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }
    
    const animate = () => {
      const currentTime = performance.now() - startTimeRef.current;
      
      // Check for new pulses based on choreography
      choreography.steps.forEach(step => {
        step.connectionsToLight.forEach(conn => {
          const elapsed = currentTime - conn.activationTime;
          // Start wave when connection should light up
          if (elapsed >= 0 && elapsed < 50) { // Within 50ms of activation
            // Check if wave already exists for this connection at this time
            const waveExists = activeWavesRef.current.some(
              w => w.connectionId === conn.connectionId && 
                   Math.abs(currentTime - startTimeRef.current - conn.activationTime) < 200
            );
            if (!waveExists) {
              startWave(conn.connectionId);
            }
          }
        });
      });
      
      // Update wave positions - modify ref directly, no setState
      const pathLengthMap = new Map<string, number>();
      
      activeWavesRef.current = activeWavesRef.current
        .map(wave => {
          const pathData = getConnectionPath(wave.connectionId);
          if (!pathData) return null;
          
          // Cache path lengths
          if (!pathLengthMap.has(wave.connectionId)) {
            pathLengthMap.set(wave.connectionId, getPathLength(pathData));
          }
          const pathLength = pathLengthMap.get(wave.connectionId) || 200;
          const elapsed = currentTime - startTimeRef.current;
          const progressPerMs = pulseSpeedRef.current / pathLength;
          
          // Calculate new position
          const newOffset = wave.startOffset + elapsed * progressPerMs;
          
          if (newOffset > 1) {
            return null; // Remove wave when complete
          }
          
          return {
            ...wave,
            startOffset: newOffset,
            opacity: 1 - (newOffset * 0.5), // Fade out as it travels
            scale: 1 + newOffset * 0.5, // Grow slightly
          };
        })
        .filter(Boolean) as PulseWave[];
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  // NOTE: No dependencies here - this effect manages its own refs internally
  // The effect runs once on mount and cleans up on unmount
  // State updates from parent (isActive change) are handled via the outer effect below
  }, [choreography]); // Only depend on choreography since other values are accessed via refs
  
  // Handle isActive changes by resetting/refreshing animation
  useEffect(() => {
    if (!isActive) {
      activeWavesRef.current = [];
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
  }, [isActive]);
  
  // Render pulse waves on connections
  return (
    <g ref={containerRef} className="energy-pulse-visualizer">
      {activeWavesRef.current.map(wave => {
        const pathData = getConnectionPath(wave.connectionId);
        if (!pathData) return null;
        
        // Calculate position along path
        const point = getPointAtOffset(pathData, wave.startOffset);
        if (!point) return null;
        
        return (
          <g key={wave.id} style={{ pointerEvents: 'none' }}>
            {/* Outer glow */}
            <circle
              cx={point.x}
              cy={point.y}
              r={12 * wave.scale}
              fill="none"
              stroke={pulseColor}
              strokeWidth="4"
              opacity={wave.opacity * 0.3}
              filter="url(#glow)"
            />
            {/* Main pulse */}
            <circle
              cx={point.x}
              cy={point.y}
              r={8 * wave.scale}
              fill={pulseColor}
              opacity={wave.opacity}
              filter="url(#glow)"
            />
            {/* Inner bright core */}
            <circle
              cx={point.x}
              cy={point.y}
              r={4 * wave.scale}
              fill="#ffffff"
              opacity={wave.opacity * 0.9}
            />
          </g>
        );
      })}
    </g>
  );
}

// Helper to get point at offset along path
function getPointAtOffset(pathData: string, offset: number): { x: number; y: number } | null {
  // Parse path to get points
  const numbers = pathData.match(/[\d.-]+/g);
  if (!numbers || numbers.length < 2) return null;
  
  // Get start and end points from M and last C/L command
  const x1 = parseFloat(numbers[0] || '0');
  const y1 = parseFloat(numbers[1] || '0');
  
  // For simple paths, interpolate
  if (numbers.length === 4) {
    const x2 = parseFloat(numbers[2] || '0');
    const y2 = parseFloat(numbers[3] || '0');
    return {
      x: x1 + (x2 - x1) * offset,
      y: y1 + (y2 - y1) * offset,
    };
  }
  
  // For bezier paths, use control points
  if (numbers.length >= 8) {
    // C command: M x1 y1 C x2 y2 x3 y3 x4 y4
    const x2 = parseFloat(numbers[2] || '0');
    const y2 = parseFloat(numbers[3] || '0');
    const x3 = parseFloat(numbers[4] || '0');
    const y3 = parseFloat(numbers[5] || '0');
    const x4 = parseFloat(numbers[6] || '0');
    const y4 = parseFloat(numbers[7] || '0');
    
    // Cubic bezier interpolation
    const t = offset;
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    
    const x = mt3 * x1 + 3 * mt2 * t * x2 + 3 * mt * t2 * x3 + t3 * x4;
    const y = mt3 * y1 + 3 * mt2 * t * y2 + 3 * mt * t2 * y3 + t3 * y4;
    
    return { x, y };
  }
  
  return { x: x1, y: y1 };
}

export default EnergyPulseVisualizer;
