import { Link } from 'react-router-dom'
import SectionHeader from '@/components/common/SectionHeader'
import { SERVICE_CATEGORIES } from '@/utils/constants'

// NF Signature Salon — Service categories section
// Renders one card per category. Cards link to the services listing with a
// category hint that the ServicesPage can read once filtering is added.

export default function ServiceCategories() {
  return (
    <section
      aria-label="Service categories"
      style={{
        padding: 'clamp(4rem, 8vw, 8rem) 1.5rem',
        backgroundColor: 'var(--color-black-soft)',
      }}
    >
      <div className="section-container">
        <SectionHeader
          eyebrow="Discover our services"
          title="Service Categories"
          subtitle="From hair to wellness, each treatment is crafted with precision and care."
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {SERVICE_CATEGORIES.map((category) => (
            <Link
              key={category.id}
              to={`/services?category=${category.id}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem 1.25rem',
                textDecoration: 'none',
                transition:
                  'border-color var(--transition-base), box-shadow var(--transition-base), transform var(--transition-base)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-gold-muted)'
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-gold)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background:
                    'linear-gradient(135deg, var(--color-gold-light), var(--color-gold-dark))',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.1rem',
                    color: 'var(--color-black)',
                    fontWeight: 700,
                  }}
                >
                  {category.name.charAt(0)}
                </span>
              </div>

              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: 'var(--color-white)',
                  margin: '0 0 0.5rem 0',
                  letterSpacing: '0.01em',
                }}
              >
                {category.name}
              </h3>

              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--color-white-muted)',
                  margin: '0 0 1.25rem 0',
                  lineHeight: 1.6,
                  flexShrink: 0,
                }}
              >
                {category.description}
              </p>

              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--color-gold)',
                  marginTop: 'auto',
                }}
              >
                View services
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
