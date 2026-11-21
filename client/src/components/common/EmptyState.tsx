import type { ReactNode } from 'react'
import Icon, { type IconName } from '@/components/common/Icon'
import { cn } from '@/lib/cn'

interface EmptyStateProps {
  icon?: IconName
  title: string
  description?: string
  action?: ReactNode
  compact?: boolean
  className?: string
}

export default function EmptyState({
  icon = 'sparkles',
  title,
  description,
  action,
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('empty-state', compact && 'empty-state-compact', className)}>
      <span className="empty-state-icon" aria-hidden="true">
        <Icon name={icon} size={compact ? 20 : 26} />
      </span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  )
}
