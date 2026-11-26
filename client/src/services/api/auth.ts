// NF Signature Salon — authentication API
//
// Authentication is never mocked. These calls always go to the Express
// backend, which is responsible for password hashing and JWT issuance.

import { apiGet, apiPost, type ApiError } from '@/services/api/client'
import type {
  AuthResponse,
  AuthUser,
  LoginCredentials,
  RegisterData,
  RegistrationResult,
} from '@/types'

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

export function parseAuthUser(value: unknown): AuthUser | null {
  const record = asRecord(value)
  if (
    !record ||
    typeof record.id !== 'string' ||
    !record.id ||
    typeof record.name !== 'string' ||
    !record.name ||
    typeof record.email !== 'string' ||
    !record.email ||
    (record.role !== 'customer' && record.role !== 'admin') ||
    (record.phone !== undefined && typeof record.phone !== 'string') ||
    (record.avatarUrl !== undefined && typeof record.avatarUrl !== 'string') ||
    (record.createdAt !== undefined && typeof record.createdAt !== 'string')
  ) {
    return null
  }

  return {
    id: record.id,
    name: record.name,
    email: record.email,
    role: record.role,
    ...(typeof record.phone === 'string' ? { phone: record.phone } : {}),
    ...(typeof record.avatarUrl === 'string' ? { avatarUrl: record.avatarUrl } : {}),
    ...(typeof record.createdAt === 'string' ? { createdAt: record.createdAt } : {}),
  }
}

function extractAuthPayload(payload: unknown): { token?: string; user?: unknown } {
  const record = asRecord(payload)
  const data = asRecord(record?.data)
  const tokenValue = record?.token ?? data?.token
  return {
    token: typeof tokenValue === 'string' ? tokenValue : undefined,
    user: record?.user ?? data?.user,
  }
}

function unexpectedResponse(message: string): ApiError {
  const error: ApiError = new Error(message)
  error.status = 500
  return error
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const payload = await apiPost<unknown>('/auth/login', credentials, { auth: false })
  const { token, user: rawUser } = extractAuthPayload(payload)
  const user = parseAuthUser(rawUser)

  if (!token || !user) {
    throw unexpectedResponse(
      'The server returned an unexpected sign-in response. Please try again.'
    )
  }

  return { token, user }
}

export async function register(data: RegisterData): Promise<RegistrationResult> {
  const payload = await apiPost<unknown>('/auth/register', data, { auth: false })
  const record = asRecord(payload)
  const nested = asRecord(record?.data)
  const { token, user: rawUser } = extractAuthPayload(payload)
  const user = parseAuthUser(rawUser)

  if (!user) {
    throw unexpectedResponse(
      'The server returned an unexpected registration response. Please try again.'
    )
  }

  const verificationEmail = asRecord(record?.verificationEmail ?? nested?.verificationEmail)
  const messageValue = record?.message ?? nested?.message
  return {
    ...(token ? { token } : {}),
    user,
    requiresEmailVerification:
      record?.requiresEmailVerification === true || nested?.requiresEmailVerification === true,
    verificationEmailSent: verificationEmail?.sent === true,
    ...(typeof messageValue === 'string' ? { message: messageValue } : {}),
  }
}

export async function getCurrentUser(): Promise<AuthUser> {
  const payload = await apiGet<unknown>('/auth/me')
  const record = asRecord(payload)
  const data = asRecord(record?.data)
  const user = parseAuthUser(record?.user ?? data?.user ?? record?.data ?? payload)

  if (!user) {
    throw unexpectedResponse('The server returned an unexpected account response.')
  }

  return user
}

export async function logout(): Promise<void> {
  await apiPost<void>('/auth/logout')
}

export async function forgotPassword(email: string): Promise<void> {
  await apiPost<void>('/auth/forgot-password', { email }, { auth: false })
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await apiPost<void>('/auth/reset-password', { token, password }, { auth: false })
}

export async function verifyEmail(token: string): Promise<void> {
  await apiPost<void>('/auth/verify-email', { token }, { auth: false })
}

export async function resendVerification(): Promise<void> {
  await apiPost<void>('/auth/resend-verification')
}

export async function resendVerificationEmail(email: string): Promise<void> {
  await apiPost<void>('/auth/resend-verification-email', { email }, { auth: false })
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<AuthResponse> {
  const payload = await apiPost<unknown>('/auth/change-password', {
    currentPassword,
    newPassword,
  })
  const { token, user: rawUser } = extractAuthPayload(payload)
  const user = parseAuthUser(rawUser)
  if (!token || !user) {
    throw unexpectedResponse('The server returned an unexpected password response.')
  }
  return { token, user }
}
