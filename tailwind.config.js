/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brutal: {
          black: '#000000',
          white: '#FFFFFF',
          pink: '#FF00FF',
          lime: '#00FF00', 
          yellow: '#FFFF00',
          cyan: '#00FFFF',
          red: '#FF0000',
          // Dark theme colors
          'dark-bg': '#0d0d12',
          'dark-deeper': '#05050a',
          'dark-border': '#1a1a2e',
          // Neon colors
          'neon-cyan': '#00fff9',
          'neon-pink': '#ff0080',
          'neon-green': '#39ff14',
          'neon-purple': '#b026ff',
          'neon-yellow': '#ffed00',
        }
      },
      fontFamily: {
        'brutal': ['Arial Black', 'Helvetica', 'sans-serif'],
      },
      boxShadow: {
        'brutal': '8px 8px 0px #000000',
        'brutal-sm': '4px 4px 0px #000000',
        'brutal-lg': '12px 12px 0px #000000',
        // Neon glow shadows
        'neon-cyan': '0 0 20px rgba(0, 255, 249, 0.5), 6px 6px 0 rgba(0, 0, 0, 0.8)',
        'neon-cyan-hover': '0 0 40px rgba(0, 255, 249, 0.8), 10px 10px 0 rgba(0, 0, 0, 0.8)',
        'neon-pink': '0 0 20px rgba(255, 0, 128, 0.5), 6px 6px 0 rgba(0, 0, 0, 0.8)',
        'neon-pink-hover': '0 0 40px rgba(255, 0, 128, 0.8), 10px 10px 0 rgba(0, 0, 0, 0.8)',
        'neon-green': '0 0 20px rgba(57, 255, 20, 0.5), 6px 6px 0 rgba(0, 0, 0, 0.8)',
        'neon-green-hover': '0 0 40px rgba(57, 255, 20, 0.8), 10px 10px 0 rgba(0, 0, 0, 0.8)',
        'neon-purple': '0 0 20px rgba(176, 38, 255, 0.5), 6px 6px 0 rgba(0, 0, 0, 0.8)',
        'neon-purple-hover': '0 0 40px rgba(176, 38, 255, 0.8), 10px 10px 0 rgba(0, 0, 0, 0.8)',
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
        '6': '6px',
      },
      animation: {
        'glitch': 'glitch 3s infinite',
        'scan': 'scan 4s infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        glitch: {
          '0%, 90%, 100%': { transform: 'translate(0)' },
          '92%': { transform: 'translate(-2px, 2px)' },
          '94%': { transform: 'translate(2px, -2px)' },
        },
        scan: {
          '0%': { left: '-100%' },
          '100%': { left: '200%' },
        },
        'glow-pulse': {
          '0%, 100%': { filter: 'drop-shadow(0 0 5px currentColor)' },
          '50%': { filter: 'drop-shadow(0 0 20px currentColor)' },
        },
      }
    },
  },
  plugins: [],
}
