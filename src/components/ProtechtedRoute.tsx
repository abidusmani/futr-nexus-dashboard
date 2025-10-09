// src/components/ProtectedRoute.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';

// This component takes other components as 'children'
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  
  // Check for the token in local storage
  const token = localStorage.getItem('token');

  if (!token) {
    // If no token is found, redirect the user to the login page
    // The 'replace' prop prevents the user from going back to the protected page
    return <Navigate to="/" replace />;
  }

  // If a token is found, render the page the user was trying to access
  return children;
};

export default ProtectedRoute;