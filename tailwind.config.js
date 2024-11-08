/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'gray': {
                    700: 'rgb(55, 65, 81)',
                    800: 'rgb(31, 41, 55)',
                    900: 'rgb(17, 24, 39)',
                },
                'blue': {
                    400: 'rgb(96, 165, 250)',
                    500: 'rgb(59, 130, 246)',
                    600: 'rgb(37, 99, 235)',
                    700: 'rgb(29, 78, 216)',
                },
            },
        },
    },
    plugins: [],
} 