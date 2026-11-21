import { useState, type FormEvent } from 'react'
import Button from '@/components/common/Button'
import Icon from '@/components/common/Icon'
import OpeningHours from '@/components/common/OpeningHours'
import PageHeader from '@/components/common/PageHeader'
import { sendContactMessage } from '@/services/api/contact'
import { SALON_LOCATION } from '@/services/salonConfig'

const directionsUrl = SALON_LOCATION.address
  ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(SALON_LOCATION.displayAddress)}`
  : undefined

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSent(false)
    setSubmitting(true)

    try {
      await sendContactMessage({ name: name.trim(), email: email.trim(), message: message.trim() })
      setSent(true)
      setName('')
      setEmail('')
      setMessage('')
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Your message could not be sent. Please try again later.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="We are here to help"
        title="Contact NF Signature Salon"
        subtitle="Reach our single salon location in Dhaka, Bangladesh."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
      />

      <section className="section-padding contact-page">
        <div className="section-container contact-layout">
          <div className="contact-information">
            <p className="contact-eyebrow">Salon details</p>
            <h2>{SALON_LOCATION.name}</h2>
            <p className="contact-location-line">
              {SALON_LOCATION.country} · {SALON_LOCATION.city}
            </p>

            <dl className="contact-details">
              <div>
                <dt><Icon name="map-pin" size={17} /> Business address</dt>
                <dd>
                  {SALON_LOCATION.address
                    ? SALON_LOCATION.displayAddress
                    : <>Exact business address is not configured. Dhaka is shown as a development location only.</>}
                </dd>
              </div>
              <div>
                <dt><Icon name="map-pin" size={17} /> Postal code</dt>
                <dd>{SALON_LOCATION.postalCode || 'Not configured'}</dd>
              </div>
              <div>
                <dt><Icon name="phone" size={17} /> Phone</dt>
                <dd>
                  {SALON_LOCATION.phone
                    ? <a href={`tel:${SALON_LOCATION.phone}`}>{SALON_LOCATION.phone}</a>
                    : 'Not configured'}
                </dd>
              </div>
              <div>
                <dt><Icon name="mail" size={17} /> Email</dt>
                <dd>
                  {SALON_LOCATION.email
                    ? <a href={`mailto:${SALON_LOCATION.email}`}>{SALON_LOCATION.email}</a>
                    : 'Not configured'}
                </dd>
              </div>
            </dl>

            {directionsUrl && (
              <a className="salon-directions-link contact-directions" href={directionsUrl} target="_blank" rel="noreferrer">
                Get Directions <span aria-hidden="true">→</span>
              </a>
            )}

            <div className="contact-hours">
              <h3>Opening hours</h3>
              <OpeningHours />
            </div>
          </div>

          <div className="contact-form-card">
            <h2>Send us a message</h2>
            <p>We will only confirm delivery when the salon contact service acknowledges it.</p>
            <form onSubmit={handleSubmit}>
              <label className="form-group">
                <span className="form-label">Your name</span>
                <input
                  className="form-input"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  maxLength={120}
                />
              </label>
              <label className="form-group">
                <span className="form-label">Email address</span>
                <input
                  className="form-input"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  maxLength={254}
                />
              </label>
              <label className="form-group">
                <span className="form-label">Message</span>
                <textarea
                  className="form-input contact-message-input"
                  name="message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  required
                  rows={5}
                  maxLength={4000}
                />
              </label>
              {error && <p className="contact-form-feedback is-error" role="alert">{error}</p>}
              {sent && <p className="contact-form-feedback is-success" role="status">Your message was confirmed by the salon contact service.</p>}
              <Button type="submit" loading={submitting} fullWidth>
                Send message
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
