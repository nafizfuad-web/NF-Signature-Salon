// NF Signature Salon — appointment booking API
//
// The backend persists the appointment in MongoDB and is the only source of
// truth for availability, conflicts and status changes.

import { apiPost } from '@/services/api/client'
import type { Appointment, CreateAppointmentPayload } from '@/types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function normalizeAppointment(payload: unknown): Appointment {
  const record = asRecord(payload)
  const appointment = asRecord(record.appointment ?? record.data ?? payload)
  return appointment as unknown as Appointment
}

/** Requests a new appointment for the signed-in customer. */
export async function createAppointment(
  payload: CreateAppointmentPayload
): Promise<Appointment> {
  const response = await apiPost<unknown>('/appointments', payload)
  return normalizeAppointment(response)
}
