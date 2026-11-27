import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import Icon, { type IconName } from '@/components/common/Icon'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/cn'
import { resolveAssetUrl } from '@/services/config'
import { getInitials } from '@/utils/format'

interface AdminNavItem {
  label: string
  to: string
  icon: IconName
  end?: boolean
}

const ADMIN_NAV: AdminNavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: 'home', end: true },
  { label: 'Bookings', to: '/admin/bookings', icon: 'calendar' },
  { label: 'Services', to: '/admin/services', icon: 'list' },
  { label: 'Customers', to: '/admin/customers', icon: 'users' },
  { label: 'Payments', to: '/admin/payments', icon: 'wallet' },
  { label: 'Profile', to: '/admin/profile', icon: 'user' },
]

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  const handleLogout = async () => {
    setMenuOpen(false)
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
  const avatarUrl = user?.avatarUrl ? resolveAssetUrl(user.avatarUrl) : null

  return (
    <div className="admin-shell">
      <a href="#admin-content" className="skip-link">
        Skip to admin content
      </a>

      <aside
        id="admin-sidebar"
        className={cn('admin-sidebar', mobileOpen && 'is-open')}
        aria-label="Admin navigation"
      >
        <div className="admin-sidebar-header">
          <Link to="/admin" className="admin-brand" aria-label="NF Signature Salon — Admin dashboard">
            <span className="admin-brand-mark">NF</span>
            <span className="admin-brand-sub">Signature Salon</span>
          </Link>
          <button
            type="button"
            className="admin-sidebar-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <nav className="admin-nav">
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cn('admin-nav-link', isActive && 'active')}
              onClick={() => setMobileOpen(false)}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {mobileOpen && (
        <button
          type="button"
          className="admin-overlay"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation overlay"
        />
      )}

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-mobile-toggle"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
            aria-controls="admin-sidebar"
          >
            <Icon name="menu" size={20} />
          </button>

          <div className="admin-profile-menu" ref={menuRef}>
            <button
              type="button"
              className="admin-profile-trigger"
              onClick={() => setMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Open administrator menu"
            >
              <span className="admin-profile-avatar" aria-hidden="true">
                {avatarUrl ? <img src={avatarUrl} alt="" /> : initials ?? <Icon name="user" size={20} />}
              </span>
              <Icon
                name="chevron-down"
                size={16}
                className={cn('admin-profile-chevron', menuOpen && 'is-open')}
              />
            </button>

            {menuOpen && (
              <div className="admin-profile-dropdown" role="menu">
                <div className="admin-profile-dropdown-head">
                  <strong>{user?.name ?? 'Administrator'}</strong>
                  <span>{user?.email ?? 'Admin account'}</span>
                </div>
                <Link
                  to="/admin/profile"
                  className="admin-profile-dropdown-link"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon name="user" size={16} />
                  Profile
                </Link>
                <Link
                  to="/"
                  className="admin-profile-dropdown-link"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon name="home" size={16} />
                  Back to site
                </Link>
                <button
                  type="button"
                  className="admin-profile-dropdown-link is-danger"
                  onClick={() => void handleLogout()}
                  role="menuitem"
                >
                  <Icon name="logout" size={16} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="admin-content" id="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
