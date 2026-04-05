import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Fallback check: if state is still updating but token exists in storage, allow through
  const hasStoredToken = !!localStorage.getItem('lancera_token');
  const isActuallyAuth = isAuthenticated || hasStoredToken;

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-dark">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isActuallyAuth) return <Navigate to="/login" replace />;
  if (role && user?.role !== role && !hasStoredToken) return <Navigate to="/dashboard" replace />;

  return children;
};

export default ProtectedRoute;
