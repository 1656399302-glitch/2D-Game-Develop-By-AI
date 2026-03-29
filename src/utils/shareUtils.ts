/**
 * Share Utilities for Arcane Machine Codex
 * 
 * Provides functionality for social media sharing, meta tag generation,
 * QR code creation, and platform-specific share links.
 */

import { GeneratedAttributes, AttributeTag } from '../types';
import { FACTIONS, FactionId } from '../types/factions';

/**
 * Open Graph meta tags for social media preview
 */
export interface OpenGraphMeta {
  title: string;
  description: string;
  image: string;
  url: string;
  type: 'website' | 'article';
  siteName: string;
  locale: string;
}

/**
 * Share platform configuration
 */
export interface SharePlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  shareUrl: (title: string, url: string, text: string) => string;
}

/**
 * All supported share platforms
 */
export const SHARE_PLATFORMS: SharePlatform[] = [
  {
    id: 'twitter',
    name: 'Twitter / X',
    icon: '🐦',
    color: '#1DA1F2',
    shareUrl: (title, url) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: 'reddit',
    name: 'Reddit',
    icon: '🤖',
    color: '#FF4500',
    shareUrl: (title, url) => `https://www.reddit.com/submit?title=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '📘',
    color: '#4267B2',
    shareUrl: (_title, url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    color: '#0077B5',
    shareUrl: (title, url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
];

/**
 * Generate Open Graph meta tags for social media sharing
 */
export function generateOpenGraphMeta(
  machineName: string,
  attributes: GeneratedAttributes,
  baseUrl: string = window.location.origin
): OpenGraphMeta {
  const faction = getDominantFaction(attributes.tags);
  const factionName = faction ? FACTIONS[faction].name : 'Arcane';
  
  return {
    title: `${machineName} | ${factionName} Machine | Arcane Machine Codex`,
    description: `${attributes.description} ${getShareableStats(attributes)}. A ${attributes.rarity} machine with ${attributes.tags.slice(0, 3).join(', ')} attributes.`,
    image: `${baseUrl}/api/og-image?machine=${encodeURIComponent(machineName)}&rarity=${attributes.rarity}&faction=${faction || 'neutral'}`,
    url: `${baseUrl}/share/${generateShareId()}`,
    type: 'article',
    siteName: 'Arcane Machine Codex Workshop',
    locale: 'en_US',
  };
}

/**
 * Generate HTML meta tags for document head
 */
export function generateMetaTags(meta: OpenGraphMeta): string {
  return `<!-- Open Graph Meta Tags -->
<meta property="og:title" content="${meta.title}">
<meta property="og:description" content="${meta.description}">
<meta property="og:image" content="${meta.image}">
<meta property="og:url" content="${meta.url}">
<meta property="og:type" content="${meta.type}">
<meta property="og:site_name" content="${meta.siteName}">
<meta property="og:locale" content="${meta.locale}">

<!-- Twitter Card Tags -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${meta.title}">
<meta name="twitter:description" content="${meta.description}">
<meta name="twitter:image" content="${meta.image}">`;
}

/**
 * Generate SVG-based QR code (simplified inline implementation)
 */
export function generateQRCodeSVG(data: string, size: number = 200): string {
  // Simplified QR code visualization using SVG
  // In production, use a proper QR code library
  const moduleSize = Math.floor(size / 25);
  const padding = moduleSize * 2;
  const gridSize = 21; // Version 2 QR code (21x21 modules)
  
  // Generate pseudo-random pattern based on data
  const hash = hashString(data);
  const modules = generateQRPattern(hash, gridSize);
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`;
  
  // Background
  svg += `<rect width="${size}" height="${size}" fill="white"/>`;
  
  // Finder patterns (corner markers)
  svg += generateFinderPattern(padding, padding, moduleSize);
  svg += generateFinderPattern(size - padding - moduleSize * 7, padding, moduleSize);
  svg += generateFinderPattern(padding, size - padding - moduleSize * 7, moduleSize);
  
  // Data modules
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (isFinderPatternArea(x, y, gridSize)) continue;
      if (modules[y * gridSize + x]) {
        svg += `<rect x="${padding + x * moduleSize}" y="${padding + y * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`;
      }
    }
  }
  
  svg += '</svg>';
  return svg;
}

/**
 * Generate shareable stats string
 */
