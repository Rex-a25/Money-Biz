import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { Loader } from 'lucide-react';
import Dashboard from './views/Dashboard';
import Login from './views/Login';
import Signup from './views/Signup';
const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Auth Changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Loading Spinner
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 text-purple-600">
        <Loader className="animate-spin mb-4" size={40} />
        <p className="font-semibold text-gray-500">Loading Portal...</p>
      </div>
    );
  }

  // Protected Route Wrapper
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        
        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} /> {/* <--- NEW ROUTE */}

        {/* PROTECTED ROUTE */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* CATCH-ALL REDIRECT */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        
      </Routes>
    </Router>
  );
};

export default App;