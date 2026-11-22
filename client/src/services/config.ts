// NF Signature Salon — runtime configuration

export const API_BASE_URL: string = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
).replace(/\/$/, '')

/** Origin of the API server, used to resolve server-relative upload URLs. */
export const API_ORIGIN: string = (() => {
  try {
    return new URL(API_BASE_URL).origin
  } catch {
    return ''
  }
})()

/**
 * Turns a server-relative asset path (for example "/uploads/avatars/x.png")
 * into an absolute URL. External image URLs are returned unchanged.
 */
export function resolveAssetUrl(url?: string): string | undefined {
  if (!url) return undefined
  if (/^https?:\/\//i.test(url)) return url
  if (!API_ORIGIN) return url
  return `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`
}

// Catalogue/dashboard fixtures are now only used by the (excluded) admin
// preview. Customer-facing features always read from the real API.
export const USE_MOCK_DATA: boolean =
  import.meta.env.VITE_USE_MOCK_DATA !== 'false'

export const GOOGLE_CLIENT_ID: string =
  import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? ''
