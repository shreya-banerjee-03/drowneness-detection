import React, { useEffect } from 'react';
import axios from 'axios';
import "./App.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./layout/Navbar";
import Login from "./pages/Login";
import Users from "./pages/Users";

// Axios interceptor to add adminId to requests
const setupAxiosInterceptors = (getToken) => {
  // This will be called before each request
  const requestInterceptor = (config) => {
    const token = getToken();
    if (token) {
      // Only add adminId to the request body or params, not as Authorization header
      if (config.method === 'get' || config.method === 'delete') {
        config.params = {
          ...config.params,
          adminId: token
        };
      } 
      // For POST/PUT/PATCH requests, we'll let the component handle adding adminId to the body
    }
    return config;
  };

  // Handle 401 Unauthorized responses
  const responseErrorInterceptor = (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      console.error('Session expired or invalid token');
      // You might want to add a global error handler or redirect to login
    }
    return Promise.reject(error);
  };

  // Add request interceptor
  const requestInterceptorId = axios.interceptors.request.use(
    requestInterceptor,
    (error) => Promise.reject(error)
  );

  // Add response interceptor
  const responseInterceptorId = axios.interceptors.response.use(
    (response) => response,
    responseErrorInterceptor
  );

  // Return cleanup function
  return () => {
    axios.interceptors.request.eject(requestInterceptorId);
    axios.interceptors.response.eject(responseInterceptorId);
  };
};

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading, authToken } = useAuth();

  // Set up axios interceptors when auth token changes
  useEffect(() => {
    if (authToken) {
      const cleanup = setupAxiosInterceptors(() => authToken);
      return cleanup;
    }
  }, [authToken]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <Navbar />
          <div className="container mt-4">
            <Routes>
              <Route path="/users" element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/users" replace />} />
              <Route path="*" element={<Navigate to="/users" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
