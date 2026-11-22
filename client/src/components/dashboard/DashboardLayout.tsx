import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import ButtonLink from '@/components/common/ButtonLink'
import Icon, { type IconName } from '@/components/common/Icon'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/cn'
import { resolveAssetUrl } from '@/services/config'
import { getInitials } from '@/utils/format'

interface DashboardLayoutProps {
  variant: 'customer' | 'admin'
}

interface DashboardNavItem {
  label: string
  to: string
  icon: IconName
  end?: boolean
}

const CUSTOMER_NAV: DashboardNavItem[] = [
  { label: 'Overview', to: '/dashboard', icon: 'grid', end: true },
  { label: 'My appointments', to: '/dashboard/appointments', icon: 'calendar' },
  { label: 'My profile', to: '/dashboard/profile', icon: 'user' },
  { label: 'Browse services', to: '/services', icon: 'sparkles' },
]

const ADMIN_NAV: DashboardNavItem[] = [
  { label: 'Overview', to: '/admin', icon: 'grid', end: true },
  { label: 'Bookings', to: '/admin/bookings', icon: 'calendar' },
  { label: 'Services', to: '/admin/services', icon: 'briefcase' },
  { label: 'Customers', to: '/admin/customers', icon: 'users' },
]

export default function DashboardLayout({ variant }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuPath, setMenuPath] = useState<string | null>(null)
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const navItems = variant === 'admin' ? ADMIN_NAV : CUSTOMER_NAV
  const activeItem = navItems.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  )

  // Close the mobile drawer when the route changes without an effect.
  if (menuPath !== null && menuPath !== location.pathname) {
    setMenuPath(null)
    setMobileOpen(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.info('Signed out', 'Your session has been cleared on this device.')
    } catch {
      toast.info('Signed out locally', 'The server could not be reached; this device has been signed out.')
    } finally {
      navigate('/')
    }
  }

  const initials = user ? getInitials(user.name) : null

  return (
    <div className="dashboard-shell">
      <a href="#dashboard-content" className="skip-link">
        Skip to dashboard content
      </a>

      <aside
        id="dashboard-sidebar"
        className={cn('dashboard-sidebar', mobileOpen && 'is-open')}
        aria-label={variant === 'admin' ? 'Admin navigation' : 'Customer navigation'}
      >
        <div className="dashboard-sidebar-header">
          <Link to="/" className="dashboard-brand" aria-label="NF Signature Salon — Home">
            <span className="dashboard-brand-name">NF SIGNATURE</span>
            <span className="dashboard-brand-sub">SALON</span>
          </Link>
          <button
            type="button"
            className="dashboard-sidebar-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <span className={cn('dashboard-role-badge', variant === 'admin' && 'dashboard-role-admin')}>
          <Icon name={variant === 'admin' ? 'shield' : 'user'} size={13} />
          {variant === 'admin' ? 'Admin workspace' : 'Customer account'}
        </span>

        <nav className="dashboard-nav">
          <span className="dashboard-nav-label">Menu</span>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn('dashboard-nav-link', isActive && 'active')
              }
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="dashboard-sidebar-footer">
          <div className="dashboard-user">
            <span className="dashboard-avatar" aria-hidden="true">
              {user?.avatarUrl ? (
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
                initials ?? <Icon name="user" size={17} />
              )}
            </span>
            <div className="dashboard-user-copy">
              <p>{user?.name ?? 'Guest'}</p>
              <span>{user?.email ?? 'Not signed in'}</span>
            </div>
          </div>

          {user ? (
            <button type="button" className="dashboard-logout" onClick={handleLogout}>
              <Icon name="logout" size={16} />
              Sign out
            </button>
          ) : (
            <ButtonLink to="/signin" variant="outline" size="sm" fullWidth>
              Sign in
            </ButtonLink>
          )}

          <Link to="/" className="dashboard-back-link">
            <Icon name="home" size={15} />
            Back to site
          </Link>
        </div>
      </aside>

      {mobileOpen && (
        <button
          type="button"
          className="dashboard-overlay"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation overlay"
        />
      )}

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <button
            type="button"
            className="dashboard-mobile-toggle"
            onClick={() => {
              setMenuPath(location.pathname)
              setMobileOpen(true)
            }}
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
            aria-controls="dashboard-sidebar"
          >
            <Icon name="menu" size={20} />
          </button>

          <div className="dashboard-topbar-title">
            <span>{variant === 'admin' ? 'Admin workspace' : 'Customer account'}</span>
            <strong>{activeItem?.label ?? 'Dashboard'}</strong>
          </div>

          <div className="dashboard-topbar-actions">
            <Link to="/services" className="dashboard-topbar-link" aria-label="Book a service">
              <Icon name="calendar" size={15} />
              <span>Book a service</span>
            </Link>
            {user ? (
              <span className="dashboard-avatar dashboard-avatar-small" aria-hidden="true">
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
                  initials
                )}
              </span>
            ) : (
              <Link to="/signin" className="dashboard-topbar-link">
                Sign in
              </Link>
            )}
          </div>
        </header>

        <main className="dashboard-content" id="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
