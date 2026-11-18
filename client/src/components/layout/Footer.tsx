import { Link } from 'react-router-dom'
import { NAV_LINKS } from '@/utils/constants'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      style={{
        backgroundColor: 'var(--color-black-soft)',
        borderTop: '1px solid var(--color-border)',
        marginTop: 'auto',
      }}
    >
      {/* Gold top accent line */}
      <div
        style={{
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, var(--color-gold) 50%, transparent 100%)',
        }}
      />

      <div className="section-container" style={{ padding: '3rem 1.5rem 2rem' }}>
        {/* Top row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Brand */}
          <div>
            <Link to="/" style={{ display: 'inline-block', marginBottom: '1rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: 'var(--color-gold)',
                  display: 'block',
                }}
              >
                NF SIGNATURE
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.3em',
                  color: 'var(--color-white-muted)',
                  textTransform: 'uppercase',
                }}
              >
                SALON
              </span>
            </Link>
            <p style={{ fontSize: '0.875rem', maxWidth: '220px', color: 'var(--color-white-muted)' }}>
              Premium beauty &amp; wellness experiences crafted for the discerning individual.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
                marginBottom: '1rem',
              }}
            >
              Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--color-white-muted)',
                      transition: 'color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-gold)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-white-muted)')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
                marginBottom: '1rem',
              }}
            >
              Contact
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { label: 'Book an Appointment', href: '/booking' },
                { label: 'Get Directions', href: '/contact' },
                { label: 'Call Us', href: 'tel:+8801700000000' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--color-white-muted)',
                      transition: 'color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-gold)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-white-muted)')}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
                marginBottom: '1rem',
              }}
            >
              Hours
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { day: 'Mon – Fri', time: '9:00 AM – 8:00 PM' },
                { day: 'Saturday', time: '9:00 AM – 6:00 PM' },
                { day: 'Sunday', time: 'By Appointment' },
              ].map((item) => (
                <li
                  key={item.day}
                  style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '0.875rem' }}
                >
                  <span style={{ color: 'var(--color-white-muted)' }}>{item.day}</span>
                  <span style={{ color: 'var(--color-gold-light)', fontWeight: 500 }}>{item.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <p style={{ fontSize: '0.8rem', color: 'var(--color-white-muted)', margin: 0 }}>
            &copy; {year} NF Signature Salon. All rights reserved.
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-white-muted)', margin: 0 }}>
            Crafted with elegance
          </p>
        </div>
      </div>
    </footer>
  )
}
