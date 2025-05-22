import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const config: Config = {
    darkMode: ['class'],
    content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        fontFamily: {
            sans: ['Inter', 'sans-serif'],
        },
        extend: {
            borderRadius: {
                circle: '50%',
            },
            dropShadow: {
                highlight: ['0 2px 4px rgba(255, 255, 255, 0.25)', '0 -2px 4px rgba(255, 255, 255, 0.25)'],
            },
            textShadow: {
                sm: '0 1px 2px var(--tw-shadow-color)',
                DEFAULT: '0 2px 4px var(--tw-shadow-color)',
                lg: '0 8px 16px var(--tw-shadow-color)',
            },
            fontSize: {
                'welcome-lg': [
                    '110px',
                    {
                        fontWeight: '600',
                    },
                ],
                'welcome-md': [
                    '72px',
                    {
                        fontWeight: '600',
                    },
                ],
                'welcome-sm': [
                    '32px',
                    {
                        fontWeight: '600',
                    },
                ],
                'display-xl': [
                    '80px',
                    {
                        fontWeight: '600',
                    },
                ],
                'display-lg': [
                    '56px',
                    {
                        fontWeight: '600',
                    },
                ],
                'display-md': [
                    '44px',
                    {
                        fontWeight: '600',
                    },
                ],
                'display-sm': [
                    '36px',
                    {
                        fontWeight: '600',
                    },
                ],
                'headline-lg': [
                    '32px',
                    {
                        fontWeight: '600',
                    },
                ],
                'headline-md': [
                    '28px',
                    {
                        fontWeight: '600',
                    },
                ],
                'headline-sm': [
                    '24px',
                    {
                        fontWeight: '600',
                    },
                ],
                'title-lg': [
                    '22px',
                    {
                        fontWeight: '600',
                    },
                ],
                'title-md': [
                    '16px',
                    {
                        fontWeight: '600',
                    },
                ],
                'title-sm': [
                    '14px',
                    {
                        fontWeight: '600',
                    },
                ],
                'label-lg': [
                    '14px',
                    {
                        fontWeight: '700',
                    },
                ],
                'label-md': [
                    '12px',
                    {
                        fontWeight: '700',
                    },
                ],
                'label-sm': [
                    '11px',
                    {
                        fontWeight: '700',
                    },
                ],
                'body-lg': [
                    '16px',
                    {
                        fontWeight: '500',
                    },
                ],
                'body-md': [
                    '14px',
                    {
                        fontWeight: '500',
                    },
                ],
                'body-sm': [
                    '12px',
                    {
                        fontWeight: '500',
                    },
                ],
            },
            keyframes: {
                fadeOut: {
                    '0%': {
                        opacity: '1',
                    },
                    '100%': {
                        opacity: '0',
                    },
                },
                fadeIn: {
                    '0%': {
                        opacity: '0',
                    },
                    '100%': {
                        opacity: '1',
                    },
                },
            },
            animation: {
                fadeOut: 'fadeOut 1s forwards',
                fadeIn: 'fadeIn 1s forwards',
            },
            opacity: {
                hover: '0.8',
            },
            colors: {
                black: {
                    pure: '#000000',
                    primary: '#1F1E24',
                    secondary: '#333333',
                    tertiary: '#4b4b59',
                },
                text: {
                    DEFAULT: '#fff',
                },
                background: 'hsl(var(--background))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                danger: {
                    DEFAULT: '#F44336',
                },
                success: {
                    DEFAULT: '#04AA6D',
                },
                info: {
                    DEFAULT: '#2196F3',
                },
                warning: {
                    DEFAULT: '#FF9800',
                },
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                chart: {
                    '1': 'hsl(var(--chart-1))',
                    '2': 'hsl(var(--chart-2))',
                    '3': 'hsl(var(--chart-3))',
                    '4': 'hsl(var(--chart-4))',
                    '5': 'hsl(var(--chart-5))',
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
        },
    },
    plugins: [
        plugin(({ matchUtilities, theme }) => {
            matchUtilities(
                {
                    'text-shadow': (value) => ({
                        textShadow: value,
                    }),
                },
                { values: theme('textShadow') }
            )
        }),
        require('tailwindcss-animate'),
    ],
}
export default config
