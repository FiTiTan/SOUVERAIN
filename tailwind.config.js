/** @type {import('tailwindcss').Config} */
export default {
  // Cette section dit à Tailwind de scanner ton HTML et tes fichiers React
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // On intègre ici l'animation fluide pour tes barres de progression
      animation: {
        'gradient-x': 'gradient-x 3s ease infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { 
            'background-size': '200% 200%', 
            'background-position': 'left center' 
          },
          '50%': { 
            'background-size': '200% 200%', 
            'background-position': 'right center' 
          },
        }
      }
    },
  },
  plugins: [],
}