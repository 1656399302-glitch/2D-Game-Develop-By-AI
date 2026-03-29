/**
 * Share Utilities Tests
 * 
 * Tests for social media sharing, meta tag generation, and share utilities.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateOpenGraphMeta,
  generateMetaTags,
  getShareableStats,
  generateShareId,
  generateQRCodeSVG,
  createShareablePosterHTML,
  getShareLink,
  SHARE_PLATFORMS,
} from '../utils/shareUtils';
import { GeneratedAttributes, AttributeTag } from '../types';

describe('Share Utilities', () => {
  const mockAttributes: GeneratedAttributes = {
    name: 'Void Resonance Amplifier',
    rarity: 'epic',
    stats: {
      stability: 85,
      powerOutput: 72,
      energyCost: 45,
      failureRate: 12,
    },
    tags: ['void', 'amplifying', 'stable'] as AttributeTag[],
    description: 'A powerful arcane device that channels void energy through resonance chambers.',
    codexId: 'AMC-00001-VRA',
  };

  describe('Open Graph Meta Generation', () => {
    it('should generate Open Graph meta with machine name', () => {
      const meta = generateOpenGraphMeta('Test Machine', mockAttributes);
      
      expect(meta.title).toContain('Test Machine');
      expect(meta.title).toContain('Void Machine'); // Based on dominant tag
    });

    it('should include machine rarity in meta', () => {
      const meta = generateOpenGraphMeta('Test Machine', mockAttributes);
      
      // Title should contain rarity in lowercase (epic)
      expect(meta.title).toMatch(/Test Machine.*Void Machine.*Arcane Machine Codex/i);
    });

    it('should include stats in description', () => {
      const meta = generateOpenGraphMeta('Test Machine', mockAttributes);
      
      expect(meta.description).toContain('Stability');
      expect(meta.description).toContain('85%');
    });

    it('should include tags in description', () => {
      const meta = generateOpenGraphMeta('Test Machine', mockAttributes);
      
      expect(meta.description).toContain('void');
      expect(meta.description).toContain('amplifying');
    });

    it('should have correct URL and type', () => {
      const meta = generateOpenGraphMeta('Test Machine', mockAttributes);
      
      expect(meta.url).toMatch(/^https?:\/\//);
      expect(meta.type).toBe('article');
      expect(meta.siteName).toBe('Arcane Machine Codex Workshop');
    });

    it('should include image URL', () => {
      const meta = generateOpenGraphMeta('Test Machine', mockAttributes);
      
      expect(meta.image).toContain('og-image');
      expect(meta.image).toContain('rarity=epic');
      expect(meta.image).toContain('faction=void');
    });

    it('should handle different rarities in attributes', () => {
      const rarities: GeneratedAttributes['rarity'][] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
      
      rarities.forEach(rarity => {
        const attrs = { ...mockAttributes, rarity };
        const meta = generateOpenGraphMeta('Test Machine', attrs);
        // Check that image URL contains the rarity
        expect(meta.image).toContain(`rarity=${rarity}`);
      });
    });
  });

  describe('Meta Tags Generation', () => {
    it('should generate valid HTML meta tags', () => {
      const meta = generateOpenGraphMeta('Test Machine', mockAttributes);
      const tags = generateMetaTags(meta);
      
      expect(tags).toContain('<meta property="og:title"');
      expect(tags).toContain('<meta property="og:description"');
      expect(tags).toContain('<meta property="og:image"');
      expect(tags).toContain('<meta property="og:url"');
      expect(tags).toContain('<meta property="og:type"');
      expect(tags).toContain('<meta property="og:site_name"');
    });

    it('should include Twitter card tags', () => {
      const meta = generateOpenGraphMeta('Test Machine', mockAttributes);
      const tags = generateMetaTags(meta);
      
      expect(tags).toContain('<meta name="twitter:card"');
      expect(tags).toContain('<meta name="twitter:title"');
      expect(tags).toContain('<meta name="twitter:description"');
      expect(tags).toContain('<meta name="twitter:image"');
    });

    it('should include Open Graph tags', () => {
      const meta = generateOpenGraphMeta('Test Machine', mockAttributes);
      const tags = generateMetaTags(meta);
      
      expect(tags).toContain('property="og:title"');
      expect(tags).toContain('property="og:type"');
      expect(tags).toContain('property="og:site_name"');
      expect(tags).toContain('property="og:locale"');
    });
  });

  describe('Shareable Stats', () => {
    it('should format stats as shareable string', () => {
      const stats = getShareableStats(mockAttributes);
      
      expect(stats).toContain('Stability: 85%');
      expect(stats).toContain('Power: 72');
      expect(stats).toContain('Failure: 12%');
    });

    it('should handle different stat values', () => {
      const attrs = {
        ...mockAttributes,
        stats: {
          stability: 100,
          powerOutput: 50,
          energyCost: 25,
          failureRate: 0,
        },
      };
      
      const stats = getShareableStats(attrs);
      expect(stats).toContain('Stability: 100%');
      expect(stats).toContain('Power: 50');
      expect(stats).toContain('Failure: 0%');
    });
  });

  describe('Share ID Generation', () => {
    it('should generate 12-character share ID', () => {
      const shareId = generateShareId();
      expect(shareId).toHaveLength(12);
    });

    it('should generate alphanumeric share ID', () => {
      const shareId = generateShareId();
      expect(shareId).toMatch(/^[A-Za-z0-9]+$/);
    });

    it('should generate unique share IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateShareId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('QR Code SVG Generation', () => {
    it('should generate valid SVG string', () => {
      const svg = generateQRCodeSVG('https://example.com');
      
      expect(svg).toContain('<svg');
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(svg).toContain('</svg>');
    });

    it('should generate SVG with correct dimensions', () => {
      const size = 200;
      const svg = generateQRCodeSVG('https://example.com', size);
      
      expect(svg).toContain(`width="${size}"`);
      expect(svg).toContain(`height="${size}"`);
    });

    it('should include finder patterns', () => {
      const svg = generateQRCodeSVG('https://example.com');
      
      // Finder patterns are 7x7 black squares in corners
      expect(svg).toContain('fill="black"');
    });

    it('should include white background', () => {
      const svg = generateQRCodeSVG('https://example.com');
      
      expect(svg).toContain('fill="white"');
    });
  });

  describe('Share Link Generation', () => {
    it('should generate valid share URL', () => {
      const link = getShareLink('Test Machine', mockAttributes);
      
      expect(link).toMatch(/^https?:\/\//);
      expect(link).toContain('share/');
      expect(link).toContain('name=Test');
    });

    it('should include rarity in share link', () => {
      const link = getShareLink('Test Machine', mockAttributes);
      
      expect(link).toContain('rarity=epic');
    });

    it('should include stats in share link', () => {
      const link = getShareLink('Test Machine', mockAttributes);
      
      expect(link).toContain('stats=85-72-12');
    });

    it('should include tags in share link', () => {
      const link = getShareLink('Test Machine', mockAttributes);
      
      expect(link).toContain('tags=void');
    });
  });

  describe('Shareable Poster HTML', () => {
    it('should generate valid HTML document', () => {
      const html = createShareablePosterHTML(
        'Test Machine',
        mockAttributes,
        '<svg><!-- poster content --></svg>'
      );
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('</html>');
      expect(html).toContain('<head>');
      expect(html).toContain('<body>');
    });

    it('should include Open Graph meta tags', () => {
      const html = createShareablePosterHTML(
        'Test Machine',
        mockAttributes,
        '<svg></svg>'
      );
      
      expect(html).toContain('og:title');
      expect(html).toContain('og:description');
      expect(html).toContain('og:image');
    });

    it('should include SVG content', () => {
      const svgContent = '<svg id="poster"><rect/></svg>';
      const html = createShareablePosterHTML('Test', mockAttributes, svgContent);
      
      expect(html).toContain(svgContent);
    });

    it('should include machine name and rarity', () => {
      const html = createShareablePosterHTML(
        'Test Machine',
        mockAttributes,
        '<svg></svg>'
      );
      
      expect(html).toContain('Test Machine');
      expect(html).toContain('EPIC'); // rarity in uppercase
    });

    it('should include copy link functionality', () => {
      const html = createShareablePosterHTML(
        'Test Machine',
        mockAttributes,
        '<svg></svg>'
      );
      
      expect(html).toContain('Copy Share Link');
      expect(html).toContain('clipboard');
    });
  });

  describe('Share Platforms', () => {
    it('should have Twitter platform', () => {
      const twitter = SHARE_PLATFORMS.find(p => p.id === 'twitter');
      expect(twitter).toBeDefined();
      expect(twitter?.name).toContain('Twitter');
    });

    it('should have Reddit platform', () => {
      const reddit = SHARE_PLATFORMS.find(p => p.id === 'reddit');
      expect(reddit).toBeDefined();
      expect(reddit?.name).toContain('Reddit');
    });

    it('should have Facebook platform', () => {
      const facebook = SHARE_PLATFORMS.find(p => p.id === 'facebook');
      expect(facebook).toBeDefined();
      expect(facebook?.name).toContain('Facebook');
    });

    it('should have LinkedIn platform', () => {
      const linkedin = SHARE_PLATFORMS.find(p => p.id === 'linkedin');
      expect(linkedin).toBeDefined();
      expect(linkedin?.name).toContain('LinkedIn');
    });

    it('each platform should have shareUrl function', () => {
      SHARE_PLATFORMS.forEach(platform => {
        expect(typeof platform.shareUrl).toBe('function');
        const url = platform.shareUrl('Test', 'https://example.com', 'Description');
        expect(url).toMatch(/^https?:\/\//);
      });
    });

    it('each platform should have required properties', () => {
      SHARE_PLATFORMS.forEach(platform => {
        expect(platform.id).toBeDefined();
        expect(platform.name).toBeDefined();
        expect(platform.icon).toBeDefined();
        expect(platform.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });
});
