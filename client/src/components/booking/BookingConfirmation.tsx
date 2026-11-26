import ButtonLink from '@/components/common/ButtonLink'
import Button from '@/components/common/Button'
import Icon from '@/components/common/Icon'
import { formatDateLong } from '@/utils/format'
import type { Appointment } from '@/types'

// NF Signature Salon — Booking confirmation
// Shown after a booking request succeeds.

interface BookingConfirmationProps {
  appointment: Appointment
  onBookAnother: () => void
  onPay?: () => void
}

export default function BookingConfirmation({
  appointment,
  onBookAnother,
  onPay,
}: BookingConfirmationProps) {
  const statusLabel =
    appointment.status === 'confirmed'
      ? 'Confirmed'
      : appointment.status === 'completed'
        ? 'Completed'
        : appointment.status === 'cancelled'
          ? 'Cancelled'
          : 'Pending confirmation'
  const paymentLabel =
    appointment.paymentStatus === 'paid'
      ? 'Paid'
      : appointment.paymentStatus === 'pending'
        ? 'Payment pending'
        : null

  return (
    <div className="booking-confirmation" role="status" aria-live="polite">
      <span className="booking-confirmation-icon" aria-hidden="true">
        <Icon name="check" size={30} />
      </span>
      <h2>Appointment request received</h2>
      <p>
        The salon will confirm your appointment by email. Please arrive a few minutes early.
      </p>

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
          <dd className="booking-status">{statusLabel}</dd>
        </div>
        {paymentLabel && (
          <div>
            <dt>Payment</dt>
            <dd>{paymentLabel}</dd>
          </div>
        )}
      </dl>

      <div className="booking-confirmation-actions">
        {onPay && (
          <Button variant="primary" onClick={onPay} rightIcon={<Icon name="arrow-right" size={16} />}>
            Pay now
          </Button>
        )}
        <ButtonLink to="/dashboard" variant={onPay ? 'outline' : 'primary'} rightIcon={<Icon name="arrow-right" size={16} />}>
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
