import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-gsap': ['gsap'],
          'vendor-zustand': ['zustand'],
          'vendor-utils': ['uuid'],
          // Component chunks for lazy loading
          'components-challenge': ['src/components/Challenge/ChallengePanel.tsx'],
          'components-codex': ['src/components/Codex/CodexView.tsx'],
          'components-faction': ['src/components/Factions/FactionPanel.tsx'],
          'components-tech-tree': ['src/components/Factions/TechTree.tsx'],
          // Template components - Round 67 remediation: code splitting
          'components-templates': ['src/components/Templates/TemplateLibrary.tsx', 'src/components/Templates/SaveTemplateModal.tsx'],
          // Utility chunks
          'utils-particle': ['src/utils/ParticleSystem.ts'],
          'utils-activation': ['src/utils/activationChoreographer.ts'],
        },
      },
    },
    // Target modern browsers for better tree-shaking
    target: 'esnext',
    // Enable CSS code splitting
    cssCodeSplit: true,
  },
})
