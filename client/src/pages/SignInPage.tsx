import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '@/components/common/Button'
import FormField from '@/components/common/FormField'
import Icon from '@/components/common/Icon'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { GOOGLE_CLIENT_ID } from '@/services/config'
import type { AuthUser } from '@/types'
import {
  EMAIL_MAX_LENGTH,
  EMAIL_PATTERN,
  PASSWORD_MAX_BYTES,
  passwordByteLength,
} from '@/utils/authValidation'
import { getErrorMessage } from '@/utils/errors'

function safeRedirect(value: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null
  return value
}

function destinationFor(user: AuthUser, redirect: string | null): string {
  if (redirect) return redirect
  return user.role === 'admin' ? '/admin' : '/dashboard'
}

export default function SignInPage() {
  const { login, loginWithGoogle, isAuthenticated, isLoading: authLoading, user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = safeRedirect(searchParams.get('redirect'))

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [googleSubmitting, setGoogleSubmitting] = useState(false)
  // Guards against a second submit before React can render the disabled button.
  const submittingRef = useRef(false)
  const googleSubmittingRef = useRef(false)

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      navigate(destinationFor(user, redirect), { replace: true })
    }
  }, [authLoading, isAuthenticated, user, redirect, navigate])

  const validate = () => {
    const next: { email?: string; password?: string } = {}
    const cleanEmail = email.trim()

    if (!cleanEmail) next.email = 'Enter the email address for your account.'
    else if (cleanEmail.length > EMAIL_MAX_LENGTH) {
      next.email = 'Email address is too long.'
    } else if (!EMAIL_PATTERN.test(cleanEmail)) {
      next.email = 'Enter a valid email address.'
    }

    if (!password) next.password = 'Enter your password.'
    else if (passwordByteLength(password) > PASSWORD_MAX_BYTES) {
      next.password = `Password must be ${PASSWORD_MAX_BYTES} bytes or fewer.`
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submittingRef.current || googleSubmittingRef.current) return

    setFormError(null)
    if (!validate()) return

    submittingRef.current = true
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
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (googleSubmittingRef.current || submittingRef.current) return

    setFormError(null)
    googleSubmittingRef.current = true
    setGoogleSubmitting(true)
    try {
      const signedInUser = await loginWithGoogle()
      toast.success('Welcome back', `Signed in as ${signedInUser.email}.`)
      navigate(destinationFor(signedInUser, redirect), { replace: true })
    } catch (caught) {
      const message = getErrorMessage(caught, 'Unable to sign in with Google. Please try again.')
      setFormError(message)
      toast.error('Google sign-in failed', message)
    } finally {
      googleSubmittingRef.current = false
      setGoogleSubmitting(false)
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

        <Button
          type="submit"
          loading={submitting}
          disabled={googleSubmitting}
          fullWidth
          size="lg"
        >
          Sign in
        </Button>
      </form>

      {GOOGLE_CLIENT_ID && (
        <div className="auth-google-section">
          <div className="auth-divider"><span>or</span></div>
          <Button
            variant="outline"
            size="lg"
            fullWidth
            loading={googleSubmitting}
            disabled={submitting}
            leftIcon={<span className="auth-google-mark" aria-hidden="true">G</span>}
            onClick={() => void handleGoogleSignIn()}
          >
            Continue with Google
          </Button>
        </div>
      )}

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
