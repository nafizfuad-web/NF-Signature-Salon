function configuredCoordinate(value: string | undefined, min: number, max: number): number | undefined {
  if (!value?.trim()) return undefined
  const coordinate = Number(value)
  return Number.isFinite(coordinate) && coordinate >= min && coordinate <= max
    ? coordinate
    : undefined
}

function externalUrl(value: string | undefined): string | undefined {
  if (!value?.trim()) return undefined
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.toString() : undefined
  } catch {
    return undefined
  }
}

const socialLinks = [
  { label: 'Instagram', url: externalUrl(import.meta.env.VITE_SALON_INSTAGRAM_URL) },
  { label: 'Facebook', url: externalUrl(import.meta.env.VITE_SALON_FACEBOOK_URL) },
  { label: 'TikTok', url: externalUrl(import.meta.env.VITE_SALON_TIKTOK_URL) },
].filter((link): link is { label: string; url: string } => Boolean(link.url))

export const SALON_LOCATION = {
  name: 'NF Signature Salon',
  country: 'Bangladesh',
  city: 'Dhaka, Bangladesh',
  address: import.meta.env.VITE_SALON_ADDRESS?.trim() ?? '',
  postalCode: import.meta.env.VITE_SALON_POSTAL_CODE?.trim() ?? '',
  displayAddress: [
    import.meta.env.VITE_SALON_ADDRESS?.trim(),
    import.meta.env.VITE_SALON_POSTAL_CODE?.trim(),
    'Dhaka, Bangladesh',
  ].filter(Boolean).join(', '),
  latitude: configuredCoordinate(import.meta.env.VITE_SALON_LATITUDE, -90, 90),
  longitude: configuredCoordinate(import.meta.env.VITE_SALON_LONGITUDE, -180, 180),
  phone: import.meta.env.VITE_SALON_PHONE?.trim() ?? '',
  email: import.meta.env.VITE_SALON_EMAIL?.trim() ?? '',
  openingHours: [
    { day: 'Sunday', hours: import.meta.env.VITE_SALON_HOURS_SUNDAY?.trim() ?? '' },
    { day: 'Monday', hours: import.meta.env.VITE_SALON_HOURS_MONDAY?.trim() ?? '' },
    { day: 'Tuesday', hours: import.meta.env.VITE_SALON_HOURS_TUESDAY?.trim() ?? '' },
    { day: 'Wednesday', hours: import.meta.env.VITE_SALON_HOURS_WEDNESDAY?.trim() ?? '' },
    { day: 'Thursday', hours: import.meta.env.VITE_SALON_HOURS_THURSDAY?.trim() ?? '' },
    { day: 'Friday', hours: import.meta.env.VITE_SALON_HOURS_FRIDAY?.trim() ?? '' },
    { day: 'Saturday', hours: import.meta.env.VITE_SALON_HOURS_SATURDAY?.trim() ?? '' },
  ],
  socialLinks,
}

export const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() ?? ''
