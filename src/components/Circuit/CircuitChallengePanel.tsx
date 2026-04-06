/**
 * Circuit Challenge Panel
 * 
 * Round 175: Circuit Challenge System Integration
 * 
 * This panel displays circuit challenges that players can solve using
 * the circuit canvas. Features challenge list, detail view, and
 * validation feedback.
 */

import { useState, useCallback, useMemo } from 'react';
import {
  CIRCUIT_CHALLENGES,
  getCircuitChallengeDifficultyLabel,
  getCircuitChallengeCount,
  CircuitChallengeDifficulty,
} from '../../data/circuitChallenges';
import { useCircuitChallengeStore } from '../../store/useCircuitChallengeStore';
import { useChallengeStore } from '../../store/useChallengeStore';
import { useCircuitCanvasStore } from '../../store/useCircuitCanvasStore';
import { validateCircuit } from '../../utils/challengeValidator';
import { CircuitValidationData } from '../../types/challenge';

/**
 * Difficulty filter type
 */
type DifficultyFilter = 'all' | CircuitChallengeDifficulty;

/**
 * Circuit Challenge Panel Component
 */
export function CircuitChallengePanel() {
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [validationSuccess, setValidationSuccess] = useState<boolean | null>(null);

  // Store hooks
  const {
    isChallengeMode,
    activeChallengeId,
    isPanelOpen,
    closePanel,
    startChallenge,
    exitChallenge,
    isChallengeCompleted,
    getAllChallenges,
  } = useCircuitChallengeStore();

  const { claimReward } = useChallengeStore();
  
  // Filter challenges by difficulty
  const filteredChallenges = useMemo(() => {
    if (difficultyFilter === 'all') {
      return getAllChallenges();
    }
    return getAllChallenges().filter(c => c.difficulty === difficultyFilter);
  }, [difficultyFilter, getAllChallenges]);

  // Get selected challenge
  const selectedChallenge = useMemo(() => {
    if (!selectedChallengeId) return null;
    return CIRCUIT_CHALLENGES.find(c => c.id === selectedChallengeId) || null;
  }, [selectedChallengeId]);

  // Handle challenge selection
  const handleSelectChallenge = useCallback((challengeId: string) => {
    setSelectedChallengeId(challengeId);
    setValidationMessage(null);
    setValidationSuccess(null);
  }, []);

  // Handle start challenge
  const handleStartChallenge = useCallback((challengeId: string) => {
    const success = startChallenge(challengeId);
    if (success) {
      setSelectedChallengeId(challengeId);
      setValidationMessage(null);
      setValidationSuccess(null);
    }
  }, [startChallenge]);

  // Handle test circuit
  const handleTestCircuit = useCallback(() => {
    if (!activeChallengeId) {
      setValidationMessage('没有活动的挑战');
      setValidationSuccess(false);
      return;
    }

    const challenge = CIRCUIT_CHALLENGES.find(c => c.id === activeChallengeId);
    if (!challenge) {
      setValidationMessage('找不到挑战');
      setValidationSuccess(false);
      return;
    }

    // Build circuit validation data from current canvas state
    const canvasStore = useCircuitCanvasStore.getState();
    const outputNodes = canvasStore.nodes.filter((n: { type: string }) => n.type === 'output');
    
    // Build outputs map
    const outputs: Record<string, boolean> = {};
    outputNodes.forEach((node: { id: string; inputSignal?: boolean; signal?: boolean }) => {
      outputs[node.id] = node.inputSignal || node.signal || false;
    });

    const circuitData: CircuitValidationData = {
      id: activeChallengeId,
      name: challenge.title,
      components: canvasStore.nodes.map((n: { id: string; type: string; position: { x: number; y: number }; gateType?: string }) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        parameters: n.gateType ? { gateType: n.gateType } : undefined,
      })),
      outputs,
    };

    // Run validation
    const result = validateCircuit(challenge.objectives, circuitData);

    if (result.isSuccess) {
      setValidationMessage('🎉 挑战完成！所有目标达成！');
      setValidationSuccess(true);
      
      // Mark challenge as completed
      const store = useCircuitChallengeStore.getState();
      store.markChallengeCompleted(activeChallengeId);
      
      // Claim reward via useChallengeStore
      claimReward(activeChallengeId);
    } else {
      const failedObjectives = result.objectiveResults.filter(r => !r.passed);
      const failedNames = failedObjectives.map(r => r.message).join('；');
      setValidationMessage(`❌ 挑战失败：${failedNames}`);
      setValidationSuccess(false);
    }
  }, [activeChallengeId, claimReward]);

  // Handle exit challenge
  const handleExitChallenge = useCallback(() => {
    exitChallenge();
    setValidationMessage(null);
    setValidationSuccess(null);
  }, [exitChallenge]);

  // Get difficulty badge color
  const getDifficultyBadgeColor = (difficulty: CircuitChallengeDifficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'intermediate':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'advanced':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
    }
  };

  // Get completed count
  const completedCount = CIRCUIT_CHALLENGES.filter(c => isChallengeCompleted(c.id)).length;
  const totalCount = getCircuitChallengeCount();

  // If panel is closed, don't Render
  if (!isPanelOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-y-0 right-0 w-96 bg-[#0a0e17] border-l border-[#1e2a42] flex flex-col z-50 shadow-xl"
      data-testid="circuit-challenge-panel"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#1e2a42] bg-[#121826]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-[#00d4ff] flex items-center gap-2">
            <span>🎯</span>
            <span>电路挑战</span>
          </h2>
          <button
            onClick={closePanel}
            className="p-1 text-[#9ca3af] hover:text-white transition-colors"
            aria-label="关闭面板"
            data-testid="close-panel-button"
          >
            ✕
          </button>
        </div>
        
        {/* Progress */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#9ca3af]">完成进度：</span>
          <span className="text-[#22c55e] font-medium">{completedCount}/{totalCount}</span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-2 bg-[#1e2a42] rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-gradient-to-r from-[#00d4ff] to-[#22c55e] transition-all duration-300"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Challenge Mode Active Banner */}
      {isChallengeMode && activeChallengeId && (
        <div className="px-4 py-2 bg-[#f59e0b]/10 border-b border-[#f59e0b]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[#f59e0b]">⚡</span>
              <span className="text-sm text-[#f59e0b] font-medium">
                {CIRCUIT_CHALLENGES.find(c => c.id === activeChallengeId)?.title}
              </span>
            </div>
            <button
              onClick={handleExitChallenge}
              className="px-2 py-1 text-xs rounded bg-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/30 transition-colors"
            >
              退出挑战
            </button>
          </div>
        </div>
      )}

      {/* Difficulty Filter */}
      <div className="flex gap-2 px-4 py-2 border-b border-[#1e2a42]">
        {(['all', 'beginner', 'intermediate', 'advanced'] as DifficultyFilter[]).map((diff) => (
          <button
            key={diff}
            onClick={() => setDifficultyFilter(diff)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              difficultyFilter === diff
                ? diff === 'all'
                  ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/50'
                  : getDifficultyBadgeColor(diff)
                : 'bg-[#1e2a42]/50 text-[#9ca3af] hover:text-white'
            }`}
          >
            {diff === 'all' ? '全部' : getCircuitChallengeDifficultyLabel(diff)}
          </button>
        ))}
      </div>

      {/* Challenge List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChallenges.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#4a5568] p-4">
            <span className="text-4xl mb-2">📭</span>
            <p className="text-sm">没有符合条件的挑战</p>
          </div>
        ) : (
          <ul className="p-2 space-y-2" role="list">
            {filteredChallenges.map((challenge) => {
              const isCompleted = isChallengeCompleted(challenge.id);
              const isSelected = selectedChallengeId === challenge.id;
              const isActive = activeChallengeId === challenge.id;

              return (
                <li key={challenge.id}>
                  <button
                    onClick={() => handleSelectChallenge(challenge.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-[#00d4ff]/10 border-[#00d4ff]/50'
                        : 'bg-[#1a2235] border-[#2d3a4f] hover:border-[#4a5568]'
                    } ${isActive ? 'ring-2 ring-[#f59e0b]' : ''}`}
                    data-testid={`challenge-item-${challenge.id}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {isCompleted && (
                          <span className="text-[#22c55e]" title="已完成">✓</span>
                        )}
                        <h3 className={`font-medium ${isCompleted ? 'text-[#9ca3af]' : 'text-white'}`}>
                          {challenge.title}
                        </h3>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-xs rounded border ${getDifficultyBadgeColor(challenge.difficulty)}`}
                      >
                        {getCircuitChallengeDifficultyLabel(challenge.difficulty)}
                      </span>
                    </div>
                    <p className="text-xs text-[#9ca3af] line-clamp-2">
                      {challenge.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-[#4a5568]">
                      <span>⚙️ 约 {challenge.estimatedGateCount} 个门</span>
                      <span>•</span>
                      <span>🏆 {challenge.totalPoints} 分</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Challenge Detail / Action Area */}
      <div className="border-t border-[#1e2a42] bg-[#121826]">
        {selectedChallenge ? (
          <div className="p-4">
            {/* Challenge Info */}
            <div className="mb-4">
              <h3 className="font-medium text-white mb-2">{selectedChallenge.title}</h3>
              <p className="text-sm text-[#9ca3af] mb-3">{selectedChallenge.description}</p>
              
              {/* Objectives */}
              <div className="mb-3">
                <h4 className="text-xs font-medium text-[#9ca3af] mb-1">目标：</h4>
                <ul className="space-y-1">
                  {selectedChallenge.objectives.map((obj) => (
                    <li key={obj.id} className="text-xs text-[#6b7280] flex items-center gap-2">
                      <span className="text-[#00d4ff]">•</span>
                      {obj.description}
                      <span className="text-[#f59e0b]">({obj.points}分)</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hint */}
              <div className="p-2 bg-[#1e2a42]/50 rounded text-xs text-[#9ca3af] italic">
                💡 {selectedChallenge.hint}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {isChallengeMode && activeChallengeId === selectedChallenge.id ? (
                <>
                  <button
                    onClick={handleTestCircuit}
                    className="flex-1 px-4 py-2 rounded-lg bg-[#22c55e] text-white hover:bg-[#16a34a] transition-colors font-medium text-sm"
                    data-testid="test-circuit-button"
                  >
                    测试电路
                  </button>
                  <button
                    onClick={handleExitChallenge}
                    className="px-4 py-2 rounded-lg bg-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/30 transition-colors font-medium text-sm"
                  >
                    退出
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleStartChallenge(selectedChallenge.id)}
                  className="flex-1 px-4 py-2 rounded-lg bg-[#00d4ff] text-white hover:bg-[#0891b2] transition-colors font-medium text-sm"
                  data-testid="start-challenge-button"
                >
                  {isChallengeCompleted(selectedChallenge.id) ? '重新挑战' : '开始挑战'}
                </button>
              )}
            </div>

            {/* Validation Feedback */}
            {validationMessage && (
              <div
                className={`mt-3 p-2 rounded text-sm ${
                  validationSuccess
                    ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/50'
                    : 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/50'
                }`}
                data-testid="validation-feedback"
              >
                {validationMessage}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 text-center text-[#4a5568] text-sm">
            选择一个挑战查看详情
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Circuit Challenge Toolbar Button
 * Add this button to the circuit toolbar
 */
export function CircuitChallengeToolbarButton() {
  const { togglePanel, isChallengeMode, activeChallengeId } = useCircuitChallengeStore();
  
  const activeChallenge = activeChallengeId
    ? CIRCUIT_CHALLENGES.find(c => c.id === activeChallengeId)
    : null;

  return (
    <button
      onClick={togglePanel}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
        isChallengeMode
          ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/50'
          : 'bg-[#1e2a42] text-[#9ca3af] hover:text-white hover:bg-[#2d3a4f]'
      }`}
      title="电路挑战"
      data-testid="circuit-challenges-button"
    >
      <span>🎯</span>
      <span>挑战</span>
      {isChallengeMode && activeChallenge && (
        <span className="text-xs truncate max-w-20">
          {activeChallenge.title}
        </span>
      )}
    </button>
  );
}

export default CircuitChallengePanel;
