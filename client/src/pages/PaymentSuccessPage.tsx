import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ButtonLink from '@/components/common/ButtonLink'
import Icon from '@/components/common/Icon'
import PageHeader from '@/components/common/PageHeader'
import {
  fetchBkashPaymentStatus,
  fetchStripePaymentStatus,
  type ProviderPaymentStatusResponse,
} from '@/services/api/payments'
import { getErrorMessage } from '@/utils/errors'
import { formatShortDate } from '@/utils/format'

const TERMINAL_FAILURE_STATUSES = new Set(['failed', 'cancelled', 'refunded'])

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id') ?? ''
  const provider = searchParams.get('provider') ?? 'stripe'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ProviderPaymentStatusResponse | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setError('No payment session was found.')
      setLoading(false)
      return
    }

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    async function poll(attempt: number) {
      try {
        const result =
          provider === 'bkash'
            ? await fetchBkashPaymentStatus(sessionId)
            : await fetchStripePaymentStatus(sessionId)
        if (cancelled) return
        setData(result)
        setError(null)
        setLoading(false)

        const stillPending =
          result.transaction.paymentStatus === 'pending' ||
          result.transaction.paymentStatus === 'processing' ||
          result.payment.status === 'pending'
        if (stillPending && attempt < 5) {
          timer = setTimeout(() => void poll(attempt + 1), 3000)
        }
      } catch (caught) {
        if (cancelled) return
        setLoading(false)
        setError(getErrorMessage(caught, 'Unable to verify your payment status right now.'))
      }
    }

    void poll(0)
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [sessionId, provider])

  const providerLabel = provider === 'bkash' ? 'bKash' : 'Stripe'
  const transactionStatus = data?.transaction.paymentStatus
  const appointmentStatus = data?.payment.status ?? data?.appointment?.paymentStatus
  const verified = transactionStatus === 'succeeded' && appointmentStatus === 'paid'
  const failed = Boolean(transactionStatus && TERMINAL_FAILURE_STATUSES.has(transactionStatus))
  const appointment = data?.appointment ?? null

  return (
    <>
      <PageHeader
        eyebrow="Payment"
        title={verified ? 'Payment successful' : failed ? 'Payment failed' : 'Payment status'}
        subtitle={
          verified
            ? 'Your payment has been verified and your appointment is confirmed.'
            : failed
              ? 'This payment did not complete. No appointment was marked as paid.'
              : 'We are verifying your payment with the server. This can take a moment.'
        }
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Payment' }]}
      />

      <section className="section-padding auth-page">
        <div className="section-container auth-container">
          <div className="auth-card">
            <span className="auth-eyebrow">
              {verified ? 'Payment confirmed' : failed ? 'Payment failed' : 'Payment pending'}
            </span>
            <h1>
              {verified ? 'Payment successful' : failed ? 'Payment not completed' : 'Checking payment status'}
            </h1>

            {error && (
              <div className="auth-alert" role="alert">
                <Icon name="alert-circle" size={17} />
                <span>{error}</span>
              </div>
            )}

            {loading && !data && (
              <div className="auth-intro">
                <Icon name="clock" size={18} />
                <span>Verifying your payment…</span>
              </div>
            )}

            {verified && (
              <>
                <div className="auth-intro">
                  <Icon name="check" size={18} />
                  <span>
                    Your payment has been verified by {providerLabel} and your appointment is confirmed.
                  </span>
                </div>

                {appointment && (
                  <dl className="payment-details">
                    <div>
                      <dt>Service</dt>
                      <dd>{appointment.serviceTitle}</dd>
                    </div>
                    <div>
                      <dt>Date</dt>
                      <dd>{formatShortDate(appointment.date)}</dd>
                    </div>
                    <div>
                      <dt>Time</dt>
                      <dd>{appointment.time}</dd>
                    </div>
                    <div>
                      <dt>Amount</dt>
                      <dd>BDT {data?.transaction.amount}</dd>
                    </div>
                  </dl>
                )}

                <div className="auth-actions">
                  <ButtonLink to="/dashboard/appointments" variant="primary" fullWidth>
                    View my appointments
                  </ButtonLink>
                  <ButtonLink to="/services" variant="outline" fullWidth>
                    Browse more services
                  </ButtonLink>
                </div>
              </>
            )}

            {failed && (
              <>
                <div className="auth-intro">
                  <Icon name="alert-circle" size={18} />
                  <span>
                    {data?.transaction.failureReason
                      ? `${providerLabel} reported that this payment did not complete.`
                      : 'This payment did not complete. You can try again from your appointments.'}
                  </span>
                </div>
                <div className="auth-actions">
                  <ButtonLink to="/dashboard/appointments" variant="primary" fullWidth>
                    Back to my appointments
                  </ButtonLink>
                  <ButtonLink to="/services" variant="outline" fullWidth>
                    Browse more services
                  </ButtonLink>
                </div>
              </>
            )}

            {!verified && !failed && !loading && (
              <>
                <div className="auth-intro">
                  <Icon name="clock" size={18} />
                  <span>
                    Payment is still pending. {providerLabel} will confirm it shortly; your appointment is
                    only marked paid after server-side verification.
                  </span>
                </div>
                <div className="auth-actions">
                  <ButtonLink to="/dashboard/appointments" variant="primary" fullWidth>
                    View my appointments
                  </ButtonLink>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
