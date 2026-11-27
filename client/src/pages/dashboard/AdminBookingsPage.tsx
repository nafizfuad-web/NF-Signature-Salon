import { useEffect, useMemo, useRef, useState } from 'react'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import Icon from '@/components/common/Icon'
import AdminBookingsTable from '@/components/dashboard/AdminBookingsTable'
import AdminBookingModal from '@/components/dashboard/AdminBookingModal'
import AdminCard from '@/components/dashboard/AdminCard'
import AdminPageHeader from '@/components/dashboard/AdminPageHeader'
import DashboardAccessGate from '@/components/dashboard/DashboardAccessGate'
import TableSkeleton from '@/components/dashboard/TableSkeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/cn'
import { fetchAdminBookings, updateBookingStatus } from '@/services/api/admin'
import type { Appointment, AppointmentStatus } from '@/types'
import { getErrorMessage } from '@/utils/errors'
import { formatNumber } from '@/utils/format'

type StatusFilter = AppointmentStatus | 'all'

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

function AdminBookingsContent() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { data, loading, error, refetch, setData } = useApiResource<Appointment[]>(
    () => fetchAdminBookings(),
    [user?.id]
  )
  const [status, setStatus] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [updating, setUpdating] = useState<{ id: string; status: AppointmentStatus } | null>(null)
  const lastError = useRef<string | null>(null)

  useEffect(() => {
    if (error && lastError.current !== error) {
      lastError.current = error
      toast.error('Could not load bookings', error)
    }
  }, [error, toast])

  const bookings = useMemo(() => {
    const query = search.trim().toLowerCase()
    return (data ?? []).filter((booking) => {
      if (status !== 'all' && booking.status !== status) return false
      if (!query) return true
      return [booking.customerName, booking.customerEmail, booking.serviceTitle, booking.date]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query)
    })
  }, [data, search, status])

  const handleStatusChange = async (bookingId: string, nextStatus: AppointmentStatus) => {
    setUpdating({ id: bookingId, status: nextStatus })
    try {
      const updated = await updateBookingStatus(bookingId, nextStatus)
      setData((current) =>
        (current ?? []).map((booking) =>
          booking.id === bookingId ? { ...booking, ...updated, status: nextStatus } : booking
        )
      )
      toast.success('Booking updated', `The booking is now ${nextStatus}.`)
      setSelected(null)
    } catch (caught) {
      toast.error('Could not update the booking', getErrorMessage(caught))
    } finally {
      setUpdating(null)
    }
  }

  const handleCancel = (appointment: Appointment) => {
    const name = appointment.customerName ?? 'this customer'
    if (!window.confirm(`Cancel the booking for ${name}?`)) return
    void handleStatusChange(appointment.id, 'cancelled')
  }

  const clearFilters = () => {
    setSearch('')
    setStatus('all')
  }

  const total = data?.length ?? 0
  const hasFilters = search.trim().length > 0 || status !== 'all'

  return (
    <>
      <AdminPageHeader
        title="Bookings"
        description="View, search and manage every appointment request."
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
            placeholder="Search customer or service…"
            aria-label="Search bookings"
          />
          {search && (
            <button
              type="button"
              className="admin-search-clear"
              onClick={() => setSearch('')}
              aria-label="Clear booking search"
            >
              <Icon name="x" size={15} />
            </button>
          )}
        </div>

        <div className="admin-filter-tabs" role="group" aria-label="Filter bookings by status">
          {STATUS_FILTERS.map((option) => {
            const count =
              option.value === 'all'
                ? total
                : (data ?? []).filter((booking) => booking.status === option.value).length
            return (
              <button
                key={option.value}
                type="button"
                className={cn('admin-filter-tab', status === option.value && 'is-active')}
                onClick={() => setStatus(option.value)}
                aria-pressed={status === option.value}
              >
                {option.label}
                <span>{formatNumber(count)}</span>
              </button>
            )
          })}
        </div>

        <span className="admin-results-meta">
          Showing <strong>{formatNumber(bookings.length)}</strong> of {formatNumber(total)}
        </span>
      </div>

      <AdminCard padded={false}>
        {loading ? (
          <div className="admin-card-pad">
            <TableSkeleton rows={6} columns={6} />
          </div>
        ) : error ? (
          <div className="admin-card-pad">
            <ErrorState title="We couldn't load bookings" message={error} onRetry={refetch} />
          </div>
        ) : bookings.length === 0 ? (
          <div className="admin-card-pad">
            <EmptyState
              icon="calendar"
              title={hasFilters ? 'No bookings match' : 'No bookings yet'}
              description={
                hasFilters
                  ? 'Try a different search or status filter.'
                  : 'New customer requests will appear here.'
              }
              action={
                hasFilters ? (
                  <button type="button" className="btn btn-outline btn-md" onClick={clearFilters}>
                    Clear filters
                  </button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <AdminBookingsTable
            appointments={bookings}
            onOpen={setSelected}
            onCancel={handleCancel}
            updatingId={updating?.id ?? null}
            updatingStatus={updating?.status ?? null}
          />
        )}
      </AdminCard>

      {selected && (
        <AdminBookingModal
          appointment={selected}
          onClose={() => setSelected(null)}
          onStatusChange={(bookingId, nextStatus) => void handleStatusChange(bookingId, nextStatus)}
          updating={Boolean(updating)}
          updatingStatus={updating?.status ?? null}
        />
      )}
    </>
  )
}

export default function AdminBookingsPage() {
  return (
    <DashboardAccessGate role="admin">
      <AdminBookingsContent />
    </DashboardAccessGate>
  )
}
