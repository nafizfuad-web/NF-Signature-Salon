import Spinner from '@/components/common/Spinner'
import { cn } from '@/lib/cn'

interface LoadingStateProps {
  label?: string
  compact?: boolean
  className?: string
}

export default function LoadingState({
  label = 'Loading…',
  compact = false,
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn('loading-state', compact && 'loading-state-compact', className)}
      role="status"
      aria-live="polite"
    >
      <Spinner size={compact ? 20 : 30} label={label} />
      <p>{label}</p>
    </div>
  )
}
