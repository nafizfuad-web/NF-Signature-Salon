import { useEffect, useMemo, useRef, useState } from 'react'
import ButtonLink from '@/components/common/ButtonLink'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import Icon from '@/components/common/Icon'
import AppointmentTable from '@/components/dashboard/AppointmentTable'
import DashboardAccessGate from '@/components/dashboard/DashboardAccessGate'
import DashboardCard from '@/components/dashboard/DashboardCard'
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader'
import PaymentHistory from '@/components/payments/PaymentHistory'
import PaymentPanel from '@/components/payments/PaymentPanel'
import TableSkeleton from '@/components/dashboard/TableSkeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { cancelCustomerAppointment, fetchCustomerAppointments } from '@/services/api/customer'
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

function CustomerAppointmentsContent() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { data, loading, error, refetch } = useApiResource<Appointment[]>(
    () => fetchCustomerAppointments(),
    [user?.id]
  )
  const [status, setStatus] = useState<StatusFilter>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<AppointmentStatus | null>(null)
  const [paymentTarget, setPaymentTarget] = useState<Appointment | null>(null)
  const [historyKey, setHistoryKey] = useState(0)
  const lastError = useRef<string | null>(null)

  useEffect(() => {
    if (error && lastError.current !== error) {
      lastError.current = error
      toast.error('Could not load your appointments', error)
    }
  }, [error, toast])

  async function handleCancel(appointmentId: string) {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return

    setUpdatingId(appointmentId)
    setUpdatingStatus('cancelled')
    try {
      await cancelCustomerAppointment(appointmentId)
      toast.success('Appointment cancelled', 'Your appointment has been cancelled.')
      refetch()
    } catch (caught) {
      const message = getErrorMessage(caught, 'Unable to cancel appointment.')
      toast.error('Cancellation failed', message)
    } finally {
      setUpdatingId(null)
      setUpdatingStatus(null)
    }
  }

  const appointments = useMemo(() => {
    const all = data ?? []
    return status === 'all' ? all : all.filter((appointment) => appointment.status === status)
  }, [data, status])

  const total = data?.length ?? 0

  return (
    <>
      <DashboardPageHeader
        eyebrow="Your visits"
        title="My appointments"
        description="See what is coming up, review past visits and book a treatment again."
        actions={
          <ButtonLink to="/services" variant="primary" rightIcon={<Icon name="arrow-right" size={16} />}>
            Book a treatment
          </ButtonLink>
        }
      />

      <div className="dashboard-filter-bar" role="group" aria-label="Filter appointments by status">
        {STATUS_FILTERS.map((option) => {
          const count =
            option.value === 'all'
              ? total
              : (data ?? []).filter((appointment) => appointment.status === option.value).length
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

      {paymentTarget && (
        <DashboardCard title="TEST payment" padded>
          <PaymentPanel
            appointment={paymentTarget}
            onClose={() => setPaymentTarget(null)}
            onChanged={() => {
              setHistoryKey((key) => key + 1)
              refetch()
            }}
          />
        </DashboardCard>
      )}

      <DashboardCard padded={false}>
        {loading ? (
          <div className="dashboard-card-pad">
            <TableSkeleton rows={5} columns={6} />
          </div>
        ) : error ? (
          <div className="dashboard-card-pad">
            <ErrorState
              title="We couldn't load your appointments"
              message={error}
              onRetry={refetch}
            />
          </div>
        ) : appointments.length === 0 ? (
          <div className="dashboard-card-pad">
            <EmptyState
              icon="calendar"
              title={status === 'all' ? 'No appointments yet' : `No ${status} appointments`}
              description={
                status === 'all'
                  ? 'Book your first treatment and it will appear here with its date and status.'
                  : 'Try a different status filter, or book a new treatment.'
              }
              action={
                status === 'all' ? (
                  <ButtonLink to="/services" variant="outline">Browse services</ButtonLink>
                ) : (
                  <button type="button" className="btn btn-outline btn-md" onClick={() => setStatus('all')}>
                    Show all appointments
                  </button>
                )
              }
            />
          </div>
        ) : (
          <AppointmentTable
            appointments={appointments}
            variant="customer"
            onStatusChange={handleCancel}
            updatingId={updatingId}
            updatingStatus={updatingStatus}
            onPay={(appointment) => setPaymentTarget(appointment)}
          />
        )}
      </DashboardCard>

      <DashboardCard
        title="TEST payment history"
        description="Simulated payments only. No real money is charged."
      >
        <PaymentHistory refreshKey={historyKey} />
      </DashboardCard>
    </>
  )
}

export default function CustomerAppointmentsPage() {
  return (
    <DashboardAccessGate>
      <CustomerAppointmentsContent />
    </DashboardAccessGate>
  )
}
