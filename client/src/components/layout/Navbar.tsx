import {
  useEffect,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { Link, useLocation } from 'react-router-dom'
import Icon, { type IconName } from '@/components/common/Icon'
import { useAuth } from '@/hooks/useAuth'
import { resolveAssetUrl } from '@/services/config'
import type { AuthUser } from '@/types'
import { getInitials } from '@/utils/format'

type DropdownKey = 'more' | 'dashboard'

interface DropdownLink {
  label: string
  href: string
  icon: IconName
  description: string
}

const PRIMARY_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
] as const

const MORE_LINKS: DropdownLink[] = [
  {
    label: 'Gallery',
    href: '/gallery',
    icon: 'grid',
    description: 'A look at our signature work',
  },
  {
    label: 'About',
    href: '/about',
    icon: 'sparkles',
    description: 'The story behind the salon',
  },
  {
    label: 'Contact',
    href: '/contact',
    icon: 'mail',
    description: 'Visit us or get in touch',
  },
]

function NavAvatar({ user }: { user: AuthUser }) {
  return (
    <span className="nf-avatar" aria-hidden="true">
      {user.avatarUrl ? (
        <img src={resolveAssetUrl(user.avatarUrl)} alt="" />
      ) : (
        getInitials(user.name)
      )}
    </span>
  )
}

