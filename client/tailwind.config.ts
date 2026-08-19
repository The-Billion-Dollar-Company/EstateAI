import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
  	container: {
  		center: true,
  		padding: {
  			DEFAULT: '1.25rem',
  			sm: '1.5rem',
  			lg: '2rem'
  		},
  		screens: {
  			'2xl': '1280px'
  		}
  	},
  	extend: {
  		fontFamily: {
  			sans: [
  				'"Inter Variable"',
  				'system-ui',
  				'sans-serif'
  			],
  			display: [
  				'"Plus Jakarta Sans Variable"',
  				'"Inter Variable"',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			success: 'hsl(var(--success))',
  			warning: 'hsl(var(--warning))',
  			info: 'hsl(var(--info))',
  			surface: 'hsl(var(--surface))',
  			ink: {
  				DEFAULT: 'hsl(var(--ink))',
  				foreground: 'hsl(var(--ink-foreground))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			xs: '0 1px 2px 0 hsl(30 12% 12% / 0.05)',
  			card: '0 1px 2px 0 hsl(30 12% 12% / 0.04), 0 1px 3px 0 hsl(30 12% 12% / 0.04)',
  			lift: '0 8px 24px -8px hsl(30 12% 12% / 0.14), 0 2px 6px -2px hsl(30 12% 12% / 0.06)',
  			panel: '0 12px 40px -12px hsl(30 12% 12% / 0.18)'
  		},
  		keyframes: {
  			'fade-up': {
  				from: { opacity: '0', transform: 'translateY(16px)' },
  				to: { opacity: '1', transform: 'translateY(0)' }
  			},
  			'fade-in': {
  				from: { opacity: '0' },
  				to: { opacity: '1' }
  			},
  			'scale-in': {
  				from: { opacity: '0', transform: 'scale(0.96)' },
  				to: { opacity: '1', transform: 'scale(1)' }
  			},
  			'pulse-dot': {
  				'0%, 100%': { opacity: '0.35', transform: 'translateY(0)' },
  				'50%': { opacity: '1', transform: 'translateY(-2px)' }
  			},
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
  			}
  		},
  		animation: {
  			'fade-up': 'fade-up 500ms cubic-bezier(0.16, 1, 0.3, 1) both',
  			'fade-in': 'fade-in 400ms ease-out both',
  			'scale-in': 'scale-in 300ms cubic-bezier(0.16, 1, 0.3, 1) both',
  			'pulse-dot': 'pulse-dot 1.2s ease-in-out infinite',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [animate],
} satisfies Config;
