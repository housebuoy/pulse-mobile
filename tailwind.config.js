/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './components/**/*.{js,ts,tsx}', "./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#2a79e9', 
        primaryLight: '#E0E7FF', 
        danger: '#DC2626',   
        dangerBg: '#FEF2F2',
        success: '#10B981',  
        warning: '#CA8A04',  
        textMain: '#111827',
        textSub: '#4B5563',
        background: '#F9FAFB',
      }
    },
  },
  plugins: [],
};
