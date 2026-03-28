import { PlacedModule, Connection, GeneratedAttributes, ExportOptions } from '../types';

export function exportToSVG(
  modules: PlacedModule[],
  connections: Connection[],
  options: ExportOptions = { format: 'svg' }
): string {
  // Calculate bounding box
  const bounds = calculateBounds(modules);
  const padding = 40;
  const width = (options.width || bounds.width + padding * 2);
  const height = (options.height || bounds.height + padding * 2);
  
  // Create SVG content
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="0 0 ${width} ${height}" 
     width="${width}" 
     height="${height}">
  <defs>
    <!-- Gradients -->
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0e17"/>
      <stop offset="100%" style="stop-color:#121826"/>
    </linearGradient>
    <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#00ffcc"/>
      <stop offset="50%" style="stop-color:#00d4ff"/>
      <stop offset="100%" style="stop-color:#00ffcc"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bgGradient)"/>
  
  <!-- Grid Pattern -->
  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e2a42" stroke-width="0.5"/>
  </pattern>
  <rect width="100%" height="100%" fill="url(#grid)" opacity="0.5"/>
  
  <!-- Energy Connections -->
  <g id="connections" filter="url(#glow)">
    ${connections.map(conn => `
    <path d="${conn.pathData}" 
          fill="none" 
          stroke="url(#energyGradient)" 
          stroke-width="3" 
          stroke-dasharray="10,5"
          opacity="0.8"/>
    <path d="${conn.pathData}" 
          fill="none" 
          stroke="#00ffcc" 
          stroke-width="1"
          stroke-dasharray="10,5"
          stroke-dashoffset="0">
      <animate attributeName="stroke-dashoffset" from="15" to="0" dur="0.5s" repeatCount="indefinite"/>
    </path>`).join('')}
  </g>
  
  <!-- Modules -->
  <g id="modules">
    ${modules.map(module => renderModuleToSVG(module)).join('')}
  </g>
