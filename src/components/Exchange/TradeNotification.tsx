/**
 * Trade Notification Component
 * 
 * Toast notification for trade-related events.
 * Displays notifications with state indicators for pending/accepted/rejected/expired proposals.
 * Includes countdown timer for pending proposals and auto-expiration handling.
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useExchangeStore } from '../../store/useExchangeStore';
import { TradeNotification as TradeNotificationType, TradeProposal } from '../../types/exchange';

interface TradeNotificationProps {
  onOpenExchange: () => void;
}

// Countdown duration in milliseconds (default: 60 seconds for proposals)
const PROPOSAL_COUNTDOWN_MS = 60000;

export function TradeNotification({ onOpenExchange }: TradeNotificationProps) {
  // Get notifications and proposals with null safety
  const notifications = useExchangeStore((state) => state.notifications) ?? [];
  const incomingProposals = useExchangeStore((state) => state.incomingProposals) ?? [];
  const markNotificationRead = useExchangeStore((state) => state.markNotificationRead);
  const acceptProposal = useExchangeStore((state) => state.acceptProposal);
  const rejectProposal = useExchangeStore((state) => state.rejectProposal);
  const expireProposal = useExchangeStore((state) => state.expireProposal);

  // Get unread notifications
  const unreadNotifications = useMemo(() => 
    notifications.filter((n) => !n.read),
    [notifications]
  );

  // Get proposal status for a notification
  const getProposalStatus = useCallback((proposalId: string): TradeProposal['status'] | null => {
    if (!incomingProposals || !Array.isArray(incomingProposals)) return null;
    const proposal = incomingProposals.find((p) => p.id === proposalId);
    return proposal?.status ?? null;
  }, [incomingProposals]);

  // Local countdown state
  const [countdown, setCountdown] = useState<number>(0);
  const [proposalId, setProposalId] = useState<string | null>(null);

  // Get the most recent unread notification
  const latestNotification = unreadNotifications.length > 0 ? unreadNotifications[0] : null;

  // Initialize countdown when latest notification changes
  useEffect(() => {
    if (latestNotification && latestNotification.type === 'incoming') {
      const status = getProposalStatus(latestNotification.proposalId);
      if (status === 'pending') {
        const proposal = incomingProposals?.find((p) => p.id === latestNotification.proposalId);
        if (proposal) {
          const elapsed = Date.now() - proposal.createdAt;
          const remaining = Math.max(0, PROPOSAL_COUNTDOWN_MS - elapsed);
          setCountdown(remaining);
          setProposalId(latestNotification.proposalId);
        }
      }
    } else {
      setCountdown(0);
      setProposalId(null);
    }
  }, [latestNotification, incomingProposals, getProposalStatus]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0 || !proposalId) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        const newValue = prev - 1000;
        if (newValue <= 0) {
          // Mark proposal as expired
          expireProposal(proposalId);
          return 0;
        }
        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown > 0, proposalId, expireProposal]);

  // Auto-dismiss after delay - marks ALL unread notifications as read after 5 seconds
  useEffect(() => {
    if (unreadNotifications.length > 0) {
      const timer = setTimeout(() => {
        unreadNotifications.forEach((n) => {
          markNotificationRead(n.id);
        });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [unreadNotifications, markNotificationRead]);

  // Don't render if no unread notifications
  if (!latestNotification) {
    return null;
  }

  // Get proposal status for the latest notification
  const proposalStatus = latestNotification.type === 'incoming' 
    ? getProposalStatus(latestNotification.proposalId) 
    : null;

  // Determine actual status to display
  // Priority: proposal status from store > notification type
  const displayStatus: 'pending' | 'accepted' | 'rejected' | 'expired' = 
    proposalStatus === 'accepted' ? 'accepted' :
    proposalStatus === 'rejected' ? 'rejected' :
    proposalStatus === 'expired' ? 'expired' :
    latestNotification.type === 'accepted' ? 'accepted' :
    latestNotification.type === 'rejected' ? 'rejected' :
    'pending';

  // Get notification icon based on notification type (backward compatible)
  const getNotificationIcon = (type: TradeNotificationType['type']): string => {
    switch (type) {
      case 'incoming':
        return '📥';
      case 'accepted':
        return '✅';
      case 'rejected':
        return '❌';
      default:
        return '💬';
    }
  };

  // Get notification color based on notification type (backward compatible)
  const getNotificationColor = (type: TradeNotificationType['type']): string => {
    switch (type) {
      case 'incoming':
        return 'from-[#7c3aed] to-[#6d28d9]';
      case 'accepted':
        return 'from-[#22c55e] to-[#16a34a]';
      case 'rejected':
        return 'from-[#ef4444] to-[#dc2626]';
      default:
        return 'from-[#7c3aed] to-[#6d28d9]';
    }
  };

  // Get status badge text
  const getStatusBadge = (status: string): string => {
    switch (status) {
      case 'pending':
        return '等待中';
      case 'accepted':
        return '已接受';
      case 'rejected':
        return '已拒绝';
      case 'expired':
        return '已过期';
      default:
        return '';
    }
  };

  // Format countdown time
  const formatCountdown = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}s`;
  };

  // Handle quick accept
  const handleQuickAccept = () => {
    if (latestNotification.type === 'incoming') {
      acceptProposal(latestNotification.proposalId);
      markNotificationRead(latestNotification.id);
    }
  };

  // Handle quick reject
  const handleQuickReject = () => {
    if (latestNotification.type === 'incoming') {
      rejectProposal(latestNotification.proposalId);
      markNotificationRead(latestNotification.id);
    }
  };

  // Handle view exchange
  const handleViewExchange = () => {
    markNotificationRead(latestNotification.id);
    onOpenExchange();
  };

  // Format timestamp
  const formatTimestamp = (createdAt: number): string => {
    const date = new Date(createdAt);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const isPending = displayStatus === 'pending' && latestNotification.type === 'incoming';
  const showStatusBadge = displayStatus !== 'pending';
  const showQuickActions = isPending;

  return (
    <div className="fixed bottom-4 right-4 z-[300] max-w-sm">
      <div
        className={`
          bg-gradient-to-r ${getNotificationColor(latestNotification.type)} 
          rounded-xl shadow-2xl overflow-hidden animate-slide-up
        `}
        data-testid="trade-notification"
        data-status={displayStatus}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl" data-testid="notification-icon">
              {getNotificationIcon(latestNotification.type)}
            </span>
            <div className="flex-1">
              {/* Header with title and dismiss button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    {latestNotification.type === 'incoming' && '收到新交易请求'}
                    {latestNotification.type === 'accepted' && '交易已接受'}
                    {latestNotification.type === 'rejected' && '交易被拒绝'}
                  </span>
                  {/* Status badge */}
                  {showStatusBadge && (
                    <span 
                      className="px-2 py-0.5 text-xs font-medium rounded-full bg-white/20 text-white"
                      data-testid={`status-badge-${displayStatus}`}
                    >
                      {getStatusBadge(displayStatus)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => markNotificationRead(latestNotification.id)}
                  className="text-white/60 hover:text-white text-lg leading-none"
                  aria-label="关闭"
                  data-testid="dismiss-button"
                >
                  ×
                </button>
              </div>
              
              {/* Timestamp and message */}
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-white/80" data-testid="notification-message">
                  {latestNotification.message}
                </p>
                <span className="text-xs text-white/50" data-testid="notification-timestamp">
                  {formatTimestamp(latestNotification.createdAt)}
                </span>
              </div>

              {/* Countdown timer for pending incoming proposals */}
              {isPending && (
                <div className="mt-2 flex items-center gap-2" data-testid="countdown-container">
                  <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white/60 transition-all duration-1000"
                      style={{ 
                        width: `${Math.max(0, Math.min(100, (countdown / PROPOSAL_COUNTDOWN_MS) * 100))}%` 
                      }}
                      data-testid="countdown-bar"
                    />
                  </div>
                  <span className="text-xs text-white/70 font-mono" data-testid="countdown-text">
                    {formatCountdown(countdown)}
                  </span>
                </div>
              )}

              {/* Quick Actions for Incoming (only when pending) */}
              {showQuickActions && (
                <div className="flex gap-2 mt-3" data-testid="quick-actions">
                  <button
                    onClick={handleQuickAccept}
                    className="px-3 py-1.5 rounded-lg bg-white/20 text-white text-xs hover:bg-white/30 transition-colors"
                    data-testid="accept-button"
                  >
                    接受
                  </button>
                  <button
                    onClick={handleQuickReject}
                    className="px-3 py-1.5 rounded-lg bg-black/20 text-white/80 text-xs hover:bg-black/30 transition-colors"
                    data-testid="reject-button"
                  >
                    拒绝
                  </button>
                  <button
                    onClick={handleViewExchange}
                    className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs hover:bg-white/20 transition-colors"
                    data-testid="view-details-button"
                  >
                    查看详情
                  </button>
                </div>
              )}

              {/* View Exchange button for accepted/rejected incoming */}
              {!showQuickActions && latestNotification.type === 'incoming' && (
                <button
                  onClick={handleViewExchange}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-white/20 text-white text-xs hover:bg-white/30 transition-colors"
                  data-testid="view-exchange-button"
                >
                  查看交易所
                </button>
              )}

              {/* Other notification types */}
              {latestNotification.type !== 'incoming' && (
                <button
                  onClick={handleViewExchange}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-white/20 text-white text-xs hover:bg-white/30 transition-colors"
                  data-testid="view-exchange-button-other"
                >
                  查看交易所
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Additional unread count */}
        {unreadNotifications.length > 1 && (
          <div className="px-4 py-2 bg-black/20 border-t border-white/10" data-testid="additional-count">
            <span className="text-xs text-white/70">
              还有 {unreadNotifications.length - 1} 条未读通知
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default TradeNotification;
