import{R as Q,P as G,A as H,v as je,j as e,u as de,w as Ce}from"./components-circuit-module-DaUEWxkx.js";import{r as y}from"./vendor-zustand-CtSZPRb0.js";import{F as xe,k as Ne}from"./components-codex-CVdGK8op.js";import{y as Se}from"./index-BTq2IoQH.js";import"./vendor-utils-CtRu48qb.js";import"./vendor-react-IJARFiOZ.js";import"./vendor-gsap-C8pce-KX.js";import"./utils-activation-RRVepEpl.js";import"./utils-animation-CKkdz26L.js";import"./components-faction-BVZ8CxDD.js";import"./components-templates-DBRIaJF2.js";const he={poster:{width:800,height:1e3},twitter:{width:1200,height:675},instagram:{width:1080,height:1080},discord:{width:600,height:400}},_=400,Y=2e3;function q(o,s){return!o||isNaN(o)?{isValid:!1,errorMessage:"Width is required"}:!s||isNaN(s)?{isValid:!1,errorMessage:"Height is required"}:o<_?{isValid:!1,errorMessage:`Width must be at least ${_}px`}:o>Y?{isValid:!1,errorMessage:`Width must be at most ${Y}px`}:s<_?{isValid:!1,errorMessage:`Height must be at least ${_}px`}:s>Y?{isValid:!1,errorMessage:`Height must be at most ${Y}px`}:{isValid:!0}}function Me(o){return he[o]||he.poster}function ge(o,s,a={format:"svg"}){const r=X(o),i=40,n=a.width||r.width+i*2,t=a.height||r.height+i*2;return`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="0 0 ${n} ${t}" 
     width="${n}" 
     height="${t}">
  <defs>
    <!-- Gradients -->
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0e17"/>
      <stop offset="100%" style="stop-color:#121826"/>
    </linearGradient>
    <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#00ffcc"/>
      <stop offset="50%" style="stop-color:#00d4ff"/>
      <stop offset="100%" style="stop-color:#00ffcc"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bgGradient)"/>
  
  <!-- Grid Pattern -->
  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e2a42" stroke-width="0.5"/>
  </pattern>
  <rect width="100%" height="100%" fill="url(#grid)" opacity="0.5"/>
  
  <!-- Energy Connections -->
  <g id="connections" filter="url(#glow)">
    ${s.map(c=>`
    <path d="${c.pathData}" 
          fill="none" 
          stroke="url(#energyGradient)" 
          stroke-width="3" 
          stroke-dasharray="10,5"
          opacity="0.8"/>
    <path d="${c.pathData}" 
          fill="none" 
          stroke="#00ffcc" 
          stroke-width="1"
          stroke-dasharray="10,5"
          stroke-dashoffset="0">
      <animate attributeName="stroke-dashoffset" from="15" to="0" dur="0.5s" repeatCount="indefinite"/>
    </path>`).join("")}
  </g>
  
  <!-- Modules -->
  <g id="modules">
    ${o.map(c=>K(c)).join("")}
  </g>
</svg>`}function K(o){const s=`translate(${o.x}, ${o.y}) rotate(${o.rotation})`;return{"core-furnace":`
      <g transform="${s}">
        <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" 
                 fill="#1a1a2e" stroke="#00d4ff" stroke-width="2"/>
        <circle cx="50" cy="50" r="25" fill="#0a0e17" stroke="#00ffcc" stroke-width="2"/>
        <circle cx="50" cy="50" r="15" fill="#00d4ff" opacity="0.5">
          <animate attributeName="r" values="15;18;15" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="50" cy="50" r="8" fill="#00ffcc">
          <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite"/>
        </circle>
      </g>
    `,"energy-pipe":`
      <g transform="${s}">
        <rect x="0" y="10" width="100" height="30" rx="5" fill="#1a1a2e" stroke="#7c3aed" stroke-width="2"/>
        <rect x="5" y="15" width="90" height="20" rx="3" fill="#2d1b4e"/>
        <line x1="20" y1="25" x2="80" y2="25" stroke="#a855f7" stroke-width="3" stroke-dasharray="8,4">
          <animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.5s" repeatCount="indefinite"/>
        </line>
      </g>
    `,gear:`
      <g transform="${s}">
        <circle cx="40" cy="40" r="30" fill="#1a1a2e" stroke="#f59e0b" stroke-width="2"/>
        <circle cx="40" cy="40" r="20" fill="#2d2d2d" stroke="#fbbf24" stroke-width="2"/>
        <g stroke="#f59e0b" stroke-width="4">
          <line x1="40" y1="5" x2="40" y2="15"/>
          <line x1="40" y1="65" x2="40" y2="75"/>
          <line x1="5" y1="40" x2="15" y2="40"/>
          <line x1="65" y1="40" x2="75" y2="40"/>
        </g>
        <circle cx="40" cy="40" r="8" fill="#f59e0b"/>
        <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="4s" repeatCount="indefinite"/>
      </g>
    `,"rune-node":`
      <g transform="${s}">
        <circle cx="40" cy="40" r="35" fill="#1a1a2e" stroke="#9333ea" stroke-width="2"/>
        <circle cx="40" cy="40" r="25" fill="#2d1b4e" stroke="#a855f7" stroke-width="1"/>
        <path d="M40,15 L50,35 L70,35 L55,48 L60,68 L40,55 L20,68 L25,48 L10,35 L30,35 Z" 
              fill="none" stroke="#c084fc" stroke-width="1.5"/>
        <circle cx="40" cy="40" r="8" fill="#9333ea">
          <animate attributeName="opacity" values="1;0.3;1" dur="3s" repeatCount="indefinite"/>
        </circle>
      </g>
    `,"shield-shell":`
      <g transform="${s}">
        <path d="M10,15 Q50,0 90,15 L95,45 Q50,55 5,45 Z" 
              fill="#1a1a2e" stroke="#22c55e" stroke-width="2"/>
        <path d="M15,20 Q50,8 85,20 L88,42 Q50,50 12,42 Z" 
              fill="#064e3b" stroke="#4ade80" stroke-width="1"/>
        <ellipse cx="50" cy="32" rx="20" ry="10" fill="none" stroke="#4ade80" stroke-width="1" opacity="0.5">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
        </ellipse>
      </g>
    `,"trigger-switch":`
      <g transform="${s}">
        <rect x="15" y="5" width="50" height="90" rx="5" fill="#1a1a2e" stroke="#ef4444" stroke-width="2"/>
        <rect x="20" y="50" width="40" height="40" rx="3" fill="#2d2d2d" stroke="#f87171" stroke-width="1"/>
        <circle cx="40" cy="70" r="10" fill="#dc2626" stroke="#ef4444" stroke-width="2">
          <animate attributeName="fill" values="#dc2626;#ef4444;#dc2626" dur="1s" repeatCount="indefinite"/>
        </circle>
        <rect x="25" y="10" width="30" height="25" rx="2" fill="#2d2d2d" stroke="#f87171" stroke-width="1"/>
      </g>
    `,"void-siphon":`
      <g transform="${s}">
        <circle cx="40" cy="40" r="32" fill="#1e1b4b" stroke="#a78bfa" stroke-width="2"/>
        <circle cx="40" cy="40" r="22" fill="none" stroke="#7c3aed" stroke-width="1"/>
        <circle cx="40" cy="40" r="12" fill="#4c1d95"/>
        <circle cx="40" cy="40" r="6" fill="#7c3aed"/>
      </g>
    `,"phase-modulator":`
      <g transform="${s}">
        <polygon points="40,4 68,18 68,52 40,66 12,52 12,18" fill="#164e63" stroke="#22d3ee" stroke-width="2"/>
        <polygon points="40,12 60,23 60,47 40,58 20,47 20,23" fill="none" stroke="#06b6d4" stroke-width="1"/>
        <circle cx="40" cy="40" r="8" fill="#0891b2"/>
        <circle cx="40" cy="40" r="4" fill="#22d3ee"/>
      </g>
    `}[o.type]||`<g transform="${s}"><rect width="60" height="60" fill="#333"/></g>`}function X(o){if(o.length===0)return{minX:0,minY:0,maxX:800,maxY:600,width:800,height:600};const s={"core-furnace":{width:100,height:100},"energy-pipe":{width:120,height:50},gear:{width:80,height:80},"rune-node":{width:80,height:80},"shield-shell":{width:100,height:60},"trigger-switch":{width:60,height:100},"output-array":{width:80,height:80},"amplifier-crystal":{width:80,height:80},"stabilizer-core":{width:80,height:80},"void-siphon":{width:80,height:80},"phase-modulator":{width:80,height:80}};let a=1/0,r=1/0,i=-1/0,n=-1/0;return o.forEach(t=>{const h=s[t.type]||{width:80,height:80};a=Math.min(a,t.x),r=Math.min(r,t.y),i=Math.max(i,t.x+h.width),n=Math.max(n,t.y+h.height)}),{minX:a,minY:r,maxX:i,maxY:n,width:i-a,height:n-r}}async function ze(o,s,a={}){const r=ge(o,s,{}),i=document.createElement("canvas"),n=i.getContext("2d"),t=new Image,c={"1x":1,"2x":2,"4x":4}[a.scale||"2x"];return new Promise((f,w)=>{t.onload=()=>{const v=a.width||t.width,g=a.height||t.height;i.width=v*c,i.height=g*c,a.transparentBackground?n.clearRect(0,0,i.width,i.height):(n.fillStyle="#0a0e17",n.fillRect(0,0,i.width,i.height)),n.scale(c,c),n.drawImage(t,0,0),i.toBlob(d=>{d?f(d):w(new Error("Failed to create PNG blob"))},"image/png")},t.onerror=()=>w(new Error("Failed to load SVG")),t.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(r)})}function Ge(o,s){const a=X(o),r=40,i=Math.max(a.width+r*2,Q["1x"].base),n=Math.max(a.height+r*2,300),t=Q[s].scaled/Q["1x"].base;return{width:Math.round(i*t),height:Math.round(n*t)}}function Le(o,s,a,r="default"){const i=X(o),n=H[r],t=Math.max(i.width+100,400),h=Math.max(i.height+100,300),c=(n.width-Math.min(t,500))/2,f=150;return`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="0 0 ${n.width} ${n.height}" 
     width="${n.width}" 
     height="${n.height}">
  <defs>
    <linearGradient id="posterBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0e17"/>
      <stop offset="100%" style="stop-color:#1a1a2e"/>
    </linearGradient>
    <filter id="posterGlow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#posterBg)"/>
  
  <!-- Border -->
  <rect x="20" y="20" width="${n.width-40}" height="${n.height-40}" 
        fill="none" stroke="#00d4ff" stroke-width="2" rx="10"/>
  <rect x="30" y="30" width="${n.width-60}" height="${n.height-60}" 
        fill="none" stroke="#7c3aed" stroke-width="1" rx="8" opacity="0.5"/>
  
  <!-- Title -->
  <text x="${n.width/2}" y="60" text-anchor="middle" 
        fill="#00d4ff" font-family="serif" font-size="24" font-weight="bold">
    ARCANE MACHINE CODEX
  </text>
  
  <!-- Machine Name -->
  <text x="${n.width/2}" y="95" text-anchor="middle" 
        fill="#ffd700" font-family="serif" font-size="18">
    ${a.name}
  </text>
  
  <!-- Rarity Badge -->
  <rect x="${n.width/2-50}" y="110" width="100" height="25" rx="12" 
        fill="${W(a.rarity)}" opacity="0.3"/>
  <text x="${n.width/2}" y="128" text-anchor="middle" 
        fill="${W(a.rarity)}" font-size="14" font-weight="bold">
    ${a.rarity.toUpperCase()}
  </text>
  
  <!-- Machine Preview -->
  <g transform="translate(${c-i.minX}, ${f-i.minY})">
    ${s.map(w=>`
    <path d="${w.pathData}" 
          fill="none" 
          stroke="#00ffcc" 
          stroke-width="2" 
          stroke-dasharray="5,3"
          opacity="0.8"/>`).join("")}
    ${o.map(w=>K(w)).join("")}
  </g>
  
  <!-- Stats -->
  <g transform="translate(50, ${f+h+30})">
    <text fill="#9ca3af" font-size="12">STATS</text>
    <text x="0" y="20" fill="#4ade80" font-size="11">Stability: ${a.stats.stability}%</text>
    <text x="0" y="35" fill="#f59e0b" font-size="11">Power: ${a.stats.powerOutput}</text>
    <text x="0" y="50" fill="#ef4444" font-size="11">Failure: ${a.stats.failureRate}%</text>
    
    <text x="150" y="20" fill="#a855f7" font-size="11">Tags: ${a.tags.join(", ")}</text>
    <text x="150" y="35" fill="#9ca3af" font-size="10">ID: ${a.codexId}</text>
  </g>
  
  <!-- Description -->
  <text x="50" y="${n.height-80}" fill="#9ca3af" font-size="10" font-family="serif">
    <tspan x="50" dy="0">${a.description.substring(0,60)}</tspan>
    <tspan x="50" dy="14">${a.description.substring(60)}</tspan>
  </text>
  
  <!-- Footer -->
  <text x="${n.width/2}" y="${n.height-30}" text-anchor="middle" 
        fill="#4a5568" font-size="10">
    Arcane Machine Codex Workshop
  </text>
</svg>`}function Be(o,s){const a=je[o];return o==="faction"&&s?{start:Ee(s,.3),end:"#1a1a2e"}:a}function Ee(o,s){const a=o.replace("#",""),r=parseInt(a.substring(0,2),16),i=parseInt(a.substring(2,4),16),n=parseInt(a.substring(4,6),16),t=Math.round(r*(1-s)),h=Math.round(i*(1-s)),c=Math.round(n*(1-s));return`#${t.toString(16).padStart(2,"0")}${h.toString(16).padStart(2,"0")}${c.toString(16).padStart(2,"0")}`}function Re(o,s,a,r="default",i={}){const n=X(o),t=H[r],h=r==="landscape",c=r==="square",f=h?280:c?300:350,w=100,v=Math.min((t.width-100)/Math.max(n.width,1),f/Math.max(n.height,1),1),g=n.width*v,d=n.height*v,m=(t.width-g)/2-n.minX*v,j=w+(f-d)/2-n.minY*v,u=me(a.tags),C=i.backgroundColor?Be(i.backgroundColor,i.factionColor):pe(u),p=i.username?`
  <!-- AC5: Watermark/Username in bottom-right -->
  <g transform="translate(${t.width-20}, ${t.height-20})">
    <rect x="-120" y="-24" width="120" height="24" rx="4" fill="#0a0e17" opacity="0.7"/>
    <text x="-10" y="-6" text-anchor="end" fill="white" font-size="12" opacity="0.6" font-family="sans-serif">
      @${i.username}
    </text>
  </g>`:"";return`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="0 0 ${t.width} ${t.height}" 
     width="${t.width}" 
     height="${t.height}">
  <defs>
    <linearGradient id="enhancedBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${C.start}"/>
      <stop offset="100%" style="stop-color:${C.end}"/>
    </linearGradient>
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fbbf24"/>
      <stop offset="50%" style="stop-color:#f59e0b"/>
      <stop offset="100%" style="stop-color:#fbbf24"/>
    </linearGradient>
    <filter id="enhancedGlow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="innerShadow">
      <feOffset dx="0" dy="2"/>
      <feGaussianBlur stdDeviation="2" result="offset-blur"/>
      <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
      <feFlood flood-color="#000" flood-opacity="0.3" result="color"/>
      <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
      <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
    </filter>
  </defs>
  
  <!-- Background with custom color -->
  <rect width="100%" height="100%" fill="url(#enhancedBg)"/>
  
  <!-- AC6: Animated decorative corner ornaments with SVG stroke-dasharray animation -->
  <g stroke="url(#goldGradient)" stroke-width="2" fill="none">
    <!-- Top left corner flourish with animation -->
    <path d="M10,50 L10,10 L50,10" stroke-dasharray="60" stroke-dashoffset="60">
      <animate attributeName="stroke-dashoffset" from="60" to="0" dur="1s" fill="freeze"/>
    </path>
    <path d="M15,40 L15,15 L40,15" stroke-dasharray="40" stroke-dashoffset="40">
      <animate attributeName="stroke-dashoffset" from="40" to="0" dur="0.8s" fill="freeze"/>
    </path>
    <circle cx="10" cy="10" r="3" fill="#fbbf24"/>
    
    <!-- Top right corner flourish with animation -->
    <path d="M${t.width-10},50 L${t.width-10},10 L${t.width-50},10" stroke-dasharray="60" stroke-dashoffset="60">
      <animate attributeName="stroke-dashoffset" from="60" to="0" dur="1s" fill="freeze"/>
    </path>
    <path d="M${t.width-15},40 L${t.width-15},15 L${t.width-40},15" stroke-dasharray="40" stroke-dashoffset="40">
      <animate attributeName="stroke-dashoffset" from="40" to="0" dur="0.8s" fill="freeze"/>
    </path>
    <circle cx="${t.width-10}" cy="10" r="3" fill="#fbbf24"/>
    
    <!-- Bottom left corner flourish with animation -->
    <path d="M10,${t.height-50} L10,${t.height-10} L50,${t.height-10}" stroke-dasharray="60" stroke-dashoffset="60">
      <animate attributeName="stroke-dashoffset" from="60" to="0" dur="1s" fill="freeze"/>
    </path>
    <path d="M15,${t.height-40} L15,${t.height-15} L40,${t.height-15}" stroke-dasharray="40" stroke-dashoffset="40">
      <animate attributeName="stroke-dashoffset" from="40" to="0" dur="0.8s" fill="freeze"/>
    </path>
    <circle cx="10" cy="${t.height-10}" r="3" fill="#fbbf24"/>
    
    <!-- Bottom right corner flourish with animation -->
    <path d="M${t.width-10},${t.height-50} L${t.width-10},${t.height-10} L${t.width-50},${t.height-10}" stroke-dasharray="60" stroke-dashoffset="60">
      <animate attributeName="stroke-dashoffset" from="60" to="0" dur="1s" fill="freeze"/>
    </path>
    <path d="M${t.width-15},${t.height-40} L${t.width-15},${t.height-15} L${t.width-40},${t.height-15}" stroke-dasharray="40" stroke-dashoffset="40">
      <animate attributeName="stroke-dashoffset" from="40" to="0" dur="0.8s" fill="freeze"/>
    </path>
    <circle cx="${t.width-10}" cy="${t.height-10}" r="3" fill="#fbbf24"/>
  </g>
  
  <!-- Outer border -->
  <rect x="20" y="20" width="${t.width-40}" height="${t.height-40}" 
        fill="none" stroke="url(#goldGradient)" stroke-width="2" rx="12"/>
  
  <!-- Inner border -->
  <rect x="30" y="30" width="${t.width-60}" height="${t.height-60}" 
        fill="none" stroke="${W(a.rarity)}" stroke-width="1" rx="8" opacity="0.6"/>
  
  <!-- Title banner -->
  <g transform="translate(${t.width/2}, 55)">
    <text x="0" y="0" text-anchor="middle" fill="#00d4ff" font-family="serif" font-size="14" letter-spacing="4">
      ★ ARCANE MACHINE CODEX ★
    </text>
  </g>
  
  <!-- Machine Name with ornate styling -->
  <g transform="translate(${t.width/2}, ${c?80:90})">
    <text x="0" y="0" text-anchor="middle" fill="#ffd700" font-family="serif" font-size="28" font-weight="bold" filter="url(#enhancedGlow)">
      ${a.name}
    </text>
    <!-- Decorative underline -->
    <line x1="-120" y1="10" x2="-20" y2="10" stroke="#ffd700" stroke-width="1" opacity="0.6"/>
    <circle cx="0" cy="10" r="3" fill="#ffd700"/>
    <line x1="20" y1="10" x2="120" y2="10" stroke="#ffd700" stroke-width="1" opacity="0.6"/>
  </g>
  
  <!-- Rarity Badge with icon -->
  <g transform="translate(${t.width/2}, ${c?110:120})">
    <rect x="-60" y="-12" width="120" height="24" rx="12" 
          fill="${W(a.rarity)}" opacity="0.2"/>
    <rect x="-58" y="-10" width="116" height="20" rx="10" 
          fill="none" stroke="${W(a.rarity)}" stroke-width="1"/>
    <text x="0" y="4" text-anchor="middle" fill="${W(a.rarity)}" font-size="12" font-weight="bold" letter-spacing="2">
      ${Z(a.rarity)} ${a.rarity.toUpperCase()} ${Z(a.rarity)}
    </text>
  </g>
  
  <!-- Machine Preview Container -->
  <rect x="40" y="${w}" width="${t.width-80}" height="${f}" 
        fill="#0a0e17" stroke="#1e2a42" stroke-width="1" rx="8" filter="url(#innerShadow)"/>
  
  <!-- Machine Preview -->
  <g transform="translate(${m}, ${j}) scale(${v})">
    ${s.map(b=>`
    <path d="${b.pathData}" 
          fill="none" 
          stroke="#00ffcc" 
          stroke-width="2.5" 
          stroke-dasharray="6,3"
          opacity="0.9"
          filter="url(#enhancedGlow)"/>`).join("")}
    ${o.map(b=>K(b)).join("")}
  </g>
  
  <!-- Stats Panel -->
  ${We(a,w,f,h)}
  
  <!-- Tags Panel -->
  ${Te(a,w,f,h,c)}
  
  <!-- Faction Emblem Placeholder -->
  <g transform="translate(${t.width-100}, ${w+f+50})">
    <circle cx="30" cy="30" r="28" fill="none" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="4,2" opacity="0.6"/>
    <circle cx="30" cy="30" r="22" fill="none" stroke="#fbbf24" stroke-width="1" opacity="0.4"/>
    <text x="30" y="36" text-anchor="middle" fill="#fbbf24" font-size="20" opacity="0.7">⚗</text>
    <text x="30" y="75" text-anchor="middle" fill="#6b7280" font-size="8">FACTION</text>
  </g>
  
  <!-- Description -->
  <g transform="translate(50, ${t.height-130})">
    <text fill="#9ca3af" font-size="10" font-family="serif" font-style="italic">
      <tspan x="0" dy="0">${Fe(a.description,70)}</tspan>
    </text>
  </g>
  
  <!-- Footer -->
  <g transform="translate(${t.width/2}, ${t.height-35})">
    <text x="0" y="0" text-anchor="middle" fill="#4a5568" font-size="9">
      Arcane Machine Codex Workshop
    </text>
    <text x="0" y="14" text-anchor="middle" fill="#374151" font-size="8">
      ID: ${a.codexId}
    </text>
  </g>
  
  ${p?`<!-- AC5: Watermark -->
  ${p}`:""}
</svg>`}function Ae(o,s,a,r,i={}){const n=G[r],t={width:n.width,height:n.height},h=X(o),c=r==="twitter",f=r==="instagram",w=f?200:c?100:120,v=f?500:c?350:180,g=w,d=Math.min((t.width-150)/Math.max(h.width,1),v/Math.max(h.height,1),.8),m=h.width*d,j=h.height*d,u=(t.width-m)/2-h.minX*d,C=g+(v-j)/2-h.minY*d,p=n.accentColor,b=me(a.tags),k=pe(b),M=i.username?`
  <!-- AC5: Watermark/Username in bottom-right -->
  <g transform="translate(${t.width-25}, ${t.height-25})">
    <rect x="-${i.username.length*8+30}" y="-28" width="${i.username.length*8+30}" height="28" rx="6" fill="#0a0e17" opacity="0.8"/>
    <text x="-${i.username.length*4+10}" y="-8" text-anchor="end" fill="white" font-size="14" opacity="0.7" font-family="sans-serif" font-weight="500">
      @${i.username}
    </text>
  </g>`:"",$=`
  <!-- AC6: Animated decorative corner ornaments -->
  <g stroke="${p}" stroke-width="2" fill="none">
    <!-- Top left corner -->
    <path d="M15,60 L15,15 L60,15" stroke-dasharray="80" stroke-dashoffset="80">
      <animate attributeName="stroke-dashoffset" from="80" to="0" dur="1.2s" fill="freeze"/>
    </path>
    <circle cx="15" cy="15" r="4" fill="${p}"/>
    
    <!-- Top right corner -->
    <path d="M${t.width-15},60 L${t.width-15},15 L${t.width-60},15" stroke-dasharray="80" stroke-dashoffset="80">
      <animate attributeName="stroke-dashoffset" from="80" to="0" dur="1.2s" fill="freeze"/>
    </path>
    <circle cx="${t.width-15}" cy="15" r="4" fill="${p}"/>
    
    <!-- Bottom left corner -->
    <path d="M15,${t.height-60} L15,${t.height-15} L60,${t.height-15}" stroke-dasharray="80" stroke-dashoffset="80">
      <animate attributeName="stroke-dashoffset" from="80" to="0" dur="1.2s" fill="freeze"/>
    </path>
    <circle cx="15" cy="${t.height-15}" r="4" fill="${p}"/>
    
    <!-- Bottom right corner -->
    <path d="M${t.width-15},${t.height-60} L${t.width-15},${t.height-15} L${t.width-60},${t.height-15}" stroke-dasharray="80" stroke-dashoffset="80">
      <animate attributeName="stroke-dashoffset" from="80" to="0" dur="1.2s" fill="freeze"/>
    </path>
    <circle cx="${t.width-15}" cy="${t.height-15}" r="4" fill="${p}"/>
  </g>`,J=`
  <!-- Faction-colored accent line -->
  <line x1="50" y1="${f?170:c?80:100}" x2="${t.width-50}" y2="${f?170:c?80:100}" stroke="${p}" stroke-width="1" opacity="0.5"/>`;return`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="0 0 ${t.width} ${t.height}" 
     width="${t.width}" 
     height="${t.height}">
  <defs>
    <linearGradient id="socialBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${k.start}"/>
      <stop offset="100%" style="stop-color:${k.end}"/>
    </linearGradient>
    <linearGradient id="platformAccent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${p}"/>
      <stop offset="50%" style="stop-color:${p}cc"/>
      <stop offset="100%" style="stop-color:${p}"/>
    </linearGradient>
    <filter id="socialGlow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#socialBg)"/>
  
  <!-- Corner flourishes -->
  ${$}
  
  <!-- Platform badge -->
  <g transform="translate(${t.width-120}, 20)">
    <rect width="100" height="36" rx="8" fill="${p}" opacity="0.2"/>
    <rect width="100" height="36" rx="8" fill="none" stroke="${p}" stroke-width="1.5"/>
    <text x="50" y="23" text-anchor="middle" fill="${p}" font-size="12" font-weight="bold">
      ${n.icon} ${n.nameCn}
    </text>
  </g>
  
  <!-- Machine Name with platform accent -->
  <g transform="translate(${t.width/2}, ${f?60:c?50:55})">
    <text x="0" y="0" text-anchor="middle" fill="${p}" font-family="serif" font-size="${f?32:c?36:30}" font-weight="bold" filter="url(#socialGlow)">
      ${a.name}
    </text>
    <!-- Decorative elements -->
    <line x1="-100" y1="12" x2="-15" y2="12" stroke="${p}" stroke-width="1" opacity="0.5"/>
    <circle cx="0" cy="12" r="3" fill="${p}"/>
    <line x1="15" y1="12" x2="100" y2="12" stroke="${p}" stroke-width="1" opacity="0.5"/>
  </g>
  
  <!-- Rarity badge -->
  ${J}
  <g transform="translate(${t.width/2}, ${f?100:c?60:70})">
    <rect x="-50" y="-12" width="100" height="24" rx="12" 
          fill="${W(a.rarity)}" opacity="0.25"/>
    <text x="0" y="4" text-anchor="middle" fill="${W(a.rarity)}" font-size="11" font-weight="bold" letter-spacing="1">
      ${Z(a.rarity)} ${a.rarity.toUpperCase()} ${Z(a.rarity)}
    </text>
  </g>
  
  <!-- Machine Preview Container -->
  <rect x="30" y="${g}" width="${t.width-60}" height="${v}" 
        fill="#0a0e17" stroke="${p}" stroke-width="1" rx="8" opacity="0.9"/>
  
  <!-- Machine Preview -->
  <g transform="translate(${u}, ${C}) scale(${d})">
    ${s.map(z=>`
    <path d="${z.pathData}" 
          fill="none" 
          stroke="#00ffcc" 
          stroke-width="3" 
          stroke-dasharray="8,4"
          opacity="0.9"
          filter="url(#socialGlow)"/>`).join("")}
    ${o.map(z=>K(z)).join("")}
  </g>
  
  <!-- Stats Panel -->
  <g transform="translate(50, ${g+v+25})">
    <text x="0" y="0" fill="#9ca3af" font-size="12" letter-spacing="1">◆ ATTRIBUTES</text>
    <line x1="0" y1="8" x2="${c?300:200}" y2="8" stroke="${p}" stroke-width="0.5"/>
    
    <g transform="translate(0, 25)">
      <rect x="0" y="0" width="100" height="8" rx="4" fill="#1e2a42"/>
      <rect x="0" y="0" width="${a.stats.stability}" height="8" rx="4" fill="#4ade80"/>
      <text x="110" y="8" fill="#4ade80" font-size="11">Stability ${a.stats.stability}%</text>
    </g>
    
    <g transform="translate(0, 45)">
      <rect x="0" y="0" width="100" height="8" rx="4" fill="#1e2a42"/>
      <rect x="0" y="0" width="${a.stats.powerOutput}" height="8" rx="4" fill="#f59e0b"/>
      <text x="110" y="8" fill="#f59e0b" font-size="11">Power ${a.stats.powerOutput}</text>
    </g>
    
    <g transform="translate(0, 65)">
      <rect x="0" y="0" width="100" height="8" rx="4" fill="#1e2a42"/>
      <rect x="0" y="0" width="${a.stats.failureRate}" height="8" rx="4" fill="#ef4444"/>
      <text x="110" y="8" fill="#ef4444" font-size="11">Failure ${a.stats.failureRate}%</text>
    </g>
  </g>
  
  <!-- Tags -->
  <g transform="translate("${c?400:f?300:250}", ${g+v+25})">
    <text x="0" y="0" fill="#9ca3af" font-size="12" letter-spacing="1">◆ TAGS</text>
    <line x1="0" y1="8" x2="100" y2="8" stroke="${p}" stroke-width="0.5"/>
    ${a.tags.slice(0,4).map((z,ee)=>`
    <g transform="translate(0, ${25+ee*20})">
      <rect x="0" y="-8" width="90" height="18" rx="4" fill="${V(z)}" opacity="0.15"/>
      <text x="10" y="3" fill="${V(z)}" font-size="10">${we(z)} ${z}</text>
    </g>`).join("")}
  </g>
  
  <!-- Footer -->
  <g transform="translate(${t.width/2}, ${t.height-25})">
    <text x="0" y="0" text-anchor="middle" fill="#6b7280" font-size="10">
      Arcane Machine Codex • ${a.codexId}
    </text>
  </g>
  
  ${M?`<!-- AC5: Watermark -->
  ${M}`:""}
</svg>`}function We(o,s,a,r){const i=s+a+20;return`
  <g transform="translate(${r?40:50}, ${i})">
    <text x="0" y="0" fill="#9ca3af" font-size="11" letter-spacing="2">◆ ATTRIBUTES</text>
    <line x1="0" y1="8" x2="150" y2="8" stroke="#1e2a42" stroke-width="1"/>
    
    <!-- Stability -->
    <g transform="translate(0, 25)">
      <rect x="0" y="0" width="80" height="8" rx="4" fill="#1e2a42"/>
      <rect x="0" y="0" width="${80*o.stats.stability/100}" height="8" rx="4" fill="#4ade80"/>
      <text x="90" y="8" fill="#4ade80" font-size="10">◆ Stability</text>
      <text x="160" y="8" fill="#4ade80" font-size="10" font-weight="bold">${o.stats.stability}%</text>
    </g>
    
    <!-- Power -->
    <g transform="translate(0, 45)">
      <rect x="0" y="0" width="80" height="8" rx="4" fill="#1e2a42"/>
      <rect x="0" y="0" width="${80*o.stats.powerOutput/100}" height="8" rx="4" fill="#f59e0b"/>
      <text x="90" y="8" fill="#f59e0b" font-size="10">⚡ Power</text>
      <text x="160" y="8" fill="#f59e0b" font-size="10" font-weight="bold">${o.stats.powerOutput}</text>
    </g>
    
    <!-- Failure Rate -->
    <g transform="translate(0, 65)">
      <rect x="0" y="0" width="80" height="8" rx="4" fill="#1e2a42"/>
      <rect x="0" y="0" width="${80*o.stats.failureRate/100}" height="8" rx="4" fill="#ef4444"/>
      <text x="90" y="8" fill="#ef4444" font-size="10">⚠ Failure</text>
      <text x="160" y="8" fill="#ef4444" font-size="10" font-weight="bold">${o.stats.failureRate}%</text>
    </g>
    
    <!-- Energy Cost -->
    <g transform="translate(0, 85)">
      <rect x="0" y="0" width="80" height="8" rx="4" fill="#1e2a42"/>
      <rect x="0" y="0" width="${80*o.stats.energyCost/100}" height="8" rx="4" fill="#06b6d4"/>
      <text x="90" y="8" fill="#06b6d4" font-size="10">❖ Energy</text>
      <text x="160" y="8" fill="#06b6d4" font-size="10" font-weight="bold">${o.stats.energyCost}</text>
    </g>
  </g>`}function Te(o,s,a,r,i){const n=r?250:i?220:250,t=s+a+20;return`
  <g transform="translate(${n}, ${t})">
    <text x="0" y="0" fill="#9ca3af" font-size="11" letter-spacing="2">◆ TAGS</text>
    <line x1="0" y1="8" x2="150" y2="8" stroke="#1e2a42" stroke-width="1"/>
    
    ${o.tags.map((h,c)=>`
    <g transform="translate(0, ${25+c*22})">
      <rect x="0" y="-8" width="140" height="20" rx="4" fill="${V(h)}" opacity="0.15"/>
      <text x="10" y="4" fill="${V(h)}" font-size="10" font-weight="bold">${we(h)}</text>
      <text x="30" y="4" fill="${V(h)}" font-size="10">${h.charAt(0).toUpperCase()+h.slice(1)}</text>
    </g>`).join("")}
  </g>`}function fe(o,s,a,r){const t=r.color,h=r.secondaryColor,f={common:{primary:"#9ca3af"},uncommon:{primary:"#22c55e"},rare:{primary:"#3b82f6"},epic:{primary:"#a855f7"},legendary:{primary:"#f59e0b"}}[a.rarity]?.primary||"#9ca3af",w=400,v=200,g=Array.from({length:20}).map((b,k)=>`<line x1="0" y1="${k*30}" x2="800" y2="${k*30}" stroke="${t}" stroke-width="0.5"/>`).join(""),d=Array.from({length:27}).map((b,k)=>`<line x1="${k*30}" y1="0" x2="${k*30}" y2="600" stroke="${t}" stroke-width="0.5"/>`).join(""),m=[{x:30,y:30,rotate:0},{x:770,y:30,rotate:90},{x:770,y:570,rotate:180},{x:30,y:570,rotate:270}].map(b=>`
    <g transform="translate(${b.x}, ${b.y}) rotate(${b.rotate})">
      <circle cx="0" cy="0" r="8" fill="${t}" opacity="0.8"/>
      <circle cx="0" cy="0" r="4" fill="#0a0e17"/>
    </g>
  `).join(""),j=o.slice(0,6).map((b,k)=>{const M=80+k%4*100,$=60+Math.floor(k/4)*80;return`<circle cx="${M}" cy="${$}" r="30" fill="${t}" opacity="0.3"/>`}).join(""),u=[{label:"稳定性",value:a.stats.stability,max:100,color:"#22c55e"},{label:"输出功率",value:a.stats.powerOutput,max:100,color:"#3b82f6"},{label:"能耗",value:a.stats.energyCost,max:100,color:"#f59e0b"},{label:"故障率",value:a.stats.failureRate,max:100,color:"#ef4444"}].map((b,k)=>`
      <g transform="translate(${k*175}, 20)">
        <text x="87.5" y="0" text-anchor="middle" fill="#9ca3af" font-size="12">${b.label}</text>
        <text x="87.5" y="35" text-anchor="middle" fill="${b.color}" font-size="24" font-weight="bold">${b.value}</text>
        <rect x="10" y="50" width="155" height="8" rx="4" fill="#1e2a42"/>
        <rect x="10" y="50" width="${155*(b.value/b.max)}" height="8" rx="4" fill="${b.color}"/>
      </g>
    `).join(""),C=100,p=a.tags.map((b,k)=>`
    <g transform="translate(${C+k*80}, 90)">
      <rect width="70" height="22" rx="4" fill="${t}" opacity="0.2"/>
      <text x="35" y="15" text-anchor="middle" fill="${t}" font-size="11">#${b}</text>
    </g>
  `).join("");return`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="0 0 800 600" 
     width="800" 
     height="600">
  <defs>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="50%" stop-color="#121826"/>
      <stop offset="100%" stop-color="#0a0e17"/>
    </linearGradient>
    
    <linearGradient id="factionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${t}"/>
      <stop offset="50%" stop-color="${h}"/>
      <stop offset="100%" stop-color="${t}"/>
    </linearGradient>
    
    <filter id="cardGlow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <rect width="800" height="600" fill="url(#cardBg)"/>
  
  <g opacity="0.1">
    ${g}
    ${d}
  </g>
  
  <rect x="10" y="10" width="780" height="580" fill="none" stroke="url(#factionGradient)" stroke-width="3" rx="20"/>
  
  <rect x="25" y="25" width="750" height="550" fill="none" stroke="${t}" stroke-width="1" opacity="0.5" rx="15"/>
  
  ${m}
  
  <g transform="translate(50, 50)">
    <rect width="120" height="40" rx="8" fill="${t}" opacity="0.2"/>
    <rect width="120" height="40" rx="8" fill="none" stroke="${t}" stroke-width="2"/>
    <text x="60" y="26" text-anchor="middle" fill="${t}" font-size="16" font-weight="bold">
      ${r.icon} ${r.nameCn}
    </text>
  </g>
  
  <g transform="translate(650, 50)">
    <rect width="100" height="40" rx="8" fill="${f}" opacity="0.2"/>
    <rect width="100" height="40" rx="8" fill="none" stroke="${f}" stroke-width="2"/>
    <text x="50" y="26" text-anchor="middle" fill="${f}" font-size="14" font-weight="bold" filter="url(#cardGlow)">
      ${f.toUpperCase()}
    </text>
  </g>
  
  <text x="400" y="150" text-anchor="middle" fill="white" font-size="36" font-weight="bold" filter="url(#cardGlow)">
    ${a.name}
  </text>
  
  <g transform="translate(200, 180)">
    <rect width="${w}" height="${v}" rx="10" fill="#0a0e17" opacity="0.5"/>
    <rect width="${w}" height="${v}" rx="10" fill="none" stroke="${t}" stroke-width="1" opacity="0.3"/>
    
    ${j}
  </g>
  
  <g transform="translate(50, 420)">
    <rect width="700" height="120" rx="10" fill="#0a0e17" opacity="0.8"/>
    <rect width="700" height="120" rx="10" fill="none" stroke="${t}" stroke-width="1" opacity="0.3"/>
    
    ${u}
    
    <text x="20" y="100" fill="#9ca3af" font-size="11">属性标签:</text>
    ${p}
  </g>
  
  <text x="400" y="570" text-anchor="middle" fill="#6b7280" font-size="12">
    ARCANE MACHINE CODEX • ${a.codexId}
  </text>
</svg>`}function W(o){return{common:"#9ca3af",uncommon:"#22c55e",rare:"#3b82f6",epic:"#a855f7",legendary:"#f59e0b"}[o]||"#9ca3af"}function Z(o){return{common:"○",uncommon:"◈",rare:"◆",epic:"✦",legendary:"★"}[o]||"○"}function me(o){const s=["void","lightning","fire","arcane","mechanical","protective","balancing","amplifying","stable"];for(const a of s)if(o.includes(a))return a;return"arcane"}function pe(o){return{void:{start:"#0f0a1e",end:"#1a1a2e"},lightning:{start:"#0a1e2e",end:"#1a2a3e"},fire:{start:"#1e0a0a",end:"#2e1a1a"},arcane:{start:"#0a0f1e",end:"#1a1a2e"},mechanical:{start:"#1e1a0a",end:"#2e2a1a"},protective:{start:"#0a1e0a",end:"#1a2e1a"},balancing:{start:"#0f1e1e",end:"#1f2e2e"},amplifying:{start:"#1e0f2e",end:"#2e1f3e"},stable:{start:"#0a1e1e",end:"#1a2e2e"}}[o]||{start:"#0a0e17",end:"#1a1a2e"}}function V(o){return{void:"#a78bfa",lightning:"#22d3ee",fire:"#f97316",arcane:"#a855f7",mechanical:"#f59e0b",protective:"#22c55e",balancing:"#06b6d4",amplifying:"#ec4899",explosive:"#ef4444",stable:"#84cc16",resonance:"#f472b6"}[o]||"#9ca3af"}function we(o){return{void:"◉",lightning:"⚡",fire:"🔥",arcane:"✧",mechanical:"⚙",protective:"◇",balancing:"≋",amplifying:"↑",explosive:"✱",stable:"○",resonance:"◌"}[o]||"◆"}function Fe(o,s){if(o.length<=s)return o;const a=o.split(" ");let r=[],i="";for(const n of a)(i+" "+n).trim().length<=s?i=(i+" "+n).trim():(i&&r.push(i),i=n);return i&&r.push(i),r.join('</tspan><tspan x="0" dy="14">')}function D(o,s,a){const r=o instanceof Blob?o:new Blob([o],{type:a}),i=URL.createObjectURL(r),n=document.createElement("a");n.href=i,n.download=s,document.body.appendChild(n),n.click(),document.body.removeChild(n),URL.revokeObjectURL(i)}const Pe=({faction:o,attributes:s,modules:a,connections:r,onExportSVG:i,onExportPNG:n,onClose:t})=>{const h=y.useRef(null),c=xe[o],f={common:{primary:"#9ca3af",secondary:"#6b7280",glow:"rgba(156, 163, 175, 0.3)"},uncommon:{primary:"#22c55e",secondary:"#16a34a",glow:"rgba(34, 197, 94, 0.3)"},rare:{primary:"#3b82f6",secondary:"#2563eb",glow:"rgba(59, 130, 246, 0.3)"},epic:{primary:"#a855f7",secondary:"#9333ea",glow:"rgba(168, 85, 247, 0.3)"},legendary:{primary:"#f59e0b",secondary:"#d97706",glow:"rgba(245, 158, 11, 0.3)"}},w=f[s.rarity]||f.common,v=y.useCallback(()=>{if(!h.current)return;const d=h.current.querySelector("svg");if(!d)return;const m=new XMLSerializer().serializeToString(d),j=new Blob([m],{type:"image/svg+xml"}),u=URL.createObjectURL(j),C=document.createElement("a");C.href=u,C.download=`${s.name.replace(/\s+/g,"-").toLowerCase()}-share-card.svg`,document.body.appendChild(C),C.click(),document.body.removeChild(C),URL.revokeObjectURL(u),i?.()},[h,s,i]),g=y.useCallback(async()=>{if(!h.current)return;const d=h.current.querySelector("svg");if(!d)return;const m=new XMLSerializer().serializeToString(d),j=document.createElement("canvas"),u=j.getContext("2d");if(!u)return;j.width=800,j.height=600;const C=new Image,p=new Blob([m],{type:"image/svg+xml;charset=utf-8"}),b=URL.createObjectURL(p);C.onload=()=>{u.fillStyle="#0a0e17",u.fillRect(0,0,j.width,j.height),u.drawImage(C,0,0,j.width,j.height),j.toBlob(k=>{if(!k)return;const M=document.createElement("a");M.href=URL.createObjectURL(k),M.download=`${s.name.replace(/\s+/g,"-").toLowerCase()}-share-card.png`,document.body.appendChild(M),M.click(),document.body.removeChild(M),URL.revokeObjectURL(b),n?.()},"image/png")},C.src=b},[h,s,n]);return e.jsx("div",{className:`
        fixed inset-0 z-[1050] flex items-center justify-center
        bg-black/80 backdrop-blur-sm
        overflow-y-auto
      `,onClick:t,children:e.jsxs("div",{className:`
          relative w-full max-w-2xl mx-4 my-8
          overflow-hidden
        `,onClick:d=>d.stopPropagation(),children:[e.jsx("div",{ref:h,className:"relative rounded-2xl overflow-hidden",style:{boxShadow:`0 0 40px ${c.glowColor}`},children:e.jsxs("svg",{width:"800",height:"600",viewBox:"0 0 800 600",xmlns:"http://www.w3.org/2000/svg",children:[e.jsxs("defs",{children:[e.jsxs("linearGradient",{id:"cardBg",x1:"0%",y1:"0%",x2:"100%",y2:"100%",children:[e.jsx("stop",{offset:"0%",stopColor:"#1a1a2e"}),e.jsx("stop",{offset:"50%",stopColor:"#121826"}),e.jsx("stop",{offset:"100%",stopColor:"#0a0e17"})]}),e.jsxs("linearGradient",{id:"factionGradient",x1:"0%",y1:"0%",x2:"100%",y2:"0%",children:[e.jsx("stop",{offset:"0%",stopColor:c.color}),e.jsx("stop",{offset:"50%",stopColor:c.secondaryColor}),e.jsx("stop",{offset:"100%",stopColor:c.color})]}),e.jsxs("filter",{id:"glow",children:[e.jsx("feGaussianBlur",{stdDeviation:"3",result:"coloredBlur"}),e.jsxs("feMerge",{children:[e.jsx("feMergeNode",{in:"coloredBlur"}),e.jsx("feMergeNode",{in:"SourceGraphic"})]})]})]}),e.jsx("rect",{width:"800",height:"600",fill:"url(#cardBg)"}),e.jsxs("g",{opacity:"0.1",children:[Array.from({length:20}).map((d,m)=>e.jsx("line",{x1:"0",y1:m*30,x2:"800",y2:m*30,stroke:c.color,strokeWidth:"0.5"},`h${m}`)),Array.from({length:27}).map((d,m)=>e.jsx("line",{x1:m*30,y1:"0",x2:m*30,y2:"600",stroke:c.color,strokeWidth:"0.5"},`v${m}`))]}),e.jsx("rect",{x:"10",y:"10",width:"780",height:"580",fill:"none",stroke:"url(#factionGradient)",strokeWidth:"3",rx:"20"}),e.jsx("rect",{x:"25",y:"25",width:"750",height:"550",fill:"none",stroke:c.color,strokeWidth:"1",opacity:"0.5",rx:"15"}),[{x:30,y:30,rotate:0},{x:770,y:30,rotate:90},{x:770,y:570,rotate:180},{x:30,y:570,rotate:270}].map((d,m)=>e.jsxs("g",{transform:`translate(${d.x}, ${d.y}) rotate(${d.rotate})`,children:[e.jsx("circle",{cx:"0",cy:"0",r:"8",fill:c.color,opacity:"0.8"}),e.jsx("circle",{cx:"0",cy:"0",r:"4",fill:"#0a0e17"})]},m)),e.jsxs("g",{transform:"translate(50, 50)",children:[e.jsx("rect",{width:"120",height:"40",rx:"8",fill:c.color,opacity:"0.2"}),e.jsx("rect",{width:"120",height:"40",rx:"8",fill:"none",stroke:c.color,strokeWidth:"2"}),e.jsxs("text",{x:"60",y:"26",textAnchor:"middle",fill:c.color,fontSize:"16",fontWeight:"bold",children:[c.icon," ",c.nameCn]})]}),e.jsxs("g",{transform:"translate(650, 50)",children:[e.jsx("rect",{width:"100",height:"40",rx:"8",fill:w.primary,opacity:"0.2"}),e.jsx("rect",{width:"100",height:"40",rx:"8",fill:"none",stroke:w.primary,strokeWidth:"2"}),e.jsx("text",{x:"50",y:"26",textAnchor:"middle",fill:w.primary,fontSize:"14",fontWeight:"bold",filter:"url(#glow)",children:w.primary.toUpperCase()})]}),e.jsx("text",{x:"400",y:"150",textAnchor:"middle",fill:"white",fontSize:"36",fontWeight:"bold",filter:"url(#glow)",children:s.name}),e.jsxs("g",{transform:"translate(200, 180)",children:[e.jsx("rect",{width:"400",height:"200",rx:"10",fill:"#0a0e17",opacity:"0.5"}),e.jsx("rect",{width:"400",height:"200",rx:"10",fill:"none",stroke:c.color,strokeWidth:"1",opacity:"0.3"}),a.slice(0,6).map((d,m)=>e.jsx("circle",{cx:80+m%4*100,cy:60+Math.floor(m/4)*80,r:"30",fill:c.color,opacity:"0.3"},d.instanceId)),r.slice(0,4).map(d=>e.jsx("line",{x1:100,y1:"160",x2:"200",y2:"220",stroke:c.color,strokeWidth:"2",opacity:"0.5"},d.id))]}),e.jsxs("g",{transform:"translate(50, 420)",children:[e.jsx("rect",{width:"700",height:"120",rx:"10",fill:"#0a0e17",opacity:"0.8"}),e.jsx("rect",{width:"700",height:"120",rx:"10",fill:"none",stroke:c.color,strokeWidth:"1",opacity:"0.3"}),[{label:"稳定性",value:s.stats.stability,max:100,color:"#22c55e"},{label:"输出功率",value:s.stats.powerOutput,max:100,color:"#3b82f6"},{label:"能耗",value:s.stats.energyCost,max:100,color:"#f59e0b"},{label:"故障率",value:s.stats.failureRate,max:100,color:"#ef4444"}].map((d,m)=>e.jsxs("g",{transform:`translate(${m*175}, 20)`,children:[e.jsx("text",{x:"87.5",y:"0",textAnchor:"middle",fill:"#9ca3af",fontSize:"12",children:d.label}),e.jsx("text",{x:"87.5",y:"35",textAnchor:"middle",fill:d.color,fontSize:"24",fontWeight:"bold",children:d.value}),e.jsx("rect",{x:"10",y:"50",width:"155",height:"8",rx:"4",fill:"#1e2a42"}),e.jsx("rect",{x:"10",y:"50",width:155*(d.value/d.max),height:"8",rx:"4",fill:d.color})]},d.label)),e.jsx("text",{x:"20",y:"100",fill:"#9ca3af",fontSize:"11",children:"属性标签:"}),s.tags.map((d,m)=>e.jsxs("g",{transform:`translate(${100+m*80}, 90)`,children:[e.jsx("rect",{width:"70",height:"22",rx:"4",fill:c.color,opacity:"0.2"}),e.jsxs("text",{x:"35",y:"15",textAnchor:"middle",fill:c.color,fontSize:"11",children:["#",d]})]},d))]}),e.jsxs("text",{x:"400",y:"570",textAnchor:"middle",fill:"#6b7280",fontSize:"12",children:["ARCANE MACHINE CODEX • ",s.codexId]})]})}),e.jsxs("div",{className:"mt-4 flex items-center justify-center gap-4",children:[e.jsxs("button",{onClick:v,className:`
              px-6 py-3 rounded-xl font-medium
              bg-[#7c3aed] text-white
              hover:bg-[#6d28d9]
              transition-colors
              flex items-center gap-2
            `,children:[e.jsx("svg",{width:"20",height:"20",viewBox:"0 0 20 20",fill:"none",stroke:"currentColor",strokeWidth:"2",children:e.jsx("path",{d:"M3 15v3h14v-3M7 12V3h6v9M10 3v9"})}),"导出 SVG"]}),e.jsxs("button",{onClick:g,className:`
              px-6 py-3 rounded-xl font-medium
              bg-[#22c55e] text-white
              hover:bg-[#16a34a]
              transition-colors
              flex items-center gap-2
            `,children:[e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 20 20",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("rect",{x:"3",y:"3",width:"14",height:"14",rx:"2"}),e.jsx("circle",{cx:"7",cy:"7",r:"2"}),e.jsx("path",{d:"M3 13l4-4 3 3 2-2 5 5"})]}),"导出 PNG"]}),t&&e.jsx("button",{onClick:t,className:`
                px-6 py-3 rounded-xl font-medium
                bg-[#1e2a42] text-[#9ca3af]
                hover:bg-[#2d3a52]
                hover:text-white
                transition-colors
              `,children:"关闭"})]})]})})};function et({onClose:o,onPublishToGallery:s}){const a=de(l=>l.modules),r=de(l=>l.connections),[i,n]=y.useState("svg"),[t,h]=y.useState(!1),[c,f]=y.useState(!1),[w,v]=y.useState("arcane-machine"),[g,d]=y.useState("2x"),[m,j]=y.useState(!1),[u,C]=y.useState("default"),[p,b]=y.useState(""),[k,M]=y.useState(!1),[$,J]=y.useState(null),[z,ee]=y.useState("dark"),[E,te]=y.useState({width:800,height:1e3}),[I,re]=y.useState(null),[O,ie]=y.useState(null),[ne,ae]=y.useState({visible:!1,message:""}),le=Se(a)||"stellar",S=xe[le],L=Ne(a,r),oe=y.useCallback(()=>{if((i==="poster"||i==="enhanced-poster"||i==="social")&&q(E.width,E.height).isValid)return{width:E.width,height:E.height};if(i==="png")return Ge(a,g);if(i==="poster"||i==="enhanced-poster")return H[u];if(i==="social"&&$){const l=G[$];return{width:l.width,height:l.height}}return{width:800,height:600}},[i,g,u,a,$,E])(),ce=y.useCallback((l,x)=>{const N=parseInt(x,10),B=isNaN(N)?0:N;te(R=>{const F=l==="width"?B:R.width,U=l==="height"?B:R.height;if(l==="width"){const P=q(B,R.height);re(P.isValid?null:P.errorMessage||null)}else{const P=q(R.width,B);ie(P.isValid?null:P.errorMessage||null)}return{width:F,height:U}})},[]),se=y.useCallback(l=>{n("social"),J(l);const x=Me(l);te(x),re(null),ie(null)},[]),ye=y.useCallback(l=>{C(l);const x=H[l];te({width:x.width,height:x.height}),re(null),ie(null)},[]),T=y.useCallback(l=>{ae({visible:!0,message:l}),setTimeout(()=>{ae({visible:!1,message:""})},5e3)},[]),ue=y.useCallback(()=>{ae({visible:!1,message:""})},[]),be=y.useCallback(async()=>{f(!0);try{if(i==="poster"||i==="enhanced-poster"||i==="social"){const x=q(E.width,E.height);if(!x.isValid){T(x.errorMessage||"Invalid dimensions. Please check your values."),f(!1);return}}const l=w.replace(/[^a-z0-9]/gi,"-").toLowerCase().replace(/-+/g,"-").replace(/^-+/,"").replace(/-+$/,"");switch(i){case"svg":const x=ge(a,r,{format:"svg"});D(x,`${l}.svg`,"image/svg+xml");break;case"png":const N=await ze(a,r,{scale:g,transparentBackground:m});D(N,`${l}.png`,"image/png");break;case"poster":const B=Le(a,r,L,u);D(B,`${l}-${u}-poster.svg`,"image/svg+xml");break;case"enhanced-poster":const R=Re(a,r,L,u,{username:k?p:void 0,backgroundColor:z,factionColor:S.color});D(R,`${l}-${u}-enhanced-poster.svg`,"image/svg+xml");break;case"social":if($){const F=Ae(a,r,L,$,{username:k?p:void 0}),P=G[$].name.toLowerCase().replace(/[^a-z]/g,"");D(F,`${l}-${P}-poster.svg`,"image/svg+xml")}break;case"faction-card":break}setTimeout(()=>{f(!1),o()},500)}catch(l){console.error("Export failed:",l),T("Export failed. Try reducing image size or changing format."),f(!1)}},[i,w,a,r,L,o,g,m,u,$,p,k,z,S,E,T]),$e=y.useCallback(()=>{const l=fe(a,r,L,S);D(l,`${L.name.replace(/\s+/g,"-").toLowerCase()}-share-card.svg`,"image/svg+xml")},[a,r,L,S]),ke=y.useCallback(async()=>{const l=fe(a,r,L,S),x=document.createElement("canvas"),N=x.getContext("2d");if(!N){T("Failed to create canvas context. Faction card PNG export is not available in this browser.");return}x.width=800,x.height=600;const B=new Image,R=new Blob([l],{type:"image/svg+xml;charset=utf-8"}),F=URL.createObjectURL(R);B.onload=()=>{N.fillStyle="#0a0e17",N.fillRect(0,0,x.width,x.height),N.drawImage(B,0,0,x.width,x.height),x.toBlob(U=>{if(!U){T("Failed to generate PNG blob. Please try exporting as SVG instead.");return}D(U,`${L.name.replace(/\s+/g,"-").toLowerCase()}-share-card.png`,"image/png"),URL.revokeObjectURL(F)},"image/png")},B.onerror=()=>{T("Failed to load faction card image. Please try exporting as SVG instead."),URL.revokeObjectURL(F)},B.src=F},[a,r,L,S,T]),ve=y.useCallback(()=>{s&&(s(),o())},[s,o]);return t?e.jsx(Pe,{faction:le,attributes:L,modules:a,connections:r,onExportSVG:$e,onExportPNG:ke,onClose:()=>h(!1)}):e.jsx("div",{role:"dialog","aria-modal":"true","aria-label":"Export Machine","aria-labelledby":"export-modal-title",className:"fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm",children:e.jsxs("div",{className:"w-full max-w-lg bg-[#121826] border border-[#1e2a42] rounded-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto",children:[e.jsxs("div",{className:"flex items-center justify-between mb-4",children:[e.jsx("h2",{id:"export-modal-title",className:"text-xl font-bold text-[#00d4ff]",children:"Export Machine"}),e.jsx("button",{onClick:o,"aria-label":"Close export dialog",className:"w-8 h-8 rounded-full bg-[#1e2a42] hover:bg-[#2d3a56] flex items-center justify-center text-[#9ca3af] hover:text-white transition-colors",children:"✕"})]}),ne.visible&&e.jsxs("div",{className:"mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg flex items-center justify-between",role:"alert","aria-live":"polite",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-red-400",children:"⚠"}),e.jsx("span",{className:"text-sm text-red-200",children:ne.message})]}),e.jsx("button",{onClick:ue,className:"text-red-400 hover:text-red-300","aria-label":"Dismiss error",children:"✕"})]}),e.jsx("div",{className:"aspect-video bg-[#0a0e17] rounded-lg mb-4 flex items-center justify-center overflow-hidden",children:e.jsx(De,{format:i,platform:$,dimensions:oe})}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{role:"tablist","aria-label":"Export format",children:[e.jsx("label",{className:"block text-sm font-medium text-[#9ca3af] mb-2",children:"Export Format (8 options)"}),e.jsxs("div",{className:"grid grid-cols-2 gap-2",children:[e.jsx(A,{format:"svg",label:"SVG",description:"Vector",icon:"📐",selected:i==="svg",onClick:()=>n("svg")}),e.jsx(A,{format:"png",label:"PNG",description:"Raster",icon:"🖼",selected:i==="png",onClick:()=>n("png")}),e.jsx(A,{format:"poster",label:"Poster",description:"Share card",icon:"🎨",selected:i==="poster",onClick:()=>n("poster")}),e.jsx(A,{format:"enhanced-poster",label:"Enhanced",description:"Deluxe card",icon:"✨",selected:i==="enhanced-poster",onClick:()=>n("enhanced-poster")}),e.jsx(A,{format:"faction-card",label:"Faction Card",description:"Branded export",icon:"⚔",selected:i==="faction-card",onClick:()=>n("faction-card")}),e.jsx(A,{format:"social-twitter",label:"Twitter/X",description:"16:9 - 1200×675",icon:"𝕏",selected:i==="social"&&$==="twitter",onClick:()=>se("twitter"),platform:"twitter"}),e.jsx(A,{format:"social-instagram",label:"Instagram",description:"1:1 - 1080×1080",icon:"📷",selected:i==="social"&&$==="instagram",onClick:()=>se("instagram"),platform:"instagram"}),e.jsx(A,{format:"social-discord",label:"Discord",description:"3:2 - 600×400",icon:"💬",selected:i==="social"&&$==="discord",onClick:()=>se("discord"),platform:"discord"})]})]}),i==="social"&&$&&e.jsx("div",{className:"p-3 bg-[#0a0e17] rounded-lg border border-[#1e2a42]",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-xl",children:G[$].icon}),e.jsx("span",{className:"text-sm font-medium text-white",children:G[$].nameCn})]}),e.jsx("span",{className:"text-xs text-[#9ca3af]",children:G[$].aspectRatio})]})}),i==="png"&&e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-[#9ca3af] mb-2",children:"分辨率 (Resolution)"}),e.jsx("div",{className:"grid grid-cols-3 gap-2",children:["1x","2x","4x"].map(l=>{const x=Q[l],N=`${x.scaled}×${Math.round(x.scaled*.75)}px`;return e.jsxs("button",{role:"button","aria-label":`Resolution ${l}`,"aria-pressed":g===l,onClick:()=>d(l),className:`p-2 rounded-lg border transition-all text-center ${g===l?"border-[#00d4ff] bg-[#00d4ff]/10 selected":"border-[#1e2a42] hover:border-[#00d4ff]/50"}`,children:[e.jsx("div",{className:`text-sm font-bold ${g===l?"text-[#00d4ff]":"text-white"}`,children:l}),e.jsx("div",{className:"text-xs text-[#4a5568]",children:N})]},l)})})]}),i==="png"&&e.jsxs("div",{className:"flex items-center gap-3 p-3 bg-[#0a0e17] rounded-lg border border-[#1e2a42]",children:[e.jsxs("label",{className:"relative inline-flex items-center cursor-pointer",children:[e.jsx("input",{type:"checkbox",role:"checkbox","aria-checked":m,"aria-label":"transparent background",checked:m,onChange:l=>j(l.target.checked),className:"sr-only peer"}),e.jsx("div",{className:"w-11 h-6 bg-[#1e2a42] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00d4ff]"})]}),e.jsxs("div",{children:[e.jsx("div",{className:"text-sm font-medium text-white",children:"透明背景"}),e.jsx("div",{className:"text-xs text-[#4a5568]",children:"Transparent Background"})]})]}),(i==="poster"||i==="enhanced-poster")&&e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-[#9ca3af] mb-2",children:"纵横比 (Aspect Ratio)"}),e.jsx("div",{className:"grid grid-cols-2 gap-2",children:["default","square","portrait","landscape"].map(l=>{const x=H[l],N={default:"默认 (Default)",square:"方形 (Square)",portrait:"纵向 (Portrait)",landscape:"横向 (Landscape)"};return e.jsxs("button",{role:"button","aria-label":N[l],"aria-pressed":u===l,onClick:()=>ye(l),className:`p-2 rounded-lg border transition-all text-center ${u===l?"border-[#00d4ff] bg-[#00d4ff]/10 selected":"border-[#1e2a42] hover:border-[#00d4ff]/50"}`,children:[e.jsx("div",{className:`text-sm font-medium ${u===l?"text-[#00d4ff]":"text-white"}`,children:N[l]}),e.jsxs("div",{className:"text-xs text-[#4a5568]",children:[x.width,"×",x.height]})]},l)})})]}),(i==="poster"||i==="enhanced-poster"||i==="social")&&e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-[#9ca3af] mb-2",children:"自定义尺寸 (Custom Dimensions)"}),e.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx("label",{htmlFor:"custom-width",className:"block text-xs text-[#6b7280] mb-1",children:"宽度 (Width)"}),e.jsx("input",{id:"custom-width",type:"number",role:"spinbutton","aria-label":"Custom width in pixels","aria-describedby":I?"width-error":void 0,"aria-invalid":!!I,value:E.width,onChange:l=>ce("width",l.target.value),min:400,max:2e3,className:`w-full bg-[#0a0e17] border rounded-lg px-3 py-2 text-white placeholder-[#4a5568] focus:outline-none transition-colors ${I?"border-red-500 focus:border-red-500":"border-[#1e2a42] focus:border-[#00d4ff]"}`,placeholder:"800"}),I&&e.jsx("p",{id:"width-error",className:"mt-1 text-xs text-red-400",role:"alert",children:I})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"custom-height",className:"block text-xs text-[#6b7280] mb-1",children:"高度 (Height)"}),e.jsx("input",{id:"custom-height",type:"number",role:"spinbutton","aria-label":"Custom height in pixels","aria-describedby":O?"height-error":void 0,"aria-invalid":!!O,value:E.height,onChange:l=>ce("height",l.target.value),min:400,max:2e3,className:`w-full bg-[#0a0e17] border rounded-lg px-3 py-2 text-white placeholder-[#4a5568] focus:outline-none transition-colors ${O?"border-red-500 focus:border-red-500":"border-[#1e2a42] focus:border-[#00d4ff]"}`,placeholder:"1000"}),O&&e.jsx("p",{id:"height-error",className:"mt-1 text-xs text-red-400",role:"alert",children:O})]})]}),e.jsx("p",{className:"mt-1 text-xs text-[#4a5568]",children:"范围: 400-2000px (Range: 400-2000px)"})]}),i==="enhanced-poster"&&e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-[#9ca3af] mb-2",children:"背景颜色 (Background Color) - 5 options"}),e.jsx("div",{className:"grid grid-cols-5 gap-2",children:Ce.map(l=>{const x=z===l.id,N=l.id==="faction"?S.color:void 0;return e.jsxs("button",{role:"button","aria-label":l.nameCn,"aria-pressed":x,onClick:()=>ee(l.id),className:`p-2 rounded-lg border transition-all text-center ${x?"border-[#00d4ff] bg-[#00d4ff]/10":"border-[#1e2a42] hover:border-[#00d4ff]/50"}`,style:x&&N?{borderColor:N}:{},title:l.description,children:[e.jsx("div",{className:"w-full h-8 rounded-md mb-1",style:{background:l.id==="faction"?`linear-gradient(135deg, ${S.color}40, #1a1a2e)`:`linear-gradient(135deg, ${l.gradient.start}, ${l.gradient.end})`,border:`1px solid ${x?"#00d4ff":"#2d3a56"}`}}),e.jsx("div",{className:`text-xs font-medium ${x?"text-[#00d4ff]":"text-white"}`,children:l.nameCn})]},l.id)})}),e.jsx("p",{className:"mt-1 text-xs text-[#4a5568]",children:"选择导出海报的背景颜色主题"})]}),(i==="poster"||i==="enhanced-poster"||i==="social")&&e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("input",{type:"text",role:"textbox","aria-label":"username",name:"username","data-testid":"username-input",value:p,onChange:l=>b(l.target.value),className:"flex-1 bg-[#0a0e17] border border-[#1e2a42] rounded-lg px-3 py-2 text-white placeholder-[#4a5568] focus:outline-none focus:border-[#00d4ff] transition-colors",placeholder:"Author (optional)"}),e.jsxs("label",{className:"relative inline-flex items-center cursor-pointer",children:[e.jsx("input",{type:"checkbox",role:"checkbox","aria-checked":k,"aria-label":"include watermark","data-testid":"watermark-toggle",checked:k,onChange:l=>M(l.target.checked),className:"sr-only peer"}),e.jsx("div",{className:"w-11 h-6 bg-[#1e2a42] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00d4ff]"})]})]}),e.jsx("div",{className:"text-xs text-[#4a5568]",children:"水印将显示在导出图片的右下角 (Watermark will appear in bottom-right of exported image)"})]}),i!=="faction-card"&&e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-[#9ca3af] mb-2",children:"文件名 (Filename)"}),e.jsx("input",{type:"text",role:"textbox","aria-label":"filename",name:"filename",value:w,onChange:l=>v(l.target.value),className:"w-full bg-[#0a0e17] border border-[#1e2a42] rounded-lg px-3 py-2 text-white placeholder-[#4a5568] focus:outline-none focus:border-[#00d4ff] transition-colors",placeholder:"arcane-machine"}),e.jsx("div",{className:"mt-1 text-xs text-[#4a5568]",children:"当前文件名将保持不变，即使切换导出格式"})]}),e.jsx("div",{className:"p-3 bg-[#0a0e17] rounded-lg border border-[#1e2a42]",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-sm text-[#9ca3af]",children:"输出尺寸 (Output Size)"}),e.jsxs("span",{className:"text-sm font-mono text-[#00d4ff]","data-testid":"dimension-indicator",children:[oe.width," × ",oe.height," px"]})]})}),e.jsxs("div",{className:"text-xs text-[#4a5568] bg-[#0a0e17] rounded-lg p-3",children:[i==="svg"&&e.jsx("p",{children:"SVG export includes all modules, connections, and animations. Best for further editing in vector software."}),i==="png"&&e.jsxs("p",{children:["PNG export creates a high-resolution raster image at ",g," scale. Transparent background removes the dark background."]}),i==="poster"&&e.jsxs("p",{children:["Poster export creates a styled share card with machine preview, stats, and decorative border at ",u," aspect ratio."]}),i==="enhanced-poster"&&e.jsxs("p",{children:["Enhanced poster includes decorative corners, ornate name styling, attribute icons, and faction emblem at ",u," aspect ratio. Now with custom background colors!"]}),i==="faction-card"&&e.jsx("p",{children:"Faction Card export creates a branded share card with faction-colored border and theming based on your machine's dominant faction."}),i==="social"&&$&&e.jsxs("p",{children:[G[$].name," optimized export at ",G[$].width,"×",G[$].height,"px with platform-specific styling."]})]}),i==="faction-card"&&e.jsx("div",{className:"mt-2 p-3 rounded-lg border",style:{borderColor:S.color+"40",backgroundColor:S.color+"10"},children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-2xl",children:S.icon}),e.jsxs("div",{children:[e.jsxs("div",{className:"text-sm font-medium",style:{color:S.color},children:[S.nameCn," - ",S.name]}),e.jsx("div",{className:"text-xs text-[#9ca3af]",children:"Dominant faction based on your machine's module composition"})]})]})}),s&&e.jsxs("div",{className:"pt-2 border-t border-[#1e2a42]",children:[e.jsxs("button",{onClick:ve,className:"w-full px-4 py-3 rounded-lg bg-[#7c3aed]/20 text-[#a78bfa] border border-[#7c3aed]/40 hover:bg-[#7c3aed]/30 transition-colors flex items-center justify-center gap-2",children:[e.jsx("span",{className:"text-xl",children:"🌐"}),e.jsx("span",{className:"font-medium",children:"Publish to Community Gallery"})]}),e.jsx("p",{className:"mt-1 text-xs text-[#4a5568] text-center",children:"Share your machine with the community (session-scoped)"})]})]}),e.jsxs("div",{className:"flex gap-3 mt-6",children:[e.jsx("button",{onClick:o,className:"flex-1 px-4 py-2 bg-[#1e2a42] hover:bg-[#2d3a56] text-white rounded-lg transition-colors",children:"Cancel"}),i==="faction-card"?e.jsx("button",{onClick:()=>h(!0),className:"flex-1 px-4 py-2 bg-[#00d4ff] hover:bg-[#00b8e6] text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2",children:"⚔ Open Faction Card"}):e.jsx("button",{onClick:be,disabled:c||!!I||!!O,className:"flex-1 px-4 py-2 bg-[#00d4ff] hover:bg-[#00b8e6] text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50",children:c?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"}),"Exporting..."]}):e.jsxs(e.Fragment,{children:["📤 Export ",i==="enhanced-poster"?"Enhanced":i==="social"&&$?G[$].name:i.toUpperCase()]})})]})]})})}function A({label:o,description:s,icon:a,selected:r,onClick:i,platform:n}){const h=n?{twitter:"#1DA1F2",instagram:"#E4405F",discord:"#5865F2"}[n]||"#1e2a42":void 0;return e.jsxs("button",{role:"tab","aria-selected":r,"aria-label":o,onClick:i,className:`p-3 rounded-lg border transition-all text-center ${r?"border-[#00d4ff] bg-[#00d4ff]/10":n&&h?`border-[${h}]/40 hover:border-[${h}]/60`:"border-[#1e2a42] hover:border-[#00d4ff]/50"}`,style:n&&r?{borderColor:h}:n&&!r?{borderColor:`${h}40`}:{},children:[e.jsx("div",{className:"text-2xl mb-1",children:a}),e.jsx("div",{className:`text-sm font-medium ${r?"text-[#00d4ff]":"text-white"}`,children:o}),e.jsx("div",{className:"text-xs text-[#4a5568]",children:s})]})}function De({format:o,platform:s,dimensions:a}){const r=a||{width:100,height:140},i=r.width/r.height,n=100,t=140;let h,c;if(i>1?(h=n,c=n/i):(c=t,h=t*i),o==="social"&&s){const f=G[s],w=s==="twitter",v=s==="instagram",g=v?100:w?140:120,d=v?100:80;return e.jsxs("svg",{width:g,height:d,viewBox:`0 0 ${g} ${d}`,children:[e.jsx("rect",{x:"2",y:"2",width:g-4,height:d-4,fill:"#0a0e17",stroke:f.accentColor,strokeWidth:"2",rx:"4"}),e.jsx("rect",{x:g*.1,y:d*.1,width:g*.8,height:d*.5,fill:"#121826",rx:"2"}),e.jsx("circle",{cx:g*.3,cy:d*.35,r:"10",fill:"#1a1a2e",stroke:"#00d4ff",strokeWidth:"1"}),e.jsx("rect",{x:g*.5,y:d*.25,width:g*.35,height:d*.2,fill:"#2d1b4e",rx:"1"}),e.jsxs("text",{x:g*.9,y:d*.95,textAnchor:"end",fontSize:"6",fill:"#4a5568",opacity:"0.6",children:["@",s]})]})}return e.jsxs("div",{className:"text-center",children:[o==="svg"&&e.jsxs("svg",{width:"120",height:"80",viewBox:"0 0 120 80",children:[e.jsx("rect",{x:"10",y:"10",width:"30",height:"30",fill:"#1a1a2e",stroke:"#00d4ff",strokeWidth:"2",rx:"4"}),e.jsx("rect",{x:"50",y:"25",width:"40",height:"15",fill:"#2d1b4e",stroke:"#7c3aed",strokeWidth:"2",rx:"2"}),e.jsx("circle",{x1:"25",y1:"25",r:"8",fill:"#00d4ff",opacity:"0.5"}),e.jsx("path",{d:"M25,25 L70,32",stroke:"#00ffcc",strokeWidth:"2",strokeDasharray:"4,2"})]}),o==="png"&&e.jsxs("svg",{width:"120",height:"80",viewBox:"0 0 120 80",children:[e.jsx("rect",{x:"5",y:"5",width:"110",height:"70",fill:"#0a0e17",stroke:"#1e2a42",strokeWidth:"1",rx:"4"}),e.jsx("rect",{x:"20",y:"20",width:"25",height:"25",fill:"#1a1a2e",stroke:"#00d4ff",strokeWidth:"2",rx:"3"}),e.jsx("rect",{x:"55",y:"25",width:"35",height:"12",fill:"#2d1b4e",stroke:"#7c3aed",strokeWidth:"1.5",rx:"2"}),e.jsx("circle",{x:"32",cy:"32",r:"6",fill:"#00d4ff",opacity:"0.6"}),e.jsx("path",{d:"M32,32 L72,31",stroke:"#00ffcc",strokeWidth:"1.5",strokeDasharray:"3,2"})]}),(o==="poster"||o==="enhanced-poster"||o==="social")&&e.jsxs("svg",{width:h,height:c,viewBox:`0 0 ${r.width} ${r.height}`,children:[e.jsx("rect",{x:"5",y:"5",width:r.width-10,height:r.height-10,fill:"#0a0e17",stroke:"#00d4ff",strokeWidth:"2",rx:"6"}),e.jsx("path",{d:"M5,40 L5,5 L40,5",fill:"none",stroke:"#ffd700",strokeWidth:"2"}),e.jsx("path",{d:`${r.width-5},5 L${r.width-40},5 L${r.width-5},40`,fill:"none",stroke:"#ffd700",strokeWidth:"2"}),e.jsx("path",{d:`5,${r.height-5} L5,${r.height-40} L40,${r.height-5}`,fill:"none",stroke:"#ffd700",strokeWidth:"2"}),e.jsx("path",{d:`${r.width-5},${r.height-40} L${r.width-40},${r.height-5} L${r.width-5},${r.height-5}`,fill:"none",stroke:"#ffd700",strokeWidth:"2"}),e.jsx("rect",{x:r.width*.08,y:r.height*.15,width:r.width*.84,height:r.height*.45,fill:"#121826",stroke:"#7c3aed",strokeWidth:"1",rx:"4"}),e.jsx("rect",{x:r.width*.15,y:r.height*.25,width:r.width*.2,height:r.height*.25,fill:"#1a1a2e",stroke:"#00d4ff",strokeWidth:"1",rx:"2"}),e.jsx("rect",{x:r.width*.45,y:r.height*.32,width:r.width*.35,height:r.height*.1,fill:"#2d1b4e",stroke:"#7c3aed",strokeWidth:"0.5",rx:"1"}),e.jsx("text",{x:r.width/2,y:r.height*.08,textAnchor:"middle",fontSize:r.width*.06,fill:"#ffd700",fontFamily:"serif",children:"★ MACHINE ★"}),e.jsx("rect",{x:r.width*.1,y:r.height*.65,width:r.width*.35,height:r.height*.06,fill:"#1e2a42",rx:"2"}),e.jsx("rect",{x:r.width*.1,y:r.height*.75,width:r.width*.3,height:r.height*.06,fill:"#1e2a42",rx:"2"}),e.jsx("rect",{x:r.width*.5,y:r.height*.65,width:r.width*.4,height:r.height*.25,fill:"#1e2a42",rx:"2"}),e.jsxs("text",{x:r.width/2,y:r.height*.95,textAnchor:"middle",fontSize:r.width*.035,fill:"#4a5568",children:[r.width,"×",r.height]})]}),o==="faction-card"&&e.jsxs("svg",{width:"100",height:"140",viewBox:"0 0 100 140",children:[e.jsx("rect",{x:"5",y:"5",width:"90",height:"130",fill:"#0a0e17",stroke:"url(#factionPreviewGradient)",strokeWidth:"3",rx:"6"}),e.jsx("defs",{children:e.jsxs("linearGradient",{id:"factionPreviewGradient",x1:"0%",y1:"0%",x2:"100%",y2:"100%",children:[e.jsx("stop",{offset:"0%",stopColor:"#a78bfa"}),e.jsx("stop",{offset:"50%",stopColor:"#7c3aed"}),e.jsx("stop",{offset:"100%",stopColor:"#a78bfa"})]})}),e.jsx("circle",{cx:"15",cy:"15",r:"4",fill:"#a78bfa",opacity:"0.8"}),e.jsx("circle",{cx:"85",cy:"15",r:"4",fill:"#a78bfa",opacity:"0.8"}),e.jsx("circle",{cx:"15",cy:"125",r:"4",fill:"#a78bfa",opacity:"0.8"}),e.jsx("circle",{cx:"85",cy:"125",r:"4",fill:"#a78bfa",opacity:"0.8"}),e.jsx("rect",{x:"15",y:"20",width:"70",height:"25",rx:"4",fill:"#a78bfa",opacity:"0.2",stroke:"#a78bfa",strokeWidth:"1"}),e.jsx("text",{x:"50",y:"37",textAnchor:"middle",fontSize:"8",fill:"#a78bfa",children:"⚔ 深渊派系"}),e.jsx("text",{x:"50",y:"75",textAnchor:"middle",fontSize:"10",fill:"white",fontWeight:"bold",children:"VOID RESONATOR"}),e.jsx("rect",{x:"25",y:"85",width:"50",height:"15",rx:"3",fill:"#a855f7",opacity:"0.2"}),e.jsx("text",{x:"50",y:"95",textAnchor:"middle",fontSize:"7",fill:"#a855f7",children:"EPIC"}),e.jsx("rect",{x:"20",y:"105",width:"60",height:"25",rx:"3",fill:"#1a1a2e",stroke:"#a78bfa",strokeWidth:"0.5"})]}),e.jsxs("p",{className:"text-xs text-[#4a5568] mt-2",children:[o==="svg"&&"Scalable Vector Graphics",o==="png"&&"Raster Image (2x)",o==="poster"&&"Social Share Card",o==="enhanced-poster"&&"Deluxe Share Card",o==="faction-card"&&"Faction-Branded Card",o==="social"&&s&&`${G[s].name} Optimized`]})]})}export{et as ExportModal,et as default};
