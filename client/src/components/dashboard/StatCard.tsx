import Icon, { type IconName } from '@/components/common/Icon'
import { cn } from '@/lib/cn'

interface StatCardProps {
  icon: IconName
  label: string
  value: string | number
  hint?: string
  accent?: boolean
}

export default function StatCard({ icon, label, value, hint, accent = false }: StatCardProps) {
  return (
    <div className={cn('stat-card', accent && 'stat-card-accent')}>
      <span className="stat-card-icon" aria-hidden="true">
        <Icon name={icon} size={19} />
      </span>
      <div>
        <span className="stat-card-label">{label}</span>
        <strong className="stat-card-value">{value}</strong>
        {hint && <span className="stat-card-hint">{hint}</span>}
      </div>
    </div>
  )
}
