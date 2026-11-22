
// NF Signature Salon — runtime configuration

export const API_BASE_URL: string = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
).replace(/\/$/, '')

// Catalog and dashboard data can use the local development fixtures.
// Authentication always calls the real backend.
export const USE_MOCK_DATA: boolean =
  import.meta.env.VITE_USE_MOCK_DATA !== 'false'

export const GOOGLE_CLIENT_ID: string =
  import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? ''
