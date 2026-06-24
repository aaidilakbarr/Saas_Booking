import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0c1220]">
        <div className="w-12 h-12 border-4 border-ptpn-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Redirect to login but keep current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User is authenticated but doesn't have the required role
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0c1220] px-4 text-center">
        <h1 className="text-4xl font-extrabold text-red-500 mb-2">403 — Terlarang</h1>
        <p className="text-slate-400 max-w-md mb-6">
          Anda tidak memiliki hak akses untuk membuka halaman ini.
        </p>
        <Navigate to="/" replace />
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
