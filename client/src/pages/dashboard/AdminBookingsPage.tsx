import { useEffect, useMemo, useRef, useState } from 'react'
import ButtonLink from '@/components/common/ButtonLink'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import Icon from '@/components/common/Icon'
import AppointmentTable from '@/components/dashboard/AppointmentTable'
import DashboardAccessGate from '@/components/dashboard/DashboardAccessGate'
import DashboardCard from '@/components/dashboard/DashboardCard'
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader'
import TableSkeleton from '@/components/dashboard/TableSkeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { fetchAdminBookings, updateBookingStatus } from '@/services/api/admin'
import type { Appointment, AppointmentStatus } from '@/types'
import { cn } from '@/lib/cn'
import { getErrorMessage } from '@/utils/errors'

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
  const [updating, setUpdating] = useState<{ id: string; status: AppointmentStatus } | null>(null)
  const lastError = useRef<string | null>(null)

  useEffect(() => {
    if (error && lastError.current !== error) {
      lastError.current = error
      toast.error('Could not load bookings', error)
    }
  }, [error, toast])

  const bookings = useMemo(() => {
    const all = data ?? []
    return status === 'all' ? all : all.filter((booking) => booking.status === status)
  }, [data, status])

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
    } catch (caught) {
      toast.error('Could not update the booking', getErrorMessage(caught))
    } finally {
      setUpdating(null)
    }
  }

  const total = data?.length ?? 0

  return (
    <>
      <DashboardPageHeader
        eyebrow="Salon operations"
        title="Bookings"
        description="Confirm new requests, mark visits as complete and keep the day moving."
        actions={
          <ButtonLink to="/admin" variant="outline" leftIcon={<Icon name="grid" size={15} />}>
            Back to overview
          </ButtonLink>
        }
      />

      <div className="dashboard-filter-bar" role="group" aria-label="Filter bookings by status">
        {STATUS_FILTERS.map((option) => {
          const count =
            option.value === 'all'
              ? total
              : (data ?? []).filter((booking) => booking.status === option.value).length
          return (
            <button
              key={option.value}
              type="button"
              className={cn('chip', status === option.value && 'chip-active')}
              onClick={() => setStatus(option.value)}
              aria-pressed={status === option.value}
            >
              {option.label}
              <span className="chip-count">{count}</span>
            </button>
          )
        })}
      </div>

      <DashboardCard padded={false}>
        {loading ? (
          <div className="dashboard-card-pad">
            <TableSkeleton rows={6} columns={7} />
          </div>
        ) : error ? (
          <div className="dashboard-card-pad">
            <ErrorState
              title="We couldn't load bookings"
              message={error}
              onRetry={refetch}
            />
          </div>
        ) : bookings.length === 0 ? (
          <div className="dashboard-card-pad">
            <EmptyState
              icon="calendar"
              title={status === 'all' ? 'No bookings yet' : `No ${status} bookings`}
              description={
                status === 'all'
                  ? 'New customer requests will appear here.'
                  : 'Try another status filter to see the rest of the bookings.'
              }
              action={
                status !== 'all' ? (
                  <button type="button" className="btn btn-outline btn-md" onClick={() => setStatus('all')}>
                    Show all bookings
                  </button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <AppointmentTable
            appointments={bookings}
            variant="admin"
            onStatusChange={handleStatusChange}
            updatingId={updating?.id ?? null}
            updatingStatus={updating?.status ?? null}
          />
        )}
      </DashboardCard>
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
