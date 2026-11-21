// NF Signature Salon — error message helpers

import { isApiError } from '@/services/api/client'

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.'

export function getErrorMessage(
  error: unknown,
  fallback = FALLBACK_MESSAGE
): string {
  if (isApiError(error)) {
    if (error.message && error.message !== 'Failed to fetch') return error.message
    if (error.status === 401) return 'Please sign in to continue.'
    if (error.status === 403) return 'You do not have permission to do that.'
    if (error.status === 404) return 'We could not find what you were looking for.'
    if (error.status === 409) return 'That account or record already exists.'
    if (error.status === 422) return 'Please check the highlighted fields and try again.'
    if (error.status === 429) return 'Too many attempts. Please wait a moment and try again.'
    if (error.status && error.status >= 500) {
      return 'The server is unavailable right now. Please try again shortly.'
    }
    return fallback
  }

  if (error instanceof TypeError) {
    return 'Unable to reach the server. Please check your connection and try again.'
  }

  if (error instanceof Error && error.message) return error.message
  return fallback
}

export function getErrorStatus(error: unknown): number | undefined {
  return isApiError(error) ? error.status : undefined
}
