import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

// NF Signature Salon — Reusable Button primitive
//
// Variants:
//   primary  — gold background, black text (main call to action)
//   outline  — transparent background, gold border and text
//   text     — transparent background, gold text (minimal)
// All variants follow the black/gold brand tokens and shared hover states.

interface ButtonProps {
  variant?: 'primary' | 'outline' | 'text'
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

const baseStyle: React.CSSProperties = {
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  fontWeight: 600,
  fontSize: '0.85rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
  transition:
    'background-color 150ms ease, color 150ms ease, border-color 150ms ease, transform 150ms ease',
  border: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
}

const variantStyles: Record<'primary' | 'outline' | 'text', React.CSSProperties> = {
  primary: {
    ...baseStyle,
    backgroundColor: 'var(--color-gold)',
    color: 'var(--color-black)',
    padding: '0.75rem 1.75rem',
  },
  outline: {
    ...baseStyle,
    backgroundColor: 'transparent',
    color: 'var(--color-gold)',
    border: '1px solid var(--color-gold)',
    padding: '0.75rem 1.75rem',
  },
  text: {
    ...baseStyle,
    backgroundColor: 'transparent',
    color: 'var(--color-gold)',
    padding: '0.5rem 1rem',
    border: 'none',
  },
}

export default function Button({
  variant = 'primary',
  children,
  onClick,
  disabled = false,
  className,
}: ButtonProps) {
  const style: React.CSSProperties = disabled
    ? { ...variantStyles[variant], opacity: 0.5, cursor: 'not-allowed' }
    : variantStyles[variant]

  const hover = (variant: string) => {
    if (variant === 'primary') return { backgroundColor: 'var(--color-gold-light)' }
    if (variant === 'outline')
      return { backgroundColor: 'var(--color-gold)', color: 'var(--color-black)' }
    if (variant === 'text') return { opacity: '0.8' }
    return {}
  }

  const leave = (variant: string) => {
    if (variant === 'primary') return { backgroundColor: 'var(--color-gold)' }
    if (variant === 'outline')
      return { backgroundColor: 'transparent', color: 'var(--color-gold)' }
    if (variant === 'text') return { opacity: '1' }
    return {}
  }

  return (
    <button
      style={style}
      disabled={disabled}
      onClick={onClick}
      className={cn(className)}
      onMouseEnter={(e) => {
        if (!disabled) Object.assign(e.currentTarget.style, hover(variant))
      }}
      onMouseLeave={(e) => {
        if (!disabled) Object.assign(e.currentTarget.style, leave(variant))
      }}
    >
      {children}
    </button>
  )
}
