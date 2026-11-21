import { Link } from 'react-router-dom'
import OpeningHours from '@/components/common/OpeningHours'
import { SALON_LOCATION } from '@/services/salonConfig'
import { NAV_LINKS } from '@/utils/constants'

const CURRENT_YEAR = new Date().getFullYear()
const directionsUrl = SALON_LOCATION.address
? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(SALON_LOCATION.displayAddress)}`
  : undefined

export default function Footer() {
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
                { label: 'Book an Appointment', href: '/booking', external: false },
                ...(directionsUrl
                  ? [{ label: 'Get Directions', href: directionsUrl, external: true }]
                  : []),
                ...(SALON_LOCATION.phone
                  ? [{ label: 'Call the salon', href: `tel:${SALON_LOCATION.phone}`, external: true }]
                  : []),
                ...(SALON_LOCATION.email
                  ? [{ label: 'Email the salon', href: `mailto:${SALON_LOCATION.email}`, external: true }]
                  : []),
              ].map((item) => (
                <li key={item.href}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target={item.href.startsWith('https:') ? '_blank' : undefined}
                      rel={item.href.startsWith('https:') ? 'noreferrer' : undefined}
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--color-white-muted)',
                        transition: 'color var(--transition-fast)',
                      }}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      to={item.href}
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--color-white-muted)',
                        transition: 'color var(--transition-fast)',
                      }}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-white-muted)', marginTop: '0.75rem' }}>
              {SALON_LOCATION.address
                ? SALON_LOCATION.displayAddress
                : `${SALON_LOCATION.city} (development location)`}
            </p>
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
            <OpeningHours compact />
          </div>

          {SALON_LOCATION.socialLinks.length > 0 && (
            <div>
              <h4 style={{
                fontSize: '0.75rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
                marginBottom: '1rem',
              }}>
                Follow
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {SALON_LOCATION.socialLinks.map((social) => (
                  <li key={social.label}>
                    <a href={social.url} target="_blank" rel="noreferrer">{social.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
            &copy; {CURRENT_YEAR} NF Signature Salon. All rights reserved.
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-white-muted)', margin: 0 }}>
            Crafted with elegance
          </p>
        </div>
      </div>
    </footer>
  )
}
