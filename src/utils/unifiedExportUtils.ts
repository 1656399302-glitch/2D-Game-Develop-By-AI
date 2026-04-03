/**
 * Unified Export Utilities - Round 115
 * Consolidated SVG generation functions for CodexCard export system
 * Single source of truth to eliminate duplicate code between exportUtils.ts and exportService.ts
 */
import { PlacedModule, Connection, GeneratedAttributes } from '../types';
import { FactionConfig } from '../types/factions';

// Poster dimensions
const PW = 800;
const PH = 1000;

// Rarity colors
const RARITY_COLORS: Record<string, { p: string }> = {
  common: { p: '#9ca3af' },
  uncommon: { p: '#22c55e' },
  rare: { p: '#3b82f6' },
  epic: { p: '#a855f7' },
  legendary: { p: '#f59e0b' },
};

/**
 * Calculate bounds and positioning for machine modules
 */
function calculateModuleBounds(modules: PlacedModule[]): {
  w: number;
  h: number;
  oX: number;
  oY: number;
  scale: number;
} {
  if (!modules.length) {
    return { w: 400, h: 300, oX: 200, oY: 180, scale: 1 };
  }

  const sizes: Record<string, [number, number]> = {
    'core-furnace': [100, 100],
    'energy-pipe': [120, 50],
    'gear': [80, 80],
    'rune-node': [80, 80],
    'shield-shell': [100, 60],
    'trigger-switch': [60, 100],
    'output-array': [80, 80],
    'amplifier-crystal': [80, 80],
    'stabilizer-core': [80, 80],
    'void-siphon': [80, 80],
    'phase-modulator': [80, 80],
    'resonance-chamber': [80, 80],
    'fire-crystal': [80, 80],
    'lightning-conductor': [80, 80],
    'void-arcane-gear': [90, 90],
    'inferno-blazing-core': [110, 110],
    'storm-thundering-pipe': [130, 60],
    'stellar-harmonic-crystal': [85, 85],
    'temporal-distorter': [90, 90],
    'arcane-matrix-grid': [80, 80],
    'ether-infusion-chamber': [100, 100],
  };

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  modules.forEach((m) => {
    const [w, h] = sizes[m.type] || [80, 80];
    minX = Math.min(minX, m.x);
    minY = Math.min(minY, m.y);
    maxX = Math.max(maxX, m.x + w);
    maxY = Math.max(maxY, m.y + h);
  });

  const w = maxX - minX;
  const h = maxY - minY;
  const ph = 400;
  const pw = 680;
  const scale = Math.min(pw / Math.max(w, 1), ph / Math.max(h, 1), 1);

  return {
    w: w * scale,
    h: h * scale,
    oX: (PW - w * scale) / 2 - minX * scale,
    oY: 180 + (ph - h * scale) / 2 - minY * scale,
    scale,
  };
}

/**
 * Generate SVG for a single module
 */
