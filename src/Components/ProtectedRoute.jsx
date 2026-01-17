// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth(); // Read the real user from Firebase

  if (!user) {
    // If no user, kick them back to the login page
    return <Navigate to="/" />;
  }

  // If user exists, let them see the page (Dashboard)
  return children;
};

export default ProtectedRoute;