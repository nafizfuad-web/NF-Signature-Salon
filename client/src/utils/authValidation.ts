// NF Signature Salon — shared authentication field limits
//
// These mirror the server-side validation so the form reports the same problem
// before a request is sent. The server remains the source of truth.

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const EMAIL_MAX_LENGTH = 254
export const NAME_MAX_LENGTH = 100
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_BYTES = 72
export const PHONE_MIN_DIGITS = 7
export const PHONE_MAX_DIGITS = 15

export function passwordByteLength(value: string): number {
  return new TextEncoder().encode(value).length
}

export function phoneDigitCount(value: string): number {
  return value.replace(/[^\d]/g, '').length
}
