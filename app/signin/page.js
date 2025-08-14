'use client';

import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
//import { AuthContext } from '@/context/AuthContext';
import { AuthContext } from "../../context/AuthContext";


// ✅ PostHog helpers
import { identifyUser, trackActiveUser } from '../analytics';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const router = useRouter();
  const { login, signInWithGoogle } = useContext(AuthContext);
  const [error, setError] = useState("");  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async () => {
    if (!acceptTerms) {
      alert('Please accept the terms and privacy policy');
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const userCredential = await login(formData.email, formData.password);
      const user = userCredential.user || userCredential;

      // ✅ PostHog tracking after login success
      identifyUser(user.uid, { email: user.email });
      trackActiveUser({ source: 'login_email' });

      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
      window.alert("Invalid login, please check User or Password!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithGoogle();
      const user = userCredential.user || userCredential;

      // ✅ PostHog tracking for Google login
      identifyUser(user.uid, { email: user.email });
      trackActiveUser({ source: 'login_google' });

      router.push('/dashboard');
    } catch (err) {
      window.alert("Google sign-in failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  const handleSignUp = () => {
    router.push('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-300 to-teal-400 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-6xl md:text-7xl font-light text-white tracking-tight drop-shadow-lg text-center">
          Sleeping<span className="text-purple-600 font-medium">AI</span>
        </h1>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl">
        <h2 className="text-2xl font-medium text-gray-800 mb-8">Log In</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200 text-gray-700 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                onClick={handleForgotPassword}
                className="text-sm text-gray-600 hover:text-purple-600 transition-colors duration-200"
              >
                Forgot password?
              </button>
            </div>

            {/* Or Login with */}
            <div className="text-center mt-8">
              <div className="flex items-center justify-center mb-4">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-sm text-gray-500">Or Login with</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>
              <button
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 mx-auto"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col justify-center space-y-6">
            <button
              onClick={handleLogin}
              disabled={isLoading || !acceptTerms}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Logging in...
                </div>
              ) : (
                'Log in'
              )}
            </button>

            {/* Terms */}
            <div className="text-center">
              <label htmlFor="acceptTerms" className="text-sm text-gray-600 cursor-pointer flex items-center justify-center">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mr-2"
                />
                I accept the terms and privacy policy
              </label>
            </div>

            {/* Sign Up */}
            <div className="text-center mt-20">
              <span className="text-sm text-gray-600">
                Do not have an account?{' '}
                <button
                  onClick={handleSignUp}
                  className="text-purple-600 hover:text-purple-700 font-medium hover:underline transition-colors duration-200"
                >
                  Sign up
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
