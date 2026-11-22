// NF Signature Salon — TEST payment API
//
// All endpoints are simulated TEST payments only. No real gateway is called.

import { apiGet, apiPost } from '@/services/api/client'
import type {
  Appointment,
  AppointmentPaymentState,
  PaymentMethodsResponse,
  PaymentMethodId,
  PaymentSimulationOutcome,
  PaymentTransaction,
} from '@/types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function extractData(payload: unknown): unknown {
  const record = asRecord(payload)
  return record.data ?? payload
}

function extractTransaction(payload: unknown): PaymentTransaction {
  const record = asRecord(payload)
  const data = asRecord(record.data ?? payload)
  return (data.transaction ?? data) as PaymentTransaction
}

export async function fetchPaymentMethods(): Promise<PaymentMethodsResponse> {
  const payload = await apiGet<unknown>('/payments/methods')
  return extractData(payload) as PaymentMethodsResponse
}

export async function createPaymentSession(
  appointmentId: string,
  method: PaymentMethodId
): Promise<{ transaction: PaymentTransaction; idempotentReplay: boolean }> {
  const payload = await apiPost<unknown>(
    `/payments/appointments/${encodeURIComponent(appointmentId)}/sessions`,
    { method }
  )
  const record = asRecord(payload)
  return {
    transaction: extractTransaction(payload),
    idempotentReplay: record.idempotentReplay === true,
  }
}

export async function fetchAppointmentPayment(
  appointmentId: string
): Promise<AppointmentPaymentState> {
  const payload = await apiGet<unknown>(
    `/payments/appointments/${encodeURIComponent(appointmentId)}`
  )
  return extractData(payload) as AppointmentPaymentState
}

export async function fetchMyPaymentTransactions(): Promise<PaymentTransaction[]> {
  const payload = await apiGet<unknown>('/payments/me/transactions')
  const data = extractData(payload)
  if (Array.isArray(data)) return data as PaymentTransaction[]
  const record = asRecord(data)
  return Array.isArray(record.transactions)
    ? (record.transactions as PaymentTransaction[])
    : []
}

export async function simulatePaymentOutcome(
  transactionId: string,
  outcome: PaymentSimulationOutcome
): Promise<{ transaction: PaymentTransaction; appointment?: Appointment }> {
  const payload = await apiPost<unknown>(
    `/payments/transactions/${encodeURIComponent(transactionId)}/simulate`,
    { outcome }
  )
  const record = asRecord(payload)
  const data = asRecord(record.data ?? payload)
  return {
    transaction: (data.transaction ?? data) as PaymentTransaction,
    appointment: data.appointment as Appointment | undefined,
  }
}
