import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import Icon from '@/components/common/Icon'
import Skeleton from '@/components/common/Skeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { fetchMyPaymentTransactions } from '@/services/api/payments'
import type { PaymentTransaction } from '@/types'
import { formatShortDate } from '@/utils/format'

const METHOD_LABELS: Record<string, string> = {
  stripe_demo: 'Stripe Demo',
  bkash_demo: 'bKash Demo',
  nagad_demo: 'Nagad Demo',
  pay_at_salon: 'Pay at Salon Demo',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  succeeded: 'Paid',
  cash_pending: 'Pay at salon',
  cash_received: 'Cash received',
  failed: 'Failed',
  cancelled: 'Cancelled',
}

interface PaymentHistoryProps {
  refreshKey?: number
}

export default function PaymentHistory({ refreshKey = 0 }: PaymentHistoryProps) {
  const { data, loading, error, refetch } = useApiResource<PaymentTransaction[]>(
    () => fetchMyPaymentTransactions(),
    [refreshKey]
  )

  if (loading) {
    return (
      <div className="payment-history-list" aria-hidden="true">
        {Array.from({ length: 3 }).map((_, index) => (
          <div className="payment-history-row" key={index}>
            <Skeleton width="42%" height="14px" />
            <Skeleton width="28%" height="12px" />
            <Skeleton width="18%" height="12px" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <ErrorState title="We couldn't load payment history" message={error} onRetry={refetch} compact />
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon="check"
        title="No TEST payments yet"
        description="Simulated payments for your confirmed appointments will appear here."
        compact
      />
    )
  }

  return (
    <div className="payment-history-list">
      {data.map((transaction) => (
        <article className="payment-history-row" key={transaction.id}>
          <div>
            <strong>{transaction.serviceTitle}</strong>
            <span>
              {formatShortDate(transaction.appointmentDate)} · {transaction.appointmentTime}
            </span>
          </div>
          <div>
            <strong>{METHOD_LABELS[transaction.paymentMethod] ?? transaction.paymentMethod}</strong>
            <span>BDT {transaction.amount} · TEST</span>
          </div>
          <span className={`payment-status payment-status-${transaction.paymentStatus}`}>
            <Icon name="shield" size={13} />
            {STATUS_LABELS[transaction.paymentStatus] ?? transaction.paymentStatus}
          </span>
        </article>
      ))}
    </div>
  )
}
