import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/** Hides an admin page from staff whose role doesn't have the permission (rules enforce it server-side too). */
export default function RequireRole({ allow, children }) {
  const { role } = useAuth();
  return allow(role) ? children : <Navigate to="/admin" replace />;
}
