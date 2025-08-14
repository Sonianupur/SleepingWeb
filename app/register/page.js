'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../../context/AuthContext';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase'; 
// ✅ PostHog KPI helpers
import { identifyUser, trackSignup, trackActiveUser } from '../analytics';

export default function SignUpPage() {
  const { signUp } = useContext(AuthContext)
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignUp = async () => {
    if (!acceptTerms) {
      alert('Please accept the terms and privacy policy');
      return;
    }
    if (!formData.email || !formData.username || !formData.password) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Create Auth user
      const userCredential = await signUp(formData.email, formData.password);
      const user = userCredential.user || userCredential;

      // 2. Create Firestore user doc with 10 credits
      await setDoc(doc(db, "users", user.uid), {
        email: formData.email,
        username: formData.username,
        credits: 10,
        createdAt: Date.now()
      });

      // ✅ 3. PostHog tracking
      identifyUser(user.uid, { email: formData.email, username: formData.username });
      trackSignup(user.uid, { method: 'email_password' });
      trackActiveUser({ source: 'signup_flow' });

      alert("Account created successfully!");
      router.push('/dashboard');
    } catch (err) {
      alert("Registration failed. Please check your email & password and try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogIn = () => {
    router.push('/signin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-300 to-teal-400 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-6xl md:text-7xl font-light text-white tracking-tight drop-shadow-lg text-center">
          Sleeping<span className="text-purple-600 font-medium">AI</span>
        </h1>
      </div>

      {/* Sign Up Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl">
        <h2 className="text-2xl font-medium text-gray-800 mb-8">Create account</h2>
        
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

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Your username"
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
          </div>

          {/* Right Column */}
          <div className="flex flex-col justify-center space-y-6">
            <button
              onClick={handleSignUp}
              disabled={isLoading || !acceptTerms}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </div>
              ) : (
                'Sign up'
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

            {/* Log In */}
            <div className="text-center mt-20">
              <span className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={handleLogIn}
                  className="text-purple-600 hover:text-purple-700 font-medium hover:underline transition-colors duration-200"
                >
                  Log in
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
