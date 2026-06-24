import React from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';

// Layouts
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import SearchPage from './pages/public/SearchPage';
import PropertyDetailPage from './pages/public/PropertyDetailPage';
import BookingPage from './pages/public/BookingPage';
import BookingConfirmationPage from './pages/public/BookingConfirmationPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Error Pages
import NotFoundPage from './pages/error/NotFoundPage';
import ServerErrorPage from './pages/error/ServerErrorPage';

// Customer Pages
import CustomerBookingList from './pages/customer/BookingListPage';
import CustomerBookingDetail from './pages/customer/BookingDetailPage';
import CustomerProfile from './pages/customer/ProfilePage';

// Manager Pages
import ManagerDashboard from './pages/manager/DashboardPage';
import ManagerPropertyList from './pages/manager/PropertyListPage';
import ManagerPropertyForm from './pages/manager/PropertyFormPage';
import ManagerRoomTypeList from './pages/manager/RoomTypeListPage';
import ManagerBookingList from './pages/manager/BookingListPage';

// Finance Pages
import FinanceDashboard from './pages/finance/DashboardPage';
import FinancePaymentQueue from './pages/finance/PaymentQueuePage';
import FinancePaymentDetail from './pages/finance/PaymentDetailPage';
import FinanceReport from './pages/finance/ReportPage';

// Layout Wrapper
const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ServerErrorPage />,
    children: [
      // Public routes
      { path: '/', element: <LandingPage /> },
      { path: '/search', element: <SearchPage /> },
      { path: '/property/:slug', element: <PropertyDetailPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },

      // Protected customer routes
      {
        path: '/booking/:slug/:roomTypeId',
        element: (
          <ProtectedRoute allowedRoles={['customer']}>
            <BookingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/booking/confirmation/:code',
        element: (
          <ProtectedRoute allowedRoles={['customer']}>
            <BookingConfirmationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/account/bookings',
        element: (
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerBookingList />
          </ProtectedRoute>
        ),
      },
      {
        path: '/account/bookings/:code',
        element: (
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerBookingDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: '/account/profile',
        element: (
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerProfile />
          </ProtectedRoute>
        ),
      },

      // Protected manager routes
      {
        path: '/manager/dashboard',
        element: (
          <ProtectedRoute allowedRoles={['property_manager']}>
            <ManagerDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/manager/properties',
        element: (
          <ProtectedRoute allowedRoles={['property_manager']}>
            <ManagerPropertyList />
          </ProtectedRoute>
        ),
      },
      {
        path: '/manager/properties/create',
        element: (
          <ProtectedRoute allowedRoles={['property_manager']}>
            <ManagerPropertyForm />
          </ProtectedRoute>
        ),
      },
      {
        path: '/manager/properties/:id/edit',
        element: (
          <ProtectedRoute allowedRoles={['property_manager']}>
            <ManagerPropertyForm />
          </ProtectedRoute>
        ),
      },
      {
        path: '/manager/properties/:id/rooms',
        element: (
          <ProtectedRoute allowedRoles={['property_manager']}>
            <ManagerRoomTypeList />
          </ProtectedRoute>
        ),
      },
      {
        path: '/manager/bookings',
        element: (
          <ProtectedRoute allowedRoles={['property_manager']}>
            <ManagerBookingList />
          </ProtectedRoute>
        ),
      },

      // Protected finance routes
      {
        path: '/finance/dashboard',
        element: (
          <ProtectedRoute allowedRoles={['finance']}>
            <FinanceDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/finance/payments',
        element: (
          <ProtectedRoute allowedRoles={['finance']}>
            <FinancePaymentQueue />
          </ProtectedRoute>
        ),
      },
      {
        path: '/finance/payments/:id',
        element: (
          <ProtectedRoute allowedRoles={['finance']}>
            <FinancePaymentDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: '/finance/reports',
        element: (
          <ProtectedRoute allowedRoles={['finance']}>
            <FinanceReport />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
