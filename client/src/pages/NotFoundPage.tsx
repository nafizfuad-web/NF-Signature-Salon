import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section
      style={{
        minHeight: 'calc(100vh - 72px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
        gap: '1.5rem',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(5rem, 15vw, 10rem)',
          fontWeight: 700,
          color: 'var(--color-surface)',
          lineHeight: 1,
        }}
      >
        404
      </span>
      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
          color: 'var(--color-white)',
          marginTop: '-1rem',
        }}
      >
        Page Not Found
      </h1>
      <span className="divider-gold" />
      <p style={{ maxWidth: '400px', color: 'var(--color-white-muted)' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        style={{
          marginTop: '1rem',
          padding: '0.75rem 2rem',
          backgroundColor: 'var(--color-gold)',
          color: 'var(--color-black)',
          fontWeight: 700,
          fontSize: '0.85rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          borderRadius: 'var(--radius-sm)',
          transition: 'background-color var(--transition-fast)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-gold-light)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-gold)')}
      >
        Return Home
      </Link>
    </section>
  )
}
