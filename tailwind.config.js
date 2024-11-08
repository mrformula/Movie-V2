/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: "#1a1b2e",
                secondary: "#232438",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            animation: {
                slide: 'slide 20s linear infinite',
            },
            keyframes: {
                slide: {
                    '0%': { backgroundPosition: '0 0' },
                    '100%': { backgroundPosition: '100% 0' },
                },
            },
        },
    },
    plugins: [],
} 