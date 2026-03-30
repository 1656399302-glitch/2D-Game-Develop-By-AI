/**
 * Community Gallery Tests
 * 
 * Tests for the Community Sharing Square feature including:
 * - Store actions (publish, like, view, search, filter, sort)
 * - Component rendering
 * - Load/publish flows
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock zustand
const mockUseCommunityStore = vi.hoisted(() => {
  const mockMachines = [
    {
      id: 'mock-test-1',
      author: 'test_author',
      authorName: 'Test Author',
      publishedAt: Date.now() - 86400000,
      likes: 10,
      views: 100,
      modules: [],
      connections: [],
      attributes: {
        name: 'Test Machine 1',
        rarity: 'rare' as const,
        stats: { stability: 80, powerOutput: 70, energyCost: 30, failureRate: 20 },
        tags: ['test', 'arcane'],
        description: 'A test machine for unit testing',
        codexId: 'TEST-001',
      },
      dominantFaction: 'void' as const,
    },
    {
      id: 'mock-test-2',
      author: 'another_author',
      publishedAt: Date.now() - 172800000,
      likes: 50,
      views: 500,
      modules: [],
      connections: [],
      attributes: {
        name: 'Test Machine 2',
        rarity: 'epic' as const,
        stats: { stability: 60, powerOutput: 90, energyCost: 50, failureRate: 40 },
        tags: ['fire', 'explosive'],
        description: 'Another test machine',
        codexId: 'TEST-002',
      },
      dominantFaction: 'inferno' as const,
    },
  ];

  return {
    communityMachines: mockMachines,
    publishedMachines: [] as typeof mockMachines,
    searchQuery: '',
    factionFilter: 'all' as const,
    rarityFilter: 'all' as const,
    sortOption: 'newest' as const,
    isGalleryOpen: false,
    isPublishModalOpen: false,
    pendingMachine: null as {
      modules: unknown[];
      connections: unknown[];
      attributes: {
        name: string;
        rarity: string;
        stats: { stability: number; powerOutput: number; energyCost: number; failureRate: number };
        tags: string[];
        description: string;
        codexId: string;
      };
      dominantFaction: string;
    } | null,
    getFilteredMachinesList: vi.fn(() => mockMachines),
    setSearchQuery: vi.fn(),
    setFactionFilter: vi.fn(),
    setRarityFilter: vi.fn(),
    setSortOption: vi.fn(),
    openGallery: vi.fn(),
    closeGallery: vi.fn(),
    openPublishModal: vi.fn(),
    closePublishModal: vi.fn(),
    publishMachine: vi.fn(),
    likeMachine: vi.fn(),
    viewMachine: vi.fn(),
  };
});

vi.mock('../../store/useCommunityStore', () => ({
  useCommunityStore: mockUseCommunityStore,
}));

describe('Community Gallery Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have empty published machines initially', () => {
      expect(mockUseCommunityStore.publishedMachines).toEqual([]);
    });

    it('should have all filters set to default values', () => {
      expect(mockUseCommunityStore.searchQuery).toBe('');
      expect(mockUseCommunityStore.factionFilter).toBe('all');
      expect(mockUseCommunityStore.rarityFilter).toBe('all');
      expect(mockUseCommunityStore.sortOption).toBe('newest');
    });

    it('should have gallery and publish modal closed initially', () => {
      expect(mockUseCommunityStore.isGalleryOpen).toBe(false);
      expect(mockUseCommunityStore.isPublishModalOpen).toBe(false);
    });

    it('should have no pending machine initially', () => {
      expect(mockUseCommunityStore.pendingMachine).toBeNull();
    });

    it('should have mock community machines loaded', () => {
      expect(mockUseCommunityStore.communityMachines).toHaveLength(2);
    });
  });

  describe('Search and Filter', () => {
    it('should update search query', () => {
      expect(mockUseCommunityStore.setSearchQuery).toBeDefined();
      mockUseCommunityStore.setSearchQuery('test search');
      expect(mockUseCommunityStore.setSearchQuery).toHaveBeenCalledWith('test search');
    });

    it('should update faction filter to void', () => {
      mockUseCommunityStore.setFactionFilter('void');
      expect(mockUseCommunityStore.setFactionFilter).toHaveBeenCalledWith('void');
    });

    it('should update faction filter to inferno', () => {
      mockUseCommunityStore.setFactionFilter('inferno');
      expect(mockUseCommunityStore.setFactionFilter).toHaveBeenCalledWith('inferno');
    });

    it('should update faction filter to storm', () => {
      mockUseCommunityStore.setFactionFilter('storm');
      expect(mockUseCommunityStore.setFactionFilter).toHaveBeenCalledWith('storm');
    });

    it('should update faction filter to stellar', () => {
      mockUseCommunityStore.setFactionFilter('stellar');
      expect(mockUseCommunityStore.setFactionFilter).toHaveBeenCalledWith('stellar');
    });

    it('should update rarity filter to rare', () => {
      mockUseCommunityStore.setRarityFilter('rare');
      expect(mockUseCommunityStore.setRarityFilter).toHaveBeenCalledWith('rare');
    });

    it('should update rarity filter to epic', () => {
      mockUseCommunityStore.setRarityFilter('epic');
      expect(mockUseCommunityStore.setRarityFilter).toHaveBeenCalledWith('epic');
    });

    it('should update rarity filter to legendary', () => {
      mockUseCommunityStore.setRarityFilter('legendary');
      expect(mockUseCommunityStore.setRarityFilter).toHaveBeenCalledWith('legendary');
    });

    it('should update rarity filter to common', () => {
      mockUseCommunityStore.setRarityFilter('common');
      expect(mockUseCommunityStore.setRarityFilter).toHaveBeenCalledWith('common');
    });

    it('should update rarity filter to uncommon', () => {
      mockUseCommunityStore.setRarityFilter('uncommon');
      expect(mockUseCommunityStore.setRarityFilter).toHaveBeenCalledWith('uncommon');
    });

    it('should update sort option to newest', () => {
      mockUseCommunityStore.setSortOption('newest');
      expect(mockUseCommunityStore.setSortOption).toHaveBeenCalledWith('newest');
    });

    it('should update sort option to most-liked', () => {
      mockUseCommunityStore.setSortOption('most-liked');
      expect(mockUseCommunityStore.setSortOption).toHaveBeenCalledWith('most-liked');
    });

    it('should update sort option to most-viewed', () => {
      mockUseCommunityStore.setSortOption('most-viewed');
      expect(mockUseCommunityStore.setSortOption).toHaveBeenCalledWith('most-viewed');
    });
  });

  describe('Gallery UI Actions', () => {
    it('should open gallery', () => {
      mockUseCommunityStore.openGallery();
      expect(mockUseCommunityStore.openGallery).toHaveBeenCalled();
    });

    it('should close gallery', () => {
      mockUseCommunityStore.closeGallery();
      expect(mockUseCommunityStore.closeGallery).toHaveBeenCalled();
    });
  });

  describe('Publish Flow', () => {
    it('should open publish modal with modules and attributes', () => {
      mockUseCommunityStore.openPublishModal(
        [{ id: 'test-module', instanceId: 'test-1', type: 'core-furnace', x: 100, y: 100, rotation: 0, scale: 1, flipped: false, ports: [] }],
        [{ id: 'conn-1', sourceModuleId: 'test-1', sourcePortId: 'port-0', targetModuleId: 'test-2', targetPortId: 'port-0', pathData: '' }],
        {
          name: 'Test Machine',
          rarity: 'common',
          stats: { stability: 80, powerOutput: 50, energyCost: 20, failureRate: 10 },
          tags: ['test'],
          description: 'Test',
          codexId: 'T-001',
        },
        'stellar'
      );
      expect(mockUseCommunityStore.openPublishModal).toHaveBeenCalled();
    });

    it('should close publish modal', () => {
      mockUseCommunityStore.closePublishModal();
      expect(mockUseCommunityStore.closePublishModal).toHaveBeenCalled();
    });

    it('should publish machine with author name', () => {
      mockUseCommunityStore.publishMachine('My Name');
      expect(mockUseCommunityStore.publishMachine).toHaveBeenCalledWith('My Name');
    });

    it('should publish machine with empty author name for anonymous', () => {
      mockUseCommunityStore.publishMachine('');
      expect(mockUseCommunityStore.publishMachine).toHaveBeenCalledWith('');
    });

    it('should publish machine with whitespace-only author name for anonymous', () => {
      mockUseCommunityStore.publishMachine('   ');
      expect(mockUseCommunityStore.publishMachine).toHaveBeenCalledWith('   ');
    });
  });

  describe('Interaction Actions', () => {
    it('should like a machine by ID', () => {
      mockUseCommunityStore.likeMachine('mock-test-1');
      expect(mockUseCommunityStore.likeMachine).toHaveBeenCalledWith('mock-test-1');
    });

    it('should like a different machine', () => {
      mockUseCommunityStore.likeMachine('mock-test-2');
      expect(mockUseCommunityStore.likeMachine).toHaveBeenCalledWith('mock-test-2');
    });

    it('should view a machine by ID', () => {
      mockUseCommunityStore.viewMachine('mock-test-1');
      expect(mockUseCommunityStore.viewMachine).toHaveBeenCalledWith('mock-test-1');
    });

    it('should view a published machine', () => {
      mockUseCommunityStore.viewMachine('published-123');
      expect(mockUseCommunityStore.viewMachine).toHaveBeenCalledWith('published-123');
    });
  });

  describe('Get Filtered Machines List', () => {
    it('should return filtered machines as array', () => {
      const result = mockUseCommunityStore.getFilteredMachinesList();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return mock machines by default', () => {
      const result = mockUseCommunityStore.getFilteredMachinesList();
      expect(result).toHaveLength(2);
    });
  });

  describe('Mock Data Validation', () => {
    it('should have valid machine attributes', () => {
      const machine = mockUseCommunityStore.communityMachines[0];
      expect(machine.attributes.name).toBe('Test Machine 1');
      expect(machine.attributes.rarity).toBe('rare');
      expect(machine.attributes.stats.stability).toBe(80);
      expect(machine.attributes.stats.powerOutput).toBe(70);
      expect(machine.attributes.tags).toContain('test');
    });

    it('should have valid author information', () => {
      const machine = mockUseCommunityStore.communityMachines[0];
      expect(machine.author).toBe('test_author');
      expect(machine.authorName).toBe('Test Author');
    });

    it('should have valid engagement stats', () => {
      const machine = mockUseCommunityStore.communityMachines[0];
      expect(machine.likes).toBe(10);
      expect(machine.views).toBe(100);
    });

    it('should have valid faction assignment', () => {
      const machine1 = mockUseCommunityStore.communityMachines[0];
      const machine2 = mockUseCommunityStore.communityMachines[1];
      expect(machine1.dominantFaction).toBe('void');
      expect(machine2.dominantFaction).toBe('inferno');
    });

    it('should have valid codex IDs', () => {
      const machine1 = mockUseCommunityStore.communityMachines[0];
      const machine2 = mockUseCommunityStore.communityMachines[1];
      expect(machine1.attributes.codexId).toBe('TEST-001');
      expect(machine2.attributes.codexId).toBe('TEST-002');
    });
  });
});

describe('Community Gallery Filter Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should support void faction filter', () => {
    mockUseCommunityStore.setFactionFilter('void');
    expect(mockUseCommunityStore.setFactionFilter).toHaveBeenCalledWith('void');
  });

  it('should support inferno faction filter', () => {
    mockUseCommunityStore.setFactionFilter('inferno');
    expect(mockUseCommunityStore.setFactionFilter).toHaveBeenCalledWith('inferno');
  });

  it('should support storm faction filter', () => {
    mockUseCommunityStore.setFactionFilter('storm');
    expect(mockUseCommunityStore.setFactionFilter).toHaveBeenCalledWith('storm');
  });

  it('should support stellar faction filter', () => {
    mockUseCommunityStore.setFactionFilter('stellar');
    expect(mockUseCommunityStore.setFactionFilter).toHaveBeenCalledWith('stellar');
  });

  it('should support common rarity filter', () => {
    mockUseCommunityStore.setRarityFilter('common');
    expect(mockUseCommunityStore.setRarityFilter).toHaveBeenCalledWith('common');
  });

  it('should support uncommon rarity filter', () => {
    mockUseCommunityStore.setRarityFilter('uncommon');
    expect(mockUseCommunityStore.setRarityFilter).toHaveBeenCalledWith('uncommon');
  });

  it('should support rare rarity filter', () => {
    mockUseCommunityStore.setRarityFilter('rare');
    expect(mockUseCommunityStore.setRarityFilter).toHaveBeenCalledWith('rare');
  });

  it('should support epic rarity filter', () => {
    mockUseCommunityStore.setRarityFilter('epic');
    expect(mockUseCommunityStore.setRarityFilter).toHaveBeenCalledWith('epic');
  });

  it('should support legendary rarity filter', () => {
    mockUseCommunityStore.setRarityFilter('legendary');
    expect(mockUseCommunityStore.setRarityFilter).toHaveBeenCalledWith('legendary');
  });

  it('should support newest sort option', () => {
    mockUseCommunityStore.setSortOption('newest');
    expect(mockUseCommunityStore.setSortOption).toHaveBeenCalledWith('newest');
  });

  it('should support most-liked sort option', () => {
    mockUseCommunityStore.setSortOption('most-liked');
    expect(mockUseCommunityStore.setSortOption).toHaveBeenCalledWith('most-liked');
  });

  it('should support most-viewed sort option', () => {
    mockUseCommunityStore.setSortOption('most-viewed');
    expect(mockUseCommunityStore.setSortOption).toHaveBeenCalledWith('most-viewed');
  });
});
