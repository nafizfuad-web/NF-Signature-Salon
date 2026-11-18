// NF Signature Salon — Type Definitions

export interface NavLink {
  label: string
  href: string
}

export interface ServiceItem {
  id: string
  title: string
  description: string
  price: string
  duration?: string
  category: 'hair' | 'skin' | 'nails' | 'wellness'
}

export interface GalleryImage {
  id: string
  src: string
  alt: string
  category?: string
}

export interface Testimonial {
  id: string
  name: string
  rating: number
  review: string
  date?: string
}

export interface BookingFormData {
  name: string
  email: string
  phone: string
  service: string
  date: string
  time: string
  notes?: string
}
