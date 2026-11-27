import Icon, { type IconName } from '@/components/common/Icon'
import { cn } from '@/lib/cn'

interface AdminStatCardProps {
  icon: IconName
  label: string
  value: string | number
  hint?: string
  hintTone?: 'success' | 'muted'
}

export default function AdminStatCard({
  icon,
  label,
  value,
  hint,
  hintTone = 'muted',
}: AdminStatCardProps) {
  return (
    <article className="admin-stat-card">
      <div className="admin-stat-copy">
        <span className="admin-stat-label">{label}</span>
        <strong className="admin-stat-value">{value}</strong>
        {hint && (
          <span className={cn('admin-stat-hint', hintTone === 'success' && 'is-success')}>
            {hint}
          </span>
        )}
      </div>
      <span className="admin-stat-icon" aria-hidden="true">
        <Icon name={icon} size={20} />
      </span>
    </article>
  )
}
