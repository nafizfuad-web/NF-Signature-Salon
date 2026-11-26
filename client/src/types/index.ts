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
  priceAmount?: number
  duration?: string
  category: ServiceCategory
  image?: string
  featured?: boolean
  longDescription?: string
  includes?: string[]
  goodToKnow?: string[]
  active?: boolean
  createdAt?: string
  updatedAt?: string
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

export interface RegistrationResult {
  token?: string
  user: AuthUser
  requiresEmailVerification: boolean
  verificationEmailSent: boolean
  message?: string
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
  priceAmount?: number
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
  totalCustomers: number
  activeServices: number
  totalAppointments: number
  pendingBookings: number
  confirmedBookings: number
  cancelledBookings: number
  completedBookings: number
  todayBookings: number
  successfulPayments: number
}

export interface AdminDashboardData {
  stats: AdminStats
  recentBookings: Appointment[]
  recentTransactions: PaymentTransaction[]
  servicesByCategory: Record<ServiceCategory, number>
}

export interface CustomerRecord {
  id: string
  name: string
  email: string
  phone?: string
  avatarUrl?: string
  role?: UserRole
  isBlocked?: boolean
  emailVerified?: boolean
  visits: number
  lastVisit?: string | null
  lastLoginAt?: string
  joinedAt?: string
  createdAt?: string
}

export interface AdminCustomerDetail {
  customer: CustomerRecord
  appointments: Appointment[]
  transactions: PaymentTransaction[]
}

export interface AdminServicePayload {
  title: string
  description: string
  longDescription?: string
  price?: string
  priceAmount: number
  durationMinutes: number
  category: ServiceCategory
  image?: string
  featured?: boolean
  active?: boolean
  includes?: string[]
  goodToKnow?: string[]
}

export interface BookingStatusUpdate {
  status: AppointmentStatus
}

/* -------------------------------------------------------------------------- */
/* TEST payments (simulated only)                                             */
/* -------------------------------------------------------------------------- */

export type PaymentMethodId =
  | 'stripe'
  | 'bkash'
  | 'nagad'
  | 'stripe_demo'
  | 'bkash_demo'
  | 'nagad_demo'
  | 'pay_at_salon'
export type PaymentProvider = 'internal_simulator' | 'salon_cash' | 'stripe' | 'bkash' | 'nagad'
export type PaymentMethodMode = 'real' | 'simulated' | 'cash'
export type AppointmentPaymentStatus = 'unpaid' | 'pending' | 'paid'
export type PaymentTransactionStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'cash_pending'
  | 'cash_received'
  | 'refunded'
export type PaymentSimulationOutcome = 'success' | 'failed' | 'cancelled'

export interface PaymentMethod {
  id: PaymentMethodId
  label: string
  provider: PaymentProvider
  mode: PaymentMethodMode
  requiresSimulation: boolean
  available: boolean
  reason: string | null
  simulated: boolean
  environment: 'TEST' | 'LIVE'
  currency: 'BDT'
}

export interface PaymentMethodsResponse {
  enabled: boolean
  environment: 'TEST' | 'LIVE'
  currency: 'BDT'
  amount: number | null
  amountBasis: 'configured_test_demo' | 'service_price'
  simulated: boolean
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
  amountBasis: 'configured_test_demo' | 'service_price'
  paymentMethod: PaymentMethodId
  provider: PaymentProvider
  providerReference?: string
  providerEventId?: string
  refundReason?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  appointmentStatus?: AppointmentStatus
  staffName?: string
  paymentStatus: PaymentTransactionStatus
  environment: 'TEST' | 'LIVE'
  simulated: boolean
  checkoutUrl?: string
  providerSessionId?: string
  providerPaymentIntentId?: string
  providerVerifiedAt?: string
  refundedAmount?: number
  refundedAt?: string
  simulationOutcome?: PaymentSimulationOutcome
  failureReason?: string
  paidAt?: string
  cashConfirmedBy?: string
  cashConfirmedAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface AdminPaymentStats {
  transactionCount: number
  byStatus: Record<string, number>
  settledCount: number
  testSimulatedAmountTotal: number
  currency: 'BDT'
  realRevenueAmount: number
}

export interface AdminPaymentsResponse {
  scope: string
  stats: AdminPaymentStats
  transactions: PaymentTransaction[]
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
