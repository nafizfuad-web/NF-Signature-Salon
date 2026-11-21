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

function safeRedirect(value: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null
  return value
}

function destinationFor(user: AuthUser, redirect: string | null): string {
  if (redirect) return redirect
  return user.role === 'admin' ? '/admin' : '/dashboard'
}

export default function SignInPage() {
  const { login, isAuthenticated, isLoading: authLoading, user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = safeRedirect(searchParams.get('redirect'))

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      navigate(destinationFor(user, redirect), { replace: true })
    }
  }, [authLoading, isAuthenticated, user, redirect, navigate])

  const validate = () => {
    const next: { email?: string; password?: string } = {}
    if (!email.trim()) next.email = 'Enter the email address for your account.'
    else if (!EMAIL_PATTERN.test(email.trim())) next.email = 'Enter a valid email address.'
    if (!password) next.password = 'Enter your password.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    if (!validate()) return

    setSubmitting(true)
    try {
      const signedInUser = await login({ email: email.trim(), password })
      toast.success('Welcome back', `Signed in as ${signedInUser.email}.`)
      navigate(destinationFor(signedInUser, redirect), { replace: true })
    } catch (caught) {
      const message = getErrorMessage(caught, 'Unable to sign in. Please try again.')
      setFormError(message)
      toast.error('Sign in failed', message)
    } finally {
      setSubmitting(false)
    }
  }

  const signUpLink = redirect ? `/signup?redirect=${encodeURIComponent(redirect)}` : '/signup'

  return (
    <div className="auth-card">
      <span className="auth-eyebrow">Welcome back</span>
      <h1>Sign in to your account</h1>
      <p className="auth-intro">
        Access your appointments, profile and favourite treatments.
      </p>

      {formError && (
        <div className="auth-alert" role="alert">
          <Icon name="alert-circle" size={17} />
          <span>{formError}</span>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormField
          id="signin-email"
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
          id="signin-password"
          label="Password"
          type="password"
          icon="lock"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          autoComplete="current-password"
          required
        />

        <div className="auth-inline-help">
          <span>Need help signing in?</span>
          <Link to="/contact">Contact the salon</Link>
        </div>

        <Button type="submit" loading={submitting} fullWidth size="lg">
          Sign in
        </Button>
      </form>

      <p className="auth-switch">
        New to NF Signature? <Link to={signUpLink}>Create an account</Link>
      </p>

      <p className="auth-note">
        <Icon name="shield" size={14} />
        Sign-in is verified by the SalonBook API. There are no demo credentials.
      </p>
    </div>
  )
}
