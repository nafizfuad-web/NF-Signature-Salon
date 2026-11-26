import Icon from '@/components/common/Icon'
import { formatDateLong } from '@/utils/format'
import type { ServiceItem } from '@/types'

// NF Signature Salon — Booking summary card
// Sticky summary of the choices made so far in the booking flow.

interface BookingSummaryProps {
  service: ServiceItem | null
  date: string
  time: string
  availableSlots: string[] | null
}

export default function BookingSummary({
  service,
  date,
  time,
  availableSlots,
}: BookingSummaryProps) {
  return (
    <aside className="booking-summary" aria-label="Booking summary">
      <h2 className="booking-summary-title">Your booking</h2>

      <dl className="booking-summary-list">
        <div>
          <dt>
            <Icon name="scissors" size={15} /> Service
          </dt>
          <dd>{service ? service.title : 'Not selected yet'}</dd>
        </div>
        <div>
          <dt>
            <Icon name="calendar" size={15} /> Date
          </dt>
          <dd>{date ? formatDateLong(date) : 'Not selected yet'}</dd>
        </div>
        <div>
          <dt>
            <Icon name="clock" size={15} /> Time
          </dt>
          <dd>{time || 'Not selected yet'}</dd>
        </div>
        {service?.duration && (
          <div>
            <dt>
              <Icon name="info" size={15} /> Duration
            </dt>
            <dd>{service.duration}</dd>
          </div>
        )}
        {service && (
          <div>
            <dt>
              <Icon name="sparkles" size={15} /> Price
            </dt>
            <dd className="booking-summary-price">{service.price}</dd>
          </div>
        )}
      </dl>

      {availableSlots && availableSlots.length === 0 && (
        <p className="booking-summary-note" role="status">
          No times were returned for this date. Please try another day.
        </p>
      )}

      <p className="booking-summary-note booking-summary-payment-note">
        <Icon name="shield" size={14} />
        Payment is a simulated TEST demo after confirmation. No real money is charged.
      </p>
    </aside>
  )
}
