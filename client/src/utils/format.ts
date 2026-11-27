// NF Signature Salon — display and formatting helpers

import type { ServiceCategory } from '@/types'

export function parsePrice(price: string): number {
  const value = Number(price.replace(/[^0-9.]/g, ''))
  return Number.isFinite(value) ? value : 0
}

export function formatDate(date: string, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return '—'
  const parsed = new Date(date.includes('T') ? date : `${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  })
}

export function formatShortDate(date: string): string {
  return formatDate(date, { weekday: undefined, year: undefined })
}

/** Long, human-friendly date used in booking summaries and confirmations. */
export function formatDateLong(date: string): string {
  return formatDate(date, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(Number.isFinite(value) ? value : 0)
}

export function formatMoney(value: number, currency = 'BDT'): string {
  return `${currency} ${formatNumber(value)}`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  hair: 'Hair',
  skin: 'Skin',
  nails: 'Nails',
  wellness: 'Wellness',
}

export function getCategoryLabel(category: ServiceCategory): string {
  return CATEGORY_LABELS[category]
}

export function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
