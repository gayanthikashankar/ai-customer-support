/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'blue-100': '#ebf8ff', // Light blue color
        'blue-500': '#4299e1', // Blue color
      },
    },
  },
  plugins: [require('flowbite/plugin')],
};