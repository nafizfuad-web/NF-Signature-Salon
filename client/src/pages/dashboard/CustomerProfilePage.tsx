import { useState } from 'react'
import type { FormEvent } from 'react'
import Button from '@/components/common/Button'
import FormField from '@/components/common/FormField'
import Icon from '@/components/common/Icon'
import DashboardAccessGate from '@/components/dashboard/DashboardAccessGate'
import DashboardCard from '@/components/dashboard/DashboardCard'
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { updateCustomerProfile } from '@/services/api/customer'
import { formatDate, getInitials } from '@/utils/format'
import { getErrorMessage } from '@/utils/errors'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function CustomerProfileContent() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  if (!user) return null

  const validate = () => {
    const next: { name?: string; email?: string; phone?: string } = {}
    if (name.trim().length < 2) next.name = 'Enter your full name.'
    if (!email.trim()) next.email = 'Enter your email address.'
    else if (!EMAIL_PATTERN.test(email.trim())) next.email = 'Enter a valid email address.'
    if (phone.trim() && phone.replace(/[^\d]/g, '').length < 7) {
      next.phone = 'Enter a valid phone number, or leave this blank.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    if (!validate()) return

    setSaving(true)
    try {
      const updated = await updateCustomerProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
      })
      updateUser(updated)
      toast.success('Profile updated', 'Your account details have been saved.')
    } catch (caught) {
      const message = getErrorMessage(caught, 'Unable to save your profile.')
      setFormError(message)
      toast.error('Could not save your profile', message)
    } finally {
      setSaving(false)
    }
  }

  const initials = getInitials(user.name)

  return (
    <>
      <DashboardPageHeader
        eyebrow="Your account"
        title="My profile"
        description="Keep your contact details up to date so the salon can reach you about appointments."
      />

      <div className="dashboard-grid dashboard-grid-profile">
        <DashboardCard title="Personal details" description="These details are used for your bookings.">
          {formError && (
            <div className="auth-alert" role="alert">
              <Icon name="alert-circle" size={17} />
              <span>{formError}</span>
            </div>
          )}

          <form className="profile-form" onSubmit={handleSubmit} noValidate>
            <FormField
              id="profile-name"
              label="Full name"
              icon="user"
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={errors.name}
              autoComplete="name"
              required
            />
            <FormField
              id="profile-email"
              label="Email address"
              type="email"
              icon="mail"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={errors.email}
              autoComplete="email"
              required
            />
            <FormField
              id="profile-phone"
              label="Phone number (optional)"
              type="tel"
              icon="phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              error={errors.phone}
              autoComplete="tel"
            />

            <div className="profile-form-actions">
              <Button type="submit" loading={saving} leftIcon={<Icon name="check" size={16} />}>
                Save changes
              </Button>
              <span className="form-hint">Changes are saved to your SalonBook account.</span>
            </div>
          </form>
        </DashboardCard>

        <DashboardCard title="Account summary">
          <div className="account-summary">
            <span className="account-avatar" aria-hidden="true">{initials}</span>
            <div className="account-summary-copy">
              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <span className="badge badge-gold">
                {user.role === 'admin' ? 'Administrator' : 'Customer'}
              </span>
            </div>
          </div>

          <dl className="account-facts">
            <div>
              <dt>Member since</dt>
              <dd>{user.createdAt ? formatDate(user.createdAt) : '—'}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{user.phone || 'Not provided'}</dd>
            </div>
            <div>
              <dt>Sign-in security</dt>
              <dd>Managed by the salon API</dd>
            </div>
          </dl>

          <p className="account-note">
            <Icon name="shield" size={15} />
            Your password is never stored by this website.
          </p>
        </DashboardCard>
      </div>
    </>
  )
}

export default function CustomerProfilePage() {
  return (
    <DashboardAccessGate>
      <CustomerProfileContent />
    </DashboardAccessGate>
  )
}