function moduleSVG(m: PlacedModule): string {
  const t = `translate(${m.x},${m.y}) rotate(${m.rotation})`;
  const templates: Record<string, string> = {
    'core-furnace': `<g transform="${t}"><polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="#1a1a2e" stroke="#00d4ff" stroke-width="2"/><circle cx="50" cy="50" r="25" fill="#0a0e17" stroke="#00ffcc" stroke-width="2"/><circle cx="50" cy="50" r="15" fill="#00d4ff" opacity="0.5"/><circle cx="50" cy="50" r="8" fill="#00ffcc"/></g>`,
    'energy-pipe': `<g transform="${t}"><rect x="0" y="10" width="100" height="30" rx="5" fill="#1a1a2e" stroke="#7c3aed" stroke-width="2"/><rect x="5" y="15" width="90" height="20" rx="3" fill="#2d1b4e"/></g>`,
    'gear': `<g transform="${t}"><circle cx="40" cy="40" r="30" fill="#1a1a2e" stroke="#f59e0b" stroke-width="2"/><circle cx="40" cy="40" r="8" fill="#f59e0b"/></g>`,
    'rune-node': `<g transform="${t}"><circle cx="40" cy="40" r="35" fill="#1a1a2e" stroke="#9333ea" stroke-width="2"/><circle cx="40" cy="40" r="25" fill="#2d1b4e" stroke="#a855f7" stroke-width="1"/></g>`,
    'shield-shell': `<g transform="${t}"><path d="M10,15 Q50,0 90,15 L95,45 Q50,55 5,45 Z" fill="#1a1a2e" stroke="#22c55e" stroke-width="2"/><path d="M15,20 Q50,8 85,20 L88,42 Q50,50 12,42 Z" fill="#064e3b" stroke="#4ade80" stroke-width="1"/></g>`,
    'trigger-switch': `<g transform="${t}"><rect x="15" y="5" width="50" height="90" rx="5" fill="#1a1a2e" stroke="#ef4444" stroke-width="2"/><rect x="20" y="50" width="40" height="40" rx="3" fill="#2d2d2d" stroke="#f87171" stroke-width="1"/><circle cx="40" cy="70" r="10" fill="#dc2626" stroke="#ef4444" stroke-width="2"/></g>`,
    'output-array': `<g transform="${t}"><polygon points="40,5 75,25 75,55 40,75 5,55 5,25" fill="#1a1a2e" stroke="#fbbf24" stroke-width="2"/><circle cx="40" cy="40" r="15" fill="#fbbf24" opacity="0.5"/></g>`,
    'amplifier-crystal': `<g transform="${t}"><polygon points="40,5 70,20 70,60 40,75 10,60 10,20" fill="#1a1a2e" stroke="#9333ea" stroke-width="2"/><circle cx="40" cy="40" r="12" fill="#a855f7" opacity="0.7"/></g>`,
    'stabilizer-core': `<g transform="${t}"><circle cx="40" cy="40" r="32" fill="#1a1a2e" stroke="#22c55e" stroke-width="2"/><circle cx="40" cy="40" r="20" fill="#064e3b" stroke="#4ade80" stroke-width="1"/></g>`,
    'void-siphon': `<g transform="${t}"><circle cx="40" cy="40" r="32" fill="#1e1b4b" stroke="#a78bfa" stroke-width="2"/><circle cx="40" cy="40" r="22" fill="none" stroke="#7c3aed" stroke-width="1"/><circle cx="40" cy="40" r="12" fill="#4c1d95"/><circle cx="40" cy="40" r="6" fill="#7c3aed"/></g>`,
    'phase-modulator': `<g transform="${t}"><polygon points="40,4 68,18 68,52 40,66 12,52 12,18" fill="#164e63" stroke="#22d3ee" stroke-width="2"/><polygon points="40,12 60,23 60,47 40,58 20,47 20,23" fill="none" stroke="#06b6d4" stroke-width="1"/><circle cx="40" cy="40" r="8" fill="#0891b2"/></g>`,
    'resonance-chamber': `<g transform="${t}"><ellipse cx="40" cy="40" rx="35" ry="25" fill="#1a1a2e" stroke="#06b6d4" stroke-width="2"/><ellipse cx="40" cy="40" rx="20" ry="12" fill="none" stroke="#22d3ee" stroke-width="1"/></g>`,
    'fire-crystal': `<g transform="${t}"><polygon points="40,2 52,28 78,28 58,46 66,74 40,56 14,74 22,46 2,28 28,28" fill="#1a1a2e" stroke="#f97316" stroke-width="2"/><circle cx="40" cy="40" r="10" fill="#ea580c"/></g>`,
    'lightning-conductor': `<g transform="${t}"><polygon points="40,5 70,25 70,55 40,75 10,55 10,25" fill="#1a1a2e" stroke="#eab308" stroke-width="2"/><path d="M40,20 L35,40 L45,40 L40,60" fill="none" stroke="#facc15" stroke-width="2"/></g>`,
    'void-arcane-gear': `<g transform="${t}"><circle cx="45" cy="45" r="35" fill="#1a1a2e" stroke="#c4b5fd" stroke-width="2"/><circle cx="45" cy="45" r="22" fill="#2e1a4e" stroke="#a78bfa" stroke-width="1"/><g stroke="#c4b5fd" stroke-width="3"><line x1="45" y1="5" x2="45" y2="15"/><line x1="45" y1="75" x2="45" y2="85"/><line x1="5" y1="45" x2="15" y2="45"/><line x1="75" y1="45" x2="85" y2="45"/></g><circle cx="45" cy="45" r="10" fill="#c4b5fd"/></g>`,
    'inferno-blazing-core': `<g transform="${t}"><polygon points="55,5 100,32.5 100,77.5 55,105 10,77.5 10,32.5" fill="#1a1a2e" stroke="#fb923c" stroke-width="2"/><circle cx="55" cy="55" r="28" fill="#7c2d12" stroke="#f97316" stroke-width="2"/><circle cx="55" cy="55" r="16" fill="#ea580c" opacity="0.7"/></g>`,
    'storm-thundering-pipe': `<g transform="${t}"><rect x="0" y="12" width="130" height="36" rx="6" fill="#1a1a2e" stroke="#67e8f9" stroke-width="2"/><rect x="5" y="17" width="120" height="26" rx="4" fill="#164e63"/><path d="M25,30 L40,30 L50,20 L60,40 L70,30 L105,30" fill="none" stroke="#67e8f9" stroke-width="3"/></g>`,
    'stellar-harmonic-crystal': `<g transform="${t}"><polygon points="42.5,5 73,22 73,58 42.5,75 12,58 12,22" fill="#1a1a2e" stroke="#fcd34d" stroke-width="2"/><polygon points="42.5,15 65,29 65,51 42.5,65 20,51 20,29" fill="none" stroke="#fbbf24" stroke-width="1"/><circle cx="42.5" cy="42.5" r="10" fill="#f59e0b"/></g>`,
    'temporal-distorter': `<g transform="${t}"><circle cx="45" cy="45" r="35" fill="#1a1a2e" stroke="#00ffcc" stroke-width="2"/><circle cx="45" cy="45" r="25" fill="none" stroke="#00d4ff" stroke-width="1" stroke-dasharray="4,4"/><circle cx="45" cy="45" r="15" fill="#0a3d3d"/><circle cx="45" cy="45" r="6" fill="#00ffcc"/></g>`,
    'arcane-matrix-grid': `<g transform="${t}"><rect x="10" y="10" width="60" height="60" fill="#1a1a2e" stroke="#22d3ee" stroke-width="2"/><g stroke="#0891b2" stroke-width="1"><line x1="10" y1="30" x2="70" y2="30"/><line x1="10" y1="50" x2="70" y2="50"/><line x1="30" y1="10" x2="30" y2="70"/><line x1="50" y1="10" x2="50" y2="70"/></g><circle cx="40" cy="40" r="8" fill="#22d3ee"/></g>`,
    'ether-infusion-chamber': `<g transform="${t}"><rect x="5" y="10" width="70" height="70" rx="10" fill="#1a1a2e" stroke="#f5d0fe" stroke-width="2"/><circle cx="40" cy="45" r="20" fill="#581c87" opacity="0.6"/><circle cx="40" cy="45" r="10" fill="#c084fc"/><rect x="0" y="25" width="10" height="15" rx="3" fill="#a855f7"/><rect x="70" y="37" width="10" height="15" rx="3" fill="#a855f7"/></g>`,
  };

  return templates[m.type] || `<g transform="${t}"><rect width="60" height="60" fill="#333"/></g>`;
}

