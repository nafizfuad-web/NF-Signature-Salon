import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import ButtonLink from '@/components/common/ButtonLink'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import Icon from '@/components/common/Icon'
import Skeleton from '@/components/common/Skeleton'
import AppointmentTable from '@/components/dashboard/AppointmentTable'
import DashboardAccessGate from '@/components/dashboard/DashboardAccessGate'
import DashboardCard from '@/components/dashboard/DashboardCard'
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader'
import StatCard from '@/components/dashboard/StatCard'
import TableSkeleton from '@/components/dashboard/TableSkeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { fetchCustomerDashboard } from '@/services/api/customer'
import type { CustomerDashboardData } from '@/types'
import { CATEGORY_META } from '@/components/services/categoryMeta'
import { formatDate } from '@/utils/format'

function NextAppointment({ data }: { data: CustomerDashboardData }) {
  const appointment = data.nextAppointment

  if (!appointment) {
    return (
      <EmptyState
        icon="calendar"
        title="No upcoming appointments"
        description="Find a treatment you love and reserve your next visit."
        action={<ButtonLink to="/services" variant="outline" size="sm">Browse services</ButtonLink>}
        compact
      />
    )
  }

  return (
    <div className="next-appointment">
      <div className="next-appointment-date">
        <span>{new Date(`${appointment.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short' })}</span>
        <strong>{new Date(`${appointment.date}T00:00:00`).getDate()}</strong>
      </div>
      <div className="next-appointment-copy">
        <span className="next-appointment-label">Up next</span>
        <h3>{appointment.serviceTitle}</h3>
        <p>
          {formatDate(appointment.date)} at {appointment.time}
          {appointment.staffName ? ` with ${appointment.staffName}` : ''}
        </p>
        <Link to="/dashboard/appointments" className="table-action-link">
          View appointment
          <Icon name="arrow-right" size={14} />
        </Link>
      </div>
    </div>
  )
}

function CustomerDashboardLoading() {
  return (
    <>
      <div className="stats-grid" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="stat-card" key={index}>
            <Skeleton width="38px" height="38px" />
            <div className="stat-card-skeleton-copy">
              <Skeleton width="70%" height="10px" />
              <Skeleton width="42%" height="24px" className="skeleton-gap" />
            </div>
          </div>
        ))}
      </div>
      <div className="dashboard-grid dashboard-grid-2">
        <DashboardCard title="Next appointment">
          <Skeleton width="100%" height="104px" />
        </DashboardCard>
        <DashboardCard title="Quick actions">
          <Skeleton width="100%" height="104px" />
        </DashboardCard>
      </div>
      <DashboardCard title="Recent appointments">
        <TableSkeleton rows={3} columns={5} />
      </DashboardCard>
    </>
  )
}

function CustomerDashboardContent() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { data, loading, error, refetch } = useApiResource<CustomerDashboardData>(
    () => fetchCustomerDashboard(),
    [user?.id]
  )
  const lastError = useRef<string | null>(null)

  useEffect(() => {
    if (error && lastError.current !== error) {
      lastError.current = error
      toast.error('Could not load your dashboard', error)
    }
  }, [error, toast])

  const firstName = user?.name.split(' ')[0] ?? 'there'

  return (
    <>
      <DashboardPageHeader
        eyebrow="Your account"
        title={`Welcome back, ${firstName}`}
        description="Here is what is coming up and how your salon visits are going."
        actions={
          <ButtonLink to="/services" variant="primary" rightIcon={<Icon name="arrow-right" size={16} />}>
            Book a treatment
          </ButtonLink>
        }
      />

      {loading ? (
        <CustomerDashboardLoading />
      ) : error ? (
        <ErrorState
          title="We couldn't load your dashboard"
          message={error}
          onRetry={refetch}
        />
      ) : data ? (
        <>
          <div className="stats-grid">
            <StatCard
              icon="calendar"
              label="Upcoming appointments"
              value={data.stats.upcoming}
              hint="Ready and waiting"
              accent
            />
            <StatCard
              icon="check"
              label="Completed visits"
              value={data.stats.completed}
              hint="Treatments finished"
            />
            <StatCard
              icon="star"
              label="Total visits"
              value={data.stats.visits}
              hint="Since joining"
            />
            <StatCard
              icon="heart"
              label="Favourite category"
              value={data.stats.favouriteCategory ? CATEGORY_META[data.stats.favouriteCategory].label : '—'}
              hint="Based on your visits"
            />
          </div>

          <div className="dashboard-grid dashboard-grid-2">
            <DashboardCard
              title="Next appointment"
              description="Your nearest confirmed or pending visit."
            >
              <NextAppointment data={data} />
            </DashboardCard>

            <DashboardCard
              title="Quick actions"
              description="Everything you need for your next visit."
            >
              <div className="quick-actions">
                <Link to="/services" className="quick-action">
                  <span className="quick-action-icon"><Icon name="sparkles" size={18} /></span>
                  <span>
                    <strong>Browse the menu</strong>
                    <small>Find your next treatment</small>
                  </span>
                  <Icon name="chevron-right" size={16} />
                </Link>
                <Link to="/dashboard/appointments" className="quick-action">
                  <span className="quick-action-icon"><Icon name="calendar" size={18} /></span>
                  <span>
                    <strong>My appointments</strong>
                    <small>Check dates and status</small>
                  </span>
                  <Icon name="chevron-right" size={16} />
                </Link>
                <Link to="/dashboard/profile" className="quick-action">
                  <span className="quick-action-icon"><Icon name="user" size={18} /></span>
                  <span>
                    <strong>My profile</strong>
                    <small>Keep your details current</small>
                  </span>
                  <Icon name="chevron-right" size={16} />
                </Link>
              </div>
            </DashboardCard>
          </div>

          <DashboardCard
            title="Recent appointments"
            description="Your latest visits and requests."
            action={<Link to="/dashboard/appointments" className="dashboard-card-link">View all</Link>}
            padded={false}
          >
            <AppointmentTable appointments={data.recentAppointments} variant="customer" />
          </DashboardCard>
        </>
      ) : (
        <EmptyState
          icon="calendar"
          title="Your dashboard is ready"
          description="Book your first treatment to start building your visit history."
          action={<ButtonLink to="/services" variant="outline">Browse services</ButtonLink>}
        />
      )}
    </>
  )
}

export default function CustomerDashboardPage() {
  return (
    <DashboardAccessGate>
      <CustomerDashboardContent />
    </DashboardAccessGate>
  )
}
