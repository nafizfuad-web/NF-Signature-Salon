import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { NAV_LINKS } from '@/utils/constants'
import Icon from '@/components/common/Icon'
import { useAuth } from '@/hooks/useAuth'
import { resolveAssetUrl } from '@/services/config'
import { getInitials } from '@/utils/format'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const { user, isLoading: authLoading } = useAuth()
  const dashboardPath = user?.role === 'admin' ? '/admin' : '/dashboard'

  // Scroll detection for background (synchronizes with an external system)
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
        backgroundColor: isScrolled || isMenuOpen ? 'rgba(10, 10, 10, 0.98)' : 'transparent',
        borderBottom: isScrolled || isMenuOpen ? '1px solid rgba(201, 168, 76, 0.2)' : '1px solid transparent',
        boxShadow: isScrolled || isMenuOpen ? '0 4px 24px rgba(0,0,0,0.4)' : 'none',
        backdropFilter: isScrolled || isMenuOpen ? 'blur(12px)' : 'none',
      }}
    >
      <div className="section-container">
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '72px',
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}
            aria-label="NF Signature Salon — Home"
          >
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.4rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: 'var(--color-gold)',
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
                marginTop: '2px',
              }}
            >
              SALON
            </span>
          </Link>

          {/* Desktop Nav */}
          <ul
            style={{
              display: 'flex',
              gap: 'clamp(1rem, 2vw, 2.5rem)',
              listStyle: 'none',
              alignItems: 'center',
            }}
            className="hidden-mobile"
          >
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: isActive(link.href)
                      ? 'var(--color-gold)'
                      : 'var(--color-white-muted)',
                    borderBottom: isActive(link.href)
                      ? '1px solid var(--color-gold)'
                      : '1px solid transparent',
                    paddingBottom: '2px',
                    transition: 'color var(--transition-fast), border-color var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(link.href)) {
                      e.currentTarget.style.color = 'var(--color-white)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(link.href)) {
                      e.currentTarget.style.color = 'var(--color-white-muted)'
                    }
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Account + Book Now CTA (desktop) */}
          <div className="hidden-mobile navbar-actions">
            {!authLoading && (
              user ? (
                <Link to={dashboardPath} className="navbar-account" aria-label="Open my dashboard">
                  <span className="navbar-avatar" aria-hidden="true">
                    {user.avatarUrl ? (
                      <img
                        src={resolveAssetUrl(user.avatarUrl)}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '50%',
                        }}
                      />
                    ) : (
                      getInitials(user.name)
                    )}
                  </span>
                  <span className="navbar-account-label">Dashboard</span>
                </Link>
              ) : (
                <Link to="/signin" className="navbar-signin" aria-label="Sign in">
                  <Icon name="user" size={16} />
                  <span className="navbar-signin-label">Sign In</span>
                </Link>
              )
            )}

            <Link
              to="/booking"
              style={{
                padding: '0.5rem 1.25rem',
                border: '1px solid var(--color-gold)',
                color: 'var(--color-gold)',
                fontSize: '0.8rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                borderRadius: 'var(--radius-sm)',
                transition: 'background-color var(--transition-fast), color var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-gold)'
                e.currentTarget.style.color = 'var(--color-black)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'var(--color-gold)'
              }}
            >
              Book Now
            </Link>
          </div>

          {/* Hamburger (mobile) */}
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            className="show-mobile"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              color: 'var(--color-white)',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
            }}
          >
            <span
              style={{
                display: 'block',
                width: '22px',
                height: '2px',
                backgroundColor: 'var(--color-gold)',
                transition: 'transform 0.25s ease, opacity 0.25s ease',
                transform: isMenuOpen ? 'translateY(7px) rotate(45deg)' : 'none',
              }}
            />
            <span
              style={{
                display: 'block',
                width: '22px',
                height: '2px',
                backgroundColor: 'var(--color-gold)',
                transition: 'opacity 0.25s ease',
                opacity: isMenuOpen ? 0 : 1,
              }}
            />
            <span
              style={{
                display: 'block',
                width: '22px',
                height: '2px',
                backgroundColor: 'var(--color-gold)',
                transition: 'transform 0.25s ease',
                transform: isMenuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none',
              }}
            />
          </button>
        </nav>

        {/* Mobile Menu */}
        <div
          id="mobile-menu"
          className="show-mobile"
          style={{
            width: '100%',
            overflow: 'hidden',
            maxHeight: isMenuOpen ? '560px' : '0',
            transition: 'max-height 0.35s ease',
            borderTop: isMenuOpen ? '1px solid var(--color-border)' : 'none',
          }}
        >
          <ul
            style={{
              listStyle: 'none',
              width: '100%',
              padding: '1rem 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '0',
            }}
          >
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '0.85rem 0',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: isActive(link.href) ? 'var(--color-gold)' : 'var(--color-white-muted)',
                    borderBottom: '1px solid var(--color-border)',
                    transition: 'color var(--transition-fast)',
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {!authLoading && (
              <li style={{ paddingTop: '1rem' }}>
                {user ? (
                  <Link
                    to={dashboardPath}
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      display: 'block',
                      padding: '0.85rem 0',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'var(--color-gold)',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    My Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/signin"
                      onClick={() => setIsMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: '0.85rem 0',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--color-white-muted)',
                        borderBottom: '1px solid var(--color-border)',
                      }}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: '0.85rem 0',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--color-white-muted)',
                        borderBottom: '1px solid var(--color-border)',
                      }}
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </li>
            )}

            <li style={{ paddingTop: '1rem' }}>
              <Link
                to="/booking"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '0.75rem',
                  backgroundColor: 'var(--color-gold)',
                  color: 'var(--color-black)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                Book Now
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  )
}
