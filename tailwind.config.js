/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          dark: '#4f46e5',
        },
        secondary: {
          DEFAULT: '#10b981',
        },
        background: '#0f172a',
        surface: '#1e293b',
        text: {
          primary: '#f8fafc',
          secondary: '#94a3b8',
        },
        accent: '#f59e0b',
        error: '#ef4444',
        success: '#22c55e',
      },
    },
  },
  plugins: [],
}
