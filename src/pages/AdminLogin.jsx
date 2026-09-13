import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, AlertCircle, ArrowRight, Lock } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect straight to admin
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/admin', { replace: true });
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6"
      style={{ backgroundColor: '#F5F2ED' }}
    >
      {/* Staff Only Badge */}
      <div
        className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6"
        style={{
          backgroundColor: 'rgba(90, 90, 64, 0.08)',
          border: '1px solid rgba(90, 90, 64, 0.12)',
        }}
      >
        <Shield
          size={14}
          style={{ color: 'var(--primary-color)' }}
        />
        <span
          className="text-[11px] font-bold tracking-[0.18em] uppercase"
          style={{
            fontFamily: "'Montserrat', sans-serif",
            color: 'var(--primary-color)',
          }}
        >
          Staff Only
        </span>
      </div>

      {/* Two-Tone Heading */}
      <h1
        className="text-center mb-3"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: 'clamp(2rem, 5vw, 3.2rem)',
          lineHeight: 1.15,
          letterSpacing: '0.04em',
        }}
      >
        <span style={{ color: 'var(--text-dark)' }}>ADMIN </span>
        <span style={{ color: 'var(--accent-color)' }}>PORTAL</span>
      </h1>

      {/* Subtitle */}
      <p
        className="text-center mb-10 max-w-md"
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '14px',
          lineHeight: '24px',
          color: '#999',
        }}
      >
        Not a customer page — this is where the store is managed from.
      </p>

      {/* Login Card */}
      <div
        className="w-full relative"
        style={{
          maxWidth: '560px',
        }}
      >
        {/* Decorative glow behind card */}
        <div
          className="absolute -inset-4 rounded-[2.5rem] opacity-30 blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 0%, rgba(212, 163, 115, 0.25) 0%, transparent 70%)',
          }}
        />

        <div
          className="relative rounded-[1.5rem] p-8 sm:p-10"
          style={{
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 40px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(0, 0, 0, 0.04)',
          }}
        >
          {/* Card Icon */}
          <div className="flex justify-center mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(90, 90, 64, 0.08)',
              }}
            >
              <Lock size={24} style={{ color: 'var(--primary-color)' }} />
            </div>
          </div>

          {/* Card Heading */}
          <h2
            className="text-center mb-2"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: '1.5rem',
              color: 'var(--text-dark)',
            }}
          >
            Admin Portal
          </h2>

          {/* Card Subtitle */}
          <p
            className="text-center mb-4"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '13px',
              lineHeight: '22px',
              color: '#888',
            }}
          >
            Sign in to manage products, orders and stock.
          </p>

          {/* Disclaimer */}
          <div
            className="rounded-xl px-4 py-3 mb-8"
            style={{
              backgroundColor: 'rgba(90, 90, 64, 0.04)',
              border: '1px solid rgba(90, 90, 64, 0.08)',
            }}
          >
            <p
              className="text-center"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '11px',
                lineHeight: '18px',
                color: '#999',
              }}
            >
              This login is a client-side demo guard — it keeps the admin area tidy for review purposes.
              It is not a secure authentication system. Any real admin functionality should be protected
              by server-side role checks.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3 mb-6"
              style={{
                backgroundColor: 'rgba(220, 53, 69, 0.06)',
                border: '1px solid rgba(220, 53, 69, 0.12)',
              }}
            >
              <AlertCircle size={16} className="flex-shrink-0" style={{ color: '#dc3545' }} />
              <p
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '12px',
                  lineHeight: '18px',
                  color: '#dc3545',
                  margin: 0,
                }}
              >
                {error}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="admin-email"
                className="block mb-2"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#555',
                }}
              >
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                placeholder="admin@livingspacehub.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl text-sm transition-all duration-200"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  backgroundColor: '#f8f6f3',
                  border: '1px solid #e8e5e0',
                  color: 'var(--text-dark)',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary-color)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(90, 90, 64, 0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e8e5e0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="admin-password"
                className="block mb-2"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#555',
                }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 pr-12 rounded-xl text-sm transition-all duration-200"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    backgroundColor: '#f8f6f3',
                    border: '1px solid #e8e5e0',
                    color: 'var(--text-dark)',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary-color)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(90, 90, 64, 0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e8e5e0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors"
                  style={{ color: '#aaa' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#666')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#aaa')}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Demo Credentials Hint */}
            <div
              className="rounded-xl px-4 py-3"
              style={{
                backgroundColor: 'rgba(212, 163, 115, 0.08)',
                border: '1px solid rgba(212, 163, 115, 0.15)',
              }}
            >
              <p
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '11px',
                  lineHeight: '18px',
                  color: '#b08a5e',
                  margin: 0,
                  textAlign: 'center',
                }}
              >
                <strong>Demo credentials:</strong> Use any email &amp; any password to sign in.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-full text-white font-bold text-[13px] tracking-[0.08em] uppercase transition-all duration-300"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                backgroundColor: 'var(--primary-color)',
                boxShadow: '0 4px 20px rgba(90, 90, 64, 0.25)',
                opacity: isLoading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#4d4d37';
                  e.currentTarget.style.boxShadow = '0 6px 30px rgba(90, 90, 64, 0.35)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary-color)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(90, 90, 64, 0.25)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
