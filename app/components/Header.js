'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Header({ credits, showMenu, setShowMenu, onNavigate, currentView }) {
  const menuRef = useRef(null);
  const router = useRouter(); 

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu, setShowMenu]);

  return (
    <div className="relative z-20">
      {/* Header Controls */}
      <div className="flex justify-end items-center p-6">
        <div className="flex items-center gap-4">
          {/* Credits Display */}
          <button
            onClick={() => router.push('/store')}
            className="bg-white bg-opacity-90 backdrop-blur-md rounded-2xl px-5 py-2 flex items-center gap-3 shadow-lg border border-white border-opacity-30 cursor-pointer transition-all hover:scale-105"
            style={{ outline: 'none' }}
            title="Buy more credits"
            aria-label="Buy more credits"
          >
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">💰</span>
            </div>
            <span className="text-gray-800 font-medium text-lg">Credits : {credits}</span>
          </button>
          {/* Menu Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-3 hover:bg-opacity-90 transition-all duration-200 shadow-lg border border-white border-opacity-30"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Conditional Logo/Header based on current page */}
      {currentView === 'generate' ? (
        <div>
          {/* Normal size logo for generate page */}
          <div className="text-center px-4 pb-6">
            <h1 className="text-6xl md:text-7xl font-light text-white text-center tracking-tight mb-2 drop-shadow-lg">
              Sleeping<span className="text-purple-600 font-medium">AI</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 text-center font-normal opacity-90">Your Bedtime, Reimagined.</p>
          </div>
        </div>
      ) : (
        <div className="text-center px-4 pb-8">
          <h1 className="text-6xl md:text-7xl font-light text-white text-center tracking-tight mb-2 drop-shadow-lg">
            Sleeping<span className="text-purple-600 font-medium">AI</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 text-center font-normal opacity-90">Your Bedtime, Reimagined.</p>
        </div>
      )}

      {/* Menu */}
      {showMenu && (
        <div ref={menuRef} className="fixed top-20 right-6 w-80 z-50" style={{ perspective: '1000px' }}>
          <div className="w-full transition-transform duration-700 ease-in-out" style={{ transformStyle: 'preserve-3d', transform: 'rotateY(180deg)' }}>
            <div className="w-full bg-white rounded-3xl shadow-2xl border border-gray-100" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Menu</h3>
                  <button onClick={() => setShowMenu(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-2">
                  <button onClick={() => { setShowMenu(false); onNavigate('generate'); }} className="w-full text-left py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-xl text-base font-medium transition-all duration-200">
                    Generate
                  </button>
                  <button onClick={() => { setShowMenu(false); onNavigate('library'); }} className="w-full text-left py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-xl text-base font-medium transition-all duration-200">
                    Library
                  </button>
                  <button onClick={() => { setShowMenu(false); onNavigate('profile'); }} className="w-full text-left py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-xl text-base font-medium transition-all duration-200">
                    Profile
                  </button>
                  <button onClick={() => { setShowMenu(false); onNavigate('settings'); }} className="w-full text-left py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-xl text-base font-medium transition-all duration-200">
                    Settings
                  </button>
                  <div className="border-t border-gray-200 my-4"></div>
                  <button onClick={() => onNavigate('landing')} className="w-full text-left py-3 px-4 text-red-600 hover:bg-red-50 rounded-xl text-base font-medium transition-all duration-200">
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
