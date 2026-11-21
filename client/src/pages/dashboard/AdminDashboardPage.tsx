import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ButtonLink from '@/components/common/ButtonLink'
import ErrorState from '@/components/common/ErrorState'
import Icon from '@/components/common/Icon'
import Skeleton from '@/components/common/Skeleton'
import AppointmentTable from '@/components/dashboard/AppointmentTable'
import DashboardAccessGate from '@/components/dashboard/DashboardAccessGate'
import DashboardCard from '@/components/dashboard/DashboardCard'
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader'
import StatCard from '@/components/dashboard/StatCard'
import TableSkeleton from '@/components/dashboard/TableSkeleton'
import { CATEGORY_OPTIONS } from '@/components/services/categoryMeta'
import { useApiResource } from '@/hooks/useApiResource'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import {
  fetchAdminDashboard,
  updateBookingStatus,
} from '@/services/api/admin'
import type {
  AdminDashboardData,
  AppointmentStatus,
} from '@/types'
import { getErrorMessage } from '@/utils/errors'

function AdminDashboardLoading() {
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
        <DashboardCard title="Recent bookings">
          <TableSkeleton rows={4} columns={5} />
        </DashboardCard>
        <DashboardCard title="Service mix">
          <Skeleton width="100%" height="150px" />
        </DashboardCard>
      </div>
    </>
  )
}

function AdminDashboardContent() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { data, loading, error, refetch, setData } = useApiResource<AdminDashboardData>(
    () => fetchAdminDashboard(),
    [user?.id]
  )
  const [updating, setUpdating] = useState<{ id: string; status: AppointmentStatus } | null>(null)
  const lastError = useRef<string | null>(null)

  useEffect(() => {
    if (error && lastError.current !== error) {
      lastError.current = error
      toast.error('Could not load the admin dashboard', error)
    }
  }, [error, toast])

  const handleStatusChange = async (bookingId: string, status: AppointmentStatus) => {
    setUpdating({ id: bookingId, status })
    try {
      const updated = await updateBookingStatus(bookingId, status)
      setData((current) => {
        if (!current) return current
        const wasPending = current.recentBookings.find(
          (booking) => booking.id === bookingId && booking.status === 'pending'
        )
        return {
          ...current,
          recentBookings: current.recentBookings.map((booking) =>
            booking.id === bookingId ? { ...booking, ...updated, status } : booking
          ),
          stats: {
            ...current.stats,
            pendingBookings: wasPending
              ? Math.max(0, current.stats.pendingBookings - 1)
              : current.stats.pendingBookings,
          },
        }
      })
      toast.success(
        'Booking updated',
        `The booking is now ${status}.`
      )
    } catch (caught) {
      toast.error('Could not update the booking', getErrorMessage(caught))
    } finally {
      setUpdating(null)
    }
  }

  const serviceMixTotal = data
    ? Object.values(data.servicesByCategory).reduce((total, count) => total + count, 0)
    : 0

  return (
    <>
      <DashboardPageHeader
        eyebrow="Salon overview"
        title="Today at a glance"
        description="Keep an eye on bookings, services and customer activity."
        actions={
          <ButtonLink to="/admin/bookings" variant="primary" rightIcon={<Icon name="arrow-right" size={16} />}>
            Manage bookings
          </ButtonLink>
        }
      />

      {loading ? (
        <AdminDashboardLoading />
      ) : error ? (
        <ErrorState
          title="We couldn't load the admin dashboard"
          message={error}
          onRetry={refetch}
        />
      ) : data ? (
        <>
          <div className="stats-grid">
            <StatCard
              icon="calendar"
              label="Today's bookings"
              value={data.stats.todayBookings}
              hint="Scheduled for today"
              accent
            />
            <StatCard
              icon="clock"
              label="Pending requests"
              value={data.stats.pendingBookings}
              hint="Awaiting confirmation"
            />
            <StatCard
              icon="briefcase"
              label="Active services"
              value={data.stats.activeServices}
              hint="On the public menu"
            />
            <StatCard
              icon="users"
              label="Registered customers"
              value={data.stats.totalCustomers}
              hint="Accounts on file"
            />
          </div>

          <div className="dashboard-grid dashboard-grid-admin">
            <DashboardCard
              title="Recent bookings"
              description="The latest requests from customers."
              action={<Link to="/admin/bookings" className="dashboard-card-link">View all</Link>}
              padded={false}
            >
              <AppointmentTable
                appointments={data.recentBookings}
                variant="admin"
                onStatusChange={handleStatusChange}
                updatingId={updating?.id ?? null}
                updatingStatus={updating?.status ?? null}
              />
            </DashboardCard>

            <DashboardCard
              title="Service mix"
              description="Active treatments by category."
            >
              <div className="category-bars">
                {CATEGORY_OPTIONS.map((option) => {
                  const count = data.servicesByCategory[option.id] ?? 0
                  const percentage = serviceMixTotal > 0 ? Math.round((count / serviceMixTotal) * 100) : 0
                  return (
                    <div className="category-bar" key={option.id}>
                      <div className="category-bar-top">
                        <span>
                          <Icon name={option.icon} size={14} />
                          {option.label}
                        </span>
                        <strong>{count}</strong>
                      </div>
                      <div className="category-bar-track" aria-hidden="true">
                        <span style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="category-bar-percent">{percentage}% of the menu</span>
                    </div>
                  )
                })}
              </div>

              <Link to="/admin/services" className="dashboard-card-link dashboard-card-link-block">
                Manage services
                <Icon name="arrow-right" size={14} />
              </Link>
            </DashboardCard>
          </div>

          <div className="dashboard-quick-links">
            <Link to="/admin/bookings" className="quick-action">
              <span className="quick-action-icon"><Icon name="calendar" size={18} /></span>
              <span>
                <strong>Bookings</strong>
                <small>Confirm, complete or cancel requests</small>
              </span>
              <Icon name="chevron-right" size={16} />
            </Link>
            <Link to="/admin/services" className="quick-action">
              <span className="quick-action-icon"><Icon name="briefcase" size={18} /></span>
              <span>
                <strong>Services</strong>
                <small>Review the active treatment menu</small>
              </span>
              <Icon name="chevron-right" size={16} />
            </Link>
            <Link to="/admin/customers" className="quick-action">
              <span className="quick-action-icon"><Icon name="users" size={18} /></span>
              <span>
                <strong>Customers</strong>
                <small>See who is booking with the salon</small>
              </span>
              <Icon name="chevron-right" size={16} />
            </Link>
          </div>
        </>
      ) : null}
    </>
  )
}

export default function AdminDashboardPage() {
  return (
    <DashboardAccessGate role="admin">
      <AdminDashboardContent />
    </DashboardAccessGate>
  )
}
