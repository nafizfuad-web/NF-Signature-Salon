import { apiGet, buildQuery } from '@/services/api/client'
import { SALON_LOCATION } from '@/services/salonConfig'

export interface AvailabilityQuery {
  serviceId: string
  date: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function extractSlots(payload: unknown): string[] {
  let value: unknown = payload
  if (isRecord(value)) {
    if ('data' in value) value = value.data
    if (isRecord(value)) value = value.availableSlots ?? value.slots
    if (isRecord(value)) value = value.availableSlots ?? value.slots
  }
  if (!Array.isArray(value)) {
    throw new Error('The availability service returned an invalid response.')
  }

  return value.map((slot) => {
    if (typeof slot === 'string' && slot.trim()) return slot
    if (isRecord(slot) && typeof slot.time === 'string' && slot.time.trim()) return slot.time
    throw new Error('The availability service returned an invalid time slot.')
  })
}

export async function fetchAvailableSlots({
  serviceId,
  date,
}: AvailabilityQuery): Promise<string[]> {
  // The server enforces opening days, service duration and existing bookings
  // before it returns any slot; the client never invents availability.
  const query = buildQuery({
    serviceId,
    date,
    location: SALON_LOCATION.displayAddress,
  })

  const payload = await apiGet<unknown>(`/appointments/availability${query}`)
  return extractSlots(payload)
}
