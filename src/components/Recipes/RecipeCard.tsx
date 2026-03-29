import React from 'react';
import { Recipe, RARITY_COLORS } from '../../types/recipes';
import { ModulePreview } from '../Modules/ModulePreview';

interface RecipeCardProps {
  recipe: Recipe;
  isUnlocked: boolean;
  onClick?: () => void;
  showHint?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  isUnlocked,
  onClick,
  showHint = true,
}) => {
  const rarityStyle = RARITY_COLORS[recipe.rarity];
  
  return (
    <div
      className={`
        relative rounded-lg overflow-hidden cursor-pointer
        transition-all duration-300 ease-out
        ${isUnlocked 
          ? 'bg-gray-900/80 border-2 hover:scale-105 hover:shadow-lg' 
          : 'bg-gray-800/50 border border-gray-700 opacity-60 hover:opacity-80'
        }
      `}
      style={{
        borderColor: isUnlocked ? rarityStyle.primary : undefined,
        boxShadow: isUnlocked ? `0 0 20px ${rarityStyle.glow}` : undefined,
      }}
      onClick={onClick}
    >
      {/* Rarity badge */}
      <div
        className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider"
        style={{
          backgroundColor: `${rarityStyle.primary}20`,
          color: rarityStyle.primary,
          border: `1px solid ${rarityStyle.primary}40`,
        }}
      >
        {recipe.rarity}
      </div>
      
      {/* Module preview or lock icon */}
      <div className="h-32 flex items-center justify-center bg-gray-900/50">
        {isUnlocked ? (
          recipe.moduleType ? (
            <div className="scale-75">
              <ModulePreview type={recipe.moduleType} isActive={true} />
            </div>
          ) : (
            <div className="w-16 h-16 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-12 h-12"
                fill="none"
                stroke={rarityStyle.primary}
                strokeWidth="1.5"
              >
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
          )
        ) : (
          <div className="w-16 h-16 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Recipe info */}
      <div className="p-3">
        <h4 
          className="font-bold text-sm mb-1 truncate"
          style={{ color: isUnlocked ? rarityStyle.primary : '#9CA3AF' }}
        >
          {recipe.name}
        </h4>
        
        {isUnlocked ? (
          <p className="text-xs text-gray-400 line-clamp-2">
            {recipe.description}
          </p>
        ) : showHint ? (
          <p className="text-xs text-gray-500 italic">
            {recipe.hint}
          </p>
        ) : (
          <p className="text-xs text-gray-600">
            Complete conditions to unlock
          </p>
        )}
        
        {/* Unlock condition */}
        {isUnlocked && (
          <div className="mt-2 pt-2 border-t border-gray-700/50">
            <span className="text-xs text-gray-500">
              {recipe.unlockCondition.description}
            </span>
          </div>
        )}
      </div>
      
      {/* Glow effect on hover for unlocked */}
      {isUnlocked && (
        <div
          className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${rarityStyle.glow}, transparent 70%)`,
          }}
        />
      )}
    </div>
  );
};

export default RecipeCard;