/**
 * Generate faction seal SVG
 */
function factionSeal(f: FactionConfig): string {
  return `<g transform="translate(700,80)"><circle cx="0" cy="0" r="35" fill="none" stroke="${f.color}" stroke-width="2" stroke-dasharray="4,2"/><circle cx="0" cy="0" r="28" fill="${f.color}10"/><text x="0" y="7" text-anchor="middle" fill="${f.color}" font-size="20">${f.icon}</text><text x="0" y="55" text-anchor="middle" fill="${f.color}" font-size="10">${f.nameCn}</text></g>`;
}

/**
 * AC-EXPORT-002: Poster contains all 6 required elements
 * Main function to generate CodexCard SVG
 */
export function generateCodexCardSVG(
  modules: PlacedModule[],
  connections: Connection[],
  attrs: GeneratedAttributes,
  faction: FactionConfig
): string {
  const { oX, oY, scale, h: ph } = calculateModuleBounds(modules);
  const rc = RARITY_COLORS[attrs.rarity]?.p || '#9ca3af';
  const fc = faction.color;

  // Generate grid lines
  const grid = Array.from({ length: 25 }, (_, i) =>
    `<line x1="0" y1="${i * 40}" x2="${PW}" y2="${i * 40}" stroke="${fc}" stroke-width="0.5" opacity="0.05"/>`
  ).join('');

  // Generate corner decorations
  const corners = [[30, 30], [770, 30], [30, 970], [770, 970]].map(([x, y]) =>
    `<circle cx="${x}" cy="${y}" r="6" fill="${fc}" opacity="0.8"/><circle cx="${x}" cy="${y}" r="3" fill="#0a0e17"/>`
  ).join('');

  const attrsY = 180 + ph + 30;

  // Generate tags
  const tags = attrs.tags.slice(0, 4).map((tag, i) =>
    `<g transform="translate(400,${attrsY})"><g transform="translate(0,${35 + i * 25})"><rect x="0" y="-10" width="140" height="22" rx="4" fill="${fc}15"/><text x="10" y="4" fill="${fc}" font-size="11">#${tag}</text></g></g>`
  ).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PW} ${PH}" width="${PW}" height="${PH}">
