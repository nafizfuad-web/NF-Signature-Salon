import { useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import BookingConfirmation from '@/components/booking/BookingConfirmation'
import BookingStepper from '@/components/booking/BookingStepper'
import BookingSummary from '@/components/booking/BookingSummary'
import Button from '@/components/common/Button'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import FormField from '@/components/common/FormField'
import Icon from '@/components/common/Icon'
import PageHeader from '@/components/common/PageHeader'
import ServiceCardSkeleton from '@/components/services/ServiceCardSkeleton'
import ServiceImage from '@/components/services/ServiceImage'
import { useAuth } from '@/hooks/useAuth'
import { useServices } from '@/hooks/useServices'
import { useToast } from '@/hooks/useToast'
import { createAppointment } from '@/services/api/appointments'
import { fetchAvailableSlots } from '@/services/api/availability'
import type { Appointment } from '@/types'
import { cn } from '@/lib/cn'
import { getErrorMessage } from '@/utils/errors'
import { formatDate } from '@/utils/format'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[+0-9()\-\s]{7,24}$/

const STEPS = [
  { id: 1, label: 'Service' },
  { id: 2, label: 'Date & time' },
  { id: 3, label: 'Your details' },
]

function localDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const TODAY = localDateString()

export default function BookingPage() {
  const [searchParams] = useSearchParams()
  const initialServiceId = searchParams.get('service') ?? ''

  const { data: services, loading: servicesLoading, error: servicesError, refetch } = useServices()
  const { user } = useAuth()
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [maxReached, setMaxReached] = useState(1)
  const [serviceId, setServiceId] = useState(initialServiceId)
  const [date, setDate] = useState('')
  const dateInputRef = useRef<HTMLInputElement>(null)
  const [time, setTime] = useState('')
  const [slots, setSlots] = useState<string[] | null>(null)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState('')

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [stepError, setStepError] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [confirmation, setConfirmation] = useState<Appointment | null>(null)

  const selectedService = useMemo(
    () => services?.find((service) => service.id === serviceId) ?? null,
    [services, serviceId]
  )

  function goToStep(nextStep: number) {
    setStepError('')
    setStep(nextStep)
    setMaxReached((current) => Math.max(current, nextStep))
  }

  function handleServiceChange(nextServiceId: string) {
    setServiceId(nextServiceId)
    setStepError('')
    // Slot availability depends on the chosen service.
    setTime('')
    setSlots(null)
    setSlotsError('')
  }

  function handleDateChange(nextDate: string) {
    setDate(nextDate)
    setTime('')
    setSlots(null)
    setSlotsError('')
  }

  function openDatePicker() {
    const dateInput = dateInputRef.current
    if (!dateInput) return
    if (typeof dateInput.showPicker === 'function') {
      dateInput.showPicker()
      return
    }
    dateInput.focus()
    dateInput.click()
  }

  function handleContinueFromService() {
    if (!selectedService) {
      setStepError('Please choose a service to continue.')
      return
    }
    goToStep(2)
  }

  async function handleCheckAvailability() {
    setSlotsError('')
    setSlots(null)

    if (!selectedService) {
      setStepError('Please choose a service first.')
      return
    }
    if (!date) {
      setSlotsError('Choose a date to check available times.')
      return
    }
    if (date < TODAY) {
      setSlotsError('Please choose today or a future appointment date.')
      return
    }

    setSlotsLoading(true)
    try {
      const available = await fetchAvailableSlots({ serviceId: selectedService.id, date })
      setSlots(available)
      if (!available.length) {
        setSlotsError('No times are available for this date. Please try another day.')
      }
    } catch (caught) {
      setSlotsError(getErrorMessage(caught, 'We could not check availability. Please try again.'))
    } finally {
      setSlotsLoading(false)
    }
  }

  function handleContinueFromDateTime() {
    if (!date) {
      setStepError('Choose an appointment date to continue.')
      return
    }
    if (!time) {
      setStepError('Choose an available time to continue.')
      return
    }
    goToStep(3)
  }

  function fillFromAccount() {
    if (!user) return
    setName(user.name)
    setEmail(user.email)
    setPhone(user.phone ?? '')
  }

  function validateDetails(): boolean {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'Enter your full name.'
    if (!email.trim()) next.email = 'Enter your email address.'
    else if (!EMAIL_PATTERN.test(email.trim())) next.email = 'Enter a valid email address.'
    if (!phone.trim()) next.phone = 'Enter a phone number so the salon can reach you.'
    else if (!PHONE_PATTERN.test(phone.trim())) next.phone = 'Enter a valid phone number.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError('')

    if (!selectedService || !date || !time) {
      setStepError('Your booking is missing a service, date or time. Please go back and complete it.')
      return
    }
    if (!validateDetails()) return

    setSubmitting(true)
    try {
      const appointment = await createAppointment({
        serviceId: selectedService.id,
        date,
        time,
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
      })
      setConfirmation(appointment)
      toast.success('Appointment requested', 'The salon will confirm your appointment by email.')
    } catch (caught) {
      const message = getErrorMessage(caught, 'Your appointment could not be requested. Please try again.')
      setSubmitError(message)
      toast.error('Booking failed', message)
    } finally {
      setSubmitting(false)
    }
  }

  function resetBooking() {
    setConfirmation(null)
    setStep(1)
    setMaxReached(1)
    setServiceId('')
    setDate('')
    setTime('')
    setSlots(null)
    setSlotsError('')
    setStepError('')
    setNotes('')
    setErrors({})
    setSubmitError('')
  }

  if (confirmation) {
    return (
      <>
        <PageHeader
          eyebrow="Booking"
          title="Your appointment request"
          subtitle="Review the details below."
          breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Booking' }]}
        />
        <section className="section-padding booking-page">
          <div className="section-container booking-confirmation-wrap">
            <BookingConfirmation
              appointment={confirmation}
              onBookAnother={resetBooking}
            />
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="Book an appointment"
        title="Reserve your visit"
        subtitle="Choose a service, pick a time and tell us how to reach you. TEST payment demos are available after confirmation."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Booking' }]}
      />

      <section className="section-padding booking-page" aria-label="Appointment booking">
        <div className="section-container booking-layout">
          <div className="booking-main">
            <BookingStepper
              steps={STEPS}
              current={step}
              maxReached={maxReached}
              onStepClick={goToStep}
            />

            {stepError && (
              <p className="form-error booking-step-error" role="alert">
                {stepError}
              </p>
            )}

            {/* Step 1 — Service */}
            {step === 1 && (
              <div className="booking-panel">
                <h2 className="booking-panel-title">1. Choose a service</h2>

                {servicesLoading && (
                  <div className="booking-service-grid" aria-busy="true" aria-label="Loading services">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <ServiceCardSkeleton key={index} />
                    ))}
                  </div>
                )}

                {!servicesLoading && servicesError && (
                  <ErrorState
                    title="We couldn't load the service menu"
                    message={servicesError}
                    onRetry={refetch}
                  />
                )}

                {!servicesLoading && !servicesError && services?.length === 0 && (
                  <EmptyState
                    icon="search"
                    title="No services are available"
                    description="The service menu is empty right now. Please check back soon."
                  />
                )}

                {!servicesLoading && !servicesError && services && services.length > 0 && (
                  <div className="booking-service-grid" role="radiogroup" aria-label="Choose a service">
                    {services.map((service) => {
                      const isSelected = service.id === serviceId
                      return (
                        <label
                          key={service.id}
                          className={cn('booking-service-option', isSelected && 'is-selected')}
                        >
                          <input
                            type="radio"
                            name="booking-service"
                            value={service.id}
                            checked={isSelected}
                            onChange={() => handleServiceChange(service.id)}
                          />
                          <span className="booking-service-media">
                            <ServiceImage src={service.image} title={service.title} />
                          </span>
                          <span className="booking-service-copy">
                            <strong>{service.title}</strong>
                            <span className="booking-service-meta">
                              {service.duration ?? 'Duration on request'} · {service.price}
                            </span>
                          </span>
                          <span className="booking-service-check" aria-hidden="true">
                            <Icon name="check" size={15} />
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )}

                <div className="booking-panel-actions">
                  <Button
                    onClick={handleContinueFromService}
                    disabled={servicesLoading}
                    rightIcon={<Icon name="arrow-right" size={16} />}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2 — Date & time */}
            {step === 2 && (
              <div className="booking-panel">
                <h2 className="booking-panel-title">2. Choose a date &amp; time</h2>

                <div className="booking-date-row">
                  <div className="form-group booking-date-group">
                    <label className="form-label" htmlFor="booking-appointment-date">
                      Appointment date
                    </label>
                    <div className="booking-date-input-wrap">
                      <input
                        ref={dateInputRef}
                        id="booking-appointment-date"
                        className="form-input"
                        type="date"
                        value={date}
                        min={TODAY}
                        onChange={(event) => handleDateChange(event.target.value)}
                      />
                      <button
                        type="button"
                        className="booking-date-picker-button"
                        onClick={openDatePicker}
                        aria-label="Open appointment date calendar"
                        title="Open calendar"
                      >
                        <Icon name="calendar" size={18} />
                      </button>
                    </div>
                    <p className="booking-date-display" aria-live="polite">
                      {date
                        ? <>Selected date: <strong>{formatDate(date, {
                          weekday: undefined,
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}</strong></>
                        : 'Select a date to continue.'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleCheckAvailability}
                    loading={slotsLoading}
                    leftIcon={<Icon name="search" size={15} />}
                  >
                    Check availability
                  </Button>
                </div>

                {slotsError && (
                  <p className="form-error" role="alert">
                    {slotsError}
                  </p>
                )}

                {slotsLoading && <p className="booking-slots-loading">Checking available times…</p>}

                {slots && slots.length > 0 && (
                  <div className="booking-slots" role="group" aria-label="Available times">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={cn('booking-slot', time === slot && 'is-selected')}
                        aria-pressed={time === slot}
                        onClick={() => {
                          setTime(slot)
                          setStepError('')
                        }}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}

                <p className="booking-availability-note">
                  <Icon name="info" size={14} />
                  Available times are provided by the salon's availability service and are confirmed
                  when your appointment is accepted.
                </p>

                <div className="booking-panel-actions">
                  <Button variant="text" onClick={() => goToStep(1)} leftIcon={<Icon name="arrow-left" size={15} />}>
                    Back
                  </Button>
                  <Button onClick={handleContinueFromDateTime} rightIcon={<Icon name="arrow-right" size={16} />}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3 — Details */}
            {step === 3 && (
              <div className="booking-panel">
                <h2 className="booking-panel-title">3. Your details</h2>

                {user && (
                  <button type="button" className="booking-fill-account" onClick={fillFromAccount}>
                    <Icon name="user" size={15} />
                    Use my account details
                  </button>
                )}

                <form className="booking-details-form" onSubmit={handleSubmit} noValidate>
                  <FormField
                    id="booking-name"
                    label="Full name"
                    icon="user"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    error={errors.name}
                    autoComplete="name"
                    placeholder="Your full name"
                    required
                  />
                  <FormField
                    id="booking-email"
                    label="Email address"
                    type="email"
                    icon="mail"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    error={errors.email}
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                  />
                  <FormField
                    id="booking-phone"
                    label="Phone number"
                    type="tel"
                    icon="phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    error={errors.phone}
                    autoComplete="tel"
                    placeholder="+880 1XXX XXXXXX"
                    hint="The salon uses this number to confirm your appointment."
                    required
                  />
                  <label className="form-group">
                    <span className="form-label">Notes for the salon (optional)</span>
                    <textarea
                      className="form-input booking-notes"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      rows={3}
                      maxLength={600}
                      placeholder="Anything we should know before your visit?"
                    />
                  </label>

                  {submitError && (
                    <p className="form-error" role="alert">
                      {submitError}
                    </p>
                  )}

                  <div className="booking-panel-actions">
                    <Button variant="text" onClick={() => goToStep(2)} leftIcon={<Icon name="arrow-left" size={15} />}>
                      Back
                    </Button>
                    <Button type="submit" loading={submitting} rightIcon={<Icon name="check" size={16} />}>
                      Request appointment
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <BookingSummary
            service={selectedService}
            date={date}
            time={time}
            availableSlots={slots}
          />
        </div>
      </section>
    </>
  )
}
