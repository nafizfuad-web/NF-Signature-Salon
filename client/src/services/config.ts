// NF Signature Salon — runtime configuration

export const API_BASE_URL: string = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
).replace(/\/$/, '')

// Catalog and dashboard data can use the local development fixtures until the
// Express API is connected. Authentication is NEVER mocked: it always calls the
// real backend. Set VITE_USE_MOCK_DATA=false to make every request go to the API.
export const USE_MOCK_DATA: boolean =
  import.meta.env.VITE_USE_MOCK_DATA !== 'false'
