/**
 * High-performance Particle System for Arcane Machine Codex Workshop
 * 
 * Features:
 * - Particle pool with configurable max size (default 1000)
 * - Emitter types: spark, dust, glow, ember
 * - Lifecycle management (spawn → move → fade → die)
 * - requestAnimationFrame-based rendering with delta time
 * - GPU-accelerated CSS transforms
 */

// Global particle ID counter
let globalParticleIdCounter = 0;

export interface ParticleConfig {
  /** Initial x position */
  x: number;
  /** Initial y position */
  y: number;
  /** Velocity in x direction (pixels per second) */
  vx: number;
  /** Velocity in y direction (pixels per second) */
  vy: number;
  /** Particle size (2-20px) */
  size: number;
  /** Particle color (hex) */
  color: string;
  /** Lifetime in seconds (0.5-5s) */
  lifetime: number;
  /** Gravity effect (pixels per second squared) */
  gravity?: number;
  /** Friction/drag (0-1, where 1 = no friction) */
  friction?: number;
  /** Spread angle in degrees */
  spread?: number;
  /** Glow intensity (0-1) */
  glowIntensity?: number;
}

export interface Particle extends ParticleConfig {
  /** Unique particle ID */
  id: number;
  /** Current age in seconds */
  age: number;
  /** Current opacity (0-1) */
  opacity: number;
  /** Whether particle is alive */
  alive: boolean;
  /** Current x position (for rendering) */
  currentX: number;
  /** Current y position (for rendering) */
  currentY: number;
}

export type EmitterType = 'spark' | 'dust' | 'glow' | 'ember';

export interface EmitterConfig {
  /** Type of emitter */
  type: EmitterType;
  /** Emit position x */
  x: number;
  /** Emit position y */
  y: number;
  /** Particles per second */
  rate: number;
  /** Maximum particles (default 1000) */
  maxParticles?: number;
  /** Spread angle in degrees (default 360 for omnidirectional) */
  spread?: number;
  /** Particle lifetime range [min, max] in seconds */
  lifetime?: [number, number];
  /** Particle size range [min, max] in pixels */
  size?: [number, number];
  /** Color or color range */
  color?: string | [string, string];
  /** Initial velocity range [min, max] */
  velocity?: [number, number];
  /** Gravity effect */
  gravity?: number;
  /** Friction */
  friction?: number;
  /** Glow intensity (0-1) */
  glowIntensity?: number;
  /** Auto-start on creation */
  autoStart?: boolean;
  /** Emit burst on start */
  burstOnStart?: boolean;
  /** Burst count */
  burstCount?: number;
}

export interface Emitter {
  /** Start emitting particles */
  start: () => void;
  /** Stop emitting particles */
  stop: () => void;
  /** Destroy emitter and cleanup */
  destroy: () => void;
  /** Get current particle count */
  getParticleCount: () => number;
  /** Update emitter position */
  setPosition: (x: number, y: number) => void;
  /** Update emitter config */
  updateConfig: (config: Partial<EmitterConfig>) => void;
  /** Emit a manual burst */
  burst: (count: number) => void;
  /** Internal update - returns active particles */
  update: (dt: number) => Particle[];
}

// Default particle pool size
const DEFAULT_MAX_PARTICLES = 1000;

// Preset emitter configurations
const EMITTER_PRESETS: Record<EmitterType, Omit<EmitterConfig, 'x' | 'y' | 'autoStart'>> = {
  spark: {
    type: 'spark',
    rate: 20,
    lifetime: [0.5, 1.5],
    size: [2, 6],
    color: '#ffd700',
    velocity: [100, 300],
    gravity: 200,
    friction: 0.98,
    glowIntensity: 0.8,
  },
  dust: {
    type: 'dust',
    rate: 10,
    lifetime: [1, 3],
    size: [3, 8],
    color: '#9ca3af',
    velocity: [10, 50],
    gravity: 5,
    friction: 0.99,
    glowIntensity: 0.2,
  },
  glow: {
    type: 'glow',
    rate: 15,
    lifetime: [0.3, 1],
    size: [4, 12],
    color: '#00d4ff',
    velocity: [5, 20],
    gravity: 0,
    friction: 1,
    glowIntensity: 1,
  },
  ember: {
    type: 'ember',
    rate: 12,
    lifetime: [1, 4],
    size: [3, 8],
    color: '#ff6b35',
    velocity: [30, 80],
    gravity: -20, // Negative gravity = float upward
    friction: 0.99,
    glowIntensity: 0.7,
  },
};

/**
 * Create a particle emitter
 */
