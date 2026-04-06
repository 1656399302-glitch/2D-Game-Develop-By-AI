import{j as e}from"./components-circuit-module-D_URZDHL.js";import{r as a}from"./vendor-zustand-CtSZPRb0.js";import{C as T,r as v,s as _,T as B}from"./index-DeeOm0Kr.js";import"./vendor-utils-CtRu48qb.js";import"./vendor-react-IJARFiOZ.js";import"./components-codex-A7ybJH__.js";import"./vendor-gsap-C8pce-KX.js";import"./utils-activation-RRVepEpl.js";import"./utils-animation-CKkdz26L.js";import"./components-faction-BA2gEQAP.js";import"./components-templates-BAsJtbJg.js";function X({step:t,currentStep:u,totalSteps:f,targetRect:o,isTransitioning:m,onNext:g,onPrevious:h,onSkip:r,onLastStep:y}){const p=a.useRef(null),[s,c]=a.useState({top:0,left:0,arrowSide:"left"}),[k,M]=a.useState(!1);a.useEffect(()=>{if(!o){c({top:window.innerHeight/3,left:window.innerWidth/2-200,arrowSide:"left"});return}const w=380,j=280,i=20,b=12;let d=0,l=0,x="left";const C=o.left+o.width/2,L=o.top+o.height/2;switch(t.position){case"right":l=o.right+i+b,d=L-j/2,x="left",l+w>window.innerWidth-i&&(l=o.left-w-i-b,x="right");break;case"left":l=o.left-w-i-b,d=L-j/2,x="right",l<i&&(l=o.right+i+b,x="left");break;case"bottom":d=o.bottom+i+b,l=C-w/2,x="top",d+j>window.innerHeight-i&&(d=o.top-j-i-b,x="bottom");break;case"top":default:d=o.top-j-i-b,l=C-w/2,x="bottom",d<i&&(d=o.bottom+i+b,x="top");break}l=Math.max(i,Math.min(l,window.innerWidth-w-i)),d=Math.max(i,Math.min(d,window.innerHeight-j-i)),c({top:d,left:l,arrowSide:x}),M(!0)},[o,t.position]);const z=()=>{switch(t.action){case"drag":return"👆";case"click":return"🖱️";case"connect":return"🔗";case"wait":return"👀";default:return"✨"}};return k?e.jsxs("div",{ref:p,className:`fixed z-[1000] pointer-events-none transition-all duration-300 ${m?"opacity-0 scale-95":"opacity-100 scale-100"}`,style:{top:s.top,left:s.left,width:380},children:[e.jsxs("div",{className:"relative bg-gradient-to-br from-[#1a1a2e] via-[#121826] to-[#0a0e17] rounded-xl border border-[#7c3aed]/50 shadow-2xl shadow-purple-900/30 overflow-hidden",children:[e.jsx("div",{className:"absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7c3aed] via-[#a855f7] to-[#c084fc]"}),e.jsxs("div",{className:"p-5",children:[e.jsxs("div",{className:"flex items-start justify-between mb-3",children:[e.jsxs("div",{className:"flex-1",children:[e.jsxs("span",{className:"text-xs text-[#a855f7] font-medium uppercase tracking-wider",children:["Step ",u+1," of ",f]}),e.jsx("h3",{className:"text-lg font-bold text-white mt-1",children:t.title})]}),e.jsx("div",{className:"w-10 h-10 rounded-lg bg-[#7c3aed]/20 flex items-center justify-center text-xl",children:z()})]}),e.jsx("p",{className:"text-sm text-[#9ca3af] leading-relaxed mb-4",children:t.description}),t.action!=="none"&&e.jsxs("div",{className:"bg-[#7c3aed]/10 rounded-lg p-3 mb-4 border border-[#7c3aed]/20",children:[e.jsx("p",{className:"text-xs text-[#c084fc] font-medium mb-1",children:"Your task:"}),e.jsx("p",{className:"text-sm text-white",children:t.actionDescription}),t.expectedResult&&e.jsxs("p",{className:"text-xs text-[#6b7280] mt-1",children:["✓ ",t.expectedResult]})]}),e.jsxs("div",{className:"flex items-center justify-between pt-2 border-t border-[#1e2a42]",children:[e.jsx("button",{onClick:r,className:"px-3 py-1.5 text-xs text-[#6b7280] hover:text-white transition-colors pointer-events-auto",children:"Skip Tutorial"}),e.jsxs("div",{className:"flex items-center gap-2",children:[u>0&&e.jsx("button",{onClick:h,className:"px-3 py-1.5 text-sm text-[#9ca3af] hover:text-white border border-[#1e2a42] rounded-lg hover:border-[#7c3aed]/50 transition-colors pointer-events-auto",children:"← Back"}),e.jsx("button",{onClick:g,className:"px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white rounded-lg hover:from-[#8b5cf6] hover:to-[#7c3aed] transition-all shadow-lg shadow-purple-900/30 pointer-events-auto",children:y?"Complete":"Next →"})]})]})]}),e.jsx("div",{className:`absolute w-0 h-0 border-8 border-transparent ${s.arrowSide==="left"?"border-r-[#7c3aed]/50 -left-[9px] top-1/2 -translate-y-1/2 border-l-0 border-r-[#1a1a2e]":s.arrowSide==="right"?"border-l-[#7c3aed]/50 -right-[9px] top-1/2 -translate-y-1/2 border-r-0 border-l-[#1a1a2e]":s.arrowSide==="top"?"border-b-[#7c3aed]/50 top-[23px] -left-[9px] border-t-0 border-b-[#1a1a2e]":"border-t-[#7c3aed]/50 bottom-[23px] -left-[9px] border-b-0 border-t-[#1a1a2e]"}`})]}),o&&t.action!=="none"&&e.jsx("div",{className:"absolute w-3 h-3 bg-[#7c3aed] rounded-full animate-ping",style:{top:s.arrowSide==="left"?"50%":s.arrowSide==="top"?-20:s.arrowSide==="bottom"?o.height+30:"50%",left:s.arrowSide==="top"||s.arrowSide==="bottom"?"50%":s.arrowSide==="left"?-20:o.width+30,transform:"translate(-50%, -50%)"}})]}):null}function G({targetRect:t,isTransitioning:u}){const f=a.useMemo(()=>{if(!t)return null;const p=8,s=t.left-p,c=t.top-p,k=t.width+p*2,M=t.height+p*2;return{x:s,y:c,w:k,h:M}},[t]);if(!t)return e.jsxs("div",{className:`fixed inset-0 z-[999] bg-black/60 transition-opacity duration-300 ${u?"opacity-0":"opacity-100"}`,children:[e.jsx("svg",{className:"absolute top-4 left-4 w-12 h-12 opacity-20",viewBox:"0 0 24 24",children:e.jsx("path",{d:"M0,12 L12,0 M4,12 L12,4 M8,12 L12,8 M12,0 L12,12 L0,12",stroke:"#7c3aed",strokeWidth:"1",fill:"none"})}),e.jsx("svg",{className:"absolute top-4 right-4 w-12 h-12 opacity-20",viewBox:"0 0 24 24",children:e.jsx("path",{d:"M12,12 L0,0 M8,0 L0,8 M4,0 L0,4 M0,12 L12,0",stroke:"#7c3aed",strokeWidth:"1",fill:"none"})})]});const o=typeof window<"u"?window.innerWidth:1e3,m=typeof window<"u"?window.innerHeight:800,g=t.left-8,h=t.top-8,r=t.width+16,y=t.height+16;return e.jsxs("div",{className:`fixed inset-0 z-[999] transition-opacity duration-300 ${u?"opacity-0":"opacity-100"}`,style:{pointerEvents:"none"},children:[e.jsxs("svg",{width:o,height:m,className:"absolute inset-0",children:[e.jsx("defs",{children:e.jsxs("mask",{id:"tutorial-spotlight-mask",children:[e.jsx("rect",{width:"100%",height:"100%",fill:"white"}),e.jsx("rect",{x:g,y:h,width:r,height:y,rx:"12",ry:"12",fill:"black"})]})}),e.jsx("rect",{width:"100%",height:"100%",fill:"rgba(0, 0, 0, 0.7)",mask:"url(#tutorial-spotlight-mask)"})]}),f&&e.jsx("div",{className:"absolute border-2 border-[#7c3aed]/60 rounded-xl transition-all duration-300",style:{left:f.x-4,top:f.y-4,width:f.w+8,height:f.h+8,boxShadow:"0 0 20px rgba(124, 58, 237, 0.4), inset 0 0 20px rgba(124, 58, 237, 0.1)",animation:"tutorial-glow-pulse 2s ease-in-out infinite"}}),e.jsxs("svg",{className:"absolute inset-0 pointer-events-none",style:{width:"100%",height:"100%"},children:[e.jsx("circle",{cx:t.left-20,cy:t.top-20,r:"3",fill:"#7c3aed",opacity:.6,className:"animate-float"}),e.jsx("circle",{cx:t.right+20,cy:t.top-20,r:"2",fill:"#a855f7",opacity:.5,className:"animate-float-delayed"}),e.jsx("circle",{cx:t.left-20,cy:t.bottom+20,r:"2",fill:"#c084fc",opacity:.5,className:"animate-float-delayed-2"}),e.jsx("circle",{cx:t.right+20,cy:t.bottom+20,r:"3",fill:"#7c3aed",opacity:.6,className:"animate-float"})]}),e.jsx("style",{children:`
        @keyframes tutorial-glow-pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(124, 58, 237, 0.4), inset 0 0 20px rgba(124, 58, 237, 0.1);
          }
          50% {
            box-shadow: 0 0 30px rgba(124, 58, 237, 0.6), inset 0 0 30px rgba(124, 58, 237, 0.2);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-5px) scale(1.1);
            opacity: 0.9;
          }
        }
        
        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translateY(5px) scale(0.9);
            opacity: 0.8;
          }
        }
        
        @keyframes float-delayed-2 {
          0%, 100% {
            transform: translateX(0) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translateX(3px) scale(1.05);
            opacity: 0.7;
          }
        }
        
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 2.5s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        
        .animate-float-delayed-2 {
          animation: float-delayed-2 2.2s ease-in-out infinite;
          animation-delay: 1s;
        }
      `})]})}function F({currentStep:t,totalSteps:u}){const f=(t+1)/u*100;return e.jsxs("div",{className:"fixed top-4 left-1/2 -translate-x-1/2 z-[1001] pointer-events-none",children:[e.jsx("div",{className:"bg-[#121826]/95 backdrop-blur-sm rounded-full px-4 py-2 border border-[#7c3aed]/30 shadow-lg shadow-purple-900/20",children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex items-center gap-1.5",children:Array.from({length:u}).map((o,m)=>e.jsx("div",{className:`w-2 h-2 rounded-full transition-all duration-300 ${m<t?"bg-[#7c3aed] scale-100":m===t?"bg-[#a855f7] scale-125 shadow-lg shadow-[#a855f7]/50":"bg-[#1e2a42]"}`},m))}),e.jsx("div",{className:"w-20 h-1.5 bg-[#1e2a42] rounded-full overflow-hidden",children:e.jsx("div",{className:"h-full bg-gradient-to-r from-[#7c3aed] to-[#a855f7] rounded-full transition-all duration-500 ease-out",style:{width:`${f}%`}})}),e.jsxs("span",{className:"text-xs text-[#9ca3af] font-medium tabular-nums",children:[t+1,"/",u]}),e.jsx("div",{className:"w-5 h-5 flex items-center justify-center text-[#a855f7]",children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M15 4V2"}),e.jsx("path",{d:"M15 16v-2"}),e.jsx("path",{d:"M8 9h2"}),e.jsx("path",{d:"M20 9h2"}),e.jsx("path",{d:"M17.8 11.8L19 13"}),e.jsx("path",{d:"M15 9h.01"}),e.jsx("path",{d:"M17.8 6.2L19 5"}),e.jsx("path",{d:"M3 21l9-9"}),e.jsx("path",{d:"M12.2 6.2L11 5"})]})})]})}),e.jsx("div",{className:"absolute -top-1 -left-1 w-2 h-2 border-l border-t border-[#7c3aed]/40"}),e.jsx("div",{className:"absolute -top-1 -right-1 w-2 h-2 border-r border-t border-[#7c3aed]/40"}),e.jsx("div",{className:"absolute -bottom-1 -left-1 w-2 h-2 border-l border-b border-[#7c3aed]/40"}),e.jsx("div",{className:"absolute -bottom-1 -right-1 w-2 h-2 border-r border-b border-[#7c3aed]/40"})]})}function q({onContinue:t,onReplay:u}){const[f,o]=a.useState(!1),[m,g]=a.useState(!0),h=a.useMemo(()=>Array.from({length:50}).map((s,c)=>({id:c,x:Math.random()*100,delay:Math.random()*2,duration:2+Math.random()*2,color:["#7c3aed","#a855f7","#c084fc","#00d4ff","#f59e0b","#22c55e"][Math.floor(Math.random()*6)],size:4+Math.random()*8,rotation:Math.random()*360})),[]),r=a.useMemo(()=>Array.from({length:30}).map((s,c)=>({id:c,x:Math.random()*100,y:Math.random()*100,size:1+Math.random()*2,delay:Math.random()*3,duration:1+Math.random()*2})),[]);a.useEffect(()=>{setTimeout(()=>o(!0),50);const s=setTimeout(()=>g(!1),4e3);return()=>clearTimeout(s)},[]);const y=()=>{o(!1),setTimeout(t,300)},p=()=>{o(!1),setTimeout(u,300)};return e.jsxs("div",{className:"fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm",children:[m&&e.jsx("div",{className:"absolute inset-0 overflow-hidden pointer-events-none",children:h.map(s=>e.jsx("div",{className:"absolute rounded-sm",style:{left:`${s.x}%`,top:"-20px",width:s.size,height:s.size,backgroundColor:s.color,animation:`confetti-fall ${s.duration}s ease-in-out infinite`,animationDelay:`${s.delay}s`,transform:`rotate(${s.rotation}deg)`,opacity:.8}},s.id))}),e.jsx("div",{className:"absolute inset-0 overflow-hidden pointer-events-none",children:r.map(s=>e.jsx("div",{className:"absolute rounded-full bg-white",style:{left:`${s.x}%`,top:`${s.y}%`,width:s.size,height:s.size,animation:`star-twinkle ${s.duration}s ease-in-out infinite`,animationDelay:`${s.delay}s`,opacity:.3}},s.id))}),e.jsx("div",{className:"absolute w-[600px] h-[600px] bg-[#7c3aed]/20 rounded-full blur-[100px]"}),e.jsxs("div",{className:`relative w-full max-w-lg mx-4 transition-all duration-500 transform ${f?"opacity-100 scale-100":"opacity-0 scale-95"}`,children:[e.jsxs("div",{className:"relative w-40 h-40 mx-auto mb-8",children:[e.jsxs("svg",{className:"absolute inset-0 w-full h-full animate-spin-slow",viewBox:"0 0 200 200",children:[e.jsx("circle",{cx:"100",cy:"100",r:"95",fill:"none",stroke:"url(#completionGradient)",strokeWidth:"3",strokeDasharray:"20 10"}),e.jsx("defs",{children:e.jsxs("linearGradient",{id:"completionGradient",x1:"0%",y1:"0%",x2:"100%",y2:"100%",children:[e.jsx("stop",{offset:"0%",stopColor:"#7c3aed"}),e.jsx("stop",{offset:"50%",stopColor:"#a855f7"}),e.jsx("stop",{offset:"100%",stopColor:"#7c3aed"})]})})]}),e.jsx("svg",{className:"absolute inset-4 w-[calc(100%-32px)] h-[calc(100%-32px)] animate-spin-reverse",viewBox:"0 0 200 200",children:e.jsx("circle",{cx:"100",cy:"100",r:"95",fill:"none",stroke:"#c084fc",strokeWidth:"1",strokeDasharray:"5 5",opacity:"0.5"})}),e.jsx("div",{className:"absolute inset-8 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] flex items-center justify-center shadow-lg shadow-purple-900/50",children:e.jsx("span",{className:"text-5xl",children:"🏆"})}),e.jsx("div",{className:"absolute inset-0 rounded-full bg-[#7c3aed]/30 animate-pulse-glow"})]}),e.jsxs("div",{className:"text-center mb-8",children:[e.jsx("h1",{className:"text-3xl font-bold text-white mb-2",children:T.title}),e.jsx("p",{className:"text-xl text-[#a855f7]",children:T.subtitle})]}),e.jsx("p",{className:"text-[#9ca3af] text-center mb-8 leading-relaxed",children:T.message}),e.jsxs("div",{className:"bg-[#0a0e17]/50 rounded-xl p-4 mb-8 border border-[#1e2a42]",children:[e.jsx("h3",{className:"text-sm font-medium text-[#c084fc] mb-3 text-center",children:"Pro Tips"}),e.jsx("div",{className:"space-y-2",children:T.tips.map((s,c)=>e.jsxs("p",{className:"text-xs text-[#9ca3af] flex items-start gap-2",children:[e.jsx("span",{className:"text-[#7c3aed]",children:"✦"}),s]},c))})]}),e.jsxs("div",{className:"flex flex-col sm:flex-row gap-4 justify-center",children:[e.jsxs("button",{onClick:y,className:`flex-1 px-6 py-3 rounded-xl font-bold text-white
                       bg-gradient-to-r from-[#22c55e] to-[#16a34a]
                       hover:from-[#4ade80] hover:to-[#22c55e]
                       shadow-lg shadow-green-900/40
                       transition-all duration-200
                       flex items-center justify-center gap-2
                       hover:scale-[1.02] active:scale-[0.98]`,children:[e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M22 11.08V12a10 10 0 1 1-5.93-9.14"}),e.jsx("polyline",{points:"22 4 12 14.01 9 11.01"})]}),T.continue]}),e.jsxs("button",{onClick:p,className:`flex-1 px-6 py-3 rounded-xl font-medium
                       bg-[#121826] text-[#9ca3af]
                       hover:bg-[#1a1a2e] hover:text-white
                       border border-[#1e2a42] hover:border-[#7c3aed]/30
                       transition-all duration-200
                       flex items-center justify-center gap-2`,children:[e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M1 4v6h6"}),e.jsx("path",{d:"M3.51 15a9 9 0 1 0 2.13-9.36L1 10"})]}),T.replayTutorial]})]}),e.jsx("div",{className:"absolute -top-4 left-1/2 -translate-x-1/2 flex gap-4",children:["⚙","🔮","⚡","✨","⚡","🔮","⚙"].map((s,c)=>e.jsx("span",{className:"text-lg text-[#7c3aed]/40",style:{animation:"rune-float 3s ease-in-out infinite",animationDelay:`${c*.2}s`},children:s},c))})]}),e.jsx("style",{children:`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.8;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        @keyframes star-twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.5);
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(124, 58, 237, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(124, 58, 237, 0.6);
          }
        }
        
        @keyframes rune-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-spin-reverse {
          animation: spin-reverse 6s linear infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `})]})}function ie({onModuleAdded:t,onModuleSelected:u,onModuleConnected:f,onMachineActivated:o,onMachineSaved:m,onTutorialCompleted:g}){const h=v(n=>n.isTutorialActive),r=v(n=>n.currentStep),y=a.useRef(v.getState().nextStep),p=a.useRef(v.getState().previousStep),s=a.useRef(v.getState().skipTutorial),c=a.useRef(v.getState().completeTutorial),k=a.useRef(v.getState().goToStep),M=a.useRef(v.getState().triggerStepCompletion);a.useEffect(()=>{const n=v.getState();y.current=n.nextStep,p.current=n.previousStep,s.current=n.skipTutorial,c.current=n.completeTutorial,k.current=n.goToStep,M.current=n.triggerStepCompletion},[]);const[z,w]=a.useState(!1),[j,i]=a.useState(null),[b,d]=a.useState(!1),l=a.useMemo(()=>_(r)??null,[r]),x=a.useRef(t),C=a.useRef(u),L=a.useRef(f),P=a.useRef(o),D=a.useRef(m),O=a.useRef(g);a.useEffect(()=>{x.current=t,C.current=u,L.current=f,P.current=o,D.current=m,O.current=g},[t,u,f,o,m,g]);const E=a.useCallback(()=>{if(!h){i(null);return}if(!l){i(null);return}const n=l.targetSelector,$=document.querySelector(n);if($){const N=$.getBoundingClientRect(),Y=l.highlightPadding||8;i(new DOMRect(N.left-Y,N.top-Y,N.width+Y*2,N.height+Y*2))}else i(null)},[h,l]),S=a.useRef(null),W=a.useRef(r);a.useEffect(()=>{if(!h)return;E();const n=()=>E(),$=()=>E();window.addEventListener("resize",n),window.addEventListener("scroll",$,!0);const N=new MutationObserver(()=>{S.current&&clearTimeout(S.current),S.current=setTimeout(()=>{E()},200)});return N.observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","style"]}),()=>{window.removeEventListener("resize",n),window.removeEventListener("scroll",$,!0),N.disconnect(),S.current&&(clearTimeout(S.current),S.current=null)}},[h,r,E]),a.useEffect(()=>{W.current!==r&&(W.current=r)},[r]),a.useEffect(()=>{if(h&&W.current!==r)switch(W.current=r,r){case 2:x.current?.();break;case 3:C.current?.();break;case 4:L.current?.();break;case 5:P.current?.();break;case 6:D.current?.();break}},[r,h]),a.useEffect(()=>{const n=()=>{O.current?.()};return window.addEventListener("tutorial:completed",n),()=>{window.removeEventListener("tutorial:completed",n)}},[]);const R=a.useCallback(()=>{r>=B-1?(c.current(),w(!0)):(d(!0),setTimeout(()=>{y.current(),d(!1)},150))},[r]),H=a.useCallback(()=>{r>0&&(d(!0),setTimeout(()=>{p.current(),d(!1)},150))},[r]),V=a.useCallback(()=>{s.current()},[]),A=a.useCallback(()=>{w(!1),c.current()},[]),I=a.useCallback(()=>{w(!1),k.current(0)},[]);return!h&&!z?null:z?e.jsx(q,{onContinue:A,onReplay:I}):e.jsxs(e.Fragment,{children:[e.jsx(G,{targetRect:j,isTransitioning:b}),l&&e.jsx(X,{step:l,currentStep:r,totalSteps:B,targetRect:j,isTransitioning:b,onNext:R,onPrevious:H,onSkip:V,onLastStep:r>=B-1}),e.jsx(F,{currentStep:r,totalSteps:B})]})}export{ie as TutorialOverlay,ie as default};
