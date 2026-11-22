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
  date: string
  time: string
  phone?: string
  notes?: string
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
  avatarUrl?: string
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
  category?: ServiceCategory
  date: string
  time: string
  duration?: string
  price?: string
  status: AppointmentStatus
  staffName?: string
  notes?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  paymentStatus?: AppointmentPaymentStatus
  paymentMethod?: PaymentMethodId
  paidAt?: string
  latestTransactionId?: string
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
/* TEST payments (simulated only)                                             */
/* -------------------------------------------------------------------------- */

export type PaymentMethodId = 'stripe_demo' | 'bkash_demo' | 'nagad_demo' | 'pay_at_salon'
export type AppointmentPaymentStatus = 'unpaid' | 'pending' | 'paid'
export type PaymentTransactionStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'cash_pending'
  | 'cash_received'
export type PaymentSimulationOutcome = 'success' | 'failed' | 'cancelled'

export interface PaymentMethod {
  id: PaymentMethodId
  label: string
  provider: 'internal_simulator' | 'salon_cash'
  requiresSimulation: boolean
  simulated: true
  environment: 'TEST'
  currency: 'BDT'
}

export interface PaymentMethodsResponse {
  enabled: boolean
  environment: 'TEST'
  currency: 'BDT'
  amount: number | null
  amountBasis: 'configured_test_demo'
  simulated: true
  methods: PaymentMethod[]
  reason: string | null
}

export interface PaymentTransaction {
  id: string
  appointmentId: string
  customerId: string
  serviceId?: string
  serviceTitle: string
  appointmentDate: string
  appointmentTime: string
  displayPrice?: string
  amount: number
  currency: 'BDT'
  amountBasis: 'configured_test_demo'
  paymentMethod: PaymentMethodId
  provider: 'internal_simulator' | 'salon_cash'
  paymentStatus: PaymentTransactionStatus
  environment: 'TEST' | 'LIVE'
  simulated: boolean
  simulationOutcome?: PaymentSimulationOutcome
  failureReason?: string
  paidAt?: string
  cashConfirmedAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface AppointmentPaymentState {
  appointment: Appointment
  transaction: PaymentTransaction | null
  payment: {
    status: AppointmentPaymentStatus
    method?: PaymentMethodId
    paidAt?: string
  }
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
