import { useEffect, useRef, useState } from 'react'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import Skeleton from '@/components/common/Skeleton'
import AdminBookingsTable from '@/components/dashboard/AdminBookingsTable'
import AdminBookingModal from '@/components/dashboard/AdminBookingModal'
import AdminCard from '@/components/dashboard/AdminCard'
import AdminPageHeader from '@/components/dashboard/AdminPageHeader'
import AdminStatCard from '@/components/dashboard/AdminStatCard'
import { AdminPaymentStatus } from '@/components/dashboard/AdminStatusPill'
import DashboardAccessGate from '@/components/dashboard/DashboardAccessGate'
import TableSkeleton from '@/components/dashboard/TableSkeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import {
  fetchAdminDashboard,
  fetchAdminPayments,
  updateBookingStatus,
} from '@/services/api/admin'
import type {
  AdminDashboardData,
  Appointment,
  AppointmentStatus,
  PaymentTransaction,
} from '@/types'
import { getErrorMessage } from '@/utils/errors'
import { formatMoney, formatNumber } from '@/utils/format'

const METHOD_LABELS: Record<string, string> = {
  stripe: 'Card',
  bkash: 'bKash',
  nagad: 'Nagad',
  stripe_demo: 'Card',
  bkash_demo: 'bKash',
  nagad_demo: 'Nagad',
  pay_at_salon: 'Cash',
}

interface AdminDashboardView extends AdminDashboardData {
  totalRevenue: number
}

async function loadAdminDashboard(): Promise<AdminDashboardView> {
  const [dashboard, payments] = await Promise.all([
    fetchAdminDashboard(),
    fetchAdminPayments({ limit: 200 }).catch(() => null),
  ])

  const totalRevenue = payments
    ? payments.stats.realRevenueAmount + payments.stats.testSimulatedAmountTotal
    : 0

  return { ...dashboard, totalRevenue }
}

function AdminDashboardLoading() {
  return (
    <>
      <div className="admin-stats-grid" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="admin-stat-card" key={index}>
            <div className="admin-stat-copy">
              <Skeleton width="55%" height="11px" />
              <Skeleton width="45%" height="24px" className="skeleton-gap" />
            </div>
            <Skeleton width="42px" height="42px" />
          </div>
        ))}
      </div>
      <div className="admin-dashboard-grid">
        <AdminCard title="Recent Bookings" padded={false}>
          <div className="admin-card-pad">
            <TableSkeleton rows={6} columns={6} />
          </div>
        </AdminCard>
        <AdminCard title="Recent Transactions" padded={false}>
          <div className="admin-card-pad">
            <TableSkeleton rows={4} columns={4} />
          </div>
        </AdminCard>
      </div>
    </>
  )
}

function AdminDashboardContent() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { data, loading, error, refetch } = useApiResource<AdminDashboardView>(
    loadAdminDashboard,
    [user?.id]
  )
  const [selected, setSelected] = useState<Appointment | null>(null)
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
      await updateBookingStatus(bookingId, status)
      toast.success('Booking updated', `The booking is now ${status}.`)
      setSelected(null)
      refetch()
    } catch (caught) {
      toast.error('Could not update the booking', getErrorMessage(caught))
    } finally {
      setUpdating(null)
    }
  }

  const handleCancel = (appointment: Appointment) => {
    const name = appointment.customerName ?? 'this customer'
    if (!window.confirm(`Cancel the booking for ${name}?`)) return
    void handleStatusChange(appointment.id, 'cancelled')
  }

  const firstName = user?.name?.trim().split(/\s+/)[0] || 'Admin'

  return (
    <>
      <AdminPageHeader
        title="Admin Dashboard"
        description={`Welcome back, ${firstName}!`}
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
          <div className="admin-stats-grid">
            <AdminStatCard
              icon="calendar"
              label="Total Bookings"
              value={formatNumber(data.stats.totalAppointments)}
              hint={`↑ ${formatNumber(data.stats.todayBookings)} today`}
              hintTone={data.stats.todayBookings > 0 ? 'success' : 'muted'}
            />
            <AdminStatCard
              icon="users"
              label="Total Customers"
              value={formatNumber(data.stats.totalCustomers)}
            />
            <AdminStatCard
              icon="scissors"
              label="Total Services"
              value={formatNumber(data.stats.activeServices)}
            />
            <AdminStatCard
              icon="dollar"
              label="Total Revenue"
              value={formatMoney(data.totalRevenue)}
            />
          </div>

          <div className="admin-dashboard-grid">
            <AdminCard title="Recent Bookings" padded={false}>
              {data.recentBookings.length === 0 ? (
                <div className="admin-card-pad">
                  <EmptyState
                    icon="calendar"
                    title="No bookings yet"
                    description="New customer appointments will appear here."
                    compact
                  />
                </div>
              ) : (
                <AdminBookingsTable
                  appointments={data.recentBookings.slice(0, 7)}
                  onOpen={setSelected}
                  onCancel={handleCancel}
                  updatingId={updating?.id ?? null}
                  updatingStatus={updating?.status ?? null}
                />
              )}
            </AdminCard>

            <AdminCard title="Recent Transactions" padded={false}>
              {data.recentTransactions.length === 0 ? (
                <div className="admin-card-pad">
                  <EmptyState
                    icon="wallet"
                    title="No transactions yet"
                    description="Payment records will appear here."
                    compact
                  />
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table admin-transactions-table">
                    <caption className="sr-only">Recent payment transactions</caption>
                    <thead>
                      <tr>
                        <th scope="col">Method</th>
                        <th scope="col">Amount</th>
                        <th scope="col">Currency</th>
                        <th scope="col">Payment Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentTransactions.slice(0, 4).map((transaction: PaymentTransaction) => (
                        <tr key={transaction.id}>
                          <td>{METHOD_LABELS[transaction.paymentMethod] ?? transaction.paymentMethod}</td>
                          <td>{formatNumber(transaction.amount)}</td>
                          <td>{transaction.currency}</td>
                          <td>
                            <AdminPaymentStatus status={transaction.paymentStatus} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </AdminCard>
          </div>
        </>
      ) : (
        <ErrorState
          title="No dashboard data"
          message="The admin dashboard did not return any data. Please retry or check the API connection."
          onRetry={refetch}
        />
      )}

      {selected && (
        <AdminBookingModal
          appointment={selected}
          onClose={() => setSelected(null)}
          onStatusChange={(bookingId, status) => void handleStatusChange(bookingId, status)}
          updating={Boolean(updating)}
          updatingStatus={updating?.status ?? null}
        />
      )}
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