export default function Navbar() {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<DropdownKey | null>(null)
  const [openMobileSection, setOpenMobileSection] = useState<DropdownKey | null>(null)
  const [navigationPath, setNavigationPath] = useState<string>(location.pathname)
  const { user, isLoading: authLoading } = useAuth()

  const navRef = useRef<HTMLElement | null>(null)
  const menuToggleRef = useRef<HTMLButtonElement | null>(null)
  const moreButtonRef = useRef<HTMLButtonElement | null>(null)
  const dashboardButtonRef = useRef<HTMLButtonElement | null>(null)

  const isAdmin = user?.role === 'admin'
  const dashboardPath = isAdmin ? '/admin' : '/dashboard'
  const firstName = user?.name.trim().split(/\s+/)[0] ?? ''

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)

  const isMoreActive = MORE_LINKS.some((item) => isActive(item.href))
  const isDashboardActive =
    location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin')

  const customerDashboardLink: DropdownLink = {
    label: 'Customer Dashboard',
    href: '/dashboard',
    icon: user ? 'user' : 'lock',
    description: user ? 'Appointments, profile and visits' : 'Sign in to view your visits',
  }

  const dashboardLinks: DropdownLink[] = [customerDashboardLink]

  if (isAdmin) {
    dashboardLinks.push({
      label: 'Admin Panel',
      href: '/admin',
      icon: 'shield',
      description: 'Salon administration workspace',
    })
  }

  // Close every navigation layer when the route changes without an effect.
  if (navigationPath !== location.pathname) {
    setNavigationPath(location.pathname)
    setIsMenuOpen(false)
    setOpenDropdown(null)
    setOpenMobileSection(null)
  }

  // Scroll detection for the elevated header treatment.
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close the desktop dropdown when clicking anywhere outside the navigation.
  useEffect(() => {
    if (!openDropdown) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [openDropdown])

  // Escape closes the active layer and returns focus to its trigger.
  useEffect(() => {
    if (!openDropdown && !isMenuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return

      if (openDropdown) {
        const trigger =
          openDropdown === 'more' ? moreButtonRef.current : dashboardButtonRef.current
        setOpenDropdown(null)
        trigger?.focus()
      }

      if (isMenuOpen) {
        setIsMenuOpen(false)
        setOpenMobileSection(null)
        menuToggleRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [openDropdown, isMenuOpen])

  // Reset the correct layer when crossing the desktop / mobile breakpoint.
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1025px)')
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsMenuOpen(false)
        setOpenMobileSection(null)
      } else {
        setOpenDropdown(null)
      }
    }

    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  // Prevent the page behind the mobile menu from scrolling.
  useEffect(() => {
    if (!isMenuOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isMenuOpen])

  const toggleDropdown = (key: DropdownKey) => {
    setOpenDropdown((current) => (current === key ? null : key))
  }

  const handleDropdownPointerEnter = (
    key: DropdownKey,
    event: ReactPointerEvent<HTMLLIElement>,
  ) => {
    if (event.pointerType === 'mouse') {
      setOpenDropdown(key)
    }
  }

  const handleDropdownPointerLeave = (
    key: DropdownKey,
    event: ReactPointerEvent<HTMLLIElement>,
  ) => {
    if (event.pointerType === 'mouse') {
      setOpenDropdown((current) => (current === key ? null : current))
    }
  }

  const handleDropdownBlur = (key: DropdownKey, event: ReactFocusEvent<HTMLLIElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setOpenDropdown((current) => (current === key ? null : current))
    }
  }

  const toggleMobileSection = (key: DropdownKey) => {
    setOpenMobileSection((current) => (current === key ? null : key))
  }

  const closeNavigation = () => {
    setIsMenuOpen(false)
    setOpenDropdown(null)
    setOpenMobileSection(null)
  }

  return (
    <header
      className={`nf-header${isScrolled ? ' is-scrolled' : ''}${
        isMenuOpen ? ' is-menu-open' : ''
      }`}
    >
      <div className="section-container">
        <nav className="nf-nav" ref={navRef} aria-label="Primary navigation">
          {/* Logo */}
          <Link
            to="/"
            className="nf-brand"
            aria-label="NF Signature Salon — Home"
            onClick={closeNavigation}
          >
            <span className="nf-brand-name">NF SIGNATURE</span>
            <span className="nf-brand-sub">SALON</span>
          </Link>

          {/* Desktop links */}
          <ul className="nf-links">
            {PRIMARY_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className={`nf-link${isActive(link.href) ? ' is-active' : ''}`}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            <li
              className={`nf-dropdown${openDropdown === 'more' ? ' is-open' : ''}`}
              onPointerEnter={(event) => handleDropdownPointerEnter('more', event)}
              onPointerLeave={(event) => handleDropdownPointerLeave('more', event)}
              onBlur={(event) => handleDropdownBlur('more', event)}
            >
              <button
                type="button"
                ref={moreButtonRef}
                className={`nf-link nf-dropdown-trigger${isMoreActive ? ' is-active' : ''}`}
                aria-haspopup="true"
                aria-expanded={openDropdown === 'more'}
                aria-controls="nf-more-panel"
                onClick={() => toggleDropdown('more')}
              >
                More
                <Icon name="chevron-down" size={13} className="nf-chevron" />
              </button>

              <div
                id="nf-more-panel"
                className="nf-dropdown-panel"
                aria-hidden={openDropdown !== 'more'}
              >
                <div className="nf-dropdown-card">
                  {MORE_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`nf-dropdown-item${isActive(item.href) ? ' is-active' : ''}`}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                      onClick={() => setOpenDropdown(null)}
                    >
                      <span className="nf-dropdown-icon">
                        <Icon name={item.icon} size={16} />
                      </span>
                      <span className="nf-dropdown-copy">
                        <strong>{item.label}</strong>
                        <small>{item.description}</small>
                      </span>
                      <Icon name="chevron-right" size={14} className="nf-dropdown-arrow" />
                    </Link>
                  ))}
                </div>
              </div>
            </li>

            <li
              className={`nf-dropdown${openDropdown === 'dashboard' ? ' is-open' : ''}`}
              onPointerEnter={(event) => handleDropdownPointerEnter('dashboard', event)}
              onPointerLeave={(event) => handleDropdownPointerLeave('dashboard', event)}
              onBlur={(event) => handleDropdownBlur('dashboard', event)}
            >
              <button
                type="button"
                ref={dashboardButtonRef}
                className={`nf-link nf-dropdown-trigger${
                  isDashboardActive ? ' is-active' : ''
                }`}
                aria-haspopup="true"
                aria-expanded={openDropdown === 'dashboard'}
                aria-controls="nf-dashboard-panel"
                onClick={() => toggleDropdown('dashboard')}
              >
                Dashboard
                <Icon name="chevron-down" size={13} className="nf-chevron" />
              </button>

              <div
                id="nf-dashboard-panel"
                className="nf-dropdown-panel"
                aria-hidden={openDropdown !== 'dashboard'}
              >
                <div className="nf-dropdown-card nf-dropdown-card-dashboard">
                  {dashboardLinks.map((item, index) => (
                    <div key={item.href}>
                      {isAdmin && index === 1 && <div className="nf-dropdown-separator" />}
                      <Link
                        to={item.href}
                        className={`nf-dropdown-item${isActive(item.href) ? ' is-active' : ''}`}
                        aria-current={isActive(item.href) ? 'page' : undefined}
                        onClick={() => setOpenDropdown(null)}
                      >
                        <span
                          className={`nf-dropdown-icon${
                            item.href === '/admin' ? ' nf-dropdown-icon-admin' : ''
                          }`}
                        >
                          <Icon name={item.icon} size={16} />
                        </span>
                        <span className="nf-dropdown-copy">
                          <strong>{item.label}</strong>
                          <small>{item.description}</small>
                        </span>
                        <Icon name="chevron-right" size={14} className="nf-dropdown-arrow" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </li>
          </ul>

          {/* Desktop account + CTA */}
          <div className="nf-actions">
            {authLoading ? (
              <span className="nf-auth-loading" aria-label="Loading your account">
                <span className="nf-auth-spinner" aria-hidden="true" />
              </span>
            ) : user ? (
              <Link
                to={dashboardPath}
                className="nf-account"
                aria-label={`Open ${isAdmin ? 'admin' : 'customer'} dashboard`}
                onClick={() => setOpenDropdown(null)}
              >
                <NavAvatar user={user} />
                <span className="nf-account-copy">
                  <small>{isAdmin ? 'Administrator' : 'My account'}</small>
                  <strong>{firstName}</strong>
                </span>
              </Link>
            ) : (
              <Link
                to="/signin"
                className="nf-signin"
                onClick={() => setOpenDropdown(null)}
              >
                <Icon name="user" size={16} />
                <span>Sign In</span>
              </Link>
            )}

            <Link
              to="/booking"
              className="nf-book"
              onClick={() => setOpenDropdown(null)}
            >
              <span>Book Now</span>
              <Icon name="arrow-right" size={14} />
            </Link>
          </div>

          {/* Mobile actions */}
          <div className="nf-mobile-actions">
            {authLoading ? (
              <span
                className="nf-auth-loading nf-auth-loading-mobile"
                aria-label="Loading your account"
              >
                <span className="nf-auth-spinner" aria-hidden="true" />
              </span>
            ) : user ? (
              <Link
                to={dashboardPath}
                className="nf-mobile-account"
                aria-label={`Open ${isAdmin ? 'admin' : 'customer'} dashboard`}
                onClick={closeNavigation}
              >
                <NavAvatar user={user} />
              </Link>
            ) : (
              <Link
                to="/signin"
                className="nf-mobile-signin"
                aria-label="Sign in"
                onClick={closeNavigation}
              >
                <Icon name="user" size={17} />
                <span className="nf-mobile-signin-label">Sign In</span>
              </Link>
            )}

            <Link to="/booking" className="nf-mobile-book" onClick={closeNavigation}>
              Book Now
            </Link>

            <button
              type="button"
              ref={menuToggleRef}
              className={`nf-toggle${isMenuOpen ? ' is-open' : ''}`}
              onClick={() => {
                setIsMenuOpen((current) => !current)
                setOpenMobileSection(null)
              }}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="nf-mobile-menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <div
          id="nf-mobile-menu"
          className={`nf-mobile-panel${isMenuOpen ? ' is-open' : ''}`}
          aria-hidden={!isMenuOpen}
        >
          <div className="nf-mobile-inner">
            <ul className="nf-mobile-links">
              {PRIMARY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className={`nf-mobile-link${isActive(link.href) ? ' is-active' : ''}`}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    onClick={closeNavigation}
                  >
                    <span>{link.label}</span>
                    <Icon name="chevron-right" size={15} />
                  </Link>
                </li>
              ))}

              <li className={`nf-mobile-group${openMobileSection === 'more' ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className={`nf-mobile-trigger${isMoreActive ? ' is-active' : ''}`}
                  aria-expanded={openMobileSection === 'more'}
                  aria-controls="nf-mobile-more"
                  onClick={() => toggleMobileSection('more')}
                >
                  <span>More</span>
                  <Icon name="chevron-down" size={16} className="nf-chevron" />
                </button>

                <div
                  id="nf-mobile-more"
                  className="nf-mobile-submenu"
                  aria-hidden={openMobileSection !== 'more'}
                >
                  <div className="nf-mobile-submenu-inner">
                    {MORE_LINKS.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={`nf-mobile-sublink${isActive(item.href) ? ' is-active' : ''}`}
                        aria-current={isActive(item.href) ? 'page' : undefined}
                        onClick={closeNavigation}
                      >
                        <span className="nf-mobile-sublink-icon">
                          <Icon name={item.icon} size={15} />
                        </span>
                        <span>{item.label}</span>
                        <Icon name="chevron-right" size={14} className="nf-mobile-sublink-arrow" />
                      </Link>
                    ))}
                  </div>
                </div>
              </li>

              <li
                className={`nf-mobile-group${
                  openMobileSection === 'dashboard' ? ' is-open' : ''
                }`}
              >
                <button
                  type="button"
                  className={`nf-mobile-trigger${isDashboardActive ? ' is-active' : ''}`}
                  aria-expanded={openMobileSection === 'dashboard'}
                  aria-controls="nf-mobile-dashboard"
                  onClick={() => toggleMobileSection('dashboard')}
                >
                  <span>Dashboard</span>
                  <Icon name="chevron-down" size={16} className="nf-chevron" />
                </button>

                <div
                  id="nf-mobile-dashboard"
                  className="nf-mobile-submenu"
                  aria-hidden={openMobileSection !== 'dashboard'}
                >
                  <div className="nf-mobile-submenu-inner">
                    {dashboardLinks.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={`nf-mobile-sublink${isActive(item.href) ? ' is-active' : ''}`}
                        aria-current={isActive(item.href) ? 'page' : undefined}
                        onClick={closeNavigation}
                      >
                        <span
                          className={`nf-mobile-sublink-icon${
                            item.href === '/admin' ? ' nf-mobile-sublink-icon-admin' : ''
                          }`}
                        >
                          <Icon name={item.icon} size={15} />
                        </span>
                        <span>{item.label}</span>
                        <Icon name="chevron-right" size={14} className="nf-mobile-sublink-arrow" />
                      </Link>
                    ))}
                  </div>
                </div>
              </li>
            </ul>

            <div className="nf-mobile-footer">
              {user ? (
                <Link
                  to={dashboardPath}
                  className="nf-mobile-account-row"
                  onClick={closeNavigation}
                >
                  <NavAvatar user={user} />
                  <span className="nf-mobile-account-copy">
                    <small>{isAdmin ? 'Administrator' : 'Signed in'}</small>
                    <strong>{user.name}</strong>
                  </span>
                  <Icon name="chevron-right" size={16} />
                </Link>
              ) : !authLoading ? (
                <div className="nf-mobile-auth-links">
                  <Link to="/signin" className="nf-mobile-auth-link" onClick={closeNavigation}>
                    Sign In
                  </Link>
                  <Link to="/signup" className="nf-mobile-auth-link" onClick={closeNavigation}>
                    Create Account
                  </Link>
                </div>
              ) : null}

              <Link to="/booking" className="nf-mobile-cta" onClick={closeNavigation}>
                <Icon name="calendar" size={16} />
                <span>Book Now</span>
                <Icon name="arrow-right" size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
