import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthLayout from '@/components/auth/AuthLayout'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import Layout from '@/components/layout/Layout'
import AboutPage from '@/pages/AboutPage'
import BookingPage from '@/pages/BookingPage'
import ContactPage from '@/pages/ContactPage'
import GalleryPage from '@/pages/GalleryPage'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'
import ServiceDetailsPage from '@/pages/ServiceDetailsPage'
import ServicesPage from '@/pages/ServicesPage'
import SignInPage from '@/pages/SignInPage'
import SignUpPage from '@/pages/SignUpPage'
import AdminBookingsPage from '@/pages/dashboard/AdminBookingsPage'
import AdminCustomersPage from '@/pages/dashboard/AdminCustomersPage'
import AdminDashboardPage from '@/pages/dashboard/AdminDashboardPage'
import AdminServicesPage from '@/pages/dashboard/AdminServicesPage'
import CustomerAppointmentsPage from '@/pages/dashboard/CustomerAppointmentsPage'
import CustomerDashboardPage from '@/pages/dashboard/CustomerDashboardPage'
import CustomerProfilePage from '@/pages/dashboard/CustomerProfilePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="services/:serviceId" element={<ServiceDetailsPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="booking" element={<BookingPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="signin" element={<SignInPage />} />
          <Route path="signup" element={<SignUpPage />} />
        </Route>

        <Route path="dashboard" element={<DashboardLayout variant="customer" />}>
          <Route index element={<CustomerDashboardPage />} />
          <Route path="appointments" element={<CustomerAppointmentsPage />} />
          <Route path="profile" element={<CustomerProfilePage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>

        <Route path="admin" element={<DashboardLayout variant="admin" />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="services" element={<AdminServicesPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
