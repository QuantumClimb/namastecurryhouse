
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'oklch(var(--border-raw) / <alpha-value>)',
				input: 'oklch(var(--input-raw) / <alpha-value>)',
				ring: 'oklch(var(--ring-raw) / <alpha-value>)',
				background: 'oklch(var(--background-raw) / <alpha-value>)',
				foreground: 'oklch(var(--foreground-raw) / <alpha-value>)',
				primary: {
					DEFAULT: 'oklch(var(--primary-raw) / <alpha-value>)',
					foreground: 'oklch(var(--primary-foreground-raw) / <alpha-value>)'
				},
				secondary: {
					DEFAULT: 'oklch(var(--secondary-raw) / <alpha-value>)',
					foreground: 'oklch(var(--secondary-foreground-raw) / <alpha-value>)'
				},
				destructive: {
					DEFAULT: 'oklch(var(--destructive-raw) / <alpha-value>)',
					foreground: 'oklch(var(--destructive-foreground-raw) / <alpha-value>)'
				},
				muted: {
					DEFAULT: 'oklch(var(--muted-raw) / <alpha-value>)',
					foreground: 'oklch(var(--muted-foreground-raw) / <alpha-value>)'
				},
				accent: {
					DEFAULT: 'oklch(var(--accent-raw) / <alpha-value>)',
					foreground: 'oklch(var(--accent-foreground-raw) / <alpha-value>)'
				},
				popover: {
					DEFAULT: 'oklch(var(--popover-raw) / <alpha-value>)',
					foreground: 'oklch(var(--popover-foreground-raw) / <alpha-value>)'
				},
				card: {
					DEFAULT: 'oklch(var(--card-raw) / <alpha-value>)',
					foreground: 'oklch(var(--card-foreground-raw) / <alpha-value>)'
				},
				sidebar: {
					DEFAULT: 'oklch(var(--sidebar-background-raw) / <alpha-value>)',
					foreground: 'oklch(var(--sidebar-foreground-raw) / <alpha-value>)',
					primary: 'oklch(var(--sidebar-primary-raw) / <alpha-value>)',
					'primary-foreground': 'oklch(var(--sidebar-primary-foreground-raw) / <alpha-value>)',
					accent: 'oklch(var(--sidebar-accent-raw) / <alpha-value>)',
					'accent-foreground': 'oklch(var(--sidebar-accent-foreground-raw) / <alpha-value>)',
					border: 'oklch(var(--sidebar-border-raw) / <alpha-value>)',
					ring: 'oklch(var(--sidebar-ring-raw) / <alpha-value>)'
				},
				/* Indian Restaurant Color Palette */
				'saffron': 'hsl(var(--saffron) / <alpha-value>)',
				'turmeric': 'hsl(var(--turmeric) / <alpha-value>)',
				'curry-red': 'hsl(var(--curry-red) / <alpha-value>)',
				'cilantro-green': 'hsl(var(--cilantro-green) / <alpha-value>)',
				'warm-cream': 'hsl(var(--warm-cream) / <alpha-value>)',
				'spice-brown': 'hsl(var(--spice-brown) / <alpha-value>)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				'sans': ['Inter', 'system-ui', 'sans-serif'],
				'serif': ['Source Serif 4', 'serif'],
				'mono': ['JetBrains Mono', 'monospace']
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'glow': {
					'0%, 100%': { boxShadow: '0 0 5px oklch(var(--primary-raw) / 0.5)' },
					'50%': { boxShadow: '0 0 20px oklch(var(--primary-raw) / 0.7), 0 0 30px oklch(var(--accent-raw) / 0.5)' }
				},
				'warm-pulse': {
					'0%, 100%': { 
						opacity: '1',
						transform: 'scale(1)'
					},
					'50%': { 
						opacity: '0.9',
						transform: 'scale(1.05)'
					}
				},
				'spice-float': {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
					'50%': { transform: 'translateY(-10px) rotate(2deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'glow': 'glow 2s ease-in-out infinite',
				'warm-pulse': 'warm-pulse 3s ease-in-out infinite',
				'spice-float': 'spice-float 4s ease-in-out infinite'
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
