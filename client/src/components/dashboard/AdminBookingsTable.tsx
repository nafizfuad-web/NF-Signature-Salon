import Icon from '@/components/common/Icon'
import AdminStatusPill, { AdminPaymentStatus } from '@/components/dashboard/AdminStatusPill'
import type { Appointment, AppointmentStatus } from '@/types'
import { formatShortDate, getInitials } from '@/utils/format'

interface AdminBookingsTableProps {
  appointments: Appointment[]
  onOpen: (appointment: Appointment) => void
  onCancel: (appointment: Appointment) => void
  updatingId?: string | null
  updatingStatus?: AppointmentStatus | null
}

function canCancel(status: AppointmentStatus): boolean {
  return status === 'pending' || status === 'confirmed'
}

export default function AdminBookingsTable({
  appointments,
  onOpen,
  onCancel,
  updatingId,
  updatingStatus,
}: AdminBookingsTableProps) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table admin-bookings-table">
        <caption className="sr-only">Customer bookings</caption>
        <thead>
          <tr>
            <th scope="col">Customer</th>
            <th scope="col">Service</th>
            <th scope="col">Date &amp; Time</th>
            <th scope="col">Booking Status</th>
            <th scope="col">Payment Status</th>
            <th scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => {
            const customerName = appointment.customerName ?? 'Guest'
            const isUpdating = updatingId === appointment.id
            return (
              <tr key={appointment.id}>
                <td>
                  <div className="admin-customer-cell">
                    <span className="admin-customer-avatar" aria-hidden="true">
                      {getInitials(customerName)}
                    </span>
                    <span>{customerName}</span>
                  </div>
                </td>
                <td className="admin-service-cell">{appointment.serviceTitle}</td>
                <td className="admin-date-cell">
                  {formatShortDate(appointment.date)} - {appointment.time}
                </td>
                <td>
                  <AdminStatusPill status={appointment.status} />
                </td>
                <td>
                  <AdminPaymentStatus status={appointment.paymentStatus} />
                </td>
                <td>
                  <div className="admin-row-actions">
                    <button
                      type="button"
                      className="admin-icon-button"
                      onClick={() => onOpen(appointment)}
                      aria-label={`View booking for ${customerName}`}
                      title="View booking"
                    >
                      <Icon name="eye" size={17} />
                    </button>
                    <button
                      type="button"
                      className="admin-icon-button"
                      onClick={() => onOpen(appointment)}
                      aria-label={`Manage booking for ${customerName}`}
                      title="Manage booking"
                      disabled={isUpdating}
                    >
                      {isUpdating && updatingStatus ? (
                        <span className="admin-icon-spinner" aria-hidden="true" />
                      ) : (
                        <Icon name="pencil" size={16} />
                      )}
                    </button>
                    <button
                      type="button"
                      className="admin-icon-button is-danger"
                      onClick={() => onCancel(appointment)}
                      aria-label={`Cancel booking for ${customerName}`}
                      title={
                        canCancel(appointment.status)
                          ? 'Cancel booking'
                          : 'This booking can no longer be cancelled'
                      }
                      disabled={!canCancel(appointment.status) || isUpdating}
                    >
                      <Icon name="x" size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
