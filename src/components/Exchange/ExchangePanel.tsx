/**
 * Exchange Panel Component
 * 
 * Main modal for the Codex Exchange System with four tabs:
 * - My Listings: Machines marked as available for trade
 * - Incoming Offers: Proposals received from AI traders (demo)
 * - Browse Trades: Community machines available for trade
 * - Trade History: Completed trades
 * 
 * ROUND 120: Added Incoming Offers tab for simulated proposals from AI traders.
 */

import { useState, useMemo, lazy, Suspense, useEffect } from 'react';
import { useExchangeStore } from '../../store/useExchangeStore';
import { useCodexStore } from '../../store/useCodexStore';
import { useCommunityStore } from '../../store/useCommunityStore';
import { ExchangeTab, TradeFactionFilter, TradeRarityFilter } from '../../types/exchange';
import { CommunityMachine } from '../../data/communityGalleryData';
import { Rarity } from '../../types';
import { FactionId } from '../../types/factions';

// Lazy-loaded Trade Proposal Modal
const LazyTradeProposalModal = lazy(() =>
  import('./TradeProposalModal').then((m) => ({ default: m.TradeProposalModal }))
);

interface ExchangePanelProps {
  onClose: () => void;
}

// Countdown timer hook for proposals
function useCountdown(createdAt: number, durationMs: number = 60000) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const updateTimer = () => {
      const elapsed = Date.now() - createdAt;
      const remaining = Math.max(0, durationMs - elapsed);
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [createdAt, durationMs]);

  return timeLeft;
}

