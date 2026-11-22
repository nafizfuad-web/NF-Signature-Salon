import { Link } from 'react-router-dom'
import Button from '@/components/common/Button'
import EmptyState from '@/components/common/EmptyState'
import Icon from '@/components/common/Icon'
import StatusBadge from '@/components/common/StatusBadge'
import type { Appointment, AppointmentStatus } from '@/types'
import { formatShortDate } from '@/utils/format'

interface AppointmentTableProps {
  appointments: Appointment[]
  variant: 'customer' | 'admin'
  onStatusChange?: (appointmentId: string, status: AppointmentStatus) => void
  updatingId?: string | null
  updatingStatus?: AppointmentStatus | null
  onPay?: (appointment: Appointment) => void
  paymentBusyId?: string | null
}

function nextActions(status: AppointmentStatus): AppointmentStatus[] {
  if (status === 'pending') return ['confirmed', 'cancelled']
  if (status === 'confirmed') return ['completed', 'cancelled']
  return []
}

function paymentStatusLabel(appointment: Appointment): string | null {
  if (appointment.paymentStatus === 'paid') return 'Paid'
  if (appointment.paymentStatus === 'pending') return 'Payment pending'
  return null
}

function canPay(appointment: Appointment): boolean {
  return (
    appointment.status === 'confirmed' &&
    (appointment.paymentStatus ?? 'unpaid') === 'unpaid'
  )
}

export default function AppointmentTable({
  appointments,
  variant,
  onStatusChange,
  updatingId,
  updatingStatus,
  onPay,
  paymentBusyId,
}: AppointmentTableProps) {
  if (appointments.length === 0) {
    return (
      <EmptyState
        icon="calendar"
        title="No appointments yet"
        description={
          variant === 'admin'
            ? 'New bookings will appear here as soon as customers request them.'
            : 'When you book a treatment, it will appear here with its date and status.'
        }
        compact
      />
    )
  }

  const renderActions = (appointment: Appointment) => {
    if (variant === 'customer') {
      return (
        <div className="table-actions">
          <Link to={`/services/${appointment.serviceId}`} className="table-action-link">
            Book again
            <Icon name="arrow-right" size={14} />
          </Link>
          {canPay(appointment) && onPay && (
            <Button
              size="sm"
              variant="primary"
              loading={paymentBusyId === appointment.id}
              onClick={() => onPay(appointment)}
            >
              Pay now
            </Button>
          )}
        </div>
      )
    }

    const actions = nextActions(appointment.status)
    if (!onStatusChange || actions.length === 0) {
      return <span className="table-muted">No action needed</span>
    }

    return (
      <div className="table-actions">
        {actions.map((status) => (
          <Button
            key={status}
            size="sm"
            variant={
              status === 'confirmed'
                ? 'primary'
                : status === 'completed'
                  ? 'outline'
                  : 'danger'
            }
            loading={updatingId === appointment.id && updatingStatus === status}
            disabled={updatingId === appointment.id}
            onClick={() => onStatusChange(appointment.id, status)}
          >
            {status === 'confirmed' ? 'Confirm' : status === 'completed' ? 'Complete' : 'Cancel'}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="table-wrap data-table-wrap">
        <table className="data-table">
          <caption className="sr-only">
            {variant === 'admin' ? 'All customer bookings' : 'Your appointments'}
          </caption>
          <thead>
            <tr>
              {variant === 'admin' && <th scope="col">Customer</th>}
              <th scope="col">Service</th>
              <th scope="col">Date &amp; time</th>
              <th scope="col">Stylist</th>
              <th scope="col">Status</th>
              <th scope="col">Price</th>
              <th scope="col"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                {variant === 'admin' && (
                  <td>
                    <div className="table-customer">
                      <strong>{appointment.customerName ?? 'Guest'}</strong>
                      <span>{appointment.customerEmail ?? 'No email on file'}</span>
                    </div>
                  </td>
                )}
                <td>
                  <div className="table-service">
                    <strong>{appointment.serviceTitle}</strong>
                    {appointment.duration && <span>{appointment.duration}</span>}
                  </div>
                </td>
                <td>
                  <div className="table-date">
                    <strong>{formatShortDate(appointment.date)}</strong>
                    <span>{appointment.time}</span>
                  </div>
                </td>
                <td>{appointment.staffName ?? 'To be assigned'}</td>
                <td><StatusBadge status={appointment.status} /></td>
                <td>
                  {appointment.price ?? '—'}
                  {paymentStatusLabel(appointment) && (
                    <span className="table-payment-status">{paymentStatusLabel(appointment)}</span>
                  )}
                </td>
                <td>{renderActions(appointment)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="appointment-cards">
        {appointments.map((appointment) => (
          <article className="appointment-card" key={appointment.id}>
            <div className="appointment-card-top">
              <div>
                <span className="appointment-card-eyebrow">
                  {variant === 'admin' ? appointment.customerName ?? 'Guest' : appointment.serviceTitle}
                </span>
                <h3>
                  {variant === 'admin' ? appointment.serviceTitle : formatShortDate(appointment.date)}
                </h3>
              </div>
              <StatusBadge status={appointment.status} />
            </div>

            <dl className="appointment-card-facts">
              {variant === 'admin' ? (
                <div>
                  <dt>Date &amp; time</dt>
                  <dd>{formatShortDate(appointment.date)} · {appointment.time}</dd>
                </div>
              ) : (
                <div>
                  <dt>Time</dt>
                  <dd>{appointment.time}</dd>
                </div>
              )}
              <div>
                <dt>Stylist</dt>
                <dd>{appointment.staffName ?? 'To be assigned'}</dd>
              </div>
              <div>
                <dt>Price</dt>
                <dd>{appointment.price ?? '—'}</dd>
              </div>
              {variant === 'customer' && (
                <div>
                  <dt>Payment</dt>
                  <dd>{paymentStatusLabel(appointment) ?? 'Unpaid'}</dd>
                </div>
              )}
            </dl>

            <div className="appointment-card-actions">{renderActions(appointment)}</div>
          </article>
        ))}
      </div>
    </>
  )
}
