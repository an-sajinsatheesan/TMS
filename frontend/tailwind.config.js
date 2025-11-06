/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  corePlugins: {
    preflight: false, // Disable Tailwind's CSS reset to preserve PrimeReact styles
  },
  theme: {
    extend: {},
  },
  plugins: [],
}
