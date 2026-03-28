import { useMachineStore } from '../../store/useMachineStore';

export const LoadPromptModal = () => {
  const restoreSavedState = useMachineStore((state) => state.restoreSavedState);
  const startFresh = useMachineStore((state) => state.startFresh);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#7c3aed]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#00d4ff]/10 rounded-full blur-3xl" />
      </div>
      
      {/* Modal content */}
      <div className="relative bg-gradient-to-b from-[#1a1f35] to-[#0f1423] border border-[#7c3aed]/50 rounded-2xl shadow-2xl shadow-[#7c3aed]/20 p-8 max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#7c3aed]/30 to-[#00d4ff]/30 mb-4">
            <svg 
              className="w-8 h-8 text-[#00d4ff]" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome Back, Artificer
          </h2>
          <p className="text-[#9ca3af] text-sm">
            A previous machine session has been detected. Would you like to resume your work?
          </p>
        </div>
        
        {/* Saved state info */}
        <div className="bg-[#0a0e17]/50 rounded-lg p-4 mb-6 border border-[#2a3550]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#7c3aed]/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#7c3aed]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Saved Machine Session</p>
              <p className="text-[#4a5568] text-xs">Auto-saved from your last session</p>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={restoreSavedState}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white font-semibold rounded-lg hover:opacity-90 transition-all shadow-lg shadow-[#7c3aed]/30 group"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Resume Previous Work
            </span>
          </button>
          
          <button
            onClick={startFresh}
            className="w-full py-3 px-4 bg-[#121826] text-[#9ca3af] font-medium rounded-lg border border-[#2a3550] hover:bg-[#1a2030] hover:text-white hover:border-[#3a4560] transition-all"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Start Fresh
            </span>
          </button>
        </div>
        
        {/* Footer note */}
        <p className="text-center text-[#4a5568] text-xs mt-6">
          Your work is automatically saved every 500ms
        </p>
      </div>
    </div>
  );
};
