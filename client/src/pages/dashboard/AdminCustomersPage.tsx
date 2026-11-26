import { useEffect, useMemo, useRef, useState } from 'react'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import Icon from '@/components/common/Icon'
import DashboardAccessGate from '@/components/dashboard/DashboardAccessGate'
import DashboardCard from '@/components/dashboard/DashboardCard'
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader'
import TableSkeleton from '@/components/dashboard/TableSkeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import {
  fetchAdminCustomer,
  fetchAdminCustomers,
  setCustomerBlocked,
} from '@/services/api/admin'
import type { AdminCustomerDetail, CustomerRecord } from '@/types'
import { formatDate, formatShortDate, getInitials } from '@/utils/format'
import { getErrorMessage } from '@/utils/errors'

const PAYMENT_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  succeeded: 'Paid',
  cash_pending: 'Cash pending',
  cash_received: 'Cash received',
  failed: 'Failed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

function AdminCustomersContent() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { data, loading, error, refetch, setData } = useApiResource<CustomerRecord[]>(
    () => fetchAdminCustomers(),
    [user?.id]
  )
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<AdminCustomerDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const lastError = useRef<string | null>(null)

  useEffect(() => {
    if (error && lastError.current !== error) {
      lastError.current = error
      toast.error('Could not load customers', error)
    }
  }, [error, toast])

  useEffect(() => {
    if (!selectedId) return
    let cancelled = false
    fetchAdminCustomer(selectedId)
      .then((result) => {
        if (!cancelled) setDetail(result)
      })
      .catch((caught) => {
        if (!cancelled) toast.error('Could not load customer details', getErrorMessage(caught))
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedId, toast])

  const customers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const list = data ?? []
    if (!normalizedSearch) return list
    return list.filter((customer) =>
      [customer.name, customer.email, customer.phone ?? '']
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch)
    )
  }, [data, search])

  const toggleBlock = async (customer: CustomerRecord) => {
    const nextBlocked = !customer.isBlocked
    const reason = nextBlocked
      ? window.prompt('Reason for blocking this customer (optional):') ?? undefined
      : undefined
    setBusyId(customer.id)
    try {
      const updated = await setCustomerBlocked(customer.id, nextBlocked, reason ?? undefined)
      setData((current) => current?.map((item) => (item.id === customer.id ? { ...item, ...updated } : item)) ?? current)
      setDetail((current) =>
        current && current.customer.id === customer.id
          ? { ...current, customer: { ...current.customer, ...updated } }
          : current
      )
      toast.success(nextBlocked ? 'Customer blocked' : 'Customer unblocked', customer.name)
    } catch (caught) {
      toast.error('Could not update customer', getErrorMessage(caught))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <DashboardPageHeader
        eyebrow="Salon operations"
        title="Customers"
        description="Review customer accounts, booking history and payment records. Blocked customers cannot use protected features."
      />

      <div className="admin-search-row">
        <div className="search-field">
          <span className="search-field-icon" aria-hidden="true"><Icon name="search" size={18} /></span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email or phone…"
            aria-label="Search customers"
          />
          {search && (
            <button type="button" className="search-field-clear" onClick={() => setSearch('')} aria-label="Clear customer search">
              <Icon name="x" size={15} />
            </button>
          )}
        </div>
        <span className="results-meta">
          Showing <strong>{customers.length}</strong> of {data?.length ?? 0} customers
        </span>
      </div>

      <DashboardCard padded={false}>
        {loading ? (
          <div className="dashboard-card-pad"><TableSkeleton rows={6} columns={6} /></div>
        ) : error ? (
          <div className="dashboard-card-pad"><ErrorState title="We couldn't load customers" message={error} onRetry={refetch} /></div>
        ) : customers.length === 0 ? (
          <div className="dashboard-card-pad">
            <EmptyState
              icon="users"
              title={search ? 'No customers match' : 'No customers yet'}
              description={search ? 'Try a different name, email address or phone number.' : 'Customer accounts will appear here once people register.'}
              action={search ? <button type="button" className="btn btn-outline btn-md" onClick={() => setSearch('')}>Clear search</button> : undefined}
            />
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <caption className="sr-only">Registered salon customers</caption>
              <thead>
                <tr><th>Customer</th><th>Phone</th><th>Visits</th><th>Last visit</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="customer-cell">
                        <span className="customer-avatar" aria-hidden="true">{getInitials(customer.name)}</span>
                        <div><strong>{customer.name}</strong><span>{customer.email}</span></div>
                      </div>
                    </td>
                    <td>{customer.phone ?? '—'}</td>
                    <td>{customer.visits}</td>
                    <td>{customer.lastVisit ? formatDate(customer.lastVisit) : '—'}</td>
                    <td><span className={`badge ${customer.isBlocked ? 'badge-outline' : 'badge-gold'}`}>{customer.isBlocked ? 'Blocked' : 'Active'}</span></td>
                    <td>
                      <div className="table-actions">
                        <button type="button" className="table-action-link" onClick={() => { setDetail(null); setDetailLoading(true); setSelectedId(customer.id); }}>Details</button>
                        <button type="button" className="table-action-link is-danger" disabled={busyId === customer.id} onClick={() => void toggleBlock(customer)}>
                          {customer.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>

      {selectedId && (
        <DashboardCard
          title={detailLoading ? 'Customer details' : detail?.customer.name ?? 'Customer details'}
          description={detail?.customer.email}
          action={<button type="button" className="table-action-link" onClick={() => { setSelectedId(null); setDetail(null); setDetailLoading(false); }}>Close</button>}
        >
          {detailLoading ? (
            <TableSkeleton rows={4} columns={4} />
          ) : detail ? (
            <div className="dashboard-grid dashboard-grid-2">
              <div>
                <h3>Appointments</h3>
                {detail.appointments.length === 0 ? <p className="table-muted">No appointments yet.</p> : (
                  <ul className="plain-list">
                    {detail.appointments.slice(0, 6).map((appointment) => (
                      <li key={appointment.id}>{formatShortDate(appointment.date)} · {appointment.time} · {appointment.serviceTitle} · {appointment.status}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h3>Payments</h3>
                {detail.transactions.length === 0 ? <p className="table-muted">No payment records yet.</p> : (
                  <ul className="plain-list">
                    {detail.transactions.slice(0, 6).map((transaction) => (
                      <li key={transaction.id}>{transaction.serviceTitle} · BDT {transaction.amount} · {PAYMENT_LABELS[transaction.paymentStatus] ?? transaction.paymentStatus}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <ErrorState title="Customer details unavailable" message="The selected customer could not be loaded." onRetry={() => setSelectedId(selectedId)} />
          )}
        </DashboardCard>
      )}
    </>
  )
}

export default function AdminCustomersPage() {
  return (
    <DashboardAccessGate role="admin">
      <AdminCustomersContent />
    </DashboardAccessGate>
  )
}
