// NF Signature Salon — authentication API
//
// Authentication is never mocked. These calls always go to the Express
// backend, which is responsible for password hashing and JWT issuance.

import { apiGet, apiPost, type ApiError } from '@/services/api/client'
import type { AuthResponse, AuthUser, LoginCredentials, RegisterData } from '@/types'

export interface RegisterResponse {
  token?: string
  user: AuthUser
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function extractAuthPayload(payload: unknown): { token?: string; user?: unknown } {
  const record = asRecord(payload)
  const data = asRecord(record.data)
  const tokenValue = record.token ?? data.token
  return {
    token: typeof tokenValue === 'string' ? tokenValue : undefined,
    user: record.user ?? data.user,
  }
}

function unexpectedResponse(message: string): ApiError {
  const error: ApiError = new Error(message)
  error.status = 500
  return error
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const payload = await apiPost<unknown>('/auth/login', credentials, { auth: false })
  const { token, user } = extractAuthPayload(payload)

  if (!token || !user || typeof user !== 'object') {
    throw unexpectedResponse(
      'The server returned an unexpected sign-in response. Please try again.'
    )
  }

  return { token, user: user as AuthUser }
}

export async function register(data: RegisterData): Promise<RegisterResponse> {
  const payload = await apiPost<unknown>('/auth/register', data, { auth: false })
  const { token, user } = extractAuthPayload(payload)

  if (!user || typeof user !== 'object') {
    throw unexpectedResponse(
      'The server returned an unexpected registration response. Please try again.'
    )
  }

  return { token, user: user as AuthUser }
}

export async function getCurrentUser(): Promise<AuthUser> {
  const payload = await apiGet<unknown>('/auth/me')
  const record = asRecord(payload)
  const user = record.user ?? record.data ?? payload

  if (!user || typeof user !== 'object') {
    throw unexpectedResponse('The server returned an unexpected account response.')
  }

  return user as AuthUser
}

export async function logout(): Promise<void> {
  await apiPost<void>('/auth/logout')
}
