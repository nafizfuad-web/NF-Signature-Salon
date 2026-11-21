import type { ReactNode } from 'react'

interface SectionHeaderProps {
  eyebrow?: string
  title: ReactNode
  subtitle?: string
  align?: 'left' | 'center'
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
}: SectionHeaderProps) {
  const isCenter = align === 'center'

  return (
    <div style={{ textAlign: isCenter ? 'center' : 'left', marginBottom: '3.5rem' }}>
      {eyebrow && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.68rem',
            fontWeight: 600,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--color-gold)',
            marginBottom: '1rem',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '24px',
              height: '1px',
              backgroundColor: 'var(--color-gold)',
              opacity: 0.7,
            }}
          />
          {eyebrow}
          <span
            style={{
              display: 'inline-block',
              width: '24px',
              height: '1px',
              backgroundColor: 'var(--color-gold)',
              opacity: 0.7,
            }}
          />
        </span>
      )}

      <h2
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
          fontWeight: 600,
          color: 'var(--color-white)',
          lineHeight: 1.2,
          letterSpacing: '0.01em',
        }}
      >
        {title}
      </h2>

      <div
        style={{
          width: '50px',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--color-gold), transparent)',
          margin: isCenter ? '1.25rem auto' : '1.25rem 0',
        }}
      />

      {subtitle && (
        <p
          style={{
            fontSize: '1rem',
            color: 'var(--color-white-muted)',
            maxWidth: '560px',
            margin: isCenter ? '0 auto' : '0',
            lineHeight: 1.7,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