// Countdown display component
function CountdownDisplay({ createdAt, durationMs }: { createdAt: number; durationMs?: number }) {
  const timeLeft = useCountdown(createdAt, durationMs);
  const seconds = Math.ceil(timeLeft / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (timeLeft <= 0) {
    return <span className="text-xs text-[#ef4444]">已过期</span>;
  }

  return (
    <span className="text-xs text-[#fbbf24]">
      {minutes}:{remainingSeconds.toString().padStart(2, '0')}
    </span>
  );
}

// Incoming proposal card component
function IncomingProposalCard({
  proposal,
  onAccept,
  onReject,
}: {
  proposal: {
    id: string;
    proposerMachine: { attributes: { name: string; rarity: Rarity } };
    targetMachine: CommunityMachine;
    createdAt: number;
  };
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}) {
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

  const getFactionIcon = (faction: FactionId): string => {
    const icons: Record<FactionId, string> = {
      void: '🌑',
      inferno: '🔥',
      storm: '⚡',
      stellar: '✨',
      arcane: '🔮',
      chaos: '💀',
    };
    return icons[faction] || '⚙';
  };

  return (
    <div className="bg-[#0a0e17]/50 rounded-xl p-4 border border-[#7c3aed]/40 hover:border-[#7c3aed]/60 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <div>
            <div className="text-sm font-medium text-white">
              {proposal.proposerMachine.attributes.name}
            </div>
            <div className={`mt-1 px-2 py-0.5 rounded text-xs inline-block border ${getRarityColor(proposal.proposerMachine.attributes.rarity)}`}>
              {proposal.proposerMachine.attributes.rarity}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CountdownDisplay createdAt={proposal.createdAt} />
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 text-center">
          <div className="text-xs text-[#6b7280] mb-1">对方提供</div>
          <div className={`px-2 py-1 rounded border ${getRarityColor(proposal.proposerMachine.attributes.rarity)}`}>
            <span className="text-xs">{proposal.proposerMachine.attributes.name}</span>
          </div>
        </div>
        <div className="text-[#7c3aed] text-xl">⇄</div>
        <div className="flex-1 text-center">
          <div className="text-xs text-[#6b7280] mb-1">交换</div>
          <div className={`px-2 py-1 rounded border ${getRarityColor(proposal.targetMachine.attributes.rarity)}`}>
            <div className="flex items-center justify-center gap-1">
              <span className="text-xs">{getFactionIcon(proposal.targetMachine.dominantFaction)}</span>
              <span className="text-xs">{proposal.targetMachine.attributes.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-[#6b7280] mb-3 text-center">
        来自社区机器: {proposal.targetMachine.attributes.codexId}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onAccept(proposal.id)}
          className="flex-1 px-3 py-2 rounded-lg bg-[#22c55e]/20 text-[#22c55e] hover:bg-[#22c55e]/30 border border-[#22c55e]/40 transition-colors text-sm font-medium"
        >
          接受
        </button>
        <button
          onClick={() => onReject(proposal.id)}
          className="flex-1 px-3 py-2 rounded-lg bg-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/30 border border-[#ef4444]/40 transition-colors text-sm font-medium"
        >
          拒绝
        </button>
      </div>
    </div>
  );
}

export function ExchangePanel({ onClose }: ExchangePanelProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<ExchangeTab>('my-listings');

  // Filter state for Browse Trades
  const [factionFilter, setFactionFilter] = useState<TradeFactionFilter>('all');
  const [rarityFilter, setRarityFilter] = useState<TradeRarityFilter>('all');

  // Machine selection for listing
  const [selectedCodexEntryId, setSelectedCodexEntryId] = useState<string>('');

  // Trade proposal modal state
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [targetMachine, setTargetMachine] = useState<CommunityMachine | null>(null);

  // Store references
  const listings = useExchangeStore((state) => state.listings);
  const markForTrade = useExchangeStore((state) => state.markForTrade);
  const unmarkFromTrade = useExchangeStore((state) => state.unmarkFromTrade);
  const isListed = useExchangeStore((state) => state.isListed);
  const getMyListedMachines = useExchangeStore((state) => state.getMyListedMachines);
  const tradeHistory = useExchangeStore((state) => state.tradeHistory);
  const outgoingProposals = useExchangeStore((state) => state.outgoingProposals);
  const incomingProposals = useExchangeStore((state) => state.incomingProposals);
  const getIncomingPendingProposals = useExchangeStore((state) => state.getIncomingPendingProposals);
  const acceptIncomingProposal = useExchangeStore((state) => state.acceptIncomingProposal);
  const rejectIncomingProposal = useExchangeStore((state) => state.rejectIncomingProposal);
  const simulateIncomingProposal = useExchangeStore((state) => state.simulateIncomingProposal);

  // Codex store
  const codexEntries = useCodexStore((state) => state.entries);

  // Community store
  const communityMachines = useCommunityStore((state) => state.communityMachines);
  const publishedMachines = useCommunityStore((state) => state.publishedMachines);

  // Get listed machines
  const myListedMachines = useMemo(() => getMyListedMachines(), [listings, codexEntries]);

  // Get pending proposals count
  const pendingOutgoingCount = outgoingProposals.filter((p) => p.status === 'pending').length;
  const pendingIncomingCount = getIncomingPendingProposals().length;

  // Get filtered incoming proposals
  const pendingIncomingProposals = useMemo(() => getIncomingPendingProposals(), [incomingProposals]);

  // Filter community machines for trade
  const filteredCommunityMachines = useMemo(() => {
    let machines = [...communityMachines, ...publishedMachines];

    // Filter by faction
    if (factionFilter !== 'all') {
      machines = machines.filter((m) => m.dominantFaction === factionFilter);
    }

    // Filter by rarity
    if (rarityFilter !== 'all') {
      machines = machines.filter((m) => m.attributes.rarity === rarityFilter);
    }

    // For MVP, show all community machines (in production, filter by availableForTrade flag)
    return machines;
  }, [communityMachines, publishedMachines, factionFilter, rarityFilter]);

  // Handle listing a machine
  const handleListForTrade = (entryId: string) => {
    markForTrade(entryId);
    setSelectedCodexEntryId('');
  };

  // Handle unlisting a machine
  const handleUnlist = (entryId: string) => {
    unmarkFromTrade(entryId);
  };

  // Handle opening trade proposal
  const handleOfferTrade = (machine: CommunityMachine) => {
    setTargetMachine(machine);
    setShowProposalModal(true);
  };

  // Handle accepting incoming proposal
  const handleAcceptIncoming = (proposalId: string) => {
    acceptIncomingProposal(proposalId);
  };

  // Handle rejecting incoming proposal
  const handleRejectIncoming = (proposalId: string) => {
    rejectIncomingProposal(proposalId);
  };

  // Handle simulating incoming proposal (demo button)
  const handleSimulateProposal = () => {
    simulateIncomingProposal();
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

  // Faction icon - extended to 6 factions
  const getFactionIcon = (faction: FactionId): string => {
    const icons: Record<FactionId, string> = {
      void: '🌑',
      inferno: '🔥',
      storm: '⚡',
      stellar: '✨',
      arcane: '🔮',
      chaos: '💀',
    };
    return icons[faction] || '⚙';
  };

  // Format timestamp
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[85vh] mx-4 bg-gradient-to-br from-[#1a1a2e] via-[#121826] to-[#0a0e17] rounded-2xl border border-[#7c3aed]/40 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a42]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚖</span>
            <h2 className="text-xl font-bold text-white">交易所</h2>
            <span className="px-2 py-1 rounded-full bg-[#7c3aed]/20 text-[#a78bfa] text-xs">
              Codex Exchange
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1e2a42] hover:bg-[#2d3a56] flex items-center justify-center text-[#9ca3af] hover:text-white transition-colors"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#1e2a42]">
          <button
            onClick={() => setActiveTab('my-listings')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'my-listings'
                ? 'text-[#a78bfa] bg-[#7c3aed]/10'
                : 'text-[#9ca3af] hover:text-white hover:bg-[#1e2a42]/50'
            }`}
          >
            我的挂牌
            {myListedMachines.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-[#7c3aed]/30 text-xs">
                {myListedMachines.length}
              </span>
            )}
            {activeTab === 'my-listings' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7c3aed]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('incoming-offers')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'incoming-offers'
                ? 'text-[#a78bfa] bg-[#7c3aed]/10'
                : 'text-[#9ca3af] hover:text-white hover:bg-[#1e2a42]/50'
            }`}
          >
            收到的报价
            {pendingIncomingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-[#22c55e]/30 text-xs animate-pulse">
                {pendingIncomingCount}
              </span>
            )}
            {activeTab === 'incoming-offers' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7c3aed]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('browse-trades')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'browse-trades'
                ? 'text-[#a78bfa] bg-[#7c3aed]/10'
                : 'text-[#9ca3af] hover:text-white hover:bg-[#1e2a42]/50'
            }`}
          >
            浏览交易
            {pendingOutgoingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-[#22c55e]/30 text-xs">
                {pendingOutgoingCount} 待处理
              </span>
            )}
            {activeTab === 'browse-trades' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7c3aed]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('trade-history')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'trade-history'
                ? 'text-[#a78bfa] bg-[#7c3aed]/10'
                : 'text-[#9ca3af] hover:text-white hover:bg-[#1e2a42]/50'
            }`}
          >
            交易历史
            {tradeHistory.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-[#7c3aed]/30 text-xs">
                {tradeHistory.length}
              </span>
            )}
            {activeTab === 'trade-history' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7c3aed]" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* My Listings Tab */}
          {activeTab === 'my-listings' && (
            <div className="space-y-6">
              {/* Listing Form */}
              <div className="bg-[#0a0e17]/50 rounded-xl p-4 border border-[#1e2a42]">
                <h3 className="text-sm font-medium text-[#a78bfa] mb-3">挂牌新机器</h3>
                <div className="flex gap-3">
                  <select
                    value={selectedCodexEntryId}
                    onChange={(e) => setSelectedCodexEntryId(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#1e2a42] text-white border border-[#2d3a4f] focus:border-[#7c3aed] focus:outline-none"
                  >
                    <option value="">选择要挂牌的机器...</option>
                    {codexEntries
                      .filter((entry) => !isListed(entry.id))
                      .map((entry) => (
                        <option key={entry.id} value={entry.id}>
                          {entry.attributes.name} ({entry.codexId})
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={() => selectedCodexEntryId && handleListForTrade(selectedCodexEntryId)}
                    disabled={!selectedCodexEntryId}
                    className="px-4 py-2 rounded-lg bg-[#7c3aed] text-white hover:bg-[#6d28d9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    挂牌
                  </button>
                </div>
                {codexEntries.filter((entry) => !isListed(entry.id)).length === 0 && (
                  <p className="mt-3 text-xs text-[#6b7280]">
                    图鉴中没有可挂牌的机器。请先创建并保存一些机器。
                  </p>
                )}
              </div>

              {/* Listed Machines */}
              <div>
                <h3 className="text-sm font-medium text-[#9ca3af] mb-3">
                  已挂牌机器 ({myListedMachines.length})
                </h3>
                {myListedMachines.length === 0 ? (
                  <div className="text-center py-8 text-[#6b7280]">
                    <span className="text-4xl mb-3 block">📦</span>
                    <p>暂无挂牌的机器</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {myListedMachines.map((entry) => (
                      <div
                        key={entry.id}
                        className="bg-[#0a0e17]/50 rounded-lg p-4 border border-[#1e2a42] hover:border-[#7c3aed]/40 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-white">{entry.attributes.name}</span>
                              <span className={`px-2 py-0.5 rounded text-xs border ${getRarityColor(entry.attributes.rarity)}`}>
                                {entry.attributes.rarity}
                              </span>
                            </div>
                            <div className="text-xs text-[#6b7280]">
                              {entry.codexId} • {entry.modules.length} 模块
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnlist(entry.id)}
                            className="px-3 py-1 rounded text-xs bg-[#7f1d1d]/30 text-[#fca5a5] hover:bg-[#7f1d1d]/50 transition-colors"
                          >
                            下架
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Outgoing Proposals */}
              {pendingOutgoingCount > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-[#9ca3af] mb-3">
                    待处理的报价 ({pendingOutgoingCount})
                  </h3>
                  <div className="space-y-2">
                    {outgoingProposals
                      .filter((p) => p.status === 'pending')
                      .map((proposal) => (
                        <div
                          key={proposal.id}
                          className="bg-[#0a0e17]/50 rounded-lg p-4 border border-[#1e2a42]"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm text-white">
                                你的 <span className="text-[#a78bfa]">{proposal.proposerMachine.attributes.name}</span>
                              </div>
                              <div className="text-xs text-[#6b7280]">
                                交换 → <span className="text-[#22c55e]">{proposal.targetMachine.attributes.name}</span>
                              </div>
                              <div className="text-xs text-[#6b7280] mt-1">
                                提交于 {formatTime(proposal.createdAt)}
                              </div>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-[#fbbf24]/20 text-[#fbbf24] text-xs">
                              等待中
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Incoming Offers Tab */}
          {activeTab === 'incoming-offers' && (
            <div className="space-y-6">
              {/* Demo Controls */}
              <div className="bg-[#0a0e17]/50 rounded-xl p-4 border border-[#1e2a42]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-[#a78bfa] mb-1">AI 交易员演示</h3>
                    <p className="text-xs text-[#6b7280]">
                      模拟 AI 交易员发送的交易报价（用于演示）
                    </p>
                  </div>
                  <button
                    onClick={handleSimulateProposal}
                    className="px-4 py-2 rounded-lg bg-[#7c3aed] text-white hover:bg-[#6d28d9] transition-colors text-sm font-medium"
                  >
                    模拟报价
                  </button>
                </div>
              </div>

              {/* Incoming Proposals */}
              <div>
                <h3 className="text-sm font-medium text-[#9ca3af] mb-3">
                  待处理的报价 ({pendingIncomingProposals.length})
                </h3>
                {pendingIncomingProposals.length === 0 ? (
                  <div className="text-center py-12 text-[#6b7280]">
                    <span className="text-4xl mb-3 block">📥</span>
                    <p>暂无收到的交易报价</p>
                    <p className="text-xs mt-2">点击上方按钮模拟 AI 交易员的报价</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {pendingIncomingProposals.map((proposal) => (
                      <IncomingProposalCard
                        key={proposal.id}
                        proposal={proposal}
                        onAccept={handleAcceptIncoming}
                        onReject={handleRejectIncoming}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Accepted/Rejected History */}
              {incomingProposals.filter((p) => p.status !== 'pending').length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-[#9ca3af] mb-3">
                    已处理的报价
                  </h3>
                  <div className="space-y-2">
                    {incomingProposals
                      .filter((p) => p.status !== 'pending')
                      .map((proposal) => (
                        <div
                          key={proposal.id}
                          className={`bg-[#0a0e17]/30 rounded-lg p-3 border ${
                            proposal.status === 'accepted'
                              ? 'border-[#22c55e]/30'
                              : 'border-[#ef4444]/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-[#9ca3af]">
                              {proposal.targetMachine.attributes.name}
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${
                                proposal.status === 'accepted'
                                  ? 'bg-[#22c55e]/20 text-[#22c55e]'
                                  : 'bg-[#ef4444]/20 text-[#ef4444]'
                              }`}
                            >
                              {proposal.status === 'accepted' ? '已接受' : '已拒绝'}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Browse Trades Tab */}
          {activeTab === 'browse-trades' && (
            <div className="space-y-6">
              {/* Filters - extended to 6 factions */}
              <div className="flex gap-4">
                <select
                  value={factionFilter}
                  onChange={(e) => setFactionFilter(e.target.value as TradeFactionFilter)}
                  className="px-3 py-2 rounded-lg bg-[#1e2a42] text-white border border-[#2d3a4f] focus:border-[#7c3aed] focus:outline-none text-sm"
                >
                  <option value="all">所有派系</option>
                  <option value="void">🌑 虚空深渊</option>
                  <option value="inferno">🔥 熔星锻造</option>
                  <option value="storm">⚡ 雷霆相位</option>
                  <option value="stellar">✨ 星辉</option>
                  <option value="arcane">🔮 奥术秩序</option>
                  <option value="chaos">💀 混沌无序</option>
                </select>

                <select
                  value={rarityFilter}
                  onChange={(e) => setRarityFilter(e.target.value as TradeRarityFilter)}
                  className="px-3 py-2 rounded-lg bg-[#1e2a42] text-white border border-[#2d3a4f] focus:border-[#7c3aed] focus:outline-none text-sm"
                >
                  <option value="all">所有稀有度</option>
                  <option value="common">普通</option>
                  <option value="uncommon">优秀</option>
                  <option value="rare">稀有</option>
                  <option value="epic">史诗</option>
                  <option value="legendary">传说</option>
                </select>
              </div>

              {/* Community Machines Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCommunityMachines.map((machine) => (
                  <div
                    key={machine.id}
                    className="bg-[#0a0e17]/50 rounded-xl p-4 border border-[#1e2a42] hover:border-[#7c3aed]/40 transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getFactionIcon(machine.dominantFaction)}</span>
                        <span className={`px-2 py-0.5 rounded text-xs border ${getRarityColor(machine.attributes.rarity)}`}>
                          {machine.attributes.rarity}
                        </span>
                      </div>
                      <div className="text-xs text-[#6b7280]">
                        {machine.attributes.codexId}
                      </div>
                    </div>

                    <h4 className="text-sm font-medium text-white mb-1 group-hover:text-[#00d4ff] transition-colors">
                      {machine.attributes.name}
                    </h4>

                    <p className="text-xs text-[#6b7280] mb-3 line-clamp-2">
                      {machine.attributes.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-[#6b7280]">❤️</span>
                        <span className="text-[#9ca3af]">{machine.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[#6b7280]">👁</span>
                        <span className="text-[#9ca3af]">{machine.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[#6b7280]">⚡</span>
                        <span className="text-[#9ca3af]">{machine.attributes.stats.powerOutput}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[#6b7280]">🛡</span>
                        <span className="text-[#9ca3af]">{machine.attributes.stats.stability}%</span>
                      </div>
                    </div>

                    <div className="text-xs text-[#6b7280] mb-3">
                      by {machine.authorName || machine.author} • {formatTime(machine.publishedAt)}
                    </div>

                    <button
                      onClick={() => handleOfferTrade(machine)}
                      disabled={myListedMachines.length === 0}
                      className="w-full px-3 py-2 rounded-lg bg-[#7c3aed]/20 text-[#a78bfa] hover:bg-[#7c3aed]/30 border border-[#7c3aed]/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      出价交易
                    </button>
                  </div>
                ))}
              </div>

              {filteredCommunityMachines.length === 0 && (
                <div className="text-center py-12 text-[#6b7280]">
                  <span className="text-4xl mb-3 block">🔍</span>
                  <p>没有找到符合条件的机器</p>
                </div>
              )}

              {myListedMachines.length === 0 && (
                <div className="bg-[#fbbf24]/10 rounded-lg p-4 border border-[#fbbf24]/20">
                  <p className="text-sm text-[#fbbf24]">
                    💡 提示：需要先在"我的挂牌"中挂牌机器才能发起交易
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Trade History Tab */}
          {activeTab === 'trade-history' && (
            <div className="space-y-6">
              {tradeHistory.length === 0 ? (
                <div className="text-center py-12 text-[#6b7280]">
                  <span className="text-4xl mb-3 block">📜</span>
                  <p>暂无交易记录</p>
                  <p className="text-xs mt-2">完成交易后将在这里显示</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tradeHistory.map((trade) => (
                    <div
                      key={trade.id}
                      className="bg-[#0a0e17]/50 rounded-xl p-4 border border-[#1e2a42]"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">⚖</span>
                          <span className="text-sm text-[#9ca3af]">已完成交易</span>
                        </div>
                        <span className="text-xs text-[#6b7280]">
                          {formatTime(trade.completedAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Given Machine */}
                        <div className="flex-1 bg-[#7f1d1d]/20 rounded-lg p-3 border border-[#7f1d1d]/30">
                          <div className="text-xs text-[#fca5a5] mb-1">给出的</div>
                          <div className="text-sm font-medium text-white">
                            {trade.givenMachine.attributes.name}
                          </div>
                          <div className={`mt-1 px-2 py-0.5 rounded text-xs inline-block ${getRarityColor(trade.givenMachine.attributes.rarity)}`}>
                            {trade.givenMachine.attributes.rarity}
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="text-[#7c3aed] text-xl">→</div>

                        {/* Received Machine */}
                        <div className="flex-1 bg-[#22c55e]/20 rounded-lg p-3 border border-[#22c55e]/30">
                          <div className="text-xs text-[#22c55e] mb-1">获得的</div>
                          <div className="text-sm font-medium text-white">
                            {trade.receivedMachine.attributes.name}
                          </div>
                          <div className={`mt-1 px-2 py-0.5 rounded text-xs inline-block ${getRarityColor(trade.receivedMachine.attributes.rarity)}`}>
                            {trade.receivedMachine.attributes.rarity}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1e2a42] bg-[#0a0e17]/50">
          <p className="text-xs text-[#6b7280] text-center">
            交易所是本地模拟功能，用于演示机器交换机制。实际交易需要后端支持。
          </p>
        </div>
      </div>

      {/* Trade Proposal Modal */}
      {showProposalModal && targetMachine && (
        <Suspense fallback={<div className="fixed inset-0 z-[210] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" /></div>}>
          <LazyTradeProposalModal
            targetMachine={targetMachine}
            onClose={() => {
              setShowProposalModal(false);
              setTargetMachine(null);
            }}
          />
        </Suspense>
      )}
    </div>
  );
}

export default ExchangePanel;
