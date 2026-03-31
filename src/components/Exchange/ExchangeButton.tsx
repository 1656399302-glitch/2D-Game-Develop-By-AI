/**
 * Exchange Button Component
 * 
 * Toolbar button for opening the Exchange Panel.
 * Shows badge count for pending proposals.
 */

import { useExchangeStore } from '../../store/useExchangeStore';

interface ExchangeButtonProps {
  onClick: () => void;
}

export function ExchangeButton({ onClick }: ExchangeButtonProps) {
  // Get pending counts
  const incomingProposals = useExchangeStore((state) => state.incomingProposals);
  const outgoingProposals = useExchangeStore((state) => state.outgoingProposals);

  const pendingIncoming = incomingProposals.filter((p) => p.status === 'pending').length;
  const pendingOutgoing = outgoingProposals.filter((p) => p.status === 'pending').length;
  const totalPending = pendingIncoming + pendingOutgoing;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1 text-xs rounded bg-[#7c3aed]/20 text-[#a78bfa] hover:bg-[#7c3aed]/30 border border-[#7c3aed]/40 transition-colors"
      title="交易所 - 交易机器"
      aria-label="交易所"
    >
      <span aria-hidden="true">⚖</span>
      <span>交易所</span>
      {totalPending > 0 && (
        <span className="px-1.5 py-0.5 rounded-full bg-[#7c3aed]/40 text-[10px] font-medium animate-pulse">
          {totalPending}
        </span>
      )}
    </button>
  );
}

export default ExchangeButton;
