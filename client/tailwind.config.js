/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0EA5E9', dark: '#0284C7' },
        secondary: { DEFAULT: '#10B981', dark: '#059669' },
        danger: '#EF4444',
        warning: '#F59E0B',
        sidebar: '#0F172A',
        surface: '#F0F9FF',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
