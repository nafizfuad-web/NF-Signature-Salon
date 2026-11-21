// NF Signature Salon — Type Definitions

export interface NavLink {
  label: string
  href: string
}

export type ServiceCategory = 'hair' | 'skin' | 'nails' | 'wellness'

export interface ServiceItem {
  id: string
  title: string
  description: string
  price: string
  duration?: string
  category: ServiceCategory
  image?: string
  featured?: boolean
  longDescription?: string
  includes?: string[]
  goodToKnow?: string[]
}

export interface ServiceQuery {
  search?: string
  category?: ServiceCategory | 'all'
  sort?: 'recommended' | 'price-asc' | 'price-desc'
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

/** Payload sent to the API when a customer requests an appointment. */
export interface CreateAppointmentPayload {
  serviceId: string
  serviceTitle: string
  date: string
  time: string
  name: string
  email: string
  phone: string
  notes?: string
  price?: string
  duration?: string
}

/* -------------------------------------------------------------------------- */
/* Authentication                                                             */
/* -------------------------------------------------------------------------- */

export type UserRole = 'customer' | 'admin'

export interface AuthUser {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  createdAt?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  phone?: string
  password: string
}

export interface AuthResponse {
  token: string
  user: AuthUser
}

export interface ProfileUpdate {
  name: string
  email: string
  phone?: string
}

/* -------------------------------------------------------------------------- */
/* Appointments & dashboards                                                  */
/* -------------------------------------------------------------------------- */

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface Appointment {
  id: string
  serviceId: string
  serviceTitle: string
  date: string
  time: string
  duration?: string
  price?: string
  status: AppointmentStatus
  staffName?: string
  notes?: string
  customerName?: string
  customerEmail?: string
  createdAt?: string
}

export interface CustomerStats {
  upcoming: number
  completed: number
  visits: number
  favouriteCategory?: ServiceCategory
}

export interface CustomerDashboardData {
  stats: CustomerStats
  nextAppointment: Appointment | null
  recentAppointments: Appointment[]
}

export interface AdminStats {
  todayBookings: number
  pendingBookings: number
  activeServices: number
  totalCustomers: number
}

export interface AdminDashboardData {
  stats: AdminStats
  recentBookings: Appointment[]
  servicesByCategory: Record<ServiceCategory, number>
}

export interface CustomerRecord {
  id: string
  name: string
  email: string
  phone?: string
  visits: number
  lastVisit?: string
  joinedAt?: string
}

export interface BookingStatusUpdate {
  status: AppointmentStatus
}

/* -------------------------------------------------------------------------- */
/* API helpers                                                                */
/* -------------------------------------------------------------------------- */

export interface ApiListResponse<T> {
  data: T[]
  total?: number
  page?: number
  limit?: number
}

export interface PaginationParams {
  page?: number
  limit?: number
}
