/**
 * Tech Tree Panel Component
 * 
 * Panel container for the tech tree, integrated into the app layout.
 * Displays the tech tree visualization and node details panel.
 * 
 * ROUND 136: Initial implementation
 */

import React, { useState, useEffect } from 'react';
import { TechTreeCanvas } from './TechTreeCanvas';
import { useTechTreeStore } from '../../store/useTechTreeStore';
import { TECH_TREE_CATEGORIES } from '../../types/techTree';
import { getNodeById } from '../../data/techTreeNodes';

interface TechTreePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TechTreePanel: React.FC<TechTreePanelProps> = ({ isOpen, onClose }) => {
  const selectedNodeId = useTechTreeStore((state) => state.selectedNodeId);
  const getUnmetPrerequisites = useTechTreeStore((state) => state.getUnmetPrerequisites);
  const isNodeUnlocked = useTechTreeStore((state) => state.isNodeUnlocked);
  const getUnlockedNodeIds = useTechTreeStore((state) => state.getUnlockedNodeIds);
  const nodes = useTechTreeStore((state) => state.nodes);
  
  const [infoPanelContent, setInfoPanelContent] = useState<{
    name: string;
    nameCn: string;
    description: string;
    category: string;
    categoryColor: string;
    isUnlocked: boolean;
    unmetPrerequisites: string[];
    prereqNames: string[];
  } | null>(null);
  
  // Update info panel when selected node changes
  useEffect(() => {
    if (!selectedNodeId) {
      setInfoPanelContent(null);
      return;
    }
    
    const node = getNodeById(selectedNodeId);
    if (!node) {
      setInfoPanelContent(null);
      return;
    }
    
    const categoryInfo = TECH_TREE_CATEGORIES[node.category];
    const unmetPrereqs = getUnmetPrerequisites(selectedNodeId);
    
    // Get prerequisite names
    const prereqNames = unmetPrereqs.map(prereqId => {
      const prereq = getNodeById(prereqId);
      return prereq?.name || prereqId;
    });
    
    setInfoPanelContent({
      name: node.name,
      nameCn: node.nameCn,
      description: node.description,
      category: categoryInfo?.name || node.category,
      categoryColor: categoryInfo?.color || '#00d4ff',
      isUnlocked: isNodeUnlocked(selectedNodeId),
      unmetPrerequisites: unmetPrereqs,
      prereqNames,
    });
  }, [selectedNodeId, getUnmetPrerequisites, isNodeUnlocked]);
  
  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  if (!isOpen) {
    return null;
  }
  
  const unlockedCount = getUnlockedNodeIds().length;
  const totalCount = nodes.length;
  const progressPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;
  
  return (
    <div
      className="
        fixed inset-0 z-[1050] flex items-center justify-center
        bg-black/80 backdrop-blur-sm
        overflow-y-auto
      "
      onClick={onClose}
      data-testid="tech-tree-panel"
    >
      <div
        className="
          relative w-full max-w-[1000px] mx-4 my-8
          bg-gradient-to-br from-[#1a1a2e] via-[#121826] to-[#0a0e17]
          rounded-2xl border border-[#7c3aed]/30
          shadow-2xl shadow-purple-900/20
          overflow-hidden
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#a78bfa] via-[#7c3aed] to-[#a78bfa]" />
        
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#7c3aed]/20 flex items-center justify-center text-xl">
                🌳
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">科技树</h2>
                <p className="text-sm text-[#9ca3af]">
                  电路组件解锁进度
                </p>
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1e2a42]/50">
                <span className="text-sm text-[#9ca3af]">解锁进度:</span>
                <span className="text-sm font-bold text-white">
                  {unlockedCount}/{totalCount}
                </span>
                <div className="w-20 h-2 bg-[#1e2a42] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#7c3aed] rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-[#6b7280] hover:text-white"
                  aria-label="关闭"
                  data-testid="tech-tree-close-button"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 5l10 10M15 5l-10 10" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Main content: Tech tree canvas and info panel */}
        <div className="px-6 pb-6">
          <div className="flex gap-6">
            {/* Tech tree canvas */}
            <div
              className="
                flex-1 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42]
                overflow-auto max-h-[600px]
              "
              data-testid="tech-tree-canvas-container"
            >
              <TechTreeCanvas />
            </div>
            
            {/* Info panel */}
            <div
              className="
                w-72 rounded-xl bg-[#0a0e17]/80 border border-[#1e2a42]
                p-4 flex flex-col
              "
              data-testid="tech-tree-info-panel"
            >
              {infoPanelContent ? (
                <>
                  {/* Node header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${infoPanelContent.categoryColor}20` }}
                    >
                      {nodes.find(n => n.name === infoPanelContent.name)?.icon || '?'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{infoPanelContent.name}</h3>
                      <p className="text-xs text-[#9ca3af]">{infoPanelContent.nameCn}</p>
                    </div>
                  </div>
                  
                  {/* Status badge */}
                  <div className="mb-3">
                    {infoPanelContent.isUnlocked ? (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}
                      >
                        <span>✓</span> 已解锁
                      </span>
                    ) : infoPanelContent.unmetPrerequisites.length === 0 ? (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: '#f59e0b20', color: '#f59e0b' }}
                      >
                        <span>!</span> 可解锁
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: '#6b728020', color: '#6b7280' }}
                      >
                        <span>🔒</span> 未解锁
                      </span>
                    )}
                  </div>
                  
                  {/* Category */}
                  <div className="mb-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${infoPanelContent.categoryColor}20`, color: infoPanelContent.categoryColor }}
                    >
                      {infoPanelContent.category}
                    </span>
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-[#9ca3af] mb-4 flex-1">
                    {infoPanelContent.description}
                  </p>
                  
                  {/* Prerequisites */}
                  {infoPanelContent.prereqNames.length > 0 && (
                    <div className="mt-auto">
                      <h4 className="text-xs font-medium text-[#6b7280] mb-2">
                        需要先解锁:
                      </h4>
                      <ul className="space-y-1">
                        {infoPanelContent.prereqNames.map((name, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-xs text-red-400"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            {name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Already unlocked message */}
                  {infoPanelContent.isUnlocked && (
                    <div className="mt-4 p-3 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/30">
                      <p className="text-xs text-[#22c55e]">
                        此组件已解锁，可用于电路设计。
                      </p>
                    </div>
                  )}
                </>
              ) : (
                /* No node selected */
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[#1e2a42]/50 flex items-center justify-center text-3xl mb-3">
                    👆
                  </div>
                  <p className="text-sm text-[#6b7280]">
                    点击科技树节点查看详情
                  </p>
                  <p className="text-xs text-[#4b5563] mt-1">
                    Click on a node to view details
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-6 p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42]">
            <h4 className="text-sm font-medium text-[#9ca3af] mb-3">节点状态</h4>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded tech-tree-node--locked bg-[#1e2a42] opacity-40" />
                <span className="text-xs text-[#6b7280]">未解锁 (Locked)</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded border-2 border-[#f59e0b]" 
                  style={{ backgroundColor: '#f59e0b20' }}
                />
                <span className="text-xs text-[#6b7280]">可解锁 (Available)</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded border-2 border-[#22c55e]" 
                  style={{ backgroundColor: '#22c55e20', boxShadow: '0 0 6px #22c55e40' }}
                />
                <span className="text-xs text-[#6b7280]">已解锁 (Unlocked)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechTreePanel;
