interface TutorialProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function TutorialProgress({ currentStep, totalSteps }: TutorialProgressProps) {
  const percentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[1001] pointer-events-none">
      <div className="bg-[#121826]/95 backdrop-blur-sm rounded-full px-4 py-2 border border-[#7c3aed]/30 shadow-lg shadow-purple-900/20">
        <div className="flex items-center gap-3">
          {/* Step indicator dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index < currentStep
                    ? 'bg-[#7c3aed] scale-100'
                    : index === currentStep
                    ? 'bg-[#a855f7] scale-125 shadow-lg shadow-[#a855f7]/50'
                    : 'bg-[#1e2a42]'
                }`}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-20 h-1.5 bg-[#1e2a42] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#7c3aed] to-[#a855f7] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Step count */}
          <span className="text-xs text-[#9ca3af] font-medium tabular-nums">
            {currentStep + 1}/{totalSteps}
          </span>

          {/* Magic wand icon */}
          <div className="w-5 h-5 flex items-center justify-center text-[#a855f7]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 4V2" />
              <path d="M15 16v-2" />
              <path d="M8 9h2" />
              <path d="M20 9h2" />
              <path d="M17.8 11.8L19 13" />
              <path d="M15 9h.01" />
              <path d="M17.8 6.2L19 5" />
              <path d="M3 21l9-9" />
              <path d="M12.2 6.2L11 5" />
            </svg>
          </div>
        </div>
      </div>

      {/* Subtle decorative elements */}
      <div className="absolute -top-1 -left-1 w-2 h-2 border-l border-t border-[#7c3aed]/40" />
      <div className="absolute -top-1 -right-1 w-2 h-2 border-r border-t border-[#7c3aed]/40" />
      <div className="absolute -bottom-1 -left-1 w-2 h-2 border-l border-b border-[#7c3aed]/40" />
      <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r border-b border-[#7c3aed]/40" />
    </div>
  );
}
