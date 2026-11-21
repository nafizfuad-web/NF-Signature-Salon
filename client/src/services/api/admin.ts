// NF Signature Salon — admin API
//
// Endpoints expected from the Express backend:
//   GET   /admin/dashboard
//   GET   /admin/bookings
//   PATCH /admin/bookings/:id/status
//   GET   /admin/customers
//
// The admin routes are role-gated on the client and must also be protected by
// JWT + role middleware on the server.

import { apiGet, apiPatch } from '@/services/api/client'
import { USE_MOCK_DATA } from '@/services/config'
import {
  mockAdminBookings,
  mockAdminDashboard,
  mockCustomers,
  mockDelay,
} from '@/services/mockData'
import type {
  AdminDashboardData,
  Appointment,
  AppointmentStatus,
  CustomerRecord,
} from '@/types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function extractList<T>(payload: unknown, key: string): T[] {
  if (Array.isArray(payload)) return payload as T[]
  const record = asRecord(payload)
  if (Array.isArray(record.data)) return record.data as T[]
  if (Array.isArray(record[key])) return record[key] as T[]
  return []
}

export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  if (USE_MOCK_DATA) {
    await mockDelay()
    return mockAdminDashboard
  }

  const payload = await apiGet<unknown>('/admin/dashboard')
  const record = asRecord(payload)
  const data = asRecord(record.data)
  return (data.stats ? data : payload) as AdminDashboardData
}

export async function fetchAdminBookings(): Promise<Appointment[]> {
  if (USE_MOCK_DATA) {
    await mockDelay()
    return mockAdminBookings
  }

  const payload = await apiGet<unknown>('/admin/bookings')
  return extractList<Appointment>(payload, 'bookings')
}

export async function updateBookingStatus(
  bookingId: string,
  status: AppointmentStatus
): Promise<Appointment> {
  if (USE_MOCK_DATA) {
    await mockDelay(250)
    const existing = mockAdminBookings.find((booking) => booking.id === bookingId)
    if (!existing) {
      throw new Error('We could not find that booking.')
    }
    return { ...existing, status }
  }

  const payload = await apiPatch<unknown>(`/admin/bookings/${encodeURIComponent(bookingId)}/status`, {
    status,
  })
  const record = asRecord(payload)
  return (record.booking ?? record.data ?? payload) as Appointment
}

export async function fetchAdminCustomers(): Promise<CustomerRecord[]> {
  if (USE_MOCK_DATA) {
    await mockDelay()
    return mockCustomers
  }

  const payload = await apiGet<unknown>('/admin/customers')
  return extractList<CustomerRecord>(payload, 'customers')
}
