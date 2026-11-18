// Coming Soon placeholder page — used for pages not yet built

interface ComingSoonProps {
  title: string
}

export default function ComingSoon({ title }: ComingSoonProps) {
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
          fontSize: '0.75rem',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'var(--color-gold)',
        }}
      >
        Coming Soon
      </span>
      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          color: 'var(--color-white)',
        }}
      >
        {title}
      </h1>
      <span className="divider-gold" />
      <p style={{ maxWidth: '400px', color: 'var(--color-white-muted)' }}>
        This page is currently under development. We're crafting something beautiful for you.
      </p>
    </section>
  )
}
