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
import { fetchAdminCustomers } from '@/services/api/admin'
import type { CustomerRecord } from '@/types'
import { formatDate, getInitials } from '@/utils/format'

function AdminCustomersContent() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { data, loading, error, refetch } = useApiResource<CustomerRecord[]>(
    () => fetchAdminCustomers(),
    [user?.id]
  )
  const [search, setSearch] = useState('')
  const lastError = useRef<string | null>(null)

  useEffect(() => {
    if (error && lastError.current !== error) {
      lastError.current = error
      toast.error('Could not load customers', error)
    }
  }, [error, toast])

  const customers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    if (!normalizedSearch) return data ?? []
    return (data ?? []).filter((customer) =>
      [customer.name, customer.email, customer.phone ?? '']
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch)
    )
  }, [data, search])

  return (
    <>
      <DashboardPageHeader
        eyebrow="Salon operations"
        title="Customers"
        description="See who is booking with the salon and how often they visit."
      />

      <div className="admin-search-row">
        <div className="search-field">
          <span className="search-field-icon" aria-hidden="true">
            <Icon name="search" size={18} />
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
              className="search-field-clear"
              onClick={() => setSearch('')}
              aria-label="Clear customer search"
            >
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
          <div className="dashboard-card-pad">
            <TableSkeleton rows={6} columns={5} />
          </div>
        ) : error ? (
          <div className="dashboard-card-pad">
            <ErrorState
              title="We couldn't load customers"
              message={error}
              onRetry={refetch}
            />
          </div>
        ) : customers.length === 0 ? (
          <div className="dashboard-card-pad">
            <EmptyState
              icon="users"
              title={search ? 'No customers match' : 'No customers yet'}
              description={
                search
                  ? 'Try a different name, email address or phone number.'
                  : 'Customer accounts will appear here once people start booking.'
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
          <div className="table-wrap">
            <table className="data-table">
              <caption className="sr-only">Registered salon customers</caption>
              <thead>
                <tr>
                  <th scope="col">Customer</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Visits</th>
                  <th scope="col">Last visit</th>
                  <th scope="col">Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="customer-cell">
                        <span className="customer-avatar" aria-hidden="true">
                          {getInitials(customer.name)}
                        </span>
                        <div>
                          <strong>{customer.name}</strong>
                          <span>{customer.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{customer.phone ?? '—'}</td>
                    <td>{customer.visits}</td>
                    <td>{customer.lastVisit ? formatDate(customer.lastVisit) : '—'}</td>
                    <td>{customer.joinedAt ? formatDate(customer.joinedAt) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>
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