export function createEmitter(config: EmitterConfig): Emitter {
  let isRunning = false;
  let isDestroyed = false;
  let emitAccumulator = 0;
  
  // Particle pool with hard limit
  const particles: Particle[] = [];
  const maxParticles = config.maxParticles ?? DEFAULT_MAX_PARTICLES;
  
  // Current position
  let currentX = config.x;
  let currentY = config.y;
  
  // Current config (may be updated)
  let currentConfig = { ...EMITTER_PRESETS[config.type], ...config };
  
  // Track if we should emit
  let shouldEmit = config.autoStart ?? true;
  let pendingBurst = config.burstOnStart ? (config.burstCount ?? 10) : 0;
  
  /**
   * Create a single particle
   */
  function createParticle(forcedConfig?: Partial<ParticleConfig>): Particle {
    const [lifetimeMin, lifetimeMax] = currentConfig.lifetime ?? [1, 2];
    const [sizeMin, sizeMax] = currentConfig.size ?? [4, 8];
    const [velMin, velMax] = currentConfig.velocity ?? [50, 150];
    
    const lifetime = lifetimeMin + Math.random() * (lifetimeMax - lifetimeMin);
    const size = sizeMin + Math.random() * (sizeMax - sizeMin);
    const speed = velMin + Math.random() * (velMax - velMin);
    
    // Calculate direction with spread
    const spreadRad = ((currentConfig.spread ?? 360) / 2 * Math.PI) / 180;
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * spreadRad * 2;
    
    // Get color
    let color = currentConfig.color ?? '#ffffff';
    if (Array.isArray(color)) {
      color = color[Math.floor(Math.random() * color.length)];
    }
    
    const particle: Particle = {
      id: globalParticleIdCounter++,
      x: currentX,
      y: currentY,
      currentX: currentX,
      currentY: currentY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size,
      color,
      lifetime,
      age: 0,
      opacity: 1,
      alive: true,
      gravity: currentConfig.gravity ?? 0,
      friction: currentConfig.friction ?? 1,
      glowIntensity: currentConfig.glowIntensity ?? 0.5,
      ...forcedConfig,
    };
    
    return particle;
  }
  
  /**
   * Update a single particle
   */
  function updateParticle(particle: Particle, dt: number): boolean {
    if (!particle.alive) return false;
    
    // Age the particle
    particle.age += dt;
    
    // Check lifetime
    if (particle.age >= particle.lifetime) {
      particle.alive = false;
      return false;
    }
    
    const gravity = particle.gravity ?? 0;
    const friction = particle.friction ?? 1;
    
    // Apply physics
    particle.vy += gravity * dt;
    particle.vx *= Math.pow(friction, dt * 60);
    particle.vy *= Math.pow(friction, dt * 60);
    
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    
    // Smooth position interpolation for rendering
    particle.currentX += (particle.x - particle.currentX) * 0.3;
    particle.currentY += (particle.y - particle.currentY) * 0.3;
    
    // Fade out based on age
    const lifeProgress = particle.age / particle.lifetime;
    if (lifeProgress > 0.7) {
      particle.opacity = 1 - ((lifeProgress - 0.7) / 0.3);
    }
    
    return true;
  }
  
  /**
   * Get all alive particles (for rendering)
   */
  function getParticles(): Particle[] {
    return particles.filter(p => p.alive);
  }
  
  /**
   * Clear all particles
   */
  function clearParticles(): void {
    particles.length = 0;
  }
  
  /**
   * Start the emitter
   */
  function start(): void {
    if (isDestroyed) return;
    isRunning = true;
    shouldEmit = true;
  }
  
  /**
   * Stop the emitter
   */
  function stop(): void {
    isRunning = false;
    shouldEmit = false;
  }
  
  /**
   * Destroy the emitter
   */
  function destroy(): void {
    isDestroyed = true;
    isRunning = false;
    shouldEmit = false;
    clearParticles();
  }
  
  /**
   * Get current particle count
   */
  function getParticleCount(): number {
    return particles.filter(p => p.alive).length;
  }
  
  /**
   * Set emitter position
   */
  function setPosition(x: number, y: number): void {
    currentX = x;
    currentY = y;
  }
  
  /**
   * Update emitter config
   */
  function updateConfig(config: Partial<EmitterConfig>): void {
    currentConfig = { ...currentConfig, ...config };
  }
  
  /**
   * Emit a manual burst of particles
   */
  function burst(count: number): void {
    for (let i = 0; i < count; i++) {
      if (particles.filter(p => p.alive).length >= maxParticles) break;
      particles.push(createParticle());
    }
  }
  
  /**
   * Update loop - call this from requestAnimationFrame
   */
  function update(dt: number): Particle[] {
    if (isDestroyed) return [];
    
    // Handle pending burst
    if (pendingBurst > 0) {
      const burstCount = Math.min(pendingBurst, maxParticles - particles.filter(p => p.alive).length);
      for (let i = 0; i < burstCount; i++) {
        particles.push(createParticle());
      }
      pendingBurst = 0;
    }
    
    // Emit new particles if running
    if (isRunning && shouldEmit) {
      emitAccumulator += dt * currentConfig.rate;
      
      while (emitAccumulator >= 1 && particles.filter(p => p.alive).length < maxParticles) {
        particles.push(createParticle());
        emitAccumulator -= 1;
      }
      
      // Handle fractional particles
      emitAccumulator = emitAccumulator % 1;
    }
    
    // Update all particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      if (!updateParticle(particle, dt)) {
        // Particle died, remove from pool
        particles.splice(i, 1);
      }
    }
    
    return getParticles();
  }
  
  // Return emitter interface
  return {
    start,
    stop,
    destroy,
    getParticleCount,
    setPosition,
    updateConfig,
    burst,
    update,
  };
}

