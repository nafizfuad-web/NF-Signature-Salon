// NF Signature Salon — customer account API
//
// Live endpoints served by the Express backend:
//   GET    /customers/me/dashboard
//   GET    /customers/me/appointments
//   PATCH  /customers/me
//   POST   /customers/me/avatar
//   DELETE /customers/me/avatar
//   PATCH  /appointments/:id/cancel
//
// Every request is authenticated and the server scopes it to the signed-in user.

import { apiDelete, apiGet, apiPatch, apiPost } from '@/services/api/client'
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

function extractUser(payload: unknown): AuthUser {
  const record = asRecord(payload)
  return (record.user ?? record.data ?? payload) as AuthUser
}

export async function fetchCustomerDashboard(): Promise<CustomerDashboardData> {
  const payload = await apiGet<unknown>('/customers/me/dashboard')
  const record = asRecord(payload)
  const data = asRecord(record.data)
  return (data.stats ? data : payload) as CustomerDashboardData
}

export async function fetchCustomerAppointments(): Promise<Appointment[]> {
  const payload = await apiGet<unknown>('/customers/me/appointments')
  return extractAppointments(payload)
}

export async function updateCustomerProfile(update: ProfileUpdate): Promise<AuthUser> {
  const payload = await apiPatch<unknown>('/customers/me', update)
  return extractUser(payload)
}

export async function uploadCustomerAvatar(file: File): Promise<AuthUser> {
  const form = new FormData()
  form.append('avatar', file)
  const payload = await apiPost<unknown>('/customers/me/avatar', form)
  return extractUser(payload)
}

export async function removeCustomerAvatar(): Promise<AuthUser> {
  const payload = await apiDelete<unknown>('/customers/me/avatar')
  return extractUser(payload)
}

export async function cancelCustomerAppointment(
  appointmentId: string
): Promise<Appointment> {
  const payload = await apiPatch<unknown>(
    `/appointments/${encodeURIComponent(appointmentId)}/cancel`
  )
  const record = asRecord(payload)
  return (record.data ?? payload) as Appointment
}
