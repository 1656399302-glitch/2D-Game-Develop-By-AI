import { useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useMachineStore } from '../../store/useMachineStore';

/**
 * Breakpoint for mobile detection
 */
const MOBILE_BREAKPOINT = 768;

/**
 * Hook to detect mobile viewport
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

/**
 * Hook for viewport-aware layout
 */
export function useViewportSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false,
    isTablet: typeof window !== 'undefined' 
      ? window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < 1024 
      : false,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < MOBILE_BREAKPOINT,
        isTablet: window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < 1024,
        isDesktop: window.innerWidth >= 1024,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

/**
 * Mobile-optimized canvas layout
 * 
 * Provides responsive layout adjustments for mobile devices:
 * - Collapsible side panels
 * - Touch-optimized controls
 * - Scrollable canvas area
 * - Gesture support hints
 * 
 * WCAG 2.1 AA Compliance:
 * - Touch targets minimum 44x44px
 * - Clear focus indicators
 * - Screen reader announcements
 */
export function MobileCanvasLayout({
  leftPanel,
  canvas,
  rightPanel,
  header,
  footer,
}: {
  leftPanel?: ReactNode;
  canvas: ReactNode;
  rightPanel?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
}) {
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'left' | 'right' | null>(null);
  
  const viewport = useViewportSize();
  const modules = useMachineStore((state) => state.modules);
  
  // FIX: Store previous isMobile value in ref for comparison
  const prevIsMobileRef = useRef<boolean>(viewport.isMobile);
  
  // FIX: Auto-collapse panels on mobile - use ref comparison to detect actual changes
  useEffect(() => {
    // Only trigger if isMobile actually changed (not on every render)
    if (viewport.isMobile !== prevIsMobileRef.current) {
      prevIsMobileRef.current = viewport.isMobile;
      if (viewport.isMobile) {
        setLeftPanelOpen(false);
        setRightPanelOpen(false);
      }
    }
  }, [viewport.isMobile]); // Only depends on primitive boolean, not object

  // Close panels when clicking outside on mobile
  const handleOverlayClick = useCallback(() => {
    setActivePanel(null);
    setLeftPanelOpen(false);
    setRightPanelOpen(false);
  }, []);

  // Toggle left panel
  const toggleLeftPanel = useCallback(() => {
    if (viewport.isMobile) {
      if (activePanel === 'left') {
        setActivePanel(null);
        setLeftPanelOpen(false);
      } else {
        setActivePanel('left');
        setLeftPanelOpen(true);
        setRightPanelOpen(false);
      }
    } else {
      setLeftPanelOpen(!leftPanelOpen);
    }
  }, [viewport.isMobile, activePanel, leftPanelOpen]);

  // Toggle right panel
  const toggleRightPanel = useCallback(() => {
    if (viewport.isMobile) {
      if (activePanel === 'right') {
        setActivePanel(null);
        setRightPanelOpen(false);
      } else {
        setActivePanel('right');
        setRightPanelOpen(true);
        setLeftPanelOpen(false);
      }
    } else {
      setRightPanelOpen(!rightPanelOpen);
    }
  }, [viewport.isMobile, activePanel, rightPanelOpen]);

  // Desktop layout
  if (!viewport.isMobile) {
    return (
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Module Panel */}
        <div
          className={`transition-all duration-300 ${
            leftPanel && leftPanelOpen ? 'w-64' : 'w-0'
          } overflow-hidden`}
        >
          {leftPanel && leftPanelOpen && leftPanel}
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {header}
          <div className="flex-1 flex overflow-hidden">
            {canvas}
            {rightPanel && rightPanelOpen && (
              <div className="w-64 overflow-hidden">{rightPanel}</div>
            )}
          </div>
          {footer}
        </div>
      </div>
    );
  }

  // Mobile layout
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Mobile Header */}
      <div className="mobile-header flex items-center justify-between px-3 py-2 bg-[#121826] border-b border-[#1e2a42]">
        {/* Left toggle */}
        <button
          onClick={toggleLeftPanel}
          className="p-2 rounded-lg bg-[#1e2a42] text-[#9ca3af] hover:text-white active:bg-[#2d3a4f] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={leftPanelOpen ? '关闭模块面板' : '打开模块面板'}
          aria-expanded={leftPanelOpen}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="3" width="6" height="14" rx="1" />
            <line x1="10" y1="3" x2="18" y2="3" />
            <line x1="10" y1="10" x2="18" y2="10" />
            <line x1="10" y1="17" x2="18" y2="17" />
          </svg>
        </button>

        {/* Title */}
        <h1 className="text-sm font-bold text-[#00d4ff] tracking-wide">
          魔法机械
        </h1>

        {/* Right toggle */}
        <button
          onClick={toggleRightPanel}
          className="p-2 rounded-lg bg-[#1e2a42] text-[#9ca3af] hover:text-white active:bg-[#2d3a4f] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={rightPanelOpen ? '关闭属性面板' : '打开属性面板'}
          aria-expanded={rightPanelOpen}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="2" width="14" height="16" rx="2" />
            <line x1="7" y1="6" x2="13" y2="6" />
            <line x1="7" y1="10" x2="13" y2="10" />
            <line x1="7" y1="14" x2="10" y2="14" />
          </svg>
        </button>
      </div>

      {/* Mobile Canvas */}
      <div className="flex-1 overflow-hidden relative">
        {canvas}
      </div>

      {/* Mobile Footer */}
      {footer && (
        <div className="mobile-footer bg-[#121826] border-t border-[#1e2a42] px-3 py-2">
          {footer}
        </div>
      )}

      {/* Mobile Overlay Panels */}
      {viewport.isMobile && (leftPanelOpen || rightPanelOpen) && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleOverlayClick}
            aria-hidden="true"
          />

          {/* Left Panel */}
          <div
            className={`fixed left-0 top-0 bottom-0 w-72 bg-[#121826] border-r border-[#1e2a42] z-50 transform transition-transform duration-300 overflow-hidden ${
              leftPanelOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            role="dialog"
            aria-label="模块面板"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#1e2a42]">
              <h2 className="text-sm font-semibold text-[#00d4ff]">模块面板</h2>
              <button
                onClick={toggleLeftPanel}
                className="p-2 rounded-lg hover:bg-[#1e2a42] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center text-[#9ca3af]"
                aria-label="关闭面板"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 6l8 8M14 6l-8 8" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto h-[calc(100%-60px)]">
              {leftPanel}
            </div>
          </div>

          {/* Right Panel */}
          {rightPanel && (
            <div
              className={`fixed right-0 top-0 bottom-0 w-72 bg-[#121826] border-l border-[#1e2a42] z-50 transform transition-transform duration-300 overflow-hidden ${
                rightPanelOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
              role="dialog"
              aria-label="属性面板"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#1e2a42]">
                <h2 className="text-sm font-semibold text-[#00d4ff]">属性</h2>
                <button
                  onClick={toggleRightPanel}
                  className="p-2 rounded-lg hover:bg-[#1e2a42] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center text-[#9ca3af]"
                  aria-label="关闭面板"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M6 6l8 8M14 6l-8 8" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto h-[calc(100%-60px)]">
                {rightPanel}
              </div>
            </div>
          )}
        </>
      )}

      {/* Mobile Quick Actions */}
      <div className="mobile-quick-actions fixed bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
        <button
          onClick={toggleLeftPanel}
          className={`p-3 rounded-full shadow-lg transition-all min-w-[48px] min-h-[48px] flex items-center justify-center ${
            leftPanelOpen
              ? 'bg-[#00d4ff] text-[#0a0e17]'
              : 'bg-[#1e2a42] text-[#9ca3af]'
          }`}
          aria-label="模块"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="2" width="7" height="7" rx="1" />
            <rect x="11" y="2" width="7" height="7" rx="1" />
            <rect x="2" y="11" width="7" height="7" rx="1" />
            <rect x="11" y="11" width="7" height="7" rx="1" />
          </svg>
        </button>

        {modules.length > 0 && (
          <>
            <button
              onClick={() => {/* Activate machine */}}
              className="p-3 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#00ffcc] text-[#0a0e17] shadow-lg min-w-[48px] min-h-[48px] flex items-center justify-center"
              aria-label="激活机器"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <polygon points="6,4 16,10 6,16" />
              </svg>
            </button>

            <button
              onClick={toggleRightPanel}
              className={`p-3 rounded-full shadow-lg transition-all min-w-[48px] min-h-[48px] flex items-center justify-center ${
                rightPanelOpen
                  ? 'bg-[#00d4ff] text-[#0a0e17]'
                  : 'bg-[#1e2a42] text-[#9ca3af]'
              }`}
              aria-label="属性"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="10" cy="10" r="3" />
                <path d="M10 2v3M10 15v3M2 10h3M15 10h3M4.2 4.2l2.1 2.1M13.7 13.7l2.1 2.1M4.2 15.8l2.1-2.1M13.7 6.3l2.1-2.1" />
              </svg>
            </button>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-header,
          .mobile-footer {
            flex-shrink: 0;
          }
          
          .mobile-quick-actions {
            animation: floatUp 0.3s ease-out;
          }
          
          @keyframes floatUp {
            from {
              opacity: 0;
              transform: translate(-50%, 20px);
            }
            to {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Touch gesture hints for mobile
 */
export function TouchGestureHints() {
  return (
    <div className="sr-only" aria-live="polite">
      <p>触摸提示：单指拖动移动模块，双指捏合缩放，双指拖动平移画布</p>
    </div>
  );
}

export default MobileCanvasLayout;