export function getShareableStats(attributes: GeneratedAttributes): string {
  return `Stability: ${attributes.stats.stability}% | Power: ${attributes.stats.powerOutput} | Failure: ${attributes.stats.failureRate}%`;
}

/**
 * Generate a unique share ID for URL
 */
export function generateShareId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

/**
 * Get share link for current machine
 */
export function getShareLink(machineName: string, attributes: GeneratedAttributes): string {
  const baseUrl = window.location.origin;
  const shareId = generateShareId();
  const params = new URLSearchParams({
    name: machineName,
    rarity: attributes.rarity,
    stats: `${attributes.stats.stability}-${attributes.stats.powerOutput}-${attributes.stats.failureRate}`,
    tags: attributes.tags.join(','),
  });
  return `${baseUrl}/share/${shareId}?${params.toString()}`;
}

/**
 * Create shareable poster HTML with embedded meta tags
 */
export function createShareablePosterHTML(
  machineName: string,
  attributes: GeneratedAttributes,
  svgContent: string
): string {
  const meta = generateOpenGraphMeta(machineName, attributes);
  const metaTags = generateMetaTags(meta);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${meta.title}</title>
  ${metaTags}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #0a0e17 0%, #1a1a2e 100%);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .poster-container {
      max-width: 800px;
      width: 100%;
      background: #121826;
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .poster-image { width: 100%; height: auto; }
    .share-section {
      padding: 1.5rem;
      text-align: center;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    .share-title {
      color: #ffd700;
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    .share-rarity {
      color: ${getRarityColor(attributes.rarity)};
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .share-stats {
      color: #9ca3af;
      font-size: 0.875rem;
      margin-top: 1rem;
    }
    .share-link {
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      color: white;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      font-weight: 600;
    }
    .share-link:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="poster-container">
    <div class="poster-image">${svgContent}</div>
    <div class="share-section">
      <div class="share-title">${machineName}</div>
      <div class="share-rarity">${attributes.rarity.toUpperCase()}</div>
      <div class="share-stats">${getShareableStats(attributes)}</div>
      <button class="share-link" onclick="navigator.clipboard.writeText(window.location.href); this.textContent='Link Copied!';">
        Copy Share Link
      </button>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Share to a specific platform
 */
export function shareToPlatform(
  platformId: string,
  machineName: string,
  attributes: GeneratedAttributes
): void {
  const platform = SHARE_PLATFORMS.find(p => p.id === platformId);
  if (!platform) return;
  
  const shareUrl = getShareLink(machineName, attributes);
  const shareText = `Check out my ${attributes.rarity} machine "${machineName}" in Arcane Machine Codex!`;
  
  window.open(
    platform.shareUrl(shareText, shareUrl, shareText),
    '_blank',
    'width=600,height=400'
  );
}

// Helper functions

function getDominantFaction(tags: AttributeTag[]): FactionId | null {
  const factionTags: Record<string, FactionId> = {
    void: 'void',
    lightning: 'storm',
    fire: 'inferno',
    arcane: 'stellar',
  };
  
  for (const tag of tags) {
    if (factionTags[tag]) return factionTags[tag];
  }
  return null;
}

function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: '#9ca3af',
    uncommon: '#22c55e',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b',
  };
  return colors[rarity] || '#9ca3af';
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function generateQRPattern(seed: number, size: number): boolean[] {
  const pattern: boolean[] = [];
  for (let i = 0; i < size * size; i++) {
    pattern.push(((seed * (i + 1) * 31) % 3) === 0);
  }
  return pattern;
}

function generateFinderPattern(x: number, y: number, moduleSize: number): string {
  const size = moduleSize * 7;
  return `
    <rect x="${x}" y="${y}" width="${size}" height="${size}" fill="black"/>
    <rect x="${x + moduleSize}" y="${y + moduleSize}" width="${moduleSize * 5}" height="${moduleSize * 5}" fill="white"/>
    <rect x="${x + moduleSize * 2}" y="${y + moduleSize * 2}" width="${moduleSize * 3}" height="${moduleSize * 3}" fill="black"/>
  `;
}

function isFinderPatternArea(x: number, y: number, size: number): boolean {
  // Top-left finder pattern
  if (x < 8 && y < 8) return true;
  // Top-right finder pattern
  if (x >= size - 7 && y < 8) return true;
  // Bottom-left finder pattern
  if (x < 8 && y >= size - 7) return true;
  return false;
}
