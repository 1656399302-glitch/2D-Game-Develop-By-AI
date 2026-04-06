import{u as g,j as e}from"./components-circuit-module-D_URZDHL.js";import{r as o}from"./vendor-zustand-CtSZPRb0.js";import{t as b,v}from"./index-D27Vd7CF.js";import"./vendor-utils-CtRu48qb.js";import"./vendor-react-IJARFiOZ.js";import"./components-codex-Dnp2_M8z.js";import"./vendor-gsap-C8pce-KX.js";import"./utils-activation-RRVepEpl.js";import"./utils-animation-CKkdz26L.js";import"./components-faction-914K4lAt.js";import"./components-templates-BAsJtbJg.js";import"./components-challenge-SxxkFjWj.js";const j={"same-port-type":{title:"连接类型冲突",suggestion:"请从输出端口（圆形）连接到输入端口（方形）"},"connection-exists":{title:"连接已存在",suggestion:"这两个端口之间已经存在连接"},"same-module":{title:"无法自连接",suggestion:"不能将模块连接到自身"},"invalid-port":{title:"无效端口",suggestion:"请选择一个有效的连接端口"},"port-occupied":{title:"端口已被占用",suggestion:"该端口已经连接，请选择其他端口或断开现有连接"},"self-connection":{title:"禁止自连接",suggestion:"模块不能连接到自己的端口"}};function O(){const t=g(s=>s.connectionError),[n,i]=o.useState(!1),[r,a]=o.useState(null),u=o.useCallback(s=>{if(!s)return null;const c={连接类型冲突:"same-port-type",不能连接相同类型的端口:"same-port-type",连接已存在:"connection-exists","cannot connect same port types":"same-port-type"};let d="invalid-port";for(const[m,h]of Object.entries(c))if(s.includes(m)){d=h;break}const f=j[d],p=d==="same-port-type"?"warning":"error";return{title:f?.title||"连接错误",suggestion:f?.suggestion||"请检查端口类型并重试",severity:p}},[]);o.useEffect(()=>{if(t){const s=u(t);a(s),i(!0),s&&(b(s.title,s.suggestion),v("error",void 0,void 0,`${s.title}: ${s.suggestion}`));const c=setTimeout(()=>{i(!1)},4e3);return()=>clearTimeout(c)}else i(!1)},[t,u]);const x=o.useCallback(()=>{i(!1)},[]);if(!n||!r)return null;const l={error:{bg:"bg-[#7f1d1d]",border:"border-[#ef4444]",icon:e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 20 20",fill:"none","aria-hidden":"true",children:[e.jsx("circle",{cx:"10",cy:"10",r:"8",stroke:"#ef4444",strokeWidth:"1.5"}),e.jsx("path",{d:"M10 6v5",stroke:"#ef4444",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("circle",{cx:"10",cy:"13.5",r:"1",fill:"#ef4444"})]})},warning:{bg:"bg-[#78350f]",border:"border-[#f97316]",icon:e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 20 20",fill:"none","aria-hidden":"true",children:[e.jsx("path",{d:"M10 3L18 17H2L10 3Z",stroke:"#f97316",strokeWidth:"1.5",fill:"none"}),e.jsx("path",{d:"M10 8v4",stroke:"#f97316",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("circle",{cx:"10",cy:"14",r:"1",fill:"#f97316"})]})},info:{bg:"bg-[#1e3a5f]",border:"border-[#3b82f6]",icon:e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 20 20",fill:"none","aria-hidden":"true",children:[e.jsx("circle",{cx:"10",cy:"10",r:"8",stroke:"#3b82f6",strokeWidth:"1.5"}),e.jsx("path",{d:"M10 9v6",stroke:"#3b82f6",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("circle",{cx:"10",cy:"6.5",r:"1",fill:"#3b82f6"})]})}}[r.severity];return e.jsxs("div",{role:"alert","aria-live":"assertive",className:`
        fixed top-20 left-1/2 transform -translate-x-1/2 z-50
        animate-slideDown
        max-w-md w-full mx-4
      `,style:{animation:"slideDown 0.3s ease-out"},children:[e.jsxs("div",{className:`
        flex items-start gap-3 px-4 py-3 rounded-lg shadow-xl
        ${l.bg} border ${l.border}
      `,children:[e.jsx("div",{className:"flex-shrink-0 mt-0.5 animate-pulse-subtle",children:l.icon}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"text-sm font-medium text-white",children:r.title}),e.jsx("p",{className:"text-xs text-[#d1d5db] mt-1 leading-relaxed",children:r.suggestion}),e.jsx("div",{className:"mt-2 pt-2 border-t border-white/10",children:e.jsxs("div",{className:"flex items-center gap-2 text-xs text-[#9ca3af]",children:[e.jsx("span",{"aria-hidden":"true",children:"💡"}),e.jsx("span",{children:r.severity==="warning"?"圆形端口为输出，方形端口为输入":"尝试拖动到不同的端口"})]})})]}),e.jsx("button",{onClick:x,className:"flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors text-[#9ca3af] hover:text-white","aria-label":"关闭提示",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 16 16",fill:"none","aria-hidden":"true",children:e.jsx("path",{d:"M4 4l8 8M12 4l-8 8",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})})]}),e.jsx("style",{children:`
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
        
        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 1.5s ease-in-out infinite;
        }
      `})]})}function R({error:t,portType:n}){const[i,r]=o.useState(!1);return o.useEffect(()=>{if(t){r(!0);const a=setTimeout(()=>r(!1),3e3);return()=>clearTimeout(a)}r(!1)},[t]),i?e.jsxs("div",{role:"tooltip",className:"absolute z-50 px-2 py-1 text-xs bg-[#7f1d1d] text-[#fecaca] rounded border border-[#ef4444] whitespace-nowrap",children:[n==="output"?"输出端口":"输入端口"," - ",t]}):null}function $({show:t,onComplete:n}){return o.useEffect(()=>{if(t){const i=setTimeout(n,1500);return()=>clearTimeout(i)}},[t,n]),t?e.jsx("div",{role:"status","aria-live":"polite",className:"fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown",children:e.jsxs("div",{className:"flex items-center gap-2 px-4 py-2 bg-[#064e3b] border border-[#22c55e] rounded-lg shadow-lg",children:[e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 16 16",fill:"none","aria-hidden":"true",children:[e.jsx("circle",{cx:"8",cy:"8",r:"7",stroke:"#22c55e",strokeWidth:"1.5"}),e.jsx("path",{d:"M5 8l2 2 4-4",stroke:"#22c55e",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),e.jsx("span",{className:"text-sm font-medium text-[#86efac]",children:"连接成功"})]})}):null}export{O as ConnectionErrorFeedback,$ as ConnectionSuccessFeedback,R as PortErrorIndicator,O as default};
