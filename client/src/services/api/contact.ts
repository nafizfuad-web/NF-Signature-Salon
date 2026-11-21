import { apiPost } from '@/services/api/client'

export interface ContactMessage {
  name: string
  email: string
  message: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export async function sendContactMessage(message: ContactMessage): Promise<void> {
  const payload = await apiPost<unknown>('/contact', message, { auth: false })
  const response = isRecord(payload) && isRecord(payload.data) ? payload.data : payload
  if (!isRecord(response) || response.success !== true) {
    throw new Error('The contact service did not confirm delivery. Please try again later.')
  }
}
