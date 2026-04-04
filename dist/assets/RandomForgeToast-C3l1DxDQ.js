import{j as e}from"./components-codex-oIGwyYbH.js";import{r}from"./vendor-zustand-CtSZPRb0.js";import{u as o}from"./components-challenge-_zgCMYMl.js";import"./vendor-utils-CtRu48qb.js";function d(){const a=o(t=>t.randomForgeToastVisible),n=o(t=>t.randomForgeToastMessage),s=r.useRef(null);return r.useEffect(()=>{!a&&s.current&&(s.current.style.animation="none")},[a]),!a||!n?null:e.jsxs("div",{ref:s,className:"fixed top-20 left-1/2 transform -translate-x-1/2 z-50",style:{animation:"slideDown 0.3s ease-out forwards"},role:"status","aria-live":"polite","aria-atomic":"true",children:[e.jsxs("div",{className:"flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] border border-[#a78bfa] rounded-xl shadow-2xl shadow-purple-900/50",children:[e.jsx("div",{className:"flex-shrink-0 text-2xl",style:{animation:"pulse 1s ease-in-out infinite"},children:"🎲"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-bold text-white",children:n}),e.jsx("p",{className:"text-xs text-purple-200 mt-0.5",children:"Machine has been randomly generated!"})]}),e.jsxs("div",{className:"absolute inset-0 overflow-hidden rounded-xl pointer-events-none",children:[e.jsx("div",{className:"absolute w-1 h-1 bg-yellow-400 rounded-full opacity-60",style:{left:"20%",top:"50%",animation:"sparkle 1s ease-out infinite",animationDelay:"0ms"}}),e.jsx("div",{className:"absolute w-1 h-1 bg-cyan-400 rounded-full opacity-60",style:{left:"80%",top:"30%",animation:"sparkle 1s ease-out infinite",animationDelay:"200ms"}}),e.jsx("div",{className:"absolute w-1 h-1 bg-pink-400 rounded-full opacity-60",style:{left:"60%",top:"70%",animation:"sparkle 1s ease-out infinite",animationDelay:"400ms"}})]})]}),e.jsx("style",{children:`
        @keyframes slideDown {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        
        @keyframes sparkle {
          0% {
            opacity: 0;
            transform: translateY(0) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateY(-10px) scale(1.5);
          }
          100% {
            opacity: 0;
            transform: translateY(-20px) scale(0);
          }
        }
      `})]})}export{d as RandomForgeToast};
