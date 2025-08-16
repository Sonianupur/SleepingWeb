'use client';

import { useContext, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../../context/AuthContext';

export const dynamic = 'force-dynamic';

function ForgotPasswordContent() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const router = useRouter();
  const { resetPassword } = useContext(AuthContext);

  const handleSendCode = async () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    // If you want the inline success UI instead of redirecting,
    // uncomment the block below and remove the redirect.
    /*
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsCodeSent(true);
    } catch (e) {
      alert('Failed to send reset code. Please try again.');
    } finally {
      setIsLoading(false);
    }
    */

    try {
      await resetPassword(email);
      window.alert('Password reset email sent. Check your inbox.');
      router.push('/signin');
    } catch (err) {
      console.error(err);
      window.alert('Error sending reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
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

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xl relative">
        {/* Back Button */}
        <button
          onClick={handleBackToLogin}
          className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Title */}
        <h2 className="text-2xl font-medium text-gray-800 mb-4 text-center">Forgot Password?</h2>

        {!isCodeSent ? (
          <>
            <p className="text-sm text-gray-600 mb-8 text-center leading-relaxed">
              Do not worry! It happens. Please enter the email associated with your account.
            </p>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendCode}
                  disabled={isLoading || !email}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-all duration-300 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </div>
                  ) : (
                    'Send Code'
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Check Your Email</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                We have sent a password reset code to <strong>{email}</strong>. Please check your inbox and follow the
                instructions to reset your password.
              </p>
            </div>

            <button
              onClick={handleBackToLogin}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300"
            >
              Back to Login
            </button>

            <div className="text-center mt-4">
              <span className="text-sm text-gray-600">
                Did not receive the code?{' '}
                <button
                  onClick={() => {
                    setIsCodeSent(false);
                    setEmail('');
                  }}
                  className="text-purple-600 hover:text-purple-700 font-medium hover:underline transition-colors duration-200"
                >
                  Try again
                </button>
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  // Suspense wrapper is safe and prevents CSR bailout errors during prerender.
  return (
    <Suspense fallback={<div />}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
