import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageLoader from './PageLoader';

/** Guards /admin: requires a signed-in user whose profile role is a staff role. */
export default function ProtectedRoute() {
  const { user, isStaff, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f8f5]">
        <PageLoader />
      </div>
    );
  }

  if (!user || !isStaff) {
    return <Navigate to="/admin-login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
