import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Props = {
  children: React.ReactNode;
};

const AdminRoute = ({ children }: Props) => {
  const { user } = useAuth() as any;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const adminEmail = 'admin@axcelci.com';

  if (user.email !== adminEmail) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
