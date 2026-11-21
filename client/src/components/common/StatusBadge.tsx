import type { AppointmentStatus } from '@/types'

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

interface StatusBadgeProps {
  status: AppointmentStatus
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-${status}`}>
      <span className="status-dot" aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  )
}
