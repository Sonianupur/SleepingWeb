'use client';

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

export default function ProfilePage({ onNavigate, darkMode = false, setDarkMode }) {
  const [profileData, setProfileData] = useState({
    name:     '',
    email:    '',
    mobile:   '',
    location: ''
  });
  const [loading, setLoading] = useState(true);

  // 1) On mount, fetch profile from Firestore (or initialize from auth)
  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) {
        onNavigate?.('landing');
        return;
      }
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setProfileData(snap.data());
      } else {
        const initial = {
          name:     user.displayName || '',
          email:    user.email || '',
          mobile:   '',
          location: ''
        };
        setProfileData(initial);
        await setDoc(ref, initial);
      }
      setLoading(false);
    };

    fetchProfile().catch(err => {
      console.error('Failed to load profile:', err);
      setLoading(false);
    });
  }, [onNavigate]);

  // 2) Handle input changes
  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  // 3) Save back to Firestore
  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not signed in');
      const ref = doc(db, 'users', user.uid);
      await updateDoc(ref, profileData);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4) Logout handler
  const handleLogout = () => {
    auth.signOut().then(() => onNavigate?.('landing'));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Loading profile…</p>
      </div>
    );
  }

  const containerCls = `rounded-2xl shadow-2xl p-8 w-full max-w-4xl mx-auto relative transition-colors duration-300 ${
    darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'
  }`;
  const borderLine = darkMode ? 'border-gray-600' : 'border-gray-300';
  const labelCls   = darkMode ? 'text-gray-200' : 'text-gray-700';
  const backBtnCls = `p-2 rounded-full transition-all ${
    darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
  }`;
  const inputCls   = `flex-1 text-right px-0 py-1 border-0 focus:outline-none focus:ring-0 bg-transparent ${
    darkMode ? 'text-gray-100 placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'
  }`;
  const subtleTxt  = darkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={containerCls}>
      {/* Header */}
      <div className="flex items-center justify-center mb-6 relative">
        <h2 className={`text-2xl font-medium flex items-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Profile
        </h2>

        <div className="absolute right-0 flex items-center gap-2">
          {/* Optional Dark Mode Toggle (shown only if setDarkMode provided) */}
          {typeof setDarkMode === 'function' && (
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                darkMode ? 'bg-purple-600' : 'bg-gray-300'
              }`}
              aria-label="Toggle dark mode"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          )}

          <button onClick={() => onNavigate?.('home')} className={backBtnCls}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Avatar */}
      <div className="flex items-center mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mr-4 text-white text-xl font-bold">
          {profileData.name?.[0] || 'U'}
        </div>
        <div>
          <h3 className="text-xl font-semibold">{profileData.name || 'Your name'}</h3>
          <p className={subtleTxt}>{profileData.email}</p>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          {/* Name */}
          <div className={`flex items-center pb-2 border-b-2 ${borderLine}`}>
            <label className={`w-36 font-medium ${labelCls}`}>Name</label>
            <input
              type="text"
              value={profileData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              className={inputCls}
              placeholder="Add your name"
            />
          </div>

          {/* Email */}
          <div className={`flex items-center pb-2 border-b-2 ${borderLine}`}>
            <label className={`w-36 font-medium ${labelCls}`}>Email</label>
            <input
              type="email"
              value={profileData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              className={inputCls}
              placeholder="Add your email"
            />
          </div>

          {/* Mobile */}
          <div className={`flex items-center pb-2 border-b-2 ${borderLine}`}>
            <label className={`w-36 font-medium ${labelCls}`}>Mobile</label>
            <input
              type="tel"
              value={profileData.mobile}
              placeholder="Add number"
              onChange={e => handleInputChange('mobile', e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Location */}
          <div className={`flex items-center pb-2 border-b-2 ${borderLine}`}>
            <label className={`w-36 font-medium ${labelCls}`}>Location</label>
            <input
              type="text"
              value={profileData.location}
              onChange={e => handleInputChange('location', e.target.value)}
              className={inputCls}
              placeholder="City, Country"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="flex flex-col justify-start pt-12">
          <button
            onClick={handleSaveChanges}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="absolute bottom-6 right-6">
        <button
          onClick={handleLogout}
          className={`flex flex-col items-center transition ${
            darkMode ? 'text-gray-300 hover:text-red-400' : 'text-gray-600 hover:text-red-600'
          }`}
        >
          <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7" />
          </svg>
          <span className="text-sm font-medium">Log out</span>
        </button>
      </div>
    </div>
  );
}
