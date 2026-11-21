import { useState, type FormEvent } from 'react'
import Icon from '@/components/common/Icon'
import { useServices } from '@/hooks/useServices'
import { fetchAvailableSlots } from '@/services/api/availability'
import { SALON_LOCATION } from '@/services/salonConfig'

function localDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const MIN_APPOINTMENT_DATE = localDateString(new Date())

export default function BookingSearch() {
  const { data: services, loading: servicesLoading, error: servicesError } = useServices()
  const [serviceId, setServiceId] = useState('')
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState<string[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSlots(null)

    if (!serviceId || !services?.some((service) => service.id === serviceId)) {
      setError('Please choose a service from our menu.')
      return
    }
    if (!date || date < localDateString(new Date())) {
      setError('Please choose today or a future appointment date.')
      return
    }

    setLoading(true)
    try {
      setSlots(await fetchAvailableSlots({ serviceId, date }))
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'We could not check availability. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="hero-booking-wrap">
      <form className="hero-booking-panel" onSubmit={handleSubmit}>
        <label className="hero-booking-field">
          <span className="hero-booking-label">What are you looking for?</span>
          <select
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
            disabled={servicesLoading || !services?.length}
            required
          >
            <option value="">
              {servicesLoading ? 'Loading services…' : 'Choose a service'}
            </option>
            {services?.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title}
              </option>
            ))}
          </select>
        </label>

        <div className="hero-booking-field hero-booking-location">
          <span className="hero-booking-label">Where?</span>
          <span className="hero-booking-value">
            <Icon name="map-pin" size={17} />
          {SALON_LOCATION.displayAddress}
          </span>
        </div>

        <label className="hero-booking-field">
          <span className="hero-booking-label">When?</span>
          <input
            type="date"
            value={date}
            min={MIN_APPOINTMENT_DATE}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </label>

        <button className="hero-booking-submit" type="submit" disabled={loading || servicesLoading || !services?.length}>
          <Icon name="search" size={17} />
          {loading ? 'Checking…' : 'Search'}
        </button>
      </form>

      <div className="hero-availability" aria-live="polite">
        {servicesError && <p className="hero-availability-error">{servicesError}</p>}
        {!servicesLoading && !servicesError && !services?.length && (
          <p className="hero-availability-error">Services are currently unavailable.</p>
        )}
        {error && <p className="hero-availability-error">{error}</p>}
        {slots && (
          <div className="hero-availability-results">
            <h2>{slots.length ? 'Available times' : 'No times available'}</h2>
            {slots.length ? (
              <ul>
                {slots.map((slot) => <li key={slot}>{slot}</li>)}
              </ul>
            ) : (
              <p>No appointment times are available for this service and date.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
