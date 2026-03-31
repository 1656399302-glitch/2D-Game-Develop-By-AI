/**
 * Trade Proposal Modal Component
 * 
 * Modal for creating a trade proposal.
 * User selects one of their listed machines to offer in exchange.
 */

import { useState, useMemo } from 'react';
import { useExchangeStore } from '../../store/useExchangeStore';
import { CommunityMachine } from '../../data/communityGalleryData';
import { Rarity } from '../../types';

interface TradeProposalModalProps {
  targetMachine: CommunityMachine;
  onClose: () => void;
}

export function TradeProposalModal({ targetMachine, onClose }: TradeProposalModalProps) {
  // State
  const [selectedMachineId, setSelectedMachineId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Store
  const getMyListedMachines = useExchangeStore((state) => state.getMyListedMachines);
  const createProposal = useExchangeStore((state) => state.createProposal);

  // Get listed machines
  const listedMachines = useMemo(() => getMyListedMachines(), []);

  // Get selected machine
  const selectedMachine = useMemo(
    () => listedMachines.find((m) => m.id === selectedMachineId),
    [listedMachines, selectedMachineId]
  );

  // Handle submit
  const handleSubmit = async () => {
    if (!selectedMachineId) return;

    setIsSubmitting(true);

    // Create proposal
    const proposal = createProposal(selectedMachineId, targetMachine);

    if (proposal) {
      // Show success state
      setSubmitted(true);

      // Auto close after success
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setIsSubmitting(false);
      alert('创建交易失败，请重试');
    }
  };

  // Rarity badge color
  const getRarityColor = (rarity: Rarity): string => {
    const colors: Record<Rarity, string> = {
      common: 'bg-gray-600/30 text-gray-300 border-gray-500/40',
      uncommon: 'bg-green-600/30 text-green-300 border-green-500/40',
      rare: 'bg-blue-600/30 text-blue-300 border-blue-500/40',
      epic: 'bg-purple-600/30 text-purple-300 border-purple-500/40',
      legendary: 'bg-amber-600/30 text-amber-300 border-amber-500/40',
    };
    return colors[rarity];
  };

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-gradient-to-br from-[#1a1a2e] via-[#121826] to-[#0a0e17] rounded-2xl border border-[#7c3aed]/40 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a42]">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚖</span>
            <h2 className="text-lg font-bold text-white">发起交易</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full bg-[#1e2a42] hover:bg-[#2d3a56] flex items-center justify-center text-[#9ca3af] hover:text-white transition-colors disabled:opacity-50"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {submitted ? (
            // Success State
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-lg font-medium text-white mb-2">交易请求已提交</h3>
              <p className="text-sm text-[#9ca3af]">
                你的交易请求正在等待处理...
              </p>
            </div>
          ) : (
            <>
              {/* Target Machine Display */}
              <div className="bg-[#22c55e]/10 rounded-xl p-4 border border-[#22c55e]/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#22c55e] text-sm">你将获得</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-medium text-white">
                      {targetMachine.attributes.name}
                    </div>
                    <div className="text-sm text-[#6b7280]">
                      {targetMachine.attributes.codexId}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm border ${getRarityColor(targetMachine.attributes.rarity)}`}>
                    {targetMachine.attributes.rarity}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-[#6b7280]">功率</div>
                    <div className="text-[#fbbf24]">{targetMachine.attributes.stats.powerOutput}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[#6b7280]">稳定性</div>
                    <div className="text-[#22c55e]">{targetMachine.attributes.stats.stability}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[#6b7280]">故障率</div>
                    <div className="text-[#ef4444]">{targetMachine.attributes.stats.failureRate}%</div>
                  </div>
                </div>
              </div>

              {/* Machine Selection */}
              <div>
                <label className="block text-sm font-medium text-[#9ca3af] mb-2">
                  选择你要提供的机器
                </label>
                <select
                  value={selectedMachineId}
                  onChange={(e) => setSelectedMachineId(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-lg bg-[#1e2a42] text-white border border-[#2d3a4f] focus:border-[#7c3aed] focus:outline-none"
                >
                  <option value="">请选择...</option>
                  {listedMachines.map((machine) => (
                    <option key={machine.id} value={machine.id}>
                      {machine.attributes.name} ({machine.attributes.rarity}) - {machine.codexId}
                    </option>
                  ))}
                </select>
                {listedMachines.length === 0 && (
                  <p className="mt-2 text-xs text-[#ef4444]">
                    你的图鉴中没有挂牌的机器。请先到"我的挂牌"挂牌机器。
                  </p>
                )}
              </div>

              {/* Selected Machine Preview */}
              {selectedMachine && (
                <div className="bg-[#7f1d1d]/10 rounded-xl p-4 border border-[#7f1d1d]/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#fca5a5] text-sm">你将给出</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-medium text-white">
                        {selectedMachine.attributes.name}
                      </div>
                      <div className="text-sm text-[#6b7280]">
                        {selectedMachine.codexId}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm border ${getRarityColor(selectedMachine.attributes.rarity)}`}>
                      {selectedMachine.attributes.rarity}
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-[#6b7280]">功率</div>
                      <div className="text-[#fbbf24]">{selectedMachine.attributes.stats.powerOutput}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[#6b7280]">稳定性</div>
                      <div className="text-[#22c55e]">{selectedMachine.attributes.stats.stability}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[#6b7280]">故障率</div>
                      <div className="text-[#ef4444]">{selectedMachine.attributes.stats.failureRate}%</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Comparison Info */}
              {selectedMachine && (
                <div className="bg-[#0a0e17]/50 rounded-lg p-3 border border-[#1e2a42]">
                  <p className="text-xs text-[#9ca3af] text-center">
                    确认交易后，你给出的机器将从你的图鉴中移除，
                    <br />
                    并获得目标机器的数据。
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!submitted && (
          <div className="px-6 py-4 border-t border-[#1e2a42] bg-[#0a0e17]/50 flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 rounded-lg bg-[#1e2a42] text-[#9ca3af] hover:text-white border border-[#2d3a4f] hover:border-[#4d5a6f] disabled:opacity-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedMachineId || isSubmitting}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-medium"
            >
              {isSubmitting ? '提交中...' : '确认交易'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TradeProposalModal;
