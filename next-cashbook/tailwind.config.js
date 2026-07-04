/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    DEFAULT: '#d97706',
                    500: '#f97316',
                    600: '#d97706',
                    700: '#b45309',
                },
            },
        },
    },
    plugins: [require("daisyui")],
    daisyui: {
        themes: ["dark"],
    },
};
