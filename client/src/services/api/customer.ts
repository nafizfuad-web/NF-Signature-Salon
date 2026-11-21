// NF Signature Salon — customer account API
//
// Endpoints expected from the Express backend:
//   GET   /customers/me/dashboard
//   GET   /customers/me/appointments
//   PATCH /customers/me
//
// Catalog-style dashboard data uses development fixtures while
// VITE_USE_MOCK_DATA is enabled. Profile updates always call the API.

import { apiGet, apiPatch } from '@/services/api/client'
import { USE_MOCK_DATA } from '@/services/config'
import { mockAppointments, mockCustomerDashboard, mockDelay } from '@/services/mockData'
import type {
  Appointment,
  AuthUser,
  CustomerDashboardData,
  ProfileUpdate,
} from '@/types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function extractAppointments(payload: unknown): Appointment[] {
  if (Array.isArray(payload)) return payload as Appointment[]
  const record = asRecord(payload)
  if (Array.isArray(record.data)) return record.data as Appointment[]
  if (Array.isArray(record.appointments)) return record.appointments as Appointment[]
  return []
}

export async function fetchCustomerDashboard(): Promise<CustomerDashboardData> {
  if (USE_MOCK_DATA) {
    await mockDelay()
    return mockCustomerDashboard
  }

  const payload = await apiGet<unknown>('/customers/me/dashboard')
  const record = asRecord(payload)
  const data = asRecord(record.data)
  return (data.stats ? data : payload) as CustomerDashboardData
}

export async function fetchCustomerAppointments(): Promise<Appointment[]> {
  if (USE_MOCK_DATA) {
    await mockDelay()
    return mockAppointments
  }

  const payload = await apiGet<unknown>('/customers/me/appointments')
  return extractAppointments(payload)
}

export async function updateCustomerProfile(update: ProfileUpdate): Promise<AuthUser> {
  const payload = await apiPatch<unknown>('/customers/me', update)
  const record = asRecord(payload)
  return (record.user ?? record.data ?? payload) as AuthUser
}
