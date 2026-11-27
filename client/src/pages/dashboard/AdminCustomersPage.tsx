import { useEffect, useMemo, useRef, useState } from 'react'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import Icon from '@/components/common/Icon'
import AdminCard from '@/components/dashboard/AdminCard'
import AdminPageHeader from '@/components/dashboard/AdminPageHeader'
import DashboardAccessGate from '@/components/dashboard/DashboardAccessGate'
import { AdminPaymentStatus } from '@/components/dashboard/AdminStatusPill'
import TableSkeleton from '@/components/dashboard/TableSkeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import {
  fetchAdminCustomer,
  fetchAdminCustomers,
  setCustomerBlocked,
} from '@/services/api/admin'
import { resolveAssetUrl } from '@/services/config'
import type { AdminCustomerDetail, CustomerRecord } from '@/types'
import { formatDate, formatShortDate, getInitials } from '@/utils/format'
import { getErrorMessage } from '@/utils/errors'

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

  const openDetails = (customer: CustomerRecord) => {
    setDetail(null)
    setDetailLoading(true)
    setSelectedId(customer.id)
  }

  return (
    <>
      <AdminPageHeader
        title="Customers"
        description="Review customer accounts, booking history and payment records."
      />

      <div className="admin-toolbar">
        <div className="admin-search">
          <span className="admin-search-icon" aria-hidden="true">
            <Icon name="search" size={17} />
          </span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email or phone…"
            aria-label="Search customers"
          />
          {search && (
            <button
              type="button"
              className="admin-search-clear"
              onClick={() => setSearch('')}
              aria-label="Clear customer search"
            >
              <Icon name="x" size={15} />
            </button>
          )}
        </div>
        <span className="admin-results-meta">
          Showing <strong>{customers.length}</strong> of {data?.length ?? 0} customers
        </span>
      </div>

      <AdminCard padded={false}>
        {loading ? (
          <div className="admin-card-pad">
            <TableSkeleton rows={6} columns={6} />
          </div>
        ) : error ? (
          <div className="admin-card-pad">
            <ErrorState title="We couldn't load customers" message={error} onRetry={refetch} />
          </div>
        ) : customers.length === 0 ? (
          <div className="admin-card-pad">
            <EmptyState
              icon="users"
              title={search ? 'No customers match' : 'No customers yet'}
              description={
                search
                  ? 'Try a different name, email address or phone number.'
                  : 'Customer accounts will appear here once people register.'
              }
              action={
                search ? (
                  <button type="button" className="btn btn-outline btn-md" onClick={() => setSearch('')}>
                    Clear search
                  </button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table admin-customers-table">
              <caption className="sr-only">Registered salon customers</caption>
              <thead>
                <tr>
                  <th scope="col">Customer</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Visits</th>
                  <th scope="col">Last Visit</th>
                  <th scope="col">Status</th>
                  <th scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => {
                  const avatarUrl = customer.avatarUrl ? resolveAssetUrl(customer.avatarUrl) : null
                  return (
                    <tr key={customer.id}>
                      <td>
                        <div className="admin-customer-cell">
                          <span className="admin-customer-avatar" aria-hidden="true">
                            {avatarUrl ? <img src={avatarUrl} alt="" /> : getInitials(customer.name)}
                          </span>
                          <div className="admin-customer-copy">
                            <strong>{customer.name}</strong>
                            <span>{customer.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>{customer.phone ?? '—'}</td>
                      <td>{customer.visits}</td>
                      <td>{customer.lastVisit ? formatDate(customer.lastVisit) : '—'}</td>
                      <td>
                        <span className={`admin-badge ${customer.isBlocked ? 'is-muted' : 'is-gold'}`}>
                          {customer.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            className="admin-icon-button"
                            onClick={() => openDetails(customer)}
                            aria-label={`View details for ${customer.name}`}
                            title="View customer"
                          >
                            <Icon name="eye" size={17} />
                          </button>
                          <button
                            type="button"
                            className={`admin-icon-button ${customer.isBlocked ? '' : 'is-danger'}`}
                            disabled={busyId === customer.id}
                            onClick={() => void toggleBlock(customer)}
                            aria-label={customer.isBlocked ? `Unblock ${customer.name}` : `Block ${customer.name}`}
                            title={customer.isBlocked ? 'Unblock customer' : 'Block customer'}
                          >
                            <Icon name={customer.isBlocked ? 'check' : 'ban'} size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {selectedId && (
        <AdminCard
          title={detailLoading ? 'Customer details' : detail?.customer.name ?? 'Customer details'}
          description={detail?.customer.email}
          action={
            <button
              type="button"
              className="admin-text-button"
              onClick={() => {
                setSelectedId(null)
                setDetail(null)
                setDetailLoading(false)
              }}
            >
              Close
            </button>
          }
        >
          {detailLoading ? (
            <TableSkeleton rows={4} columns={4} />
          ) : detail ? (
            <div className="admin-detail-grid">
              <div>
                <h3 className="admin-detail-title">Appointments</h3>
                {detail.appointments.length === 0 ? (
                  <p className="admin-muted-copy">No appointments yet.</p>
                ) : (
                  <ul className="admin-detail-list">
                    {detail.appointments.slice(0, 6).map((appointment) => (
                      <li key={appointment.id}>
                        <span>{formatShortDate(appointment.date)} · {appointment.time}</span>
                        <strong>{appointment.serviceTitle}</strong>
                        <small>{appointment.status}</small>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h3 className="admin-detail-title">Payments</h3>
                {detail.transactions.length === 0 ? (
                  <p className="admin-muted-copy">No payment records yet.</p>
                ) : (
                  <ul className="admin-detail-list">
                    {detail.transactions.slice(0, 6).map((transaction) => (
                      <li key={transaction.id}>
                        <span>{transaction.serviceTitle}</span>
                        <strong>BDT {transaction.amount}</strong>
                        <AdminPaymentStatus status={transaction.paymentStatus} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <ErrorState
              title="Customer details unavailable"
              message="The selected customer could not be loaded."
              onRetry={() => setSelectedId(selectedId)}
            />
          )}
        </AdminCard>
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