</svg>`;

  return svg;
}

function renderModuleToSVG(module: PlacedModule): string {
  const transform = `translate(${module.x}, ${module.y}) rotate(${module.rotation})`;
  
  const moduleTemplates: Record<string, string> = {
    'core-furnace': `
      <g transform="${transform}">
        <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" 
                 fill="#1a1a2e" stroke="#00d4ff" stroke-width="2"/>
        <circle cx="50" cy="50" r="25" fill="#0a0e17" stroke="#00ffcc" stroke-width="2"/>
        <circle cx="50" cy="50" r="15" fill="#00d4ff" opacity="0.5">
          <animate attributeName="r" values="15;18;15" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="50" cy="50" r="8" fill="#00ffcc">
          <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite"/>
        </circle>
      </g>
    `,
    'energy-pipe': `
      <g transform="${transform}">
        <rect x="0" y="10" width="100" height="30" rx="5" fill="#1a1a2e" stroke="#7c3aed" stroke-width="2"/>
        <rect x="5" y="15" width="90" height="20" rx="3" fill="#2d1b4e"/>
        <line x1="20" y1="25" x2="80" y2="25" stroke="#a855f7" stroke-width="3" stroke-dasharray="8,4">
          <animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.5s" repeatCount="indefinite"/>
        </line>
      </g>
    `,
    'gear': `
      <g transform="${transform}">
        <circle cx="40" cy="40" r="30" fill="#1a1a2e" stroke="#f59e0b" stroke-width="2"/>
        <circle cx="40" cy="40" r="20" fill="#2d2d2d" stroke="#fbbf24" stroke-width="2"/>
        <g stroke="#f59e0b" stroke-width="4">
          <line x1="40" y1="5" x2="40" y2="15"/>
          <line x1="40" y1="65" x2="40" y2="75"/>
          <line x1="5" y1="40" x2="15" y2="40"/>
          <line x1="65" y1="40" x2="75" y2="40"/>
        </g>
        <circle cx="40" cy="40" r="8" fill="#f59e0b"/>
        <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="4s" repeatCount="indefinite"/>
      </g>
    `,
    'rune-node': `
      <g transform="${transform}">
        <circle cx="40" cy="40" r="35" fill="#1a1a2e" stroke="#9333ea" stroke-width="2"/>
        <circle cx="40" cy="40" r="25" fill="#2d1b4e" stroke="#a855f7" stroke-width="1"/>
        <path d="M40,15 L50,35 L70,35 L55,48 L60,68 L40,55 L20,68 L25,48 L10,35 L30,35 Z" 
              fill="none" stroke="#c084fc" stroke-width="1.5"/>
        <circle cx="40" cy="40" r="8" fill="#9333ea">
          <animate attributeName="opacity" values="1;0.3;1" dur="3s" repeatCount="indefinite"/>
        </circle>
      </g>
    `,
    'shield-shell': `
      <g transform="${transform}">
        <path d="M10,15 Q50,0 90,15 L95,45 Q50,55 5,45 Z" 
              fill="#1a1a2e" stroke="#22c55e" stroke-width="2"/>
        <path d="M15,20 Q50,8 85,20 L88,42 Q50,50 12,42 Z" 
              fill="#064e3b" stroke="#4ade80" stroke-width="1"/>
        <ellipse cx="50" cy="32" rx="20" ry="10" fill="none" stroke="#4ade80" stroke-width="1" opacity="0.5">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
        </ellipse>
      </g>
    `,
    'trigger-switch': `
      <g transform="${transform}">
        <rect x="15" y="5" width="50" height="90" rx="5" fill="#1a1a2e" stroke="#ef4444" stroke-width="2"/>
        <rect x="20" y="50" width="40" height="40" rx="3" fill="#2d2d2d" stroke="#f87171" stroke-width="1"/>
        <circle cx="40" cy="70" r="10" fill="#dc2626" stroke="#ef4444" stroke-width="2">
          <animate attributeName="fill" values="#dc2626;#ef4444;#dc2626" dur="1s" repeatCount="indefinite"/>
        </circle>
        <rect x="25" y="10" width="30" height="25" rx="2" fill="#2d2d2d" stroke="#f87171" stroke-width="1"/>
      </g>
    `,
  };
  
  return moduleTemplates[module.type] || `<g transform="${transform}"><rect width="60" height="60" fill="#333"/></g>`;
}

function calculateBounds(modules: PlacedModule[]): { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } {
  if (modules.length === 0) {
    return { minX: 0, minY: 0, maxX: 800, maxY: 600, width: 800, height: 600 };
  }
  
  const moduleSizes: Record<string, { width: number; height: number }> = {
    'core-furnace': { width: 100, height: 100 },
    'energy-pipe': { width: 120, height: 50 },
    'gear': { width: 80, height: 80 },
    'rune-node': { width: 80, height: 80 },
    'shield-shell': { width: 100, height: 60 },
    'trigger-switch': { width: 60, height: 100 },
  };
  
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  modules.forEach((module) => {
    const size = moduleSizes[module.type] || { width: 80, height: 80 };
    minX = Math.min(minX, module.x);
    minY = Math.min(minY, module.y);
    maxX = Math.max(maxX, module.x + size.width);
    maxY = Math.max(maxY, module.y + size.height);
  });
  
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export async function exportToPNG(
  modules: PlacedModule[],
  connections: Connection[],
  options: ExportOptions = { format: 'png', scale: 2 }
): Promise<Blob> {
  const svgString = exportToSVG(modules, connections, options);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const img = new Image();
  
  return new Promise((resolve, reject) => {
    img.onload = () => {
      const scale = options.scale || 2;
      canvas.width = (options.width || img.width) * scale;
      canvas.height = (options.height || img.height) * scale;
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create PNG blob'));
        }
      }, 'image/png');
    };
    
    img.onerror = () => reject(new Error('Failed to load SVG'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
  });
}

export function exportPoster(
  modules: PlacedModule[],
  connections: Connection[],
  attributes: GeneratedAttributes
): string {
  const bounds = calculateBounds(modules);
  const machineWidth = Math.max(bounds.width + 100, 400);
  const machineHeight = Math.max(bounds.height + 100, 300);
  const posterWidth = 600;
  const posterHeight = 800;
  
  const offsetX = (posterWidth - Math.min(machineWidth, 500)) / 2;
  const offsetY = 150;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="0 0 ${posterWidth} ${posterHeight}" 
     width="${posterWidth}" 
     height="${posterHeight}">
  <defs>
    <linearGradient id="posterBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0e17"/>
      <stop offset="100%" style="stop-color:#1a1a2e"/>
    </linearGradient>
    <filter id="posterGlow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#posterBg)"/>
  
  <!-- Border -->
  <rect x="20" y="20" width="${posterWidth - 40}" height="${posterHeight - 40}" 
        fill="none" stroke="#00d4ff" stroke-width="2" rx="10"/>
  <rect x="30" y="30" width="${posterWidth - 60}" height="${posterHeight - 60}" 
        fill="none" stroke="#7c3aed" stroke-width="1" rx="8" opacity="0.5"/>
  
  <!-- Title -->
  <text x="${posterWidth / 2}" y="60" text-anchor="middle" 
        fill="#00d4ff" font-family="serif" font-size="24" font-weight="bold">
    ARCANE MACHINE CODEX
  </text>
  
  <!-- Machine Name -->
  <text x="${posterWidth / 2}" y="95" text-anchor="middle" 
        fill="#ffd700" font-family="serif" font-size="18">
    ${attributes.name}
  </text>
  
  <!-- Rarity Badge -->
  <rect x="${posterWidth / 2 - 50}" y="110" width="100" height="25" rx="12" 
        fill="${getRarityColorHex(attributes.rarity)}" opacity="0.3"/>
  <text x="${posterWidth / 2}" y="128" text-anchor="middle" 
        fill="${getRarityColorHex(attributes.rarity)}" font-size="14" font-weight="bold">
    ${attributes.rarity.toUpperCase()}
  </text>
  
  <!-- Machine Preview -->
  <g transform="translate(${offsetX - bounds.minX}, ${offsetY - bounds.minY})">
    ${connections.map(conn => `
    <path d="${conn.pathData}" 
          fill="none" 
          stroke="#00ffcc" 
          stroke-width="2" 
          stroke-dasharray="5,3"
          opacity="0.8"/>`
    ).join('')}
    ${modules.map(module => renderModuleToSVG(module)).join('')}
  </g>
  
  <!-- Stats -->
  <g transform="translate(50, ${offsetY + machineHeight + 30})">
    <text fill="#9ca3af" font-size="12">STATS</text>
    <text x="0" y="20" fill="#4ade80" font-size="11">Stability: ${attributes.stats.stability}%</text>
    <text x="0" y="35" fill="#f59e0b" font-size="11">Power: ${attributes.stats.powerOutput}</text>
    <text x="0" y="50" fill="#ef4444" font-size="11">Failure: ${attributes.stats.failureRate}%</text>
    
    <text x="150" y="20" fill="#a855f7" font-size="11">Tags: ${attributes.tags.join(', ')}</text>
    <text x="150" y="35" fill="#9ca3af" font-size="10">ID: ${attributes.codexId}</text>
  </g>
  
  <!-- Description -->
  <text x="50" y="${posterHeight - 80}" fill="#9ca3af" font-size="10" font-family="serif">
    <tspan x="50" dy="0">${attributes.description.substring(0, 60)}</tspan>
    <tspan x="50" dy="14">${attributes.description.substring(60)}</tspan>
  </text>
  
  <!-- Footer -->
  <text x="${posterWidth / 2}" y="${posterHeight - 30}" text-anchor="middle" 
        fill="#4a5568" font-size="10">
    Arcane Machine Codex Workshop
  </text>
</svg>`;
}

function getRarityColorHex(rarity: string): string {
  const colors: Record<string, string> = {
    common: '#9ca3af',
    uncommon: '#22c55e',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b',
  };
  return colors[rarity] || '#9ca3af';
}

export function downloadFile(content: string | Blob, filename: string, mimeType: string): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
