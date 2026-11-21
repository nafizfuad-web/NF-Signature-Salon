// NF Signature Salon — Centralized API client
//
// Prepared for future backend integration. Uses the native fetch API so no
// extra HTTP library is required. All request URLs are built from the
// VITE_API_BASE_URL environment variable (see client/.env.example).
//
// This file intentionally contains no endpoints — endpoints are added by the
// API service functions in this same folder when the backend is ready.

const BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export interface ApiError extends Error {
  status?: number
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const err: ApiError = new Error(
      `API error: ${response.status} ${response.statusText}`
    )
    err.status = response.status
    throw err
  }
  return (await response.json()) as T
}

export async function apiGet<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...options.headers },
  })
  return handleResponse<T>(response)
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    body: JSON.stringify(body),
  })
  return handleResponse<T>(response)
}

export { BASE_URL as API_BASE_URL }
