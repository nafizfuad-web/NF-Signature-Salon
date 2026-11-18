// NF Signature Salon — Design Tokens (JS/TS mirror of CSS tokens)
// Use these when you need token values in JS logic

export const colors = {
  gold: '#C9A84C',
  goldLight: '#E8C76D',
  goldDark: '#B8962E',
  goldMuted: '#A08030',
  black: '#0A0A0A',
  blackSoft: '#111111',
  surface: '#1A1A1A',
  surfaceLight: '#242424',
  border: '#2E2E2E',
  ivory: '#F5F0E8',
  white: '#F5F5F5',
  whiteMuted: '#D1D1D1',
} as const

export const fonts = {
  heading: "'Playfair Display', Georgia, serif",
  body: "'Inter', 'Segoe UI', system-ui, sans-serif",
} as const

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const
