import { Link, Outlet } from 'react-router-dom'
import Icon from '@/components/common/Icon'

const CURRENT_YEAR = new Date().getFullYear()

export default function AuthLayout() {
  return (
    <div className="auth-shell">
      <aside className="auth-brand-panel" aria-label="NF Signature Salon">
        <Link to="/" className="auth-brand" aria-label="NF Signature Salon — Home">
          <span className="auth-brand-name">NF SIGNATURE</span>
          <span className="auth-brand-sub">SALON</span>
        </Link>

        <div className="auth-brand-copy">
          <span className="auth-brand-eyebrow">Beauty, considered</span>
          <h2>Your next appointment starts here.</h2>
          <p>
            Book treatments, keep track of visits and manage your details in one
            calm, considered space.
          </p>
        </div>

        <ul className="auth-benefits">
          <li>
            <span className="auth-benefit-icon"><Icon name="calendar" size={17} /></span>
            View and manage your appointments
          </li>
          <li>
            <span className="auth-benefit-icon"><Icon name="heart" size={17} /></span>
            Save your favourite treatments
          </li>
          <li>
            <span className="auth-benefit-icon"><Icon name="shield" size={17} /></span>
            Secure sign-in handled by the salon API
          </li>
        </ul>

        <p className="auth-brand-footnote">
          <Icon name="sparkles" size={14} />
          Premium beauty &amp; wellness, thoughtfully delivered.
        </p>
      </aside>

      <main className="auth-form-panel">
        <div className="auth-form-top">
          <Link to="/" className="auth-mobile-brand" aria-label="NF Signature Salon — Home">
            NF SIGNATURE <span>SALON</span>
          </Link>
          <Link to="/" className="auth-back-link">
            <Icon name="arrow-left" size={15} />
            Back to site
          </Link>
        </div>

        <div className="auth-form-content">
          <Outlet />
        </div>

        <p className="auth-legal">
          © {CURRENT_YEAR} NF Signature Salon. All rights reserved.
        </p>
      </main>
    </div>
  )
}
