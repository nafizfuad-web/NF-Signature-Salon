// NF Signature Salon — admin API
//
// Endpoints served by the Express backend under /api/admin with JWT + admin role:
//   GET   /admin/dashboard
//   GET   /admin/bookings
//   PATCH /admin/bookings/:id/status
//   GET   /admin/payments
//   PATCH /admin/payments/:transactionId/cash-received
//   GET   /admin/customers
//   GET   /admin/customers/:id
//   PATCH /admin/customers/:id/block
//   GET   /admin/services
//   POST  /admin/services
//   PATCH /admin/services/:id
//   POST  /admin/services/:id/image
//   DELETE /admin/services/:id

import { apiDelete, apiGet, apiPatch, apiPost } from '@/services/api/client'
import type {
  AdminCustomerDetail,
  AdminDashboardData,
  AdminPaymentsResponse,
  AdminServicePayload,
  Appointment,
  AppointmentStatus,
  CustomerRecord,
  PaymentTransaction,
  ServiceItem,
} from '@/types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function extractData(payload: unknown): unknown {
  const record = asRecord(payload)
  return record.data ?? payload
}

function extractList<T>(payload: unknown, key: string): T[] {
  if (Array.isArray(payload)) return payload as T[]
  const record = asRecord(payload)
  if (Array.isArray(record.data)) return record.data as T[]
  if (Array.isArray(record[key])) return record[key] as T[]
  return []
}

export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const payload = await apiGet<unknown>('/admin/dashboard')
  const data = extractData(payload) as AdminDashboardData
  if (
    !data ||
    typeof data !== 'object' ||
    !data.stats ||
    typeof data.stats !== 'object' ||
    !Array.isArray(data.recentBookings) ||
    !Array.isArray(data.recentTransactions) ||
    !data.servicesByCategory ||
    typeof data.servicesByCategory !== 'object'
  ) {
    throw new Error('The server returned an unexpected admin dashboard response.')
  }
  return data
}

export async function fetchAdminBookings(): Promise<Appointment[]> {
  const payload = await apiGet<unknown>('/admin/bookings')
  return extractList<Appointment>(payload, 'bookings')
}

export async function updateBookingStatus(
  bookingId: string,
  status: AppointmentStatus
): Promise<Appointment> {
  const payload = await apiPatch<unknown>(`/admin/bookings/${encodeURIComponent(bookingId)}/status`, {
    status,
  })
  const record = asRecord(payload)
  return (record.booking ?? record.data ?? payload) as Appointment
}

export interface AdminPaymentFilters {
  method?: string
  status?: string
  q?: string
  limit?: number
}

export async function fetchAdminPayments(
  filters: AdminPaymentFilters = {}
): Promise<AdminPaymentsResponse> {
  const params = new URLSearchParams()
  if (filters.method) params.set('method', filters.method)
  if (filters.status) params.set('status', filters.status)
  if (filters.q?.trim()) params.set('q', filters.q.trim())
  if (filters.limit) params.set('limit', String(filters.limit))
  const query = params.toString()
  const payload = await apiGet<unknown>(`/admin/payments${query ? `?${query}` : ''}`)
  return extractData(payload) as AdminPaymentsResponse
}

export async function confirmCashReceived(
  transactionId: string
): Promise<{ transaction: PaymentTransaction; appointment?: Appointment }> {
  const payload = await apiPatch<unknown>(
    `/admin/payments/${encodeURIComponent(transactionId)}/cash-received`
  )
  const record = asRecord(payload)
  const data = asRecord(record.data ?? payload)
  return {
    transaction: (data.transaction ?? data) as PaymentTransaction,
    appointment: data.appointment as Appointment | undefined,
  }
}

export async function fetchAdminCustomers(search = ''): Promise<CustomerRecord[]> {
  const query = search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ''
  const payload = await apiGet<unknown>(`/admin/customers${query}`)
  return extractList<CustomerRecord>(payload, 'customers')
}

export async function fetchAdminCustomer(customerId: string): Promise<AdminCustomerDetail> {
  const payload = await apiGet<unknown>(`/admin/customers/${encodeURIComponent(customerId)}`)
  return extractData(payload) as AdminCustomerDetail
}

export async function setCustomerBlocked(
  customerId: string,
  blocked: boolean,
  reason?: string
): Promise<CustomerRecord> {
  const payload = await apiPatch<unknown>(
    `/admin/customers/${encodeURIComponent(customerId)}/block`,
    { blocked, ...(reason?.trim() ? { reason: reason.trim() } : {}) }
  )
  return extractData(payload) as CustomerRecord
}

export async function fetchAdminServices(filters: {
  q?: string
  category?: string
  active?: 'true' | 'false' | ''
} = {}): Promise<ServiceItem[]> {
  const params = new URLSearchParams()
  if (filters.q?.trim()) params.set('q', filters.q.trim())
  if (filters.category && filters.category !== 'all') params.set('category', filters.category)
  if (filters.active) params.set('active', filters.active)
  const query = params.toString()
  const payload = await apiGet<unknown>(`/admin/services${query ? `?${query}` : ''}`)
  return extractList<ServiceItem>(payload, 'services')
}

function servicePayloadToForm(
  payload: AdminServicePayload,
  image?: File | null
): FormData | AdminServicePayload {
  if (!image) return payload
  const form = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      form.append(key, JSON.stringify(value))
    } else if (value !== undefined) {
      form.append(key, String(value))
    }
  })
  form.append('image', image)
  return form
}

export async function createAdminService(
  payload: AdminServicePayload,
  image?: File | null
): Promise<ServiceItem> {
  const body = servicePayloadToForm(payload, image)
  const response = await apiPost<unknown>('/admin/services', body)
  return extractData(response) as ServiceItem
}

export async function updateAdminService(
  serviceId: string,
  payload: Partial<AdminServicePayload>,
  image?: File | null
): Promise<ServiceItem> {
  const definedPayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  ) as Partial<AdminServicePayload>
  let body: FormData | Partial<AdminServicePayload> = definedPayload
  if (image) {
    const form = new FormData()
    Object.entries(definedPayload).forEach(([key, value]) => {
      if (Array.isArray(value)) form.append(key, JSON.stringify(value))
      else if (value !== undefined) form.append(key, String(value))
    })
    form.append('image', image)
    body = form
  }
  const response = await apiPatch<unknown>(
    `/admin/services/${encodeURIComponent(serviceId)}`,
    body
  )
  return extractData(response) as ServiceItem
}

export async function uploadAdminServiceImage(
  serviceId: string,
  image: File
): Promise<ServiceItem> {
  const form = new FormData()
  form.append('image', image)
  const response = await apiPost<unknown>(
    `/admin/services/${encodeURIComponent(serviceId)}/image`,
    form
  )
  return extractData(response) as ServiceItem
}

export async function deleteAdminService(serviceId: string): Promise<{ id: string }> {
  const payload = await apiDelete<unknown>(`/admin/services/${encodeURIComponent(serviceId)}`)
  return extractData(payload) as { id: string }
}
