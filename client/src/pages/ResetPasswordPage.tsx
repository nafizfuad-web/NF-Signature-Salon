import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '@/components/common/Button'
import FormField from '@/components/common/FormField'
import Icon from '@/components/common/Icon'
import PageHeader from '@/components/common/PageHeader'
import { useToast } from '@/hooks/useToast'
import { resetPassword } from '@/services/api/auth'
import {
  PASSWORD_MAX_BYTES,
  PASSWORD_MIN_LENGTH,
  passwordByteLength,
} from '@/utils/authValidation'
import { getErrorMessage } from '@/utils/errors'

export default function ResetPasswordPage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)

  const PASSWORD_PATTERN_REGEX = new RegExp(
    `^(?=.*[A-Za-z])(?=.*\\d).{${PASSWORD_MIN_LENGTH},}$`
  )

  useEffect(() => {
    if (!token) {
      setFormError('No reset token was provided. Please request a new password reset link.')
    }
  }, [token])

  const validate = () => {
    const next: { password?: string; confirmPassword?: string } = {}
    if (!password) next.password = 'Choose a new password.'
    else if (!PASSWORD_PATTERN_REGEX.test(password)) {
      next.password = `Use at least ${PASSWORD_MIN_LENGTH} characters, including a letter and a number.`
    } else if (passwordByteLength(password) > PASSWORD_MAX_BYTES) {
      next.password = `Password must be ${PASSWORD_MAX_BYTES} bytes or fewer.`
    }
    if (password !== confirmPassword) next.confirmPassword = 'Passwords do not match.'
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
      await resetPassword(token, password)
      toast.success('Password reset', 'Your password has been updated. Please sign in with your new password.')
      navigate('/signin', { replace: true })
    } catch (caught) {
      const message = getErrorMessage(caught, 'Unable to reset your password right now.')
      setFormError(message)
      toast.error('Reset failed', message)
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Account recovery"
        title="Choose a new password"
        subtitle="Create a new password for your account using the reset link sent to your email."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Reset password' }]}
      />

      <section className="section-padding auth-page">
        <div className="section-container auth-container">
          <div className="auth-card">
            <span className="auth-eyebrow">Reset password</span>
            <h1>Choose a new password</h1>
            <p className="auth-intro">
              Your new password must be at least {PASSWORD_MIN_LENGTH} characters and include a letter and a number.
            </p>

            {formError && (
              <div className="auth-alert" role="alert">
                <Icon name="alert-circle" size={17} />
                <span>{formError}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <FormField
                id="reset-password"
                label="New password"
                type="password"
                icon="lock"
                placeholder="Create a new password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                error={errors.password}
                hint="At least 8 characters, including a letter and a number."
                autoComplete="new-password"
                required
              />
              <FormField
                id="reset-confirm-password"
                label="Confirm new password"
                type="password"
                icon="lock"
                placeholder="Repeat your new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                error={errors.confirmPassword}
                autoComplete="new-password"
                required
              />

              <Button
                type="submit"
                loading={submitting}
                disabled={!token}
                fullWidth
                size="lg"
              >
                Reset password
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
