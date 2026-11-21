import { Link } from 'react-router-dom'

const trustItems = [
  { value: '500+', label: 'Happy Clients' },
  { value: '10+', label: 'Years of Excellence' },
  { value: '20+', label: 'Premium Services' },
]

const cornerStyle = {
  position: 'absolute' as const,
  zIndex: 1,
  display: 'flex' as const,
  flexDirection: 'column' as const,
}

const goldLine = (w: string, h: string, extra?: React.CSSProperties): React.CSSProperties => ({
  width: w,
  height: h,
  backgroundColor: 'var(--color-gold)',
  opacity: 0.45,
  ...extra,
})

export default function HeroSection() {
  return (
    <section
      aria-label="Hero — NF Signature Salon"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: `
          radial-gradient(ellipse 100% 80% at 50% 45%, rgba(201,168,76,0.09) 0%, transparent 65%),
          radial-gradient(ellipse 50% 40% at 20% 85%, rgba(201,168,76,0.03) 0%, transparent 50%),
          radial-gradient(ellipse 40% 30% at 80% 15%, rgba(201,168,76,0.03) 0%, transparent 50%),
          #0A0A0A
        `,
        padding: '7rem 1.5rem 5rem',
      }}
    >
      {/* Keyframe animation */}
      <style>{`
        @keyframes scrollPulse {
          0%, 100% { opacity: 1; transform: scaleY(1); }
          50%       { opacity: 0.25; transform: scaleY(0.75); }
        }
      `}</style>

      {/* Subtle grid texture */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(201,168,76,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          zIndex: 0,
        }}
      />

      {/* Corner accents — top-left */}
      <div aria-hidden="true" style={{ ...cornerStyle, top: '110px', left: '48px' }}>
        <div style={goldLine('44px', '2px')} />
        <div style={goldLine('2px', '44px', { marginTop: '-2px' })} />
      </div>

      {/* Corner accents — top-right */}
      <div aria-hidden="true" style={{ ...cornerStyle, top: '110px', right: '48px', alignItems: 'flex-end' }}>
        <div style={goldLine('44px', '2px')} />
        <div style={goldLine('2px', '44px', { marginTop: '-2px' })} />
      </div>

      {/* Corner accents — bottom-left */}
      <div aria-hidden="true" style={{ ...cornerStyle, bottom: '90px', left: '48px' }}>
        <div style={goldLine('2px', '44px')} />
        <div style={goldLine('44px', '2px', { marginTop: '-2px' })} />
      </div>

      {/* Corner accents — bottom-right */}
      <div aria-hidden="true" style={{ ...cornerStyle, bottom: '90px', right: '48px', alignItems: 'flex-end' }}>
        <div style={goldLine('2px', '44px')} />
        <div style={goldLine('44px', '2px', { marginTop: '-2px' })} />
      </div>

      {/* ── Main content ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          maxWidth: '860px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Eyebrow */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.68rem',
            fontWeight: 600,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: 'var(--color-gold)',
            marginBottom: '1.5rem',
          }}
        >
          <span style={{ display: 'block', width: '32px', height: '1px', backgroundColor: 'var(--color-gold)', opacity: 0.6 }} />
          Premium Beauty &amp; Wellness
          <span style={{ display: 'block', width: '32px', height: '1px', backgroundColor: 'var(--color-gold)', opacity: 0.6 }} />
        </span>

        {/* H1 */}
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.6rem, 6.5vw, 5.2rem)',
            fontWeight: 700,
            color: 'var(--color-white)',
            lineHeight: 1.08,
            letterSpacing: '-0.01em',
            marginBottom: '1.5rem',
          }}
        >
          Where{' '}
          <em
            style={{
              fontStyle: 'italic',
              background: 'linear-gradient(135deg, var(--color-gold-light) 0%, var(--color-gold) 60%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Elegance
          </em>{' '}
          Meets Expertise
        </h1>

        {/* Gold divider */}
        <div
          style={{
            width: '72px',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, var(--color-gold), transparent)',
            marginBottom: '1.5rem',
          }}
        />

        {/* Subheadline — [Placeholder copy] */}
        <p
          style={{
            fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
            color: 'var(--color-white-muted)',
            maxWidth: '540px',
            lineHeight: 1.75,
            marginBottom: '2.75rem',
          }}
        >
          {/* [Placeholder: Replace with real salon tagline] */}
          Experience the pinnacle of beauty and wellness. Our master stylists bring artistry and precision to every single appointment.
        </p>

        {/* CTA buttons */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: '3rem',
          }}
        >
          <Link
            to="/booking"
            style={{
              padding: '1rem 2.25rem',
              backgroundColor: 'var(--color-gold)',
              color: 'var(--color-black)',
              fontWeight: 700,
              fontSize: '0.82rem',
              letterSpacing: '0.13em',
              textTransform: 'uppercase',
              borderRadius: 'var(--radius-sm)',
              transition: 'background-color var(--transition-fast), transform var(--transition-fast)',
              display: 'inline-block',
              border: '1px solid var(--color-gold)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--color-gold-light)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'var(--color-gold)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Book an Appointment
          </Link>

          <Link
            to="/services"
            style={{
              padding: '1rem 2.25rem',
              backgroundColor: 'transparent',
              color: 'var(--color-gold)',
              fontWeight: 600,
              fontSize: '0.82rem',
              letterSpacing: '0.13em',
              textTransform: 'uppercase',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-gold)',
              transition: 'background-color var(--transition-fast), color var(--transition-fast), transform var(--transition-fast)',
              display: 'inline-block',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(201,168,76,0.1)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Explore Services
          </Link>
        </div>

        {/* Trust bar */}
        <div
          style={{
            display: 'flex',
            gap: '0',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'stretch',
            padding: '1.25rem 2rem',
            border: '1px solid rgba(201,168,76,0.18)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(201,168,76,0.03)',
            backdropFilter: 'blur(4px)',
          }}
        >
          {trustItems.map((item, index) => (
            <div key={item.value} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ textAlign: 'center', padding: '0 1.75rem' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.6rem',
                    fontWeight: 700,
                    color: 'var(--color-gold)',
                    lineHeight: 1,
                    marginBottom: '0.25rem',
                  }}
                >
                  {item.value}
                </div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--color-white-muted)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {item.label}
                </div>
              </div>
              {index < trustItems.length - 1 && (
                <div
                  style={{
                    width: '1px',
                    height: '36px',
                    backgroundColor: 'rgba(201,168,76,0.25)',
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.4rem',
          zIndex: 2,
        }}
      >
        <span
          style={{
            fontSize: '0.6rem',
            letterSpacing: '0.25em',
            color: 'var(--color-gold)',
            textTransform: 'uppercase',
            opacity: 0.7,
          }}
        >
          Scroll
        </span>
        <div
          style={{
            width: '1px',
            height: '44px',
            background: 'linear-gradient(to bottom, var(--color-gold), transparent)',
            animation: 'scrollPulse 2.2s ease-in-out infinite',
            transformOrigin: 'top',
          }}
        />
      </div>
    </section>
  )
}
