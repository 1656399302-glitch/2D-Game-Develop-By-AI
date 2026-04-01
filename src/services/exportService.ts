/**
 * Export Service - CodexCard Poster Export System (Round 95)
 */
import { PlacedModule, Connection, GeneratedAttributes } from '../types';
import { FactionConfig } from '../types/factions';

export type ExportFormat = 'svg' | 'png';
export type ExportQuality = 'standard' | 'high';

const PW = 800, PH = 1000;
const RC: Record<string, { p: string }> = {
  common: { p: '#9ca3af' }, uncommon: { p: '#22c55e' },
  rare: { p: '#3b82f6' }, epic: { p: '#a855f7' }, legendary: { p: '#f59e0b' },
};

function bounds(modules: PlacedModule[]) {
  if (!modules.length) return { w: 400, h: 300, oX: 200, oY: 180 };
  const sizes: Record<string, [number, number]> = {
    'core-furnace': [100, 100], 'energy-pipe': [120, 50], 'gear': [80, 80],
    'rune-node': [80, 80], 'shield-shell': [100, 60], 'trigger-switch': [60, 100],
  };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  modules.forEach(m => {
    const [w, h] = sizes[m.type] || [80, 80];
    minX = Math.min(minX, m.x); minY = Math.min(minY, m.y);
    maxX = Math.max(maxX, m.x + w); maxY = Math.max(maxY, m.y + h);
  });
  const w = maxX - minX, h = maxY - minY;
  const ph = 400, pw = 680;
  const scale = Math.min(pw / Math.max(w, 1), ph / Math.max(h, 1), 1);
  return { w: w * scale, h: h * scale, oX: (PW - w * scale) / 2 - minX * scale, oY: 180 + (ph - h * scale) / 2 - minY * scale, scale };
}

function moduleSVG(m: PlacedModule): string {
  const t = `translate(${m.x},${m.y}) rotate(${m.rotation})`;
  const templates: Record<string, string> = {
    'core-furnace': `<g transform="${t}"><polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="#1a1a2e" stroke="#00d4ff" stroke-width="2"/><circle cx="50" cy="50" r="25" fill="#0a0e17" stroke="#00ffcc" stroke-width="2"/><circle cx="50" cy="50" r="15" fill="#00d4ff" opacity="0.5"/><circle cx="50" cy="50" r="8" fill="#00ffcc"/></g>`,
    'energy-pipe': `<g transform="${t}"><rect x="0" y="10" width="100" height="30" rx="5" fill="#1a1a2e" stroke="#7c3aed" stroke-width="2"/><rect x="5" y="15" width="90" height="20" rx="3" fill="#2d1b4e"/></g>`,
    'gear': `<g transform="${t}"><circle cx="40" cy="40" r="30" fill="#1a1a2e" stroke="#f59e0b" stroke-width="2"/><circle cx="40" cy="40" r="8" fill="#f59e0b"/></g>`,
    'rune-node': `<g transform="${t}"><circle cx="40" cy="40" r="35" fill="#1a1a2e" stroke="#9333ea" stroke-width="2"/><circle cx="40" cy="40" r="25" fill="#2d1b4e" stroke="#a855f7" stroke-width="1"/></g>`,
  };
  return templates[m.type] || `<g transform="${t}"><rect width="60" height="60" fill="#333"/></g>`;
}

function factionSeal(f: FactionConfig) {
  return `<g transform="translate(700,80)"><circle cx="0" cy="0" r="35" fill="none" stroke="${f.color}" stroke-width="2" stroke-dasharray="4,2"/><circle cx="0" cy="0" r="28" fill="${f.color}10"/><text x="0" y="7" text-anchor="middle" fill="${f.color}" font-size="20">${f.icon}</text><text x="0" y="55" text-anchor="middle" fill="${f.color}" font-size="10">${f.nameCn}</text></g>`;
}

/** AC-EXPORT-002: Poster contains all 6 required elements */
export function generateCodexCardSVG(
  modules: PlacedModule[], connections: Connection[], attrs: GeneratedAttributes, faction: FactionConfig
): string {
  const { oX, oY, scale, h: ph } = bounds(modules);
  const rc = RC[attrs.rarity]?.p || '#9ca3af';
  const fc = faction.color;
  const grid = Array.from({ length: 25 }, (_, i) => `<line x1="0" y1="${i * 40}" x2="${PW}" y2="${i * 40}" stroke="${fc}" stroke-width="0.5" opacity="0.05"/>`).join('');
  const corners = [[30, 30], [770, 30], [30, 970], [770, 970]].map(([x, y]) => 
    `<circle cx="${x}" cy="${y}" r="6" fill="${fc}" opacity="0.8"/><circle cx="${x}" cy="${y}" r="3" fill="#0a0e17"/>`
  ).join('');
  const attrsY = 180 + ph + 30;
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

/** AC-EXPORT-003: PNG export is downloadable and non-empty */
export async function generateCodexCardPNG(
  modules: PlacedModule[], connections: Connection[], attrs: GeneratedAttributes, faction: FactionConfig, quality: ExportQuality = 'standard'
): Promise<Blob> {
  const svg = generateCodexCardSVG(modules, connections, attrs, faction);
  const scale = quality === 'high' ? 2 : 1;
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) { reject(new Error('Canvas context unavailable')); return; }
    canvas.width = PW * scale; canvas.height = PH * scale;
    const img = new Image();
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(b => b && b.size > 0 ? resolve(b) : reject(new Error('Empty PNG')), 'image/png');
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('SVG load failed')); };
    img.src = url;
  });
}

/** AC-EXPORT-005: Export completes within 5 seconds for 30 modules */
export async function exportAsCodexCard(
  modules: PlacedModule[], connections: Connection[], attrs: GeneratedAttributes, faction: FactionConfig, format: ExportFormat = 'svg', quality: ExportQuality = 'standard'
): Promise<Blob | string> {
  const start = performance.now();
  if (format === 'svg') {
    const svg = generateCodexCardSVG(modules, connections, attrs, faction);
    /** AC-EXPORT-004: SVG export produces valid, parseable SVG */
    const parser = new DOMParser();
    if (parser.parseFromString(svg, 'image/svg+xml').querySelector('parsererror')) throw new Error('Invalid SVG');
    if (performance.now() - start > 5000) console.warn('SVG export > 5s');
    return svg;
  }
  const blob = await generateCodexCardPNG(modules, connections, attrs, faction, quality);
  if (performance.now() - start > 5000) console.warn('PNG export > 5s');
  return blob;
}

export function downloadCodexCard(content: string | Blob, filename: string, mime: string): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
