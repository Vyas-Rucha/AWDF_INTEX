import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * ProtectedRoute Component (Task 2)
 * 1. Checks if token exists -> if missing, redirects to '/' (LoginPage).
 * 2. Nests role check inside -> if requiredRole does not match, redirects to '/events' instead of logging out.
 */
function ProtectedRoute({ children, requiredRole }) {
  const { token, role } = useAuth();

  // Case 1: Missing token -> redirect to Login Page
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Case 2: Token exists, but role does not match requiredRole -> redirect to /events
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/events" replace />;
  }

  // Authorized
  return children;
}

export default ProtectedRoute;
