import Button from '@/components/common/Button'
import Icon from '@/components/common/Icon'
import { cn } from '@/lib/cn'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  retryLabel?: string
  compact?: boolean
  className?: string
}

export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
  compact = false,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn('error-state', compact && 'error-state-compact', className)}
      role="alert"
    >
      <span className="error-state-icon" aria-hidden="true">
        <Icon name="alert-circle" size={compact ? 20 : 26} />
      </span>
      <h3>{title}</h3>
      <p>{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} leftIcon={<Icon name="refresh" size={15} />}>
          {retryLabel}
        </Button>
      )}
    </div>
  )
}
