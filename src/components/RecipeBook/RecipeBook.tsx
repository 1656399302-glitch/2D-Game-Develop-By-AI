import { useState, useMemo } from 'react';
import { useRecipeStore } from '../../store/useRecipeStore';
import { RECIPE_DEFINITIONS, Recipe } from '../../data/recipes';
import { RecipeCard } from '../Recipes/RecipeCard';

interface RecipeBookProps {
  onClose?: () => void;
}

type FilterType = 'all' | 'unlocked' | 'locked';
type SortType = 'name' | 'rarity' | 'unlocked';

export function RecipeBook({ onClose }: RecipeBookProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('name');
  const [searchQuery, setSearchQuery] = useState('');

  const isUnlocked = useRecipeStore((state) => state.isUnlocked);
  const getUnlockedRecipes = useRecipeStore((state) => state.getUnlockedRecipes);
  const getLockedRecipes = useRecipeStore((state) => state.getLockedRecipes);

  const filteredRecipes = useMemo(() => {
    let result: Recipe[];

    // Apply filter
    if (filter === 'unlocked') {
      result = getUnlockedRecipes();
    } else if (filter === 'locked') {
      result = getLockedRecipes();
    } else {
      result = RECIPE_DEFINITIONS;
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query) ||
          (r.moduleType && r.moduleType.toLowerCase().includes(query))
      );
    }

    // Apply sort
    result = [...result].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'rarity') {
        const rarityOrder: Record<string, number> = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
        return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
      } else if (sortBy === 'unlocked') {
        const aUnlocked = isUnlocked(a.id);
        const bUnlocked = isUnlocked(b.id);
        if (aUnlocked && !bUnlocked) return -1;
        if (!aUnlocked && bUnlocked) return 1;
        return 0;
      }
      return 0;
    });

    return result;
  }, [filter, sortBy, searchQuery, getUnlockedRecipes, getLockedRecipes, isUnlocked]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  const unlockedCount = getUnlockedRecipes().length;
  const totalCount = RECIPE_DEFINITIONS.length;

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      data-testid="recipe-book-panel"
    >
      <div className="w-full max-w-4xl max-h-[85vh] bg-gradient-to-br from-[#1a1a2e] via-[#121826] to-[#0a0e17] rounded-2xl border border-[#7c3aed]/40 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a42]">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">📖</span>
              配方图鉴
            </h2>
            <span className="text-sm text-[#9ca3af]">
              {unlockedCount} / {totalCount} 已解锁
            </span>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#1e2a42] hover:bg-[#2d3a56] flex items-center justify-center text-[#9ca3af] hover:text-white transition-colors"
            aria-label="关闭配方图鉴"
            data-testid="recipe-book-close"
          >
            ✕
          </button>
        </div>

        {/* Filters and Search */}
        <div className="px-6 py-3 border-b border-[#1e2a42] bg-[#0a0e17]/50">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="搜索配方..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-[#1e2a42] border border-[#2d3a56] rounded-lg text-white placeholder-[#6b7280] focus:outline-none focus:border-[#7c3aed]"
                aria-label="搜索配方"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]">
                🔍
              </span>
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              {(['all', 'unlocked', 'locked'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    filter === f
                      ? 'bg-[#7c3aed] text-white'
                      : 'bg-[#1e2a42] text-[#9ca3af] hover:text-white'
                  }`}
                  data-testid={`recipe-book-filter-${f}`}
                >
                  {f === 'all' ? '全部' : f === 'unlocked' ? '已解锁' : '未解锁'}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="px-3 py-2 bg-[#1e2a42] border border-[#2d3a56] rounded-lg text-white focus:outline-none focus:border-[#7c3aed]"
              aria-label="排序方式"
              data-testid="recipe-book-sort"
            >
              <option value="name">名称排序</option>
              <option value="rarity">稀有度</option>
              <option value="unlocked">解锁状态</option>
            </select>
          </div>
        </div>

        {/* Recipe Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredRecipes.length === 0 ? (
            <div 
              className="flex flex-col items-center justify-center h-64 text-[#6b7280]"
              data-testid="recipe-empty-state"
            >
              <span className="text-4xl mb-4">📭</span>
              <p className="text-lg">没有找到配方</p>
              <p className="text-sm mt-2">尝试调整筛选条件或搜索词</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isUnlocked={isUnlocked(recipe.id)}
                  onClick={() => {}}
                  showHint={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="px-6 py-3 border-t border-[#1e2a42] bg-[#0a0e17]/50">
          <div className="flex items-center justify-between text-sm text-[#6b7280]">
            <span>
              显示 {filteredRecipes.length} 个配方
            </span>
            <span>
              解锁进度: {Math.round((unlockedCount / totalCount) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecipeBook;
