import { useMemo, useState } from 'react'
import Button from '@/components/common/Button'
import DashboardAccessGate from '@/components/dashboard/DashboardAccessGate'
import DashboardCard from '@/components/dashboard/DashboardCard'
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import LoadingState from '@/components/common/LoadingState'
import { useApiResource } from '@/hooks/useApiResource'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { confirmCashReceived, fetchAdminPayments } from '@/services/api/admin'
import type { AdminPaymentsResponse, PaymentTransaction } from '@/types'
import type { PaymentMethodId, PaymentTransactionStatus } from '@/types'
import { getErrorMessage } from '@/utils/errors'
import { formatShortDate } from '@/utils/format'

const METHOD_LABELS: Record<string, string> = {
  stripe: 'Card via Stripe',
  bkash: 'bKash',
  nagad: 'Nagad',
  stripe_demo: 'Stripe Demo',
  bkash_demo: 'bKash Demo',
  nagad_demo: 'Nagad Demo',
  pay_at_salon: 'Pay at Salon',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  succeeded: 'Paid',
  cash_pending: 'Cash pending',
  cash_received: 'Cash received',
  failed: 'Failed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

function isCashPending(transaction: PaymentTransaction): boolean {
  return transaction.paymentMethod === 'pay_at_salon' && transaction.paymentStatus === 'cash_pending'
}

function AdminPaymentsContent() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [methodFilter, setMethodFilter] = useState<PaymentMethodId | ''>('')
  const [statusFilter, setStatusFilter] = useState<PaymentTransactionStatus | ''>('')
  const [search, setSearch] = useState('')
  const { data, loading, error, refetch, setData } = useApiResource<AdminPaymentsResponse>(
    () =>
      fetchAdminPayments({
        method: methodFilter || undefined,
        status: statusFilter || undefined,
        q: search || undefined,
      }),
    [user?.id, methodFilter, statusFilter, search]
  )
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const transactions = useMemo(() => data?.transactions ?? [], [data])
  const cashPending = useMemo(() => transactions.filter(isCashPending), [transactions])

  async function confirmCash(transaction: PaymentTransaction) {
    setConfirmingId(transaction.id)
    try {
      const result = await confirmCashReceived(transaction.id)
      setData((current) => {
        if (!current) return current
        return {
          ...current,
          transactions: current.transactions.map((item) =>
            item.id === transaction.id ? { ...item, ...result.transaction } : item
          ),
          stats: {
            ...current.stats,
            byStatus: {
              ...current.stats.byStatus,
              cash_pending: Math.max((current.stats.byStatus.cash_pending ?? 0) - 1, 0),
              cash_received: (current.stats.byStatus.cash_received ?? 0) + 1,
            },
          },
        }
      })
      toast.success('Cash payment confirmed', `${transaction.serviceTitle} is marked as received.`)
    } catch (caught) {
      toast.error('Could not confirm cash payment', getErrorMessage(caught))
    } finally {
      setConfirmingId(null)
    }
  }

  if (loading) return <LoadingState label="Loading payment records…" />
  if (error) {
    return (
      <ErrorState
        title="We couldn't load payments"
        message={error}
        onRetry={refetch}
      />
    )
  }

  return (
    <>
      <DashboardPageHeader
        eyebrow="Salon operations"
        title="Payment management"
        description="Review TEST payment records, filter by method/status, and confirm cash received for Pay at Salon appointments."
      />

      <div className="dashboard-filter-bar" role="group" aria-label="Filter payment transactions">
        <select
          className="form-input"
          value={methodFilter}
          onChange={(event) => setMethodFilter(event.target.value as PaymentMethodId | '')}
          aria-label="Filter by payment method"
        >
          <option value="">All methods</option>
          {Object.entries(METHOD_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          className="form-input"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as PaymentTransactionStatus | '')}
          aria-label="Filter by payment status"
        >
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <input
          className="form-input"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search service or reference"
          aria-label="Search payment transactions"
        />
      </div>

      <div className="stats-grid">
        <article className="stat-card">
          <div>
            <span className="stat-card-label">Transactions</span>
            <strong className="stat-card-value">{data?.stats.transactionCount ?? 0}</strong>
          </div>
        </article>
        <article className="stat-card">
          <div>
            <span className="stat-card-label">Cash pending</span>
            <strong className="stat-card-value">{cashPending.length}</strong>
          </div>
        </article>
        <article className="stat-card">
          <div>
            <span className="stat-card-label">Settled TEST amount</span>
            <strong className="stat-card-value">BDT {data?.stats.testSimulatedAmountTotal ?? 0}</strong>
          </div>
        </article>
        <article className="stat-card">
          <div>
            <span className="stat-card-label">Real revenue</span>
            <strong className="stat-card-value">BDT {data?.stats.realRevenueAmount ?? 0}</strong>
          </div>
        </article>
      </div>

      <DashboardCard
        title="Payment transactions"
        description="TEST payment records, provider references and salon cash confirmations are shown here."
        padded={false}
      >
        {transactions.length === 0 ? (
          <div className="dashboard-card-pad">
            <EmptyState
              icon="chart"
              title="No payment records yet"
              description="Payment attempts will appear here after customers start checkout or Pay at Salon."
            />
          </div>
        ) : (
          <div className="payment-history-list">
            {transactions.map((transaction) => (
              <article key={transaction.id} className="payment-history-row">
                <div>
                  <strong>{transaction.serviceTitle}</strong>
                  <span>
                    {formatShortDate(transaction.appointmentDate)} · {transaction.appointmentTime} · BDT {transaction.amount}
                  </span>
                  <small>
                    {transaction.customerName
                      ? `${transaction.customerName}${transaction.customerEmail ? ` · ${transaction.customerEmail}` : ''}`
                      : transaction.customerEmail ?? ''}
                  </small>
                  <small>
                    {[
                      transaction.appointmentStatus ? `Booking ${transaction.appointmentStatus}` : null,
                      transaction.staffName ? `Staff ${transaction.staffName}` : null,
                      transaction.providerReference ? `Ref ${transaction.providerReference}` : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </small>
                  <small>
                    {transaction.cashConfirmedBy ? `Confirmed by ${transaction.cashConfirmedBy}` : ''}
                    {transaction.cashConfirmedBy && transaction.cashConfirmedAt ? ' · ' : ''}
                    {transaction.cashConfirmedAt ? formatShortDate(transaction.cashConfirmedAt) : ''}
                  </small>
                </div>
                <div>
                  <strong>{METHOD_LABELS[transaction.paymentMethod] ?? transaction.paymentMethod}</strong>
                  <span>{transaction.environment}{transaction.simulated ? ' · simulated' : ''}</span>
                </div>
                <div className="payment-history-actions">
                  <span className={`payment-status payment-status-${transaction.paymentStatus}`}>
                    {STATUS_LABELS[transaction.paymentStatus] ?? transaction.paymentStatus}
                  </span>
                  {isCashPending(transaction) && (
                    <Button
                      size="sm"
                      variant="primary"
                      loading={confirmingId === transaction.id}
                      onClick={() => void confirmCash(transaction)}
                    >
                      Confirm cash
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </DashboardCard>
    </>
  )
}

export default function AdminPaymentsPage() {
  return (
    <DashboardAccessGate role="admin">
      <AdminPaymentsContent />
    </DashboardAccessGate>
  )
}
