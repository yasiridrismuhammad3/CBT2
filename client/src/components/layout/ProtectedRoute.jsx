import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSkeleton from '../common/LoadingSkeleton';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!user) {
    // Redirect to the landing page if not authenticated
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // If roles are specified and user's role is not in the allowed list,
  // redirect to their dashboard (not to another role's area)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
