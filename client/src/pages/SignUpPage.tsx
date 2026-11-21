import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '@/components/common/Button'
import FormField from '@/components/common/FormField'
import Icon from '@/components/common/Icon'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import type { AuthUser } from '@/types'
import { getErrorMessage } from '@/utils/errors'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

function safeRedirect(value: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null
  return value
}

function destinationFor(user: AuthUser, redirect: string | null): string {
  if (redirect) return redirect
  return user.role === 'admin' ? '/admin' : '/dashboard'
}

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  password?: string
  confirmPassword?: string
  terms?: string
}

export default function SignUpPage() {
  const { register, isAuthenticated, isLoading: authLoading, user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = safeRedirect(searchParams.get('redirect'))

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      navigate(destinationFor(user, redirect), { replace: true })
    }
  }, [authLoading, isAuthenticated, user, redirect, navigate])

  const validate = () => {
    const next: FormErrors = {}
    if (name.trim().length < 2) next.name = 'Enter your full name.'
    if (!email.trim()) next.email = 'Enter your email address.'
    else if (!EMAIL_PATTERN.test(email.trim())) next.email = 'Enter a valid email address.'
    if (phone.trim() && phone.replace(/[^\d]/g, '').length < 7) {
      next.phone = 'Enter a valid phone number, or leave this blank.'
    }
    if (!password) next.password = 'Choose a password.'
    else if (!PASSWORD_PATTERN.test(password)) {
      next.password = 'Use at least 8 characters, including a letter and a number.'
    }
    if (password !== confirmPassword) next.confirmPassword = 'Passwords do not match.'
    if (!acceptedTerms) next.terms = 'Please accept the terms to create an account.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    if (!validate()) return

    setSubmitting(true)
    try {
      const createdUser = await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
      })
      toast.success('Account created', `Welcome to NF Signature, ${createdUser.name.split(' ')[0]}.`)
      navigate(destinationFor(createdUser, redirect), { replace: true })
    } catch (caught) {
      const message = getErrorMessage(caught, 'Unable to create your account. Please try again.')
      setFormError(message)
      toast.error('Could not create account', message)
    } finally {
      setSubmitting(false)
    }
  }

  const signInLink = redirect ? `/signin?redirect=${encodeURIComponent(redirect)}` : '/signin'

  return (
    <div className="auth-card">
      <span className="auth-eyebrow">Create an account</span>
      <h1>Join NF Signature</h1>
      <p className="auth-intro">
        Keep your appointments and preferences together in one place.
      </p>

      {formError && (
        <div className="auth-alert" role="alert">
          <Icon name="alert-circle" size={17} />
          <span>{formError}</span>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormField
          id="signup-name"
          label="Full name"
          icon="user"
          placeholder="Your full name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={errors.name}
          autoComplete="name"
          required
        />
        <FormField
          id="signup-email"
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
        <FormField
          id="signup-phone"
          label="Phone number (optional)"
          type="tel"
          icon="phone"
          placeholder="+880 1700 000000"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          error={errors.phone}
          autoComplete="tel"
        />
        <FormField
          id="signup-password"
          label="Password"
          type="password"
          icon="lock"
          placeholder="Create a password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          hint="At least 8 characters, including a letter and a number."
          autoComplete="new-password"
          required
        />
        <FormField
          id="signup-confirm-password"
          label="Confirm password"
          type="password"
          icon="lock"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={errors.confirmPassword}
          autoComplete="new-password"
          required
        />

        <div className="checkbox-field">
          <input
            id="signup-terms"
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
            aria-invalid={errors.terms ? true : undefined}
            aria-describedby={errors.terms ? 'signup-terms-error' : undefined}
          />
          <label htmlFor="signup-terms">
            I agree to the salon&apos;s terms of service and privacy policy.
          </label>
        </div>
        {errors.terms && (
          <p className="form-error" id="signup-terms-error" role="alert">
            {errors.terms}
          </p>
        )}

        <Button type="submit" loading={submitting} fullWidth size="lg">
          Create account
        </Button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to={signInLink}>Sign in</Link>
      </p>

      <p className="auth-note">
        <Icon name="shield" size={14} />
        Account creation is handled by the SalonBook API. No details are stored on the client.
      </p>
    </div>
  )
}
