import { useEffect, useRef } from 'react'
import Button from '@/components/common/Button'
import Icon from '@/components/common/Icon'
import AdminStatusPill, { AdminPaymentStatus } from '@/components/dashboard/AdminStatusPill'
import type { Appointment, AppointmentStatus } from '@/types'
import { formatShortDate, getInitials } from '@/utils/format'

interface AdminBookingModalProps {
  appointment: Appointment
  onClose: () => void
  onStatusChange: (bookingId: string, status: AppointmentStatus) => void
  updating: boolean
  updatingStatus: AppointmentStatus | null
}

function nextActions(status: AppointmentStatus): AppointmentStatus[] {
  if (status === 'pending') return ['confirmed', 'cancelled']
  if (status === 'confirmed') return ['completed', 'cancelled']
  return []
}

function actionLabel(status: AppointmentStatus): string {
  if (status === 'confirmed') return 'Confirm booking'
  if (status === 'completed') return 'Mark completed'
  return 'Cancel booking'
}

export default function AdminBookingModal({
  appointment,
  onClose,
  onStatusChange,
  updating,
  updatingStatus,
}: AdminBookingModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const customerName = appointment.customerName ?? 'Guest'
  const actions = nextActions(appointment.status)

  return (
    <div
      className="admin-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="admin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-booking-modal-title"
      >
        <header className="admin-modal-header">
          <div>
            <span className="admin-modal-eyebrow">Appointment</span>
            <h2 id="admin-booking-modal-title">Booking details</h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="admin-icon-button"
            onClick={onClose}
            aria-label="Close booking details"
          >
            <Icon name="x" size={18} />
          </button>
        </header>

        <div className="admin-modal-body">
          <div className="admin-modal-customer">
            <span className="admin-customer-avatar" aria-hidden="true">
              {getInitials(customerName)}
            </span>
            <div>
              <strong>{customerName}</strong>
              {appointment.customerEmail && <span>{appointment.customerEmail}</span>}
              {appointment.customerPhone && <span>{appointment.customerPhone}</span>}
            </div>
          </div>

          <dl className="admin-modal-facts">
            <div>
              <dt>Service</dt>
              <dd>{appointment.serviceTitle}</dd>
            </div>
            <div>
              <dt>Date &amp; time</dt>
              <dd>
                {formatShortDate(appointment.date)} - {appointment.time}
              </dd>
            </div>
            <div>
              <dt>Stylist</dt>
              <dd>{appointment.staffName ?? 'To be assigned'}</dd>
            </div>
            <div>
              <dt>Price</dt>
              <dd>{appointment.price ?? '—'}</dd>
            </div>
          </dl>

          <div className="admin-modal-statuses">
            <AdminStatusPill status={appointment.status} />
            <AdminPaymentStatus status={appointment.paymentStatus} />
          </div>

          {appointment.notes && (
            <div className="admin-modal-note">
              <span>Customer note</span>
              <p>{appointment.notes}</p>
            </div>
          )}
        </div>

        <footer className="admin-modal-footer">
          {actions.length > 0 ? (
            actions.map((status) => (
              <Button
                key={status}
                variant={status === 'cancelled' ? 'danger' : 'primary'}
                size="sm"
                loading={updating && updatingStatus === status}
                disabled={updating}
                onClick={() => onStatusChange(appointment.id, status)}
              >
                {actionLabel(status)}
              </Button>
            ))
          ) : (
            <span className="admin-modal-muted">No further action is needed for this booking.</span>
          )}
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </footer>
      </div>
    </div>
  )
}
