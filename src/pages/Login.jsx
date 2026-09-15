import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { authErrorMessage, useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // Mode is 'signup' if route is /signup or /register, otherwise 'login'
  const isSignUp = location.pathname.includes('signup') || location.pathname.includes('register');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { login, signup, resetPassword, user, loading } = useAuth();
  const redirectTo = location.state?.from || '/account';

  useEffect(() => {
    window.scrollTo(0, 0);
    setSubmitted(false);
    setError('');
    setResetSent(false);
  }, [location.pathname]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (isSignUp && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      if (isSignUp) {
        await signup({ name: formData.fullName, email: formData.email, password: formData.password });
      } else {
        await login(formData.email, formData.password);
      }
      setSubmitted(true);
      setTimeout(() => navigate(redirectTo, { replace: true }), 900);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    if (!formData.email.trim()) {
      setError('Enter your email address above, then click "Forgot password?" again.');
      return;
    }
    try {
      await resetPassword(formData.email);
      setResetSent(true);
    } catch (err) {
      setError(authErrorMessage(err));
    }
  };

  // Already signed in (and not in the middle of the success animation)
  if (!loading && user && !submitted) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center py-8 px-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-stone-200/50 text-center relative">
        {/* Title & Subtitle */}
        <h1 className="font-serif text-3xl font-bold text-[#1a1a1a] mb-1">
          {isSignUp ? 'Create Account' : 'Login'}
        </h1>
        <p className="text-xs text-stone-500 mb-8 font-medium">
          {isSignUp ? 'Join our community of design lovers' : 'Welcome back to Living Space Hub'}
        </p>

        {submitted ? (
          <div className="py-8 space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              ✓
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900">
              {isSignUp ? 'Account Created!' : 'Welcome Back!'}
            </h3>
            <p className="text-xs text-stone-500">Redirecting…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            {/* Full Name (Sign Up only) */}
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold uppercase text-stone-800 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-[#1a1a1a] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#56573C] focus:border-transparent"
                />
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold uppercase text-stone-800 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-[#1a1a1a] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#56573C] focus:border-transparent"
              />
            </div>

            {/* Password Fields */}
            {isSignUp ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-800 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-[#1a1a1a] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#56573C] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-800 mb-2">
                    Confirm
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-[#1a1a1a] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#56573C] focus:border-transparent"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase text-stone-800 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-[#1a1a1a] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#56573C] focus:border-transparent"
                />
              </div>
            )}

            {!isSignUp && (
              <div className="text-right -mt-2">
                <button type="button" onClick={handleForgotPassword} className="text-xs text-[#0d6efd] hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            {resetSent && (
              <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                Password reset email sent. Check your inbox (and spam folder).
              </p>
            )}

            {error && (
              <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={busy}
                className="w-full py-3.5 bg-[#56573C] hover:bg-[#474831] text-white font-bold text-xs tracking-wider uppercase rounded-full shadow-md transition-colors cursor-pointer disabled:opacity-60"
              >
                {busy ? 'PLEASE WAIT…' : isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
              </button>
            </div>
          </form>
        )}

        {/* Toggle Mode & Back to Home Links */}
        <div className="mt-6 pt-2 text-center text-xs text-stone-600 space-y-3">
          <p>
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <Link to="/login" className="text-[#0d6efd] font-medium hover:underline">
                  Login
                </Link>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <Link to="/signup" className="text-[#0d6efd] font-medium hover:underline">
                  Sign Up
                </Link>
              </>
            )}
          </p>

          <div>
            <Link to="/" className="text-xs text-stone-500 underline hover:text-stone-800">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
