/**
 * Unit tests for Export Poster Presets (AC1-AC6)
 * 
 * AC1: Export modal displays 8 format options (5 existing + 3 new social presets)
 * AC2: Twitter/X preset: 16:9 aspect ratio, 1200×675px
 * AC3: Instagram preset: 1:1 square, 1080×1080px
 * AC3b: Discord preset: 3:2 aspect ratio, 600×400px
 * AC4: Username input field with toggle
 * AC5: Watermark in exported poster
 * AC6: Animated corner decorations
 * 
 * Tests also cover negative assertions as required by operator inbox.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  exportSocialPoster, 
  exportEnhancedPoster,
  exportPoster,
  downloadFile,
  sanitizeFilename 
} from '../utils/exportUtils';
import { GeneratedAttributes, SocialPlatform, PLATFORM_PRESETS } from '../types';

// Mock modules and connections for testing
const mockModules = [
  { 
    id: 'mod1', 
    instanceId: 'inst1', 
    type: 'core-furnace' as const, 
    x: 100, 
    y: 100, 
    rotation: 0, 
    scale: 1, 
    flipped: false,
    ports: []
  },
  { 
    id: 'mod2', 
    instanceId: 'inst2', 
    type: 'energy-pipe' as const, 
    x: 200, 
    y: 100, 
    rotation: 0, 
    scale: 1, 
    flipped: false,
    ports: []
  }
];

const mockConnections = [
  {
    id: 'conn1',
    sourceModuleId: 'mod1',
    sourcePortId: 'port1',
    targetModuleId: 'mod2',
    targetPortId: 'port2',
    pathData: 'M150,150 L200,100'
  }
];

const mockAttributes: GeneratedAttributes = {
  name: 'Test Arcane Machine',
  rarity: 'rare',
  stats: {
    stability: 75,
    powerOutput: 80,
    energyCost: 40,
    failureRate: 15
  },
  tags: ['arcane', 'amplifying'],
  description: 'A test machine for unit testing the export functionality.',
  codexId: 'TEST-001'
};

describe('Export Poster Presets - Platform Configurations', () => {
  describe('AC1: Platform Preset Configurations', () => {
    it('should have all 3 social platforms defined', () => {
      expect(PLATFORM_PRESETS).toHaveProperty('twitter');
      expect(PLATFORM_PRESETS).toHaveProperty('instagram');
      expect(PLATFORM_PRESETS).toHaveProperty('discord');
    });

    it('should have correct platform names', () => {
      expect(PLATFORM_PRESETS.twitter.name).toBe('Twitter/X');
      expect(PLATFORM_PRESETS.instagram.name).toBe('Instagram');
      expect(PLATFORM_PRESETS.discord.name).toBe('Discord');
    });

    it('should have Chinese names for all platforms', () => {
      expect(PLATFORM_PRESETS.twitter.nameCn).toBe('推特/X');
      expect(PLATFORM_PRESETS.instagram.nameCn).toBe('Instagram');
      expect(PLATFORM_PRESETS.discord.nameCn).toBe('Discord');
    });
  });

  describe('AC2: Twitter/X Preset - 16:9 1200×675px', () => {
    it('should have correct aspect ratio (16:9)', () => {
      const preset = PLATFORM_PRESETS.twitter;
      expect(preset.aspectRatio).toBe('16:9');
    });

    it('should have correct dimensions (1200×675px)', () => {
      const preset = PLATFORM_PRESETS.twitter;
      expect(preset.width).toBe(1200);
      expect(preset.height).toBe(675);
    });

    it('should generate SVG with correct viewBox dimensions', () => {
      const svg = exportSocialPoster(mockModules, mockConnections, mockAttributes, 'twitter');
      
      // Check for correct width and height attributes
      expect(svg).toContain('width="1200"');
      expect(svg).toContain('height="675"');
      expect(svg).toContain('viewBox="0 0 1200 675"');
    });

    it('should have Twitter accent color', () => {
      const preset = PLATFORM_PRESETS.twitter;
      expect(preset.accentColor).toBe('#1DA1F2');
    });
  });

  describe('AC3: Instagram Preset - 1:1 1080×1080px', () => {
    it('should have correct aspect ratio (1:1)', () => {
      const preset = PLATFORM_PRESETS.instagram;
      expect(preset.aspectRatio).toBe('1:1');
    });

    it('should have correct dimensions (1080×1080px)', () => {
      const preset = PLATFORM_PRESETS.instagram;
      expect(preset.width).toBe(1080);
      expect(preset.height).toBe(1080);
    });

    it('should generate SVG with correct viewBox dimensions', () => {
      const svg = exportSocialPoster(mockModules, mockConnections, mockAttributes, 'instagram');
      
      // Check for correct width and height attributes
      expect(svg).toContain('width="1080"');
      expect(svg).toContain('height="1080"');
      expect(svg).toContain('viewBox="0 0 1080 1080"');
    });

    it('should have Instagram accent color', () => {
      const preset = PLATFORM_PRESETS.instagram;
      expect(preset.accentColor).toBe('#E4405F');
    });
  });

  describe('AC3b: Discord Preset - 3:2 600×400px', () => {
    it('should have correct aspect ratio (3:2)', () => {
      const preset = PLATFORM_PRESETS.discord;
      expect(preset.aspectRatio).toBe('3:2');
    });

    it('should have correct dimensions (600×400px)', () => {
      const preset = PLATFORM_PRESETS.discord;
      expect(preset.width).toBe(600);
      expect(preset.height).toBe(400);
    });

    it('should generate SVG with correct viewBox dimensions', () => {
      const svg = exportSocialPoster(mockModules, mockConnections, mockAttributes, 'discord');
      
      // Check for correct width and height attributes
      expect(svg).toContain('width="600"');
      expect(svg).toContain('height="400"');
      expect(svg).toContain('viewBox="0 0 600 400"');
    });

    it('should have Discord accent color', () => {
      const preset = PLATFORM_PRESETS.discord;
      expect(preset.accentColor).toBe('#5865F2');
    });
  });
});

describe('AC5: Watermark Support', () => {
  describe('exportEnhancedPoster with watermark', () => {
    it('should include username when provided', () => {
      const svg = exportEnhancedPoster(
        mockModules, 
        mockConnections, 
        mockAttributes, 
        'default',
        { username: 'ArcaneMaster' }
      );
      
      // Check for username in SVG
      expect(svg).toContain('@ArcaneMaster');
    });

    it('should NOT include watermark section when username is undefined', () => {
      const svg = exportEnhancedPoster(
        mockModules, 
        mockConnections, 
        mockAttributes, 
        'default',
        { username: undefined }
      );
      
      // Should not contain @ symbol in watermark context
      expect(svg).not.toContain('text-anchor="end"');
    });

    it('should position watermark in bottom-right corner', () => {
      const svg = exportEnhancedPoster(
        mockModules, 
        mockConnections, 
        mockAttributes, 
        'default',
        { username: 'TestUser' }
      );
      
      // Check for bottom-right positioning (text-anchor="end" with negative x offset)
      expect(svg).toContain('text-anchor="end"');
      expect(svg).toContain('@TestUser');
    });

    it('should have subtle styling for watermark (smaller font, muted color)', () => {
      const svg = exportEnhancedPoster(
        mockModules, 
        mockConnections, 
        mockAttributes, 
        'default',
        { username: 'WatermarkTest' }
      );
      
      // Check for smaller font size and opacity
      expect(svg).toContain('font-size="12"');
      expect(svg).toContain('opacity="0.6"');
      expect(svg).toContain('fill="white"');
    });
  });

  describe('exportSocialPoster with watermark', () => {
    it('should include username for Twitter preset', () => {
      const svg = exportSocialPoster(
        mockModules, 
        mockConnections, 
        mockAttributes, 
        'twitter',
        { username: 'TwitterUser' }
      );
      
      expect(svg).toContain('@TwitterUser');
    });

    it('should include username for Instagram preset', () => {
      const svg = exportSocialPoster(
        mockModules, 
        mockConnections, 
        mockAttributes, 
        'instagram',
        { username: 'InstaUser' }
      );
      
      expect(svg).toContain('@InstaUser');
    });

    it('should include username for Discord preset', () => {
      const svg = exportSocialPoster(
        mockModules, 
        mockConnections, 
        mockAttributes, 
        'discord',
        { username: 'DiscordUser' }
      );
      
      expect(svg).toContain('@DiscordUser');
    });

    it('should NOT include watermark when username is undefined (social poster)', () => {
      const svg = exportSocialPoster(
        mockModules, 
        mockConnections, 
        mockAttributes, 
        'twitter',
        { username: undefined }
      );
      
      // Should not contain watermark section
      expect(svg).not.toContain('Watermark');
    });

    it('should NOT render empty username text element', () => {
      const svg = exportSocialPoster(
        mockModules, 
        mockConnections, 
        mockAttributes, 
        'twitter',
        { username: '' }
      );
      
      // Empty username should not render text element
      expect(svg).not.toContain('text-anchor="end"');
    });
  });
});

describe('AC6: Animated Corner Decorations', () => {
  describe('exportEnhancedPoster decorations', () => {
    it('should include corner path elements (4 corners)', () => {
      const svg = exportEnhancedPoster(
        mockModules, 
        mockConnections, 
        mockAttributes, 
        'default'
      );
      
      // Should have 4 corner flourishes (4 sets of path elements)
      const cornerPathMatches = svg.match(/<path d="M\d+,\d+ L\d+,\d+ L\d+,\d+"/g);
      expect(cornerPathMatches).toBeTruthy();
      expect(cornerPathMatches!.length).toBe(8); // 2 paths per corner × 4 corners
    });

    it('should have stroke-dasharray animation for corner paths', () => {
      const svg = exportEnhancedPoster(
        mockModules, 
        mockConnections, 
        mockAttributes, 
        'default'
      );
      
      // Check for stroke-dasharray animation
      expect(svg).toContain('stroke-dasharray="60"');
      expect(svg).toContain('stroke-dashoffset="60"');
      expect(svg).toContain('<animate attributeName="stroke-dashoffset"');
    });

    it('should use gold color (#ffd700 / #fbbf24) for corners', () => {
      const svg = exportEnhancedPoster(
        mockModules, 
        mockConnections, 
        mockAttributes, 
        'default'
      );
      
      // Check for gold color in flourishes
      expect(svg).toContain('#fbbf24');
    });

    it('should have animate elements for fill freeze', () => {
      const svg = exportEnhancedPoster(
        mockModules, 
        mockConnections, 
        mockAttributes, 
        'default'
      );
      
      // Check for fill="freeze" on animations
      expect(svg).toContain('fill="freeze"');
    });
  });

  describe('exportSocialPoster decorations', () => {
    it('should include corner decorations for Twitter', () => {
      const svg = exportSocialPoster(
        mockModules, 
        mockConnections, 
        mockAttributes, 
        'twitter'
      );
      
      // Check for corner flourishes
      expect(svg).toContain('<path d="M15,60 L15,15 L60,15"');
    });

    it('should include corner decorations for Instagram', () => {
      const svg = exportSocialPoster(
        mockModules, 
        mockConnections, 
        mockAttributes, 
        'instagram'
      );
      
      // Check for corner flourishes
      expect(svg).toContain('<path d="M15,60 L15,15 L60,15"');
    });

    it('should include corner decorations for Discord', () => {
      const svg = exportSocialPoster(
        mockModules, 
        mockConnections, 
        mockAttributes, 
        'discord'
      );
      
      // Check for corner flourishes
      expect(svg).toContain('<path d="M15,60 L15,15 L60,15"');
    });

    it('should use platform accent color for corner strokes', () => {
      // Twitter uses #1DA1F2
      const twitterSvg = exportSocialPoster(
        mockModules, 
        mockConnections, 
        mockAttributes, 
        'twitter'
      );
      expect(twitterSvg).toContain('#1DA1F2');
      
      // Instagram uses #E4405F
      const instagramSvg = exportSocialPoster(
        mockModules, 
        mockConnections, 
        mockAttributes, 
        'instagram'
      );
      expect(instagramSvg).toContain('#E4405F');
      
      // Discord uses #5865F2
      const discordSvg = exportSocialPoster(
        mockModules, 
        mockConnections, 
        mockAttributes, 
        'discord'
      );
      expect(discordSvg).toContain('#5865F2');
    });

    it('should have stroke-dasharray animation for social poster corners', () => {
      const svg = exportSocialPoster(
        mockModules, 
        mockConnections, 
        mockAttributes, 
        'twitter'
      );
      
      // Check for stroke-dasharray animation
      expect(svg).toContain('stroke-dasharray="80"');
      expect(svg).toContain('<animate attributeName="stroke-dashoffset"');
    });
  });
});

describe('Negative Assertions - AC1-AC6', () => {
  describe('Dimensions should NOT be incorrect', () => {
    it('Twitter should NOT produce 1080×1080 or 600×400', () => {
      const svg = exportSocialPoster(
        mockModules, 
        mockConnections, 
        mockAttributes, 
        'twitter'
      );
      
      // Should not contain wrong dimensions
      expect(svg).not.toContain('width="1080"');
      expect(svg).not.toContain('height="1080"');
      expect(svg).not.toContain('width="600"');
      expect(svg).not.toContain('height="400"');
    });

    it('Instagram should NOT produce 1200×675 or 600×400', () => {
      const svg = exportSocialPoster(
        mockModules, 
        mockConnections, 
        mockAttributes, 
        'instagram'
      );
      
      // Should not contain wrong dimensions
      expect(svg).not.toContain('width="1200"');
      expect(svg).not.toContain('height="675"');
      expect(svg).not.toContain('width="600"');
      expect(svg).not.toContain('height="400"');
    });

    it('Discord should NOT produce 1200×675 or 1080×1080', () => {
      const svg = exportSocialPoster(
        mockModules, 
        mockConnections, 
        mockAttributes, 
        'discord'
      );
      
      // Should not contain wrong dimensions
      expect(svg).not.toContain('width="1200"');
      expect(svg).not.toContain('height="675"');
      expect(svg).not.toContain('width="1080"');
      expect(svg).not.toContain('height="1080"');
    });
  });

  describe('Enhanced poster (non-social) should NOT include social features', () => {
    it('should NOT include platform badge', () => {
      const svg = exportEnhancedPoster(
        mockModules, 
        mockConnections, 
        mockAttributes, 
        'default'
      );
      
      // Should not have platform badges
      expect(svg).not.toContain('Twitter/X');
      expect(svg).not.toContain('Instagram');
      expect(svg).not.toContain('Discord');
    });

    it('should NOT include watermark when not provided', () => {
      const svg = exportEnhancedPoster(
        mockModules, 
        mockConnections, 
        mockAttributes, 
        'default',
        { username: undefined }
      );
      
      // Should not contain watermark elements
      expect(svg).not.toContain('@');
    });
  });

  describe('Regular poster should NOT include ornate decorations', () => {
    it('should NOT have stroke-dasharray animated corners', () => {
      const svg = exportPoster(
        mockModules, 
        mockConnections, 
        mockAttributes, 
        'default'
      );
      
      // Regular poster should not have animated corner flourishes
      expect(svg).not.toContain('stroke-dasharray="60"');
      expect(svg).not.toContain('stroke-dashoffset="60"');
    });
  });

  describe('SVG should remain valid with watermark enabled', () => {
    it('should have properly closed SVG tags', () => {
      const svg = exportEnhancedPoster(
        mockModules, 
        mockConnections, 
        mockAttributes, 
        'default',
        { username: 'ValidSVGTest' }
      );
      
      // Check for proper SVG structure
      expect(svg).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('<defs>');
      expect(svg).toContain('</defs>');
    });

    it('should have matching open/close tags', () => {
      const svg = exportSocialPoster(
        mockModules, 
        mockConnections, 
        mockAttributes, 
        'twitter',
        { username: 'TagTest' }
      );
      
      // Count open and close tags
      const openG = (svg.match(/<g/g) || []).length;
      const closeG = (svg.match(/<\/g>/g) || []).length;
      expect(openG).toBe(closeG);
      
      const openRect = (svg.match(/<rect/g) || []).length;
      const closeRect = (svg.match(/<\/rect>/g) || []).length;
      // Note: self-closing rects don't have </rect>, so we check differently
      expect(svg).not.toContain('</rect');
    });
  });
});

describe('Backward Compatibility', () => {
  it('exportEnhancedPoster should work without options parameter', () => {
    const svg = exportEnhancedPoster(
      mockModules, 
      mockConnections, 
      mockAttributes, 
      'default'
    );
    
    expect(svg).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(svg).toContain('width="600"');
  });

  it('exportPoster should still work for existing functionality', () => {
    const svg = exportPoster(
      mockModules, 
      mockConnections, 
      mockAttributes, 
      'default'
    );
    
    expect(svg).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(svg).toContain('ARCANE MACHINE CODEX');
    expect(svg).toContain('Test Arcane Machine');
  });

  it('all aspect ratios should still work for enhanced poster', () => {
    const ratios: ('default' | 'square' | 'portrait' | 'landscape')[] = ['default', 'square', 'portrait', 'landscape'];
    
    ratios.forEach(ratio => {
      const svg = exportEnhancedPoster(
        mockModules, 
        mockConnections, 
        mockAttributes, 
        ratio
      );
      
      expect(svg).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    });
  });
});

describe('sanitizeFilename', () => {
  it('should convert to lowercase', () => {
    expect(sanitizeFilename('TEST-FILE')).toBe('test-file');
  });

  it('should replace special characters with hyphens', () => {
    expect(sanitizeFilename('test@#$%file')).toBe('test-file');
  });

  it('should collapse consecutive hyphens', () => {
    expect(sanitizeFilename('test---file')).toBe('test-file');
  });

  it('should trim leading and trailing hyphens', () => {
    expect(sanitizeFilename('-test-file-')).toBe('test-file');
  });
});
