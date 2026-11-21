import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import ButtonLink from '@/components/common/ButtonLink'
import EmptyState from '@/components/common/EmptyState'
import LoadingState from '@/components/common/LoadingState'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types'

interface DashboardAccessGateProps {
  children: ReactNode
  role?: UserRole
}

export default function DashboardAccessGate({
  children,
  role,
}: DashboardAccessGateProps) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingState label="Checking your session…" />
  }

  if (!user) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`)
    return (
      <EmptyState
        icon="lock"
        title="Sign in to view this dashboard"
        description="Your appointments, profile details and preferences are private to your account."
        action={
          <div className="gate-actions">
            <ButtonLink to={`/signin?redirect=${redirect}`} variant="primary">
              Sign in
            </ButtonLink>
            <ButtonLink to="/signup" variant="outline">
              Create an account
            </ButtonLink>
          </div>
        }
      />
    )
  }

  if (role && user.role !== role) {
    return (
      <EmptyState
        icon="shield"
        title="This area is for administrators"
        description="Your account does not have permission to open the admin workspace. If you believe this is a mistake, contact the salon team."
        action={
          <ButtonLink to={user.role === 'admin' ? '/admin' : '/dashboard'} variant="outline">
            Go to my dashboard
          </ButtonLink>
        }
      />
    )
  }

  return <>{children}</>
}
