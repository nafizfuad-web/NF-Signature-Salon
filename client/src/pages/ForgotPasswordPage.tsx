import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '@/components/common/Button'
import FormField from '@/components/common/FormField'
import Icon from '@/components/common/Icon'
import PageHeader from '@/components/common/PageHeader'
import { useToast } from '@/hooks/useToast'
import { forgotPassword } from '@/services/api/auth'
import { EMAIL_MAX_LENGTH, EMAIL_PATTERN } from '@/utils/authValidation'
import { getErrorMessage } from '@/utils/errors'

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ email?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('reset') === 'success') {
      toast.success('Password reset email sent', 'Check your inbox and follow the link to choose a new password.')
    }
  }, [toast])

  const validate = () => {
    const next: { email?: string } = {}
    const cleanEmail = email.trim()
    if (!cleanEmail) next.email = 'Enter the email address for your account.'
    else if (cleanEmail.length > EMAIL_MAX_LENGTH) {
      next.email = 'Email address is too long.'
    } else if (!EMAIL_PATTERN.test(cleanEmail)) {
      next.email = 'Enter a valid email address.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submittingRef.current) return

    setFormError(null)
    if (!validate()) return

    submittingRef.current = true
    setSubmitting(true)
    try {
      await forgotPassword(email.trim())
      toast.success('Reset email sent', 'If an account exists for that address, you will receive a password reset link.')
      navigate('/signin', { replace: true })
    } catch (caught) {
      const message = getErrorMessage(caught, 'Unable to send a reset email right now.')
      setFormError(message)
      toast.error('Reset email failed', message)
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Account recovery"
        title="Reset your password"
        subtitle="Enter your email address and we will send you a link to choose a new password."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Reset password' }]}
      />

      <section className="section-padding auth-page">
        <div className="section-container auth-container">
          <div className="auth-card">
            <span className="auth-eyebrow">Forgot password</span>
            <h1>Reset your password</h1>
            <p className="auth-intro">
              We will send a secure link to your email address. You can use it to choose a new password.
            </p>

            {formError && (
              <div className="auth-alert" role="alert">
                <Icon name="alert-circle" size={17} />
                <span>{formError}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <FormField
                id="forgot-email"
                label="Email address"
                type="email"
                icon="mail"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                error={errors.email}
                autoComplete="email"
                required
              />

              <Button
                type="submit"
                loading={submitting}
                fullWidth
                size="lg"
              >
                Send reset link
              </Button>
            </form>

            <p className="auth-switch">
              Remember your password? <Link to="/signin">Sign in</Link>
            </p>

            <p className="auth-note">
              <Icon name="shield" size={14} />
              Reset links expire after one hour and can only be used once.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
