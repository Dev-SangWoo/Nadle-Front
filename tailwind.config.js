/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        nadle: {
          green: '#4CAF50',
          light: '#E8F5E9',
          dark: '#2E7D32'
        }
      }
    }
  },
  plugins: []
}
