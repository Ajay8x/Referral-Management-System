import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const clean = mobile.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    setSubmitting(true);
    try {
      await login(clean, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      toast.error(err.response?.data?.message || 'Invalid mobile number or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand */}
        <div className="brand-header">
          <div className="brand-logo-icon">R</div>
          <div className="brand-text">
            <h1>Shree RBSK</h1>
            <p>Referral Management System</p>
          </div>
        </div>

        {/* Heading */}
        <div className="auth-heading">
          <h2>Welcome Back</h2>
          <p>Sign in to manage child referrals and treatment records.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>
          {/* Mobile Number */}
          <div className="form-group">
            <label htmlFor="mobile">Mobile Number</label>
            <div className="password-input-wrapper">
              <input
                type="tel"
                id="mobile"
                className="form-control"
                placeholder="Enter 10 digit mobile number"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '10px', padding: '12px' }}
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer-link">
          Don't have an account?
          <Link to="/register">Create Account</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
