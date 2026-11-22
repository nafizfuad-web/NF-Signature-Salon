// NF Signature Salon — service catalogue API
//
// Reads the live MongoDB-backed catalogue from the Express backend:
//   GET /services
//   GET /services/:id

import { apiGet, buildQuery } from '@/services/api/client'
import type { ServiceCategory, ServiceItem, ServiceQuery } from '@/types'

const VALID_CATEGORIES: ServiceCategory[] = ['hair', 'skin', 'nails', 'wellness']

const SERVICE_IMAGE_MAP: Record<string, string> = {
  "men's haircut": '/services/mens-haircut.jpg',
  "women's haircut": '/services/womens-haircut.jpg',
  'hair styling': '/services/hair-styling.jpg',
  'hair coloring': '/services/hair-coloring.jpg',
  'hair highlights': '/services/hair-highlights.jpg',
  'hair treatment': '/services/hair-treatment.jpg',
  'keratin treatment': '/services/keratin-treatment.jpg',
  'hair spa': '/services/hair-spa.jpg',
  'beard trimming': '/services/beard-trimming.jpg',
  'beard styling': '/services/beard-styling.jpg',
  shaving: '/services/shaving.jpg',
  facial: '/services/facial.jpg',
  'skin care': '/services/skin-care.jpg',
  manicure: '/services/manicure.jpg',
  pedicure: '/services/pedicure.jpg',
  'head massage': '/services/head-massage.jpg',
  'bridal makeup': '/services/bridal-makeup.jpg',
  'party makeup': '/services/party-makeup.jpg',
  'eyebrow threading': '/services/eyebrow-threading.jpg',
  waxing: '/services/waxing.jpg',
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const values = value.filter((item): item is string => typeof item === 'string')
  return values.length ? values : undefined
}

function normalizeCategory(value: unknown): ServiceCategory {
  return VALID_CATEGORIES.includes(value as ServiceCategory)
    ? (value as ServiceCategory)
    : 'hair'
}

export function normalizeService(value: unknown): ServiceItem {
  const raw = asRecord(value)
  const rawPrice = raw.price
  const title = asString(raw.title) || asString(raw.name, 'Untitled service')
  const imageKey = title.trim().toLowerCase()
  const price =
    typeof rawPrice === 'number'
      ? `$${rawPrice}`
      : typeof rawPrice === 'string'
        ? rawPrice
        : ''

  return {
    id: asString(raw.id) || asString(raw._id),
    title,
    description: asString(raw.description),
    longDescription: asOptionalString(raw.longDescription),
    price,
    duration: asOptionalString(raw.duration),
    category: normalizeCategory(raw.category),
    image: asOptionalString(raw.image) ?? SERVICE_IMAGE_MAP[imageKey] ?? '/services/fallback.svg',
    featured: Boolean(raw.featured),
    includes: asStringArray(raw.includes),
    goodToKnow: asStringArray(raw.goodToKnow),
  }
}

function extractServiceList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload
  const record = asRecord(payload)
  if (Array.isArray(record.data)) return record.data
  if (Array.isArray(record.services)) return record.services
  if (Array.isArray(record.items)) return record.items
  return []
}

function extractService(payload: unknown): unknown {
  const record = asRecord(payload)
  return record.service ?? record.data ?? payload
}

export async function fetchServices(query: ServiceQuery = {}): Promise<ServiceItem[]> {
  const params = buildQuery({
    search: query.search,
    category: query.category === 'all' ? undefined : query.category,
  })
  const payload = await apiGet<unknown>(`/services${params}`)
  return extractServiceList(payload).map(normalizeService).filter((service) => service.id)
}

export async function fetchServiceById(id: string): Promise<ServiceItem> {
  const payload = await apiGet<unknown>(`/services/${encodeURIComponent(id)}`)
  return normalizeService(extractService(payload))
}
