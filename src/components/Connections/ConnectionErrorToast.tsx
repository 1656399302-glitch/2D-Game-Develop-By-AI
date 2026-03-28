import { useEffect, useState } from 'react';
import { useMachineStore } from '../../store/useMachineStore';

export function ConnectionErrorToast() {
  const connectionError = useMachineStore((state) => state.connectionError);
  const [visible, setVisible] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  
  useEffect(() => {
    if (connectionError) {
      setErrorText(connectionError);
      setVisible(true);
      
      // Auto-hide after 2 seconds
      const timer = setTimeout(() => {
        setVisible(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [connectionError]);
  
  if (!visible || !errorText) return null;
  
  return (
    <div 
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown"
      style={{
        animation: 'slideDown 0.3s ease-out',
      }}
    >
      <div className="flex items-center gap-3 px-4 py-3 bg-[#7f1d1d] border border-[#ef4444] rounded-lg shadow-lg">
        <div className="flex-shrink-0">
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 20 20" 
            fill="none" 
            stroke="#ef4444" 
            strokeWidth="2"
            className="animate-pulse"
          >
            <circle cx="10" cy="10" r="8" />
            <path d="M10 6v5" />
            <circle cx="10" cy="14" r="1" fill="#ef4444" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-[#fecaca]">
            连接错误
          </p>
          <p className="text-xs text-[#fca5a5]">
            {errorText}
          </p>
        </div>
      </div>
      
      <style>{`
        @keyframes slideDown {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
