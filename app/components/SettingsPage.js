'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage({ onNavigate, darkMode = false, setDarkMode }) {
  const [options, setOptions] = useState({
    emailNotifications: false,
    accessibility: false,
    darkMode: darkMode
  });

  useEffect(() => {
    setOptions(prev => ({
      ...prev,
      darkMode: darkMode
    }));
  }, [darkMode]);

  const toggleSetting = (field) => {
    if (field === 'darkMode') {
      setDarkMode && setDarkMode(!darkMode);
    } else {
      setOptions(prev => ({
        ...prev,
        [field]: !prev[field]
      }));
    }
  };

  const saveSettings = () => {
    console.log('Saving settings:', options);
    alert('Settings updated successfully!');
  };

  const signOut = () => {
    onNavigate?.('landing');
  };

  const changePass = () => {
    console.log('Change password clicked');
  };

  const addPayment = () => {
    console.log('Add payment method clicked');
  };

  return (
    <>
      {darkMode && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-0 transition-opacity duration-300"></div>
      )}
      
      <div className={`rounded-2xl shadow-2xl p-8 w-full max-w-4xl mx-auto relative z-10 transition-all duration-300 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        
        <div className="flex items-center justify-center mb-4 relative">
          <h2 className={`text-2xl font-medium flex items-center transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            <svg className="w-6 h-6 mr-2 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </h2>
          <button 
            onClick={() => onNavigate?.('home')}
            className={`absolute right-0 p-2 rounded-full transition-all duration-300 ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <svg className={`w-6 h-6 transition-colors duration-300 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          <div className="space-y-6 ml-12 mt-4">
            
            <div className={`flex items-center justify-between border-b-2 pb-2 transition-colors duration-300 ${
              darkMode ? 'border-gray-600' : 'border-gray-300'
            }`} style={{ width: '400px' }}>
              <label className={`font-medium transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`} style={{ width: '180px' }}>Change password</label>
              <div className="flex-1 text-right">
                <button
                  onClick={changePass}
                  className={`transition-colors duration-300 ${
                    darkMode ? 'text-gray-400 hover:text-purple-400' : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className={`flex items-center justify-between border-b-2 pb-2 transition-colors duration-300 ${
              darkMode ? 'border-gray-600' : 'border-gray-300'
            }`} style={{ width: '400px' }}>
              <label className={`font-medium transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`} style={{ width: '180px' }}>Add a payment method</label>
              <div className="flex-1 text-right">
                <button
                  onClick={addPayment}
                  className={`transition-colors duration-300 ${
                    darkMode ? 'text-gray-400 hover:text-purple-400' : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            </div>

            <div className={`flex items-center justify-between border-b-2 pb-2 transition-colors duration-300 ${
              darkMode ? 'border-gray-600' : 'border-gray-300'
            }`} style={{ width: '400px' }}>
              <label className={`font-medium transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`} style={{ width: '180px' }}>Email notifications</label>
              <div className="flex-1 text-right">
                <button
                  onClick={() => toggleSetting('emailNotifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    options.emailNotifications ? 'bg-purple-600' : (darkMode ? 'bg-gray-600' : 'bg-gray-300')
                  }`}
                >
                  <span
                    className={`h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      options.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className={`flex items-center justify-between border-b-2 pb-2 transition-colors duration-300 ${
              darkMode ? 'border-gray-600' : 'border-gray-300'
            }`} style={{ width: '400px' }}>
              <label className={`font-medium flex items-center transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`} style={{ width: '180px' }}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Accessibility
              </label>
              <div className="flex-1 text-right">
                <button
                  onClick={() => toggleSetting('accessibility')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    options.accessibility ? 'bg-purple-600' : (darkMode ? 'bg-gray-600' : 'bg-gray-300')
                  }`}
                >
                  <span
                    className={`h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      options.accessibility ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => toggleSetting('darkMode')}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 mb-2 ${
                    darkMode ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`h-6 w-6 transform rounded-full bg-gray-800 flex items-center justify-center transition-transform duration-200 ${
                      darkMode ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  >
                    {darkMode ? (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                      </svg>
                    )}
                  </span>
                </button>
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>Dark mode</span>
              </div>
            </div>

          </div>

          <div className="flex flex-col justify-center space-y-6 ml-20">
            <button
              onClick={saveSettings}
              className="w-auto px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-300"
            >
              Save Changes
            </button>
          </div>
        </div>

        <div className="absolute bottom-6 right-6">
          <button
            onClick={signOut}
            className={`flex flex-col items-center justify-center transition-colors duration-300 ${
              darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600'
            }`}
          >
            <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v6" />
            </svg>
            <span className="text-sm font-medium">Log out</span>
          </button>
        </div>
      </div>
    </>
  );
}