<defs>
<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" stop-color="#0a0e17"/><stop offset="100%" stop-color="#121826"/>
</linearGradient>
<linearGradient id="brd" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" stop-color="${fc}"/><stop offset="50%" stop-color="${faction.secondaryColor}"/><stop offset="100%" stop-color="${fc}"/>
</linearGradient>
<filter id="g"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<rect width="100%" height="100%" fill="url(#bg)"/>
${grid}
<rect x="15" y="15" width="770" height="970" fill="none" stroke="url(#brd)" stroke-width="3" rx="16"/>
<rect x="25" y="25" width="750" height="950" fill="none" stroke="${fc}" stroke-width="1" opacity="0.5" rx="12"/>
${corners}
<text x="400" y="60" text-anchor="middle" fill="#00d4ff" font-size="16" font-family="serif" letter-spacing="3">ARCANE MACHINE CODEX</text>
<text x="400" y="100" text-anchor="middle" fill="#ffd700" font-size="28" font-weight="bold" font-family="serif" filter="url(#g)">${attrs.name}</text>
<g transform="translate(400,135)">
<rect x="-60" y="-14" width="120" height="28" rx="14" fill="${rc}" opacity="0.2"/>
<rect x="-58" y="-12" width="116" height="24" rx="12" fill="none" stroke="${rc}" stroke-width="1.5"/>
<text x="0" y="4" text-anchor="middle" fill="${rc}" font-size="12" font-weight="bold" letter-spacing="2">${attrs.rarity.toUpperCase()}</text>
</g>
<g transform="translate(0,160)">
<rect x="60" y="0" width="680" height="${ph}" fill="#0a0e17" stroke="${fc}" stroke-width="1" rx="8" opacity="0.9"/>
<g transform="translate(${oX},${oY}) scale(${scale})">
${connections.map(c => `<path d="${c.pathData}" fill="none" stroke="#00ffcc" stroke-width="2.5" stroke-dasharray="6,3" opacity="0.9" filter="url(#g)"/>`).join('')}
${modules.map(m => moduleSVG(m)).join('')}
</g>
</g>
<g transform="translate(60,${attrsY})">
<text x="0" y="0" fill="#9ca3af" font-size="12" letter-spacing="2">◆ ATTRIBUTES</text>
<line x1="0" y1="10" x2="300" y2="10" stroke="${fc}" stroke-width="0.5"/>
<g transform="translate(0,35)"><rect x="0" y="0" width="100" height="10" rx="5" fill="#1e2a42"/><rect x="0" y="0" width="${attrs.stats.stability}" height="10" rx="5" fill="#4ade80"/><text x="110" y="9" fill="#4ade80" font-size="12">Stability: ${attrs.stats.stability}%</text></g>
<g transform="translate(0,60)"><rect x="0" y="0" width="100" height="10" rx="5" fill="#1e2a42"/><rect x="0" y="0" width="${attrs.stats.powerOutput}" height="10" rx="5" fill="#f59e0b"/><text x="110" y="9" fill="#f59e0b" font-size="12">Power: ${attrs.stats.powerOutput}</text></g>
<g transform="translate(0,85)"><rect x="0" y="0" width="100" height="10" rx="5" fill="#1e2a42"/><rect x="0" y="0" width="${Math.min(attrs.stats.energyCost, 100)}" height="10" rx="5" fill="#22d3ee"/><text x="110" y="9" fill="#22d3ee" font-size="12">Energy: ${attrs.stats.energyCost}</text></g>
<g transform="translate(0,110)"><rect x="0" y="0" width="100" height="10" rx="5" fill="#1e2a42"/><rect x="0" y="0" width="${attrs.stats.failureRate}" height="10" rx="5" fill="#ef4444"/><text x="110" y="9" fill="#ef4444" font-size="12">Failure: ${attrs.stats.failureRate}%</text></g>
</g>
<g transform="translate(400,${attrsY})">
<text x="0" y="0" fill="#9ca3af" font-size="12" letter-spacing="2">◆ TAGS</text>
<line x1="0" y1="10" x2="150" y2="10" stroke="${fc}" stroke-width="0.5"/>
</g>
${tags}
${factionSeal(faction)}
<text x="400" y="${PH - 50}" text-anchor="middle" fill="#6b7280" font-size="10">CODEX ID: ${attrs.codexId}</text>
<text x="400" y="${PH - 30}" text-anchor="middle" fill="#4a5568" font-size="9">Arcane Machine Codex Workshop</text>
</svg>`;
}

/**
 * AC-EXPORT-003: PNG export is downloadable and non-empty
 */
export async function generateCodexCardPNG(
  modules: PlacedModule[],
  connections: Connection[],
  attrs: GeneratedAttributes,
  faction: FactionConfig,
  quality: 'standard' | 'high' = 'standard'
): Promise<Blob> {
  const svg = generateCodexCardSVG(modules, connections, attrs, faction);
  const scale = quality === 'high' ? 2 : 1;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas context unavailable'));
      return;
    }

    canvas.width = PW * scale;
    canvas.height = PH * scale;

    const img = new Image();
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (b) => (b && b.size > 0 ? resolve(b) : reject(new Error('Empty PNG'))),
        'image/png'
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('SVG load failed'));
    };

    img.src = url;
  });
}

/**
 * AC-EXPORT-005: Export completes within 5 seconds for 30 modules
 */
export async function exportAsCodexCard(
  modules: PlacedModule[],
  connections: Connection[],
  attrs: GeneratedAttributes,
  faction: FactionConfig,
  format: 'svg' | 'png' = 'svg',
  quality: 'standard' | 'high' = 'standard'
): Promise<Blob | string> {
  const start = performance.now();

  if (format === 'svg') {
    const svg = generateCodexCardSVG(modules, connections, attrs, faction);

    /** AC-EXPORT-004: SVG export produces valid, parseable SVG */
    const parser = new DOMParser();
    if (parser.parseFromString(svg, 'image/svg+xml').querySelector('parsererror')) {
      throw new Error('Invalid SVG');
    }

    if (performance.now() - start > 5000) {
      console.warn('SVG export > 5s');
    }
    return svg;
  }

  const blob = await generateCodexCardPNG(modules, connections, attrs, faction, quality);
  if (performance.now() - start > 5000) {
    console.warn('PNG export > 5s');
  }
  return blob;
}

/**
 * Download utility for CodexCard exports
 */
export function downloadCodexCard(
  content: string | Blob,
  filename: string,
  mime: string
): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export types for use by other modules
export type ExportFormat = 'svg' | 'png';
export type ExportQuality = 'standard' | 'high';

// Poster dimension constants
export const POSTER_WIDTH = PW;
export const POSTER_HEIGHT = PH;

// Format presets
export const FORMAT_PRESETS = {
  poster: { width: 800, height: 1000 },
  twitter: { width: 1200, height: 675 },
  instagram: { width: 1080, height: 1080 },
  discord: { width: 600, height: 400 },
} as const;

/**
 * Custom poster dimension validation
 */
export interface DimensionValidation {
  isValid: boolean;
  errorMessage?: string;
  clampedWidth?: number;
  clampedHeight?: number;
}

const MIN_DIMENSION = 400;
const MAX_DIMENSION = 2000;

/**
 * Validate custom poster dimensions
 */
export function validateDimensions(
  width: number,
  height: number
): DimensionValidation {
  // Handle empty or invalid input
  if (!width || isNaN(width)) {
    return {
      isValid: false,
      errorMessage: 'Width is required',
    };
  }

  if (!height || isNaN(height)) {
    return {
      isValid: false,
      errorMessage: 'Height is required',
    };
  }

  // Check width bounds
  if (width < MIN_DIMENSION) {
    return {
      isValid: false,
      errorMessage: `Width must be at least ${MIN_DIMENSION}px`,
    };
  }

  if (width > MAX_DIMENSION) {
    return {
      isValid: false,
      errorMessage: `Width must be at most ${MAX_DIMENSION}px`,
    };
  }

  // Check height bounds
  if (height < MIN_DIMENSION) {
    return {
      isValid: false,
      errorMessage: `Height must be at least ${MIN_DIMENSION}px`,
    };
  }

  if (height > MAX_DIMENSION) {
    return {
      isValid: false,
      errorMessage: `Height must be at most ${MAX_DIMENSION}px`,
    };
  }

  return { isValid: true };
}

/**
 * Clamp dimensions to valid range
 */
export function clampDimensions(
  width: number,
  height: number
): { width: number; height: number } {
  return {
    width: Math.max(MIN_DIMENSION, Math.min(MAX_DIMENSION, width)),
    height: Math.max(MIN_DIMENSION, Math.min(MAX_DIMENSION, height)),
  };
}

/**
 * Reset dimensions for format type
 */
export function getDefaultDimensionsForFormat(
  format: 'poster' | 'twitter' | 'instagram' | 'discord'
): { width: number; height: number } {
  return FORMAT_PRESETS[format] || FORMAT_PRESETS.poster;
}
