import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

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

  useEffect(() => {
    window.scrollTo(0, 0);
    setSubmitted(false);
  }, [location.pathname]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      navigate('/');
    }, 1200);
  };

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
            <p className="text-xs text-stone-500">Redirecting to homepage...</p>
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

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-[#56573C] hover:bg-[#474831] text-white font-bold text-xs tracking-wider uppercase rounded-full shadow-md transition-colors cursor-pointer"
              >
                {isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
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
