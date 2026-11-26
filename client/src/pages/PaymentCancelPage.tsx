import { useSearchParams } from 'react-router-dom'
import ButtonLink from '@/components/common/ButtonLink'
import Icon from '@/components/common/Icon'
import PageHeader from '@/components/common/PageHeader'

export default function PaymentCancelPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id') ?? ''

  return (
    <>
      <PageHeader
        eyebrow="Payment"
        title="Payment cancelled"
        subtitle="Your payment was not completed. No charge was made to your card."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Payment' }]}
      />

      <section className="section-padding auth-page">
        <div className="section-container auth-container">
          <div className="auth-card">
            <span className="auth-eyebrow">Payment cancelled</span>
            <h1>Payment not completed</h1>
            <p className="auth-intro">
              You cancelled the checkout or the payment session expired. Your
              appointment remains unpaid and you can try again at any time.
            </p>

            {sessionId && (
              <p className="auth-note">
                <Icon name="shield" size={14} />
                Session: {sessionId}
              </p>
            )}

            <div className="auth-actions">
              <ButtonLink to="/dashboard/appointments" variant="primary" fullWidth>
                View my appointments
              </ButtonLink>
              <ButtonLink to="/services" variant="outline" fullWidth>
                Browse more services
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
