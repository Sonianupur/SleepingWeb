
'use client';

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

export default function ProfilePage({ onNavigate }) {
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
        // Not signed in → send to landing
        onNavigate?.('landing');
        return;
      }
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setProfileData(snap.data());
      } else {
        // No Firestore doc yet, fall back to auth info
        setProfileData({
          name:     user.displayName || '',
          email:    user.email || '',
          mobile:   '',
          location: ''
        });
        // Create a fresh doc
        await setDoc(ref, {
          name:     user.displayName || '',
          email:    user.email || '',
          mobile:   '',
          location: ''
        });
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
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
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
        <p className="text-gray-500">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl mx-auto relative">
      {/* Header */}
      <div className="flex items-center justify-center mb-6 relative">
        <h2 className="text-2xl font-medium text-gray-800 flex items-center">
          <svg className="w-6 h-6 mr-2 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Profile
        </h2>
        <button
          onClick={() => onNavigate?.('home')}
          className="absolute right-0 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Avatar */}
      <div className="flex items-center mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mr-4 text-white text-xl font-bold">
          {profileData.name?.[0] || 'U'}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{profileData.name}</h3>
          <p className="text-gray-600">{profileData.email}</p>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          {/** Name **/}
          <div className="flex items-center border-b-2 border-gray-300 pb-2">
            <label className="w-36 text-gray-700 font-medium">Name</label>
            <input
              type="text"
              value={profileData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              className="flex-1 text-right px-0 py-1 border-0 focus:outline-none bg-transparent"
            />
          </div>
          {/** Email **/}
          <div className="flex items-center border-b-2 border-gray-300 pb-2">
            <label className="w-36 text-gray-700 font-medium">Email</label>
            <input
              type="email"
              value={profileData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              className="flex-1 text-right px-0 py-1 border-0 focus:outline-none bg-transparent"
            />
          </div>
          {/** Mobile **/}
          <div className="flex items-center border-b-2 border-gray-300 pb-2">
            <label className="w-36 text-gray-700 font-medium">Mobile</label>
            <input
              type="tel"
              value={profileData.mobile}
              placeholder="Add number"
              onChange={e => handleInputChange('mobile', e.target.value)}
              className="flex-1 text-right px-0 py-1 border-0 focus:outline-none bg-transparent placeholder-gray-400"
            />
          </div>
          {/** Location **/}
          <div className="flex items-center border-b-2 border-gray-300 pb-2">
            <label className="w-36 text-gray-700 font-medium">Location</label>
            <input
              type="text"
              value={profileData.location}
              onChange={e => handleInputChange('location', e.target.value)}
              className="flex-1 text-right px-0 py-1 border-0 focus:outline-none bg-transparent"
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
          className="flex flex-col items-center text-gray-600 hover:text-red-600 transition"
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
