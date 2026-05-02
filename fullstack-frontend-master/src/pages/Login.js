
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const { requestOtp, verifyOtp, email: savedEmail } = useAuth();
  const navigate = useNavigate();

  // Auto-fill email from context if available
  useEffect(() => {
    if (savedEmail) {
      setEmail(savedEmail);
      setShowOtpField(true);
    }
  }, [savedEmail]);

  // Handle OTP resend timer
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await requestOtp(email);
      setShowOtpField(true);
      setResendTimer(30); // 30 seconds cooldown
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
      console.error('OTP request error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setError('');
    setIsLoading(true);
    
    try {
      const result = await verifyOtp(otp);
      
      if (result && result.success) {
        // Clear any previous errors
        setError('');
        
        // Show success message
        alert('Login successful! Redirecting...');
        
        // Redirect to users page
        navigate('/users', { replace: true });
      } else {
        throw new Error('Login was not successful');
      }
    } catch (err) {
      // Show the error message from the server or a default message
      setError(err.message || 'Invalid OTP. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    setError('');
    setIsLoading(true);
    
    try {
      await requestOtp(email);
      setResendTimer(30); // Reset cooldown
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
      console.error('Resend OTP error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="text-center mb-4">Admin Login</h2>
              
              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}
              
              {!showOtpField ? (
                <form onSubmit={handleEmailSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit}>
                  <div className="mb-3">
                    <label htmlFor="otp" className="form-label">
                      Enter 6-digit OTP sent to {email}
                    </label>
                    <input
                      type="text"
                      className="form-control text-center"
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      inputMode="numeric"
                      pattern="\d{6}"
                      required
                    />
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <button 
                        type="button" 
                        className="btn btn-link p-0"
                        onClick={handleResendOtp}
                        disabled={resendTimer > 0 || isLoading}
                      >
                        {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-link p-0"
                        onClick={() => setShowOtpField(false)}
                        disabled={isLoading}
                      >
                        Change Email
                      </button>
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
