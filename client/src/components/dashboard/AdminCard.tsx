import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface AdminCardProps {
  title?: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  padded?: boolean
}

export default function AdminCard({
  title,
  description,
  action,
  children,
  className,
  padded = true,
}: AdminCardProps) {
  return (
    <section className={cn('admin-card', className)}>
      {(title || action) && (
        <div className="admin-card-header">
          <div>
            {title && <h2>{title}</h2>}
            {description && <p>{description}</p>}
          </div>
          {action && <div className="admin-card-action">{action}</div>}
        </div>
      )}
      <div className={cn('admin-card-body', padded && 'is-padded')}>{children}</div>
    </section>
  )
}
