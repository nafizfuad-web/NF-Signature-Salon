import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Button from '@/components/common/Button'
import ButtonLink from '@/components/common/ButtonLink'
import FormField from '@/components/common/FormField'
import Icon from '@/components/common/Icon'
import PageHeader from '@/components/common/PageHeader'
import { useToast } from '@/hooks/useToast'
import { verifyEmail, resendVerificationEmail } from '@/services/api/auth'
import { EMAIL_MAX_LENGTH, EMAIL_PATTERN } from '@/utils/authValidation'
import { getErrorMessage } from '@/utils/errors'

export default function VerifyEmailPage() {
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setError('No verification token was provided.')
      return
    }
    setVerifying(true)
    verifyEmail(token)
      .then(() => {
        setVerified(true)
        toast.success('Email verified', 'Your email address has been verified. You can now sign in.')
      })
      .catch((caught) => {
        setError(getErrorMessage(caught, 'Unable to verify your email address. Please try again.'))
      })
      .finally(() => {
        setVerifying(false)
      })
  }, [token, toast])

  const handleResend = async () => {
    const cleanEmail = email.trim()
    if (!cleanEmail) {
      setEmailError('Enter the email address for your account.')
      return
    }
    if (cleanEmail.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(cleanEmail)) {
      setEmailError('Enter a valid email address.')
      return
    }

    setEmailError(null)
    setResending(true)
    try {
      await resendVerificationEmail(cleanEmail)
      toast.success('Verification email sent', 'If an account needs verification, a new link has been sent.')
    } catch (caught) {
      setError(getErrorMessage(caught, 'Unable to send a verification email right now.'))
    } finally {
      setResending(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Account verification"
        title={verified ? 'Email verified' : 'Verify your email address'}
        subtitle={verified
          ? 'Your account is ready. You can now sign in and book appointments.'
          : 'Follow the link sent to your email to confirm your address.'}
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Verify email' }]}
      />

      <section className="section-padding auth-page">
        <div className="section-container auth-container">
          <div className="auth-card">
            <span className="auth-eyebrow">{verified ? 'Verified' : 'Verify email'}</span>
            <h1>{verified ? 'Email address verified' : 'Verify your email address'}</h1>

            {error && (
              <div className="auth-alert" role="alert">
                <Icon name="alert-circle" size={17} />
                <span>{error}</span>
              </div>
            )}

            {!verified && verifying && (
              <div className="auth-intro">
                <Icon name="clock" size={18} />
                <span>Verifying your email address…</span>
              </div>
            )}

            {verified && (
              <div className="auth-intro">
                <Icon name="check" size={18} />
                <span>Your email address has been verified successfully.</span>
              </div>
            )}

            {!verified && !verifying && (
              <>
                <p className="auth-intro">
                  {token
                    ? 'This verification link is invalid or has expired. Request a new link below.'
                    : 'We could not find a verification token. Request a new verification link below.'}
                </p>
                <FormField
                  id="verify-email-address"
                  label="Email address"
                  type="email"
                  icon="mail"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  error={emailError ?? undefined}
                  autoComplete="email"
                  required
                />
                <Button
                  variant="outline"
                  loading={resending}
                  onClick={handleResend}
                  fullWidth
                  size="lg"
                >
                  Send verification email
                </Button>
                <p className="auth-note">
                  <Icon name="shield" size={14} />
                  Verification links expire after 24 hours and can only be used once.
                </p>
              </>
            )}

            <div className="auth-actions">
              <ButtonLink to="/signin" variant="primary" fullWidth>
                {verified ? 'Go to sign in' : 'Return to sign in'}
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
