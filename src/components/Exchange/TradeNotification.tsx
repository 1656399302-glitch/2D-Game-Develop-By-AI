/**
 * Trade Notification Component
 * 
 * Toast notification for trade-related events.
 */

import { useEffect } from 'react';
import { useExchangeStore } from '../../store/useExchangeStore';
import { TradeNotification as TradeNotificationType } from '../../types/exchange';

interface TradeNotificationProps {
  onOpenExchange: () => void;
}

export function TradeNotification({ onOpenExchange }: TradeNotificationProps) {
  // Get notifications
  const notifications = useExchangeStore((state) => state.notifications);
  const markNotificationRead = useExchangeStore((state) => state.markNotificationRead);
  const acceptProposal = useExchangeStore((state) => state.acceptProposal);
  const rejectProposal = useExchangeStore((state) => state.rejectProposal);

  // Get unread notifications
  const unreadNotifications = notifications.filter((n) => !n.read);

  // Auto-dismiss after delay
  useEffect(() => {
    if (unreadNotifications.length > 0) {
      // Auto-mark as read after 5 seconds
      const timer = setTimeout(() => {
        unreadNotifications.forEach((n) => {
          markNotificationRead(n.id);
        });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [unreadNotifications, markNotificationRead]);

  // Don't render if no notifications
  if (unreadNotifications.length === 0) {
    return null;
  }

  // Get the most recent notification
  const latestNotification = unreadNotifications[0];

  // Get notification icon
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

  // Get notification color
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

  return (
    <div className="fixed bottom-4 right-4 z-[300] max-w-sm">
      <div
        className={`
          bg-gradient-to-r ${getNotificationColor(latestNotification.type)} 
          rounded-xl shadow-2xl overflow-hidden animate-slide-up
        `}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{getNotificationIcon(latestNotification.type)}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">
                  {latestNotification.type === 'incoming' && '收到新交易请求'}
                  {latestNotification.type === 'accepted' && '交易已接受'}
                  {latestNotification.type === 'rejected' && '交易被拒绝'}
                </span>
                <button
                  onClick={() => markNotificationRead(latestNotification.id)}
                  className="text-white/60 hover:text-white text-lg leading-none"
                  aria-label="关闭"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-white/80 mt-1">
                {latestNotification.message}
              </p>

              {/* Quick Actions for Incoming */}
              {latestNotification.type === 'incoming' && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleQuickAccept}
                    className="px-3 py-1.5 rounded-lg bg-white/20 text-white text-xs hover:bg-white/30 transition-colors"
                  >
                    接受
                  </button>
                  <button
                    onClick={handleQuickReject}
                    className="px-3 py-1.5 rounded-lg bg-black/20 text-white/80 text-xs hover:bg-black/30 transition-colors"
                  >
                    拒绝
                  </button>
                  <button
                    onClick={handleViewExchange}
                    className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs hover:bg-white/20 transition-colors"
                  >
                    查看详情
                  </button>
                </div>
              )}

              {/* Other types */}
              {latestNotification.type !== 'incoming' && (
                <button
                  onClick={handleViewExchange}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-white/20 text-white text-xs hover:bg-white/30 transition-colors"
                >
                  查看交易所
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Additional unread count */}
        {unreadNotifications.length > 1 && (
          <div className="px-4 py-2 bg-black/20 border-t border-white/10">
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
