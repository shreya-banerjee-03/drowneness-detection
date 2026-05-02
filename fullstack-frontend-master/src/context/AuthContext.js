import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [authToken, setAuthToken] = useState('');

  // Check auth status on load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('authToken');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setAuthToken(savedToken);
    }
    setLoading(false);
  }, []);

  // Function to request OTP
  const requestOtp = async (email) => {
    try {
      // First, check if email is provided
      if (!email) {
        throw new Error('Email is required');
      }

      // Request OTP with email as query parameter
      const response = await fetch(`http://localhost:8080/otp/`+email, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OTP request failed with status:', response.status, 'Response:', errorData);
        throw new Error(`Failed to send OTP: ${response.status} ${response.statusText}`);
      }

      // Save email for verification
      setEmail(email);
      return { success: true };
    } catch (error) {
      console.error('OTP request failed:', error);
      throw error;
    }
  };

  // Function to verify OTP and login
  const verifyOtp = async (otp) => {
    try {
      // Basic validation
      if (!email) {
        throw new Error('Email is required');
      }
      if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
        throw new Error('Please enter a valid 6-digit OTP');
      }

      const response = await fetch(`http://localhost:8080/login?otp=${otp}&email=${encodeURIComponent(email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login failed:', response.status, errorText);
        throw new Error(errorText || 'Invalid OTP or email');
      }

      const token = await response.text(); // Get the token as string
      
      if (!token) {
        throw new Error('No authentication token received');
      }

      // Save user and token
      const userData = { 
        email, 
        isAdmin: true 
      };
      
      setUser(userData);
      setAuthToken(token);
      
      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('authToken', token);
      
      return { 
        success: true,
        user: userData,
        token
      };
    } catch (error) {
      console.error('OTP verification failed:', error);
      // Return a more user-friendly error message
      const errorMessage = error.message || 'Failed to verify OTP. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setUser(null);
    setAuthToken('');
    setEmail('');
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      authToken,
      email,
      requestOtp, 
      verifyOtp, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
