import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user: authUser, loading } = useAuth();
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Fallback check for localStorage during initial hydration/refresh
  const storedUser = JSON.parse(localStorage.getItem('lancera_user') || 'null');
  const user = authUser || storedUser;

  useEffect(() => {
    if (!loading) setIsAuthReady(true);
  }, [loading]);

  if (loading && !isAuthReady && !storedUser) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#030B18]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
};

export default AdminRoute;
