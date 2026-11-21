import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface DashboardCardProps {
  title?: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  padded?: boolean
}

export default function DashboardCard({
  title,
  description,
  action,
  children,
  className,
  padded = true,
}: DashboardCardProps) {
  return (
    <section className={cn('dashboard-card', className)}>
      {(title || action) && (
        <div className="dashboard-card-header">
          <div>
            {title && <h2>{title}</h2>}
            {description && <p>{description}</p>}
          </div>
          {action && <div className="dashboard-card-action">{action}</div>}
        </div>
      )}
      <div className={cn('dashboard-card-body', padded && 'is-padded')}>{children}</div>
    </section>
  )
}
