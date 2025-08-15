'use client';

import { useRouter } from 'next/navigation';

export default function Header({
  credits,
  onNavigate,
  currentView,
  darkMode = false,
  showNavigation = true
}) {
  const router = useRouter();

  const navItems = [
    { label: 'Home', key: 'home' },
    { label: 'Generate', key: 'generate' },
    { label: 'Library', key: 'library' },
    { label: 'Profile', key: 'profile' },
    { label: 'Settings', key: 'settings' },
  ];

  return (
    <div className="relative z-20 w-full">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-6 pt-6">
        {/* Left placeholder to balance center layout */}
        <div className="w-1/3"></div>

        {/* Centered Navigation */}
        <div className="w-1/3 flex justify-center gap-6 md:gap-8">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`px-6 py-3 rounded-md text-base font-medium transition-all duration-200
 ${
                currentView === item.key
                  ? 'bg-purple-600 text-white'
                  : darkMode
                    ? 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Credits & Sign Out */}
        <div className="w-1/3 flex justify-end items-center gap-4">
          <button
            onClick={() => router.push('/store')}
            className="bg-white bg-opacity-90 backdrop-blur-md rounded-md px-6 py-3 flex items-center gap-2 shadow border border-white border-opacity-30 transition-all hover:scale-105"
            title="Buy more credits"
          >
            <span className="text-yellow-500 text-lg">💰</span>
            <span className="text-gray-800 font-semibold text-lg">Credits : {credits}</span>
          </button>
          <button
            onClick={() => onNavigate('landing')}
            className="text-lg font-medium text-red-600 hover:underline"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Title and Slogan */}
      <div className="text-center px-4 pb-8 mt-4">
        <h1
          className={`text-6xl md:text-7xl font-light tracking-tight mb-2 transition-all duration-300 ${
            darkMode ? 'text-white drop-shadow-2xl' : 'text-white drop-shadow-lg'
          }`}
          style={{
            textShadow: darkMode ? '0 0 20px rgba(0,0,0,0.9), 2px 2px 8px rgba(0,0,0,1)' : ''
          }}
        >
          Sleeping<span className="text-purple-600 font-medium">AI</span>
        </h1>
        <p
          className={`text-xl md:text-2xl font-normal opacity-90 transition-all duration-300 ${
            darkMode ? 'text-gray-200' : 'text-gray-700'
          }`}
          style={{
            textShadow: darkMode ? '2px 2px 6px rgba(0,0,0,0.9)' : ''
          }}
        >
          Your Bedtime, Reimagined.
        </p>
      </div>
    </div>
  );
}
