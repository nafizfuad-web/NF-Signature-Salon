import { useState } from 'react'
import type { FormEvent } from 'react'
import Button from '@/components/common/Button'
import AdminCard from '@/components/dashboard/AdminCard'
import DashboardAccessGate from '@/components/dashboard/DashboardAccessGate'
import { CustomerProfileContent } from '@/pages/dashboard/CustomerProfilePage'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { changePassword } from '@/services/api/auth'
import { getErrorMessage } from '@/utils/errors'

function AdminProfileContent() {
  const { applySession } = useAuth()
  const { toast } = useToast()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    if (!currentPassword) return setError('Enter your current password.')
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      return setError('New password must be 8-72 characters and include a letter and a number.')
    }
    if (newPassword !== confirmPassword) return setError('New passwords do not match.')
    setSaving(true)
    try {
      const response = await changePassword(currentPassword, newPassword)
      applySession(response.token, response.user)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Password updated', 'Your admin password has been changed.')
    } catch (caught) {
      const message = getErrorMessage(caught, 'Unable to change password.')
      setError(message)
      toast.error('Could not change password', message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <CustomerProfileContent
        title="Profile"
        description="Manage your administrator account details, profile picture and password."
        eyebrow=""
      />
      <AdminCard title="Change password" description="Use a strong password for your admin account.">
        {error && (
          <div className="auth-alert" role="alert">
            <span>{error}</span>
          </div>
        )}
        <form className="profile-form admin-form" onSubmit={handleSubmit} noValidate>
          <label className="form-field">
            <span>Current password</span>
            <input
              className="form-input"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
          </label>
          <label className="form-field">
            <span>New password</span>
            <input
              className="form-input"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
          </label>
          <label className="form-field">
            <span>Confirm new password</span>
            <input
              className="form-input"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </label>
          <div className="profile-form-actions">
            <Button type="submit" loading={saving}>Change password</Button>
          </div>
        </form>
      </AdminCard>
    </>
  )
}

export default function AdminProfilePage() {
  return (
    <DashboardAccessGate role="admin">
      <AdminProfileContent />
    </DashboardAccessGate>
  )
}
