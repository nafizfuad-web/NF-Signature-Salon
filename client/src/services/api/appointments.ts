// NF Signature Salon — appointment booking API
//
// Endpoint expected from the Express backend:
//   POST /appointments
//   Body: { serviceId, date, time, name, email, phone, notes? }
//
// While VITE_USE_MOCK_DATA is enabled the booking is answered with a clearly
// marked DEMO record so the confirmation screen can be previewed. A demo record
// is never presented as a database save: the UI labels it explicitly and no
// appointment is persisted. Set VITE_USE_MOCK_DATA=false to call the real API.

import { apiPost } from '@/services/api/client'
import { USE_MOCK_DATA } from '@/services/config'
import { mockDelay } from '@/services/mockData'
import type { Appointment, CreateAppointmentPayload } from '@/types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function normalizeAppointment(payload: unknown): Appointment {
  const record = asRecord(payload)
  const appointment = asRecord(record.appointment ?? record.data ?? payload)
  return appointment as unknown as Appointment
}

/**
 * Requests a new appointment.
 *
 * In mock mode this resolves to a demo appointment (not persisted). In API mode
 * it resolves to whatever the backend created, so the returned record is the
 * only source of truth for the confirmation.
 */
export async function createAppointment(
  payload: CreateAppointmentPayload
): Promise<Appointment> {
  if (USE_MOCK_DATA) {
    await mockDelay(650)
    return {
      id: `demo-${Date.now()}`,
      serviceId: payload.serviceId,
      serviceTitle: payload.serviceTitle,
      date: payload.date,
      time: payload.time,
      duration: payload.duration,
      price: payload.price,
      status: 'pending',
      notes: payload.notes,
      customerName: payload.name,
      customerEmail: payload.email,
      createdAt: new Date().toISOString(),
    }
  }

  const response = await apiPost<unknown>('/appointments', payload)
  return normalizeAppointment(response)
}

/** True when the confirmation shown to the customer is a non-persisted demo. */
export const BOOKING_IS_DEMO = USE_MOCK_DATA
