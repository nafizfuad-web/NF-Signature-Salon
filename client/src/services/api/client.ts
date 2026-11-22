// NF Signature Salon — Centralized API client
//
// Prepared for the separate Express backend. Uses the native fetch API so no
// extra HTTP library is required. All request URLs are built from the
// VITE_API_BASE_URL environment variable (see client/.env.example).
//
// Auth tokens are attached automatically when the user is signed in. Public
// endpoints simply ignore the header if no token is present.

import { API_BASE_URL } from '@/services/config'
import { getStoredToken } from '@/services/authStorage'

export interface ApiError extends Error {
  status?: number
  details?: unknown
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  /** Set to false for public endpoints such as sign-in and sign-up. */
  auth?: boolean
}

function createApiError(
  message: string,
  status?: number,
  details?: unknown
): ApiError {
  const error: ApiError = new Error(message)
  error.status = status
  error.details = details
  return error
}

function readMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined
  const record = payload as Record<string, unknown>
  const candidate = record.message ?? record.error ?? record.detail
  return typeof candidate === 'string' && candidate.trim() ? candidate : undefined
}

async function handleResponse<T>(
  response: Response,
  requestToken: string | null
): Promise<T> {
  const text = await response.text()
  let payload: unknown

  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = text
    }
  }

  if (!response.ok) {
    const message =
      readMessage(payload) ||
      (response.status === 401
        ? 'Your session has expired. Please sign in again.'
        : `Request failed (${response.status} ${response.statusText})`)

    // Let AuthProvider know that the token used for this request is no longer
    // valid. Only invalidate that exact token: a slow 401 from an older request
    // must never clear a newer session created by a successful login.
    if (
      response.status === 401 &&
      requestToken &&
      getStoredToken() === requestToken
    ) {
      window.dispatchEvent(new Event('nf:unauthorized'))
    }

    throw createApiError(message, response.status, payload)
  }

  return payload as T
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { body, auth = true, headers: initialHeaders, ...rest } = options
  const headers = new Headers(initialHeaders)
  const requestToken = auth ? getStoredToken() : null

  if (body !== undefined && !(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (requestToken) {
    headers.set('Authorization', `Bearer ${requestToken}`)
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers,
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
    })
  } catch {
    throw createApiError(
      'Unable to reach the server. Please check your connection and try again.'
    )
  }

  return handleResponse<T>(response, requestToken)
}

export function apiGet<T>(
  path: string,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
): Promise<T> {
  return apiRequest<T>(path, { ...options, method: 'GET' })
}

export function apiPost<T>(
  path: string,
  body?: unknown,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
): Promise<T> {
  return apiRequest<T>(path, { ...options, method: 'POST', body })
}

export function apiPut<T>(
  path: string,
  body?: unknown,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
): Promise<T> {
  return apiRequest<T>(path, { ...options, method: 'PUT', body })
}

export function apiPatch<T>(
  path: string,
  body?: unknown,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
): Promise<T> {
  return apiRequest<T>(path, { ...options, method: 'PATCH', body })
}

export function apiDelete<T>(
  path: string,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
): Promise<T> {
  return apiRequest<T>(path, { ...options, method: 'DELETE' })
}

export function buildQuery(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value))
    }
  }
  const serialized = query.toString()
  return serialized ? `?${serialized}` : ''
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && 'status' in error
}

export { API_BASE_URL }
