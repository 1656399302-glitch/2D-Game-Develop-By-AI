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
    'void-siphon': `
      <g transform="${transform}">
        <circle cx="40" cy="40" r="32" fill="#1e1b4b" stroke="#a78bfa" stroke-width="2"/>
        <circle cx="40" cy="40" r="22" fill="none" stroke="#7c3aed" stroke-width="1"/>
        <circle cx="40" cy="40" r="12" fill="#4c1d95"/>
        <circle cx="40" cy="40" r="6" fill="#7c3aed"/>
      </g>
    `,
    'phase-modulator': `
      <g transform="${transform}">
        <polygon points="40,4 68,18 68,52 40,66 12,52 12,18" fill="#164e63" stroke="#22d3ee" stroke-width="2"/>
        <polygon points="40,12 60,23 60,47 40,58 20,47 20,23" fill="none" stroke="#06b6d4" stroke-width="1"/>
        <circle cx="40" cy="40" r="8" fill="#0891b2"/>
        <circle cx="40" cy="40" r="4" fill="#22d3ee"/>
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
    'output-array': { width: 80, height: 80 },
    'amplifier-crystal': { width: 80, height: 80 },
    'stabilizer-core': { width: 80, height: 80 },
    'void-siphon': { width: 80, height: 80 },
    'phase-modulator': { width: 80, height: 80 },
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

export function exportEnhancedPoster(
  modules: PlacedModule[],
  connections: Connection[],
  attributes: GeneratedAttributes
): string {
  const bounds = calculateBounds(modules);
  const posterWidth = 600;
  const posterHeight = 850;
  
  // Calculate machine preview position
  const previewHeight = 350;
  const previewY = 100;
  const machineScale = Math.min(450 / bounds.width, previewHeight / bounds.height, 1);
  const offsetX = (posterWidth - bounds.width * machineScale) / 2 - bounds.minX * machineScale + bounds.width * (machineScale - 1) / 2;
  const offsetY = previewY + (previewHeight - bounds.height * machineScale) / 2 - bounds.minY * machineScale;
  
  // Get background gradient based on dominant tag
  const dominantTag = getDominantTag(attributes.tags);
  const bgGradient = getTagGradient(dominantTag);
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="0 0 ${posterWidth} ${posterHeight}" 
     width="${posterWidth}" 
     height="${posterHeight}">
  <defs>
    <linearGradient id="enhancedBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgGradient.start}"/>
      <stop offset="100%" style="stop-color:${bgGradient.end}"/>
    </linearGradient>
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fbbf24"/>
      <stop offset="50%" style="stop-color:#f59e0b"/>
      <stop offset="100%" style="stop-color:#fbbf24"/>
    </linearGradient>
    <filter id="enhancedGlow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="innerShadow">
      <feOffset dx="0" dy="2"/>
      <feGaussianBlur stdDeviation="2" result="offset-blur"/>
      <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
      <feFlood flood-color="#000" flood-opacity="0.3" result="color"/>
      <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
      <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#enhancedBg)"/>
  
  <!-- Decorative corner ornaments -->
  <g stroke="url(#goldGradient)" stroke-width="2" fill="none">
    <!-- Top left -->
    <path d="M10,50 L10,10 L50,10"/>
    <path d="M15,40 L15,15 L40,15"/>
    <circle cx="10" cy="10" r="3" fill="#fbbf24"/>
    
    <!-- Top right -->
    <path d="M${posterWidth - 10},50 L${posterWidth - 10},10 L${posterWidth - 50},10"/>
    <path d="M${posterWidth - 15},40 L${posterWidth - 15},15 L${posterWidth - 40},15"/>
    <circle cx="${posterWidth - 10}" cy="10" r="3" fill="#fbbf24"/>
    
    <!-- Bottom left -->
    <path d="M10,${posterHeight - 50} L10,${posterHeight - 10} L50,${posterHeight - 10}"/>
    <path d="M15,${posterHeight - 40} L15,${posterHeight - 15} L40,${posterHeight - 15}"/>
    <circle cx="10" cy="${posterHeight - 10}" r="3" fill="#fbbf24"/>
    
    <!-- Bottom right -->
    <path d="M${posterWidth - 10},${posterHeight - 50} L${posterWidth - 10},${posterHeight - 10} L${posterWidth - 50},${posterHeight - 10}"/>
    <path d="M${posterWidth - 15},${posterHeight - 40} L${posterWidth - 15},${posterHeight - 15} L${posterWidth - 40},${posterHeight - 15}"/>
    <circle cx="${posterWidth - 10}" cy="${posterHeight - 10}" r="3" fill="#fbbf24"/>
  </g>
  
  <!-- Outer border -->
  <rect x="20" y="20" width="${posterWidth - 40}" height="${posterHeight - 40}" 
        fill="none" stroke="url(#goldGradient)" stroke-width="2" rx="12"/>
  
  <!-- Inner border -->
  <rect x="30" y="30" width="${posterWidth - 60}" height="${posterHeight - 60}" 
        fill="none" stroke="${getRarityColorHex(attributes.rarity)}" stroke-width="1" rx="8" opacity="0.6"/>
  
  <!-- Title banner -->
  <g transform="translate(${posterWidth / 2}, 55)">
    <text x="0" y="0" text-anchor="middle" fill="#00d4ff" font-family="serif" font-size="14" letter-spacing="4">
      ★ ARCANE MACHINE CODEX ★
    </text>
  </g>
  
  <!-- Machine Name with ornate styling -->
  <g transform="translate(${posterWidth / 2}, 90)">
    <text x="0" y="0" text-anchor="middle" fill="#ffd700" font-family="serif" font-size="28" font-weight="bold" filter="url(#enhancedGlow)">
      ${attributes.name}
    </text>
    <!-- Decorative underline -->
    <line x1="-120" y1="10" x2="-20" y2="10" stroke="#ffd700" stroke-width="1" opacity="0.6"/>
    <circle cx="0" cy="10" r="3" fill="#ffd700"/>
    <line x1="20" y1="10" x2="120" y2="10" stroke="#ffd700" stroke-width="1" opacity="0.6"/>
  </g>
  
  <!-- Rarity Badge with icon -->
  <g transform="translate(${posterWidth / 2}, 120)">
    <rect x="-60" y="-12" width="120" height="24" rx="12" 
          fill="${getRarityColorHex(attributes.rarity)}" opacity="0.2"/>
    <rect x="-58" y="-10" width="116" height="20" rx="10" 
          fill="none" stroke="${getRarityColorHex(attributes.rarity)}" stroke-width="1"/>
    <text x="0" y="4" text-anchor="middle" fill="${getRarityColorHex(attributes.rarity)}" font-size="12" font-weight="bold" letter-spacing="2">
      ${getRarityIcon(attributes.rarity)} ${attributes.rarity.toUpperCase()} ${getRarityIcon(attributes.rarity)}
    </text>
  </g>
  
  <!-- Machine Preview Container -->
  <rect x="40" y="${previewY}" width="${posterWidth - 80}" height="${previewHeight}" 
        fill="#0a0e17" stroke="#1e2a42" stroke-width="1" rx="8" filter="url(#innerShadow)"/>
  
  <!-- Machine Preview -->
  <g transform="translate(${offsetX}, ${offsetY}) scale(${machineScale})">
    ${connections.map(conn => `
    <path d="${conn.pathData}" 
          fill="none" 
          stroke="#00ffcc" 
          stroke-width="2.5" 
          stroke-dasharray="6,3"
          opacity="0.9"
          filter="url(#enhancedGlow)"/>`
    ).join('')}
    ${modules.map(module => renderModuleToSVG(module)).join('')}
  </g>
  
  <!-- Stats Panel -->
  <g transform="translate(50, ${previewY + previewHeight + 20})">
    <!-- Stats header -->
    <text x="0" y="0" fill="#9ca3af" font-size="11" letter-spacing="2">◆ ATTRIBUTES</text>
    <line x1="0" y1="8" x2="150" y2="8" stroke="#1e2a42" stroke-width="1"/>
    
    <!-- Stability -->
    <g transform="translate(0, 25)">
      <rect x="0" y="0" width="80" height="8" rx="4" fill="#1e2a42"/>
      <rect x="0" y="0" width="${80 * attributes.stats.stability / 100}" height="8" rx="4" fill="#4ade80"/>
      <text x="90" y="8" fill="#4ade80" font-size="10">◆ Stability</text>
      <text x="160" y="8" fill="#4ade80" font-size="10" font-weight="bold">${attributes.stats.stability}%</text>
    </g>
    
    <!-- Power -->
    <g transform="translate(0, 45)">
      <rect x="0" y="0" width="80" height="8" rx="4" fill="#1e2a42"/>
      <rect x="0" y="0" width="${80 * attributes.stats.powerOutput / 100}" height="8" rx="4" fill="#f59e0b"/>
      <text x="90" y="8" fill="#f59e0b" font-size="10">⚡ Power</text>
      <text x="160" y="8" fill="#f59e0b" font-size="10" font-weight="bold">${attributes.stats.powerOutput}</text>
    </g>
    
    <!-- Failure Rate -->
    <g transform="translate(0, 65)">
      <rect x="0" y="0" width="80" height="8" rx="4" fill="#1e2a42"/>
      <rect x="0" y="0" width="${80 * attributes.stats.failureRate / 100}" height="8" rx="4" fill="#ef4444"/>
      <text x="90" y="8" fill="#ef4444" font-size="10">⚠ Failure</text>
      <text x="160" y="8" fill="#ef4444" font-size="10" font-weight="bold">${attributes.stats.failureRate}%</text>
    </g>
    
    <!-- Energy Cost -->
    <g transform="translate(0, 85)">
      <rect x="0" y="0" width="80" height="8" rx="4" fill="#1e2a42"/>
      <rect x="0" y="0" width="${80 * attributes.stats.energyCost / 100}" height="8" rx="4" fill="#06b6d4"/>
      <text x="90" y="8" fill="#06b6d4" font-size="10">❖ Energy</text>
      <text x="160" y="8" fill="#06b6d4" font-size="10" font-weight="bold">${attributes.stats.energyCost}</text>
    </g>
  </g>
  
  <!-- Tags Panel -->
  <g transform="translate(250, ${previewY + previewHeight + 20})">
    <text x="0" y="0" fill="#9ca3af" font-size="11" letter-spacing="2">◆ TAGS</text>
    <line x1="0" y1="8" x2="150" y2="8" stroke="#1e2a42" stroke-width="1"/>
    
    ${attributes.tags.map((tag, idx) => `
    <g transform="translate(0, ${25 + idx * 22})">
      <rect x="0" y="-8" width="140" height="20" rx="4" fill="${getTagColor(tag)}" opacity="0.15"/>
      <text x="10" y="4" fill="${getTagColor(tag)}" font-size="10" font-weight="bold">${getTagIcon(tag)}</text>
      <text x="30" y="4" fill="${getTagColor(tag)}" font-size="10">${tag.charAt(0).toUpperCase() + tag.slice(1)}</text>
    </g>`).join('')}
  </g>
  
  <!-- Faction Emblem Placeholder -->
  <g transform="translate(${posterWidth - 100}, ${previewY + previewHeight + 50})">
    <circle cx="30" cy="30" r="28" fill="none" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="4,2" opacity="0.6"/>
    <circle cx="30" cy="30" r="22" fill="none" stroke="#fbbf24" stroke-width="1" opacity="0.4"/>
    <text x="30" y="36" text-anchor="middle" fill="#fbbf24" font-size="20" opacity="0.7">⚗</text>
    <text x="30" y="75" text-anchor="middle" fill="#6b7280" font-size="8">FACTION</text>
  </g>
  
  <!-- Description -->
  <g transform="translate(50, ${posterHeight - 130})">
    <text fill="#9ca3af" font-size="10" font-family="serif" font-style="italic">
      <tspan x="0" dy="0">${wrapText(attributes.description, 70)}</tspan>
    </text>
  </g>
  
  <!-- Footer -->
  <g transform="translate(${posterWidth / 2}, ${posterHeight - 35})">
    <text x="0" y="0" text-anchor="middle" fill="#4a5568" font-size="9">
      Arcane Machine Codex Workshop
    </text>
    <text x="0" y="14" text-anchor="middle" fill="#374151" font-size="8">
      ID: ${attributes.codexId}
    </text>
  </g>
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

function getRarityIcon(rarity: string): string {
  const icons: Record<string, string> = {
    common: '○',
    uncommon: '◈',
    rare: '◆',
    epic: '✦',
    legendary: '★',
  };
  return icons[rarity] || '○';
}

function getDominantTag(tags: string[]): string {
  const tagOrder = ['void', 'lightning', 'fire', 'arcane', 'mechanical', 'protective', 'balancing', 'amplifying', 'stable'];
  for (const tag of tagOrder) {
    if (tags.includes(tag as any)) {
      return tag;
    }
  }
  return 'arcane';
}

function getTagGradient(tag: string): { start: string; end: string } {
  const gradients: Record<string, { start: string; end: string }> = {
    void: { start: '#0f0a1e', end: '#1a1a2e' },
    lightning: { start: '#0a1e2e', end: '#1a2a3e' },
    fire: { start: '#1e0a0a', end: '#2e1a1a' },
    arcane: { start: '#0a0f1e', end: '#1a1a2e' },
    mechanical: { start: '#1e1a0a', end: '#2e2a1a' },
    protective: { start: '#0a1e0a', end: '#1a2e1a' },
    balancing: { start: '#0f1e1e', end: '#1f2e2e' },
    amplifying: { start: '#1e0f2e', end: '#2e1f3e' },
    stable: { start: '#0a1e1e', end: '#1a2e2e' },
  };
  return gradients[tag] || { start: '#0a0e17', end: '#1a1a2e' };
}

function getTagColor(tag: string): string {
  const colors: Record<string, string> = {
    void: '#a78bfa',
    lightning: '#22d3ee',
    fire: '#f97316',
    arcane: '#a855f7',
    mechanical: '#f59e0b',
    protective: '#22c55e',
    balancing: '#06b6d4',
    amplifying: '#ec4899',
    explosive: '#ef4444',
    stable: '#84cc16',
    resonance: '#f472b6',
  };
  return colors[tag] || '#9ca3af';
}

function getTagIcon(tag: string): string {
  const icons: Record<string, string> = {
    void: '◉',
    lightning: '⚡',
    fire: '🔥',
    arcane: '✧',
    mechanical: '⚙',
    protective: '◇',
    balancing: '≋',
    amplifying: '↑',
    explosive: '✱',
    stable: '○',
    resonance: '◌',
  };
  return icons[tag] || '◆';
}

function wrapText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const words = text.split(' ');
  let lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxChars) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  
  return lines.join('</tspan><tspan x="0" dy="14">');
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
