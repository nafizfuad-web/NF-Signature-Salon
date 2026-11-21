import ButtonLink from '@/components/common/ButtonLink'
import Button from '@/components/common/Button'
import Icon from '@/components/common/Icon'
import { formatDateLong } from '@/utils/format'
import type { Appointment } from '@/types'

// NF Signature Salon — Booking confirmation
// Shown after a booking request succeeds. In mock mode the record is clearly
// labelled as a demo so it is never mistaken for a saved database row.

interface BookingConfirmationProps {
  appointment: Appointment
  isDemo: boolean
  onBookAnother: () => void
}

export default function BookingConfirmation({
  appointment,
  isDemo,
  onBookAnother,
}: BookingConfirmationProps) {
  return (
    <div className="booking-confirmation" role="status" aria-live="polite">
      <span className="booking-confirmation-icon" aria-hidden="true">
        <Icon name="check" size={30} />
      </span>
      <h2>Appointment request received</h2>
      <p>
        {isDemo
          ? 'Demo mode is on, so this request was not saved to a database. It shows how the confirmation will look once the booking API is connected.'
          : 'The salon will confirm your appointment by email. Please arrive a few minutes early.'}
      </p>

      {isDemo && (
        <p className="booking-demo-badge" role="note">
          <Icon name="alert-circle" size={15} />
          Demo confirmation — no appointment has been saved.
        </p>
      )}

      <dl className="booking-confirmation-facts">
        <div>
          <dt>Service</dt>
          <dd>{appointment.serviceTitle}</dd>
        </div>
        <div>
          <dt>Date</dt>
          <dd>{formatDateLong(appointment.date)}</dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd>{appointment.time}</dd>
        </div>
        {appointment.duration && (
          <div>
            <dt>Duration</dt>
            <dd>{appointment.duration}</dd>
          </div>
        )}
        {appointment.price && (
          <div>
            <dt>Price</dt>
            <dd>{appointment.price}</dd>
          </div>
        )}
        <div>
          <dt>Status</dt>
          <dd className="booking-status">Pending confirmation</dd>
        </div>
      </dl>

      <div className="booking-confirmation-actions">
        <ButtonLink to="/dashboard" variant="primary" rightIcon={<Icon name="arrow-right" size={16} />}>
          View my dashboard
        </ButtonLink>
        <Button variant="outline" onClick={onBookAnother}>
          Book another appointment
        </Button>
      </div>

      <p className="booking-confirmation-note">
        Need to change something? <ButtonLink to="/contact" variant="text">Contact the salon</ButtonLink>
      </p>
    </div>
  )
}