/**
 * Particle Manager - manages multiple emitters
 */
export class ParticleManager {
  private emitters: Map<string, Emitter> = new Map();
  private globalParticles: Particle[] = [];
  private isRunning = false;
  private animationFrameId: number | null = null;
  private lastTime = 0;
  private maxGlobalParticles = DEFAULT_MAX_PARTICLES;
  
  /**
   * Add an emitter with a name
   */
  addEmitter(name: string, config: EmitterConfig): Emitter {
    // Remove existing if exists
    const existing = this.emitters.get(name);
    if (existing) {
      existing.destroy();
    }
    
    const emitter = createEmitter({
      ...config,
      autoStart: true,
    });
    
    this.emitters.set(name, emitter);
    
    return emitter;
  }
  
  /**
   * Get an emitter by name
   */
  getEmitter(name: string): Emitter | undefined {
    return this.emitters.get(name);
  }
  
  /**
   * Remove an emitter
   */
  removeEmitter(name: string): void {
    const emitter = this.emitters.get(name);
    if (emitter) {
      emitter.destroy();
      this.emitters.delete(name);
    }
  }
  
  /**
   * Get all global particles
   */
  getParticles(): Particle[] {
    return this.globalParticles;
  }
  
  /**
   * Get total particle count across all emitters
   */
  getTotalParticleCount(): number {
    let total = 0;
    this.emitters.forEach(emitter => {
      total += emitter.getParticleCount();
    });
    return total;
  }
  
  /**
   * Start the update loop
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop();
  }
  
  /**
   * Stop the update loop
   */
  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  /**
   * Clear all particles without destroying emitters
   */
  clearAll(): void {
    this.globalParticles = [];
  }
  
  /**
   * Destroy all emitters
   */
  destroy(): void {
    this.stop();
    this.emitters.forEach(emitter => emitter.destroy());
    this.emitters.clear();
    this.globalParticles = [];
  }
  
  /**
   * Update loop
   */
  private loop = (): void => {
    if (!this.isRunning) return;
    
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1); // Cap at 100ms to prevent spiral of death
    this.lastTime = now;
    
    // Collect all particles from all emitters
    this.globalParticles = [];
    this.emitters.forEach(emitter => {
      const particles = emitter.update(dt);
      this.globalParticles.push(...particles);
    });
    
    // Cap global particles
    if (this.globalParticles.length > this.maxGlobalParticles) {
      this.globalParticles = this.globalParticles.slice(-this.maxGlobalParticles);
    }
    
    this.animationFrameId = requestAnimationFrame(this.loop);
  };
}

// Singleton instance for global use
let globalParticleManager: ParticleManager | null = null;

export function getParticleManager(): ParticleManager {
  if (!globalParticleManager) {
    globalParticleManager = new ParticleManager();
  }
  return globalParticleManager;
}

/**
 * Helper to calculate particle render styles
 */
export function getParticleStyle(particle: Particle): React.CSSProperties {
  const glowIntensity = particle.glowIntensity ?? 0.5;
  
  return {
    position: 'absolute' as const,
    left: particle.currentX - particle.size / 2,
    top: particle.currentY - particle.size / 2,
    width: particle.size,
    height: particle.size,
    borderRadius: '50%',
    backgroundColor: particle.color,
    opacity: particle.opacity,
    boxShadow: glowIntensity > 0 
      ? `0 0 ${particle.size * glowIntensity}px ${particle.color}`
      : undefined,
    pointerEvents: 'none' as const,
    transform: 'translateZ(0)', // Force GPU layer
  };
}

/**
 * Create particles at a specific position (for burst effects)
 */
export function createBurstParticles(
  x: number,
  y: number,
  count: number,
  config?: Partial<ParticleConfig>
): Particle[] {
  const particles: Particle[] = [];
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const speed = 50 + Math.random() * 150;
    
    particles.push({
      id: globalParticleIdCounter++,
      x,
      y,
      currentX: x,
      currentY: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: config?.size ?? (2 + Math.random() * 6),
      color: config?.color ?? '#ffd700',
      lifetime: config?.lifetime ?? (0.5 + Math.random()),
      age: 0,
      opacity: 1,
      alive: true,
      gravity: config?.gravity ?? 100,
      friction: config?.friction ?? 0.98,
      glowIntensity: config?.glowIntensity ?? 0.5,
    });
  }
  
  return particles;
}
