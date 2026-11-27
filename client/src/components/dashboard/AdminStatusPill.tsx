import type {
  AppointmentPaymentStatus,
  AppointmentStatus,
  PaymentTransactionStatus,
} from '@/types'

const APPOINTMENT_LABELS: Record<AppointmentStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const PAYMENT_LABELS: Record<string, string> = {
  unpaid: 'Unpaid',
  pending: 'Pending',
  paid: 'Paid',
  processing: 'Processing',
  succeeded: 'Successful',
  cash_pending: 'Pending',
  cash_received: 'Successful',
  failed: 'Failed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

type PaymentStatus = AppointmentPaymentStatus | PaymentTransactionStatus | null | undefined

function paymentTone(status: PaymentStatus): string {
  if (status === 'paid' || status === 'succeeded' || status === 'cash_received') {
    return 'is-success'
  }
  if (status === 'pending' || status === 'processing' || status === 'cash_pending') {
    return 'is-pending'
  }
  if (status === 'failed' || status === 'cancelled') {
    return 'is-danger'
  }
  return 'is-muted'
}

export default function AdminStatusPill({ status }: { status: AppointmentStatus }) {
  return (
    <span className={`admin-status-pill admin-status-${status}`}>
      {APPOINTMENT_LABELS[status]}
    </span>
  )
}

export function AdminPaymentStatus({ status }: { status: PaymentStatus }) {
  const normalized = status ?? 'unpaid'
  return (
    <span className={`admin-payment-status ${paymentTone(normalized)}`}>
      {PAYMENT_LABELS[normalized] ?? normalized}
    </span>
  )
}

