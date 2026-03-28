/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arcane: {
          dark: '#0a0e17',
          darker: '#050810',
          panel: '#121826',
          border: '#1e2a42',
          accent: '#00d4ff',
          secondary: '#7c3aed',
          glow: '#00ffcc',
          warning: '#ff6b35',
          danger: '#ff3355',
          gold: '#ffd700',
          purple: '#9333ea',
          energy: '#00ff88'
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'flow': 'flow 2s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.5', filter: 'brightness(1)' },
          '50%': { opacity: '1', filter: 'brightness(1.5)' },
        },
        flow: {
          '0%': { strokeDashoffset: '20' },
          '100%': { strokeDashoffset: '0' },
        }
      }
    },
  },
  plugins: [],
}
