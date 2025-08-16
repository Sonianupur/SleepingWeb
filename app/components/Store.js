'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const creditPacks = [
  {
    label: '30 Credits',
    price: '£3.00',
    url: 'https://buy.stripe.com/test_7sYaEX1UUatJcQ4cLua7C00',
  },
  {
    label: '60 Credits',
    price: '£6.00',
    url: 'https://buy.stripe.com/test_eVqdR90QQdFV7vK5j2a7C01',
  },
];

export default function Store() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  // purely visual highlight
  const plans = useMemo(
    () => creditPacks.map(p => ({ ...p, popular: p.label.toLowerCase().includes('60') })),
    []
  );

  return (
    <div
      className={`min-h-screen flex items-start justify-center py-12 px-4 transition-colors ${
        darkMode
          ? 'bg-slate-900 text-gray-100'
          : 'bg-gradient-to-br from-slate-900 via-purple-300 to-teal-400 text-gray-900'
      }`}
    >
      
      <div
        className={`relative z-10 w-full max-w-3xl rounded-3xl border shadow-2xl backdrop-blur-md p-6 ${
          darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/50 border-black/70'
        }`}
      >
        {/* Card header: Back + dark toggle */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-purple-700 text-white hover:bg-purple-800 shadow"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>

          <button
            onClick={() => setDarkMode(v => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              border-2 border-black ${
              darkMode ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            aria-label="Toggle dark mode"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Title + subtitle */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-purple-700">Buy Credits</h1>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Purchase credits to unlock and enjoy more AI-generated bedtime stories.
          </p>
          <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Payments are securely processed by Stripe. You can use test cards while developing.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plans.map(plan => (
            <div
              key={plan.label}
              className={`relative rounded-2xl border shadow-lg overflow-hidden transition-all hover:shadow-xl ${
                darkMode ? 'bg-gray-900/70 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-3 text-xs font-semibold px-2 py-1 rounded-full bg-purple-600 text-white shadow">
                  Most Popular
                </div>
              )}

              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {plan.label}
                  </h3>
                  <div className="text-right">
                    <div className="text-xl font-bold">{plan.price}</div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>one-time</div>
                  </div>
                </div>

                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Instant delivery to your account.
                </p>

                <a
                  href={plan.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Buy Now
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Fine print */}
        <div className={`mt-6 text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          You’ll be redirected to Stripe Checkout. After payment, return to the app to see your new credits.
        </div>
      </div>
    </div>
  );
}
