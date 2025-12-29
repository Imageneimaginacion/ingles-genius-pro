/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                heading: ['Outfit', 'sans-serif'],
            },
            colors: {
                space: {
                    black: '#0B0E14',
                    dark: 'var(--color-bg)',      // Was #151921
                    card: 'var(--color-card)',    // Was #1E2330
                    border: '#2D3446',
                    text: 'var(--color-text)',    // Was #F3F4F6
                    muted: '#9CA3AF',
                },
                brand: {
                    primary: '#3B82F6', // Blue 500
                    'primary-hover': '#2563EB',
                    secondary: '#8B5CF6', // Violet 500
                    accent: '#06B6D4', // Cyan 500
                },
                feedback: {
                    success: '#10B981',
                    warning: '#F59E0B',
                    error: '#EF4444',
                    info: '#3B82F6'
                }
            },
            backgroundImage: {
                'space-gradient': 'radial-gradient(circle at center, #1E2330 0%, #0B0E14 100%)',
                'gradient-brand': 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                'gradient-kids': 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 30%, #f472b6 60%, #facc15 100%)',
            },
            boxShadow: {
                'neon': '0 0 10px rgba(59, 130, 246, 0.5)',
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
            },
            animation: {
                'float': 'float 3s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 2s infinite',
                'spin-slow': 'spin 3s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'pulse-glow': {
                    '0%, 100%': { boxShadow: '0 0 10px var(--color-brand-primary)' },
                    '50%': { boxShadow: '0 0 25px var(--color-brand-primary)' },
                }
            }
        },
    },
    plugins: [],
}
