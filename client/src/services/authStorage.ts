// NF Signature Salon — token storage
//
// The token is issued by the Express backend after a successful sign-in. It is
// never generated on the client. Keeping the storage helpers in one place makes
// it easy to switch to httpOnly cookies later without touching UI components.

const TOKEN_KEY = 'nf_signature_auth_token'

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // Storage can be unavailable in private browsing. Auth still works for the
    // current tab because the in-memory token is kept by AuthProvider.
  }
}

export function clearStoredToken(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Ignore storage failures.
  }
}
