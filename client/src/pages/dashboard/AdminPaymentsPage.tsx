import { useMemo, useState } from 'react'
import Button from '@/components/common/Button'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import Icon from '@/components/common/Icon'
import AdminCard from '@/components/dashboard/AdminCard'
import AdminPageHeader from '@/components/dashboard/AdminPageHeader'
import AdminStatCard from '@/components/dashboard/AdminStatCard'
import DashboardAccessGate from '@/components/dashboard/DashboardAccessGate'
import { AdminPaymentStatus } from '@/components/dashboard/AdminStatusPill'
import TableSkeleton from '@/components/dashboard/TableSkeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { confirmCashReceived, fetchAdminPayments } from '@/services/api/admin'
import type { AdminPaymentsResponse, PaymentTransaction } from '@/types'
import type { PaymentMethodId, PaymentTransactionStatus } from '@/types'
import { getErrorMessage } from '@/utils/errors'
import { formatMoney, formatNumber, formatShortDate } from '@/utils/format'

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

  return (
    <>
      <AdminPageHeader
        title="Payments"
        description="Review transactions, payment methods, currencies and payment statuses."
      />

      {loading ? (
        <>
          <div className="admin-stats-grid" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="admin-stat-card" key={index}>
                <div className="admin-stat-copy">
                  <span className="admin-stat-label">Loading</span>
                  <strong className="admin-stat-value">—</strong>
                </div>
              </div>
            ))}
          </div>
          <AdminCard padded={false}>
            <div className="admin-card-pad">
              <TableSkeleton rows={6} columns={6} />
            </div>
          </AdminCard>
        </>
      ) : error ? (
        <ErrorState title="We couldn't load payments" message={error} onRetry={refetch} />
      ) : (
        <>
          <div className="admin-stats-grid">
            <AdminStatCard
              icon="wallet"
              label="Transactions"
              value={formatNumber(data?.stats.transactionCount ?? 0)}
            />
            <AdminStatCard
              icon="clock"
              label="Cash pending"
              value={formatNumber(cashPending.length)}
            />
            <AdminStatCard
              icon="dollar"
              label="Settled TEST amount"
              value={formatMoney(data?.stats.testSimulatedAmountTotal ?? 0)}
            />
            <AdminStatCard
              icon="chart"
              label="Real revenue"
              value={formatMoney(data?.stats.realRevenueAmount ?? 0)}
            />
          </div>

          <div className="admin-toolbar">
            <select
              className="admin-select"
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
              className="admin-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as PaymentTransactionStatus | '')}
              aria-label="Filter by payment status"
            >
              <option value="">All statuses</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <div className="admin-search">
              <span className="admin-search-icon" aria-hidden="true">
                <Icon name="search" size={17} />
              </span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search service or reference…"
                aria-label="Search payment transactions"
              />
              {search && (
                <button
                  type="button"
                  className="admin-search-clear"
                  onClick={() => setSearch('')}
                  aria-label="Clear payment search"
                >
                  <Icon name="x" size={15} />
                </button>
              )}
            </div>

            <span className="admin-results-meta">
              Showing <strong>{transactions.length}</strong> transactions
            </span>
          </div>

          <AdminCard padded={false}>
            {transactions.length === 0 ? (
              <div className="admin-card-pad">
                <EmptyState
                  icon="wallet"
                  title="No payment records yet"
                  description="Payment attempts will appear here after customers start checkout or Pay at Salon."
                />
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table admin-payments-table">
                  <caption className="sr-only">Payment transactions</caption>
                  <thead>
                    <tr>
                      <th scope="col">Transaction</th>
                      <th scope="col">Method</th>
                      <th scope="col">Amount</th>
                      <th scope="col">Currency</th>
                      <th scope="col">Payment Status</th>
                      <th scope="col"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>
                          <div className="admin-transaction-cell">
                            <strong>{transaction.serviceTitle}</strong>
                            <span>
                              {formatShortDate(transaction.appointmentDate)} · {transaction.appointmentTime}
                            </span>
                            <small>
                              {transaction.customerName
                                ? `${transaction.customerName}${transaction.customerEmail ? ` · ${transaction.customerEmail}` : ''}`
                                : transaction.customerEmail ?? 'Customer'}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div className="admin-method-cell">
                            <strong>{METHOD_LABELS[transaction.paymentMethod] ?? transaction.paymentMethod}</strong>
                            <span>
                              {transaction.environment}
                              {transaction.simulated ? ' · simulated' : ''}
                              {transaction.providerReference ? ` · ${transaction.providerReference}` : ''}
                            </span>
                          </div>
                        </td>
                        <td>{formatNumber(transaction.amount)}</td>
                        <td>{transaction.currency}</td>
                        <td>
                          <AdminPaymentStatus status={transaction.paymentStatus} />
                        </td>
                        <td>
                          {isCashPending(transaction) ? (
                            <Button
                              size="sm"
                              variant="primary"
                              loading={confirmingId === transaction.id}
                              onClick={() => void confirmCash(transaction)}
                            >
                              Confirm cash
                            </Button>
                          ) : (
                            <span className="admin-muted-copy">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AdminCard>
        </>
      )}
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
