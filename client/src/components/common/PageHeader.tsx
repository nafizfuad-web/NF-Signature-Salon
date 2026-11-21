import { useId } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

export interface Breadcrumb {
  label: string
  to?: string
}

interface PageHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  breadcrumbs?: Breadcrumb[]
  actions?: ReactNode
  compact?: boolean
}

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  breadcrumbs,
  actions,
  compact = false,
}: PageHeaderProps) {
  const titleId = useId()

  return (
    <section className={cn('page-hero', compact && 'page-hero-compact')} aria-labelledby={titleId}>
      <div className="section-container">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <ol>
              {breadcrumbs.map((crumb, index) => (
                <li key={`${crumb.label}-${index}`}>
                  {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : <span aria-current="page">{crumb.label}</span>}
                  {index < breadcrumbs.length - 1 && <span className="breadcrumb-sep" aria-hidden="true">/</span>}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {eyebrow && <span className="page-eyebrow">{eyebrow}</span>}
        <h1 className="page-title" id={titleId}>
          {title}
        </h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
        {actions && <div className="page-actions">{actions}</div>}
      </div>
    </section>
  )
}
