'use client';

import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';

import { auth, db } from '../firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  increment,
} from 'firebase/firestore';

export default function GeneratePage({ onNavigate, darkMode = false }) {
  const topicOptions = [
    { id: 'nature', label: 'Nature' },
    { id: 'music', label: 'Music' },
    { id: 'science', label: 'Science' },
    { id: 'inventions', label: 'Inventions & Technology' },
    { id: 'space', label: 'Space & Astronomy' },
    { id: 'mythology', label: 'Mythology' },
    { id: 'mindfulness', label: 'Mindfulness & Emotions' },
    { id: 'history', label: 'History' },
  ];

  const musicOptions = [
    { id: 'ambient', label: 'Ambient' },
    { id: 'rainthunder', label: 'Rain & Thunder' },
    { id: 'naturesounds', label: 'Nature Sounds' },
    { id: 'nomusic', label: 'No Music' },
  ];

  const storyPrompts = [
    'Add a peaceful twist at the end',
    'Make it feel like a dream',
    'Include a moment of wonder',
    'Let the story begin with a surprise',
    'End with a calming message',
  ];

  const [selectedTopic, setSelectedTopic] = useState('');
  const [lengthMinutes, setLengthMinutes] = useState(10);
  const [voice, setVoice] = useState('female');
  const [backgroundMusic, setBackgroundMusic] = useState('nomusic');
  const [customPrompt, setCustomPrompt] = useState('');
  const [storyTitle, setStoryTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [successModal, setSuccessModal] = useState(false);

  // ✅ Helper to build the payload PlayerControlsPage expects
  const voiceLabel = voice === 'female' ? 'Female Voice' : 'Male Voice';
  const buildStoryData = (s) => ({
    title: s?.title || storyTitle || 'Untitled',
    narrator: voiceLabel,
    content: s?.fullText || s?.content || s?.summary || 'Your story is ready.',
    audioUrl: s?.audioUrl || null,
  });

  const saveToLocal = (stories) => {
    try {
      const existing = JSON.parse(localStorage.getItem('myStories') || '[]');
      const stamped = stories.map(s => ({
        ...s,
        topic: selectedTopic,
        lengthMin: lengthMinutes,
        voice,
        backgroundMusic,
        customPrompt,
        storyTitle,
        savedAt: new Date().toISOString(),
      }));
      localStorage.setItem('myStories', JSON.stringify([...stamped, ...existing]));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  };

  const saveToFirestore = async (stories) => {
    try {
      const user = auth.currentUser;
      if (!user) return stories;
      const colRef = collection(db, 'users', user.uid, 'stories');
      const created = [];
      for (const s of stories) {
        const ref = await addDoc(colRef, {
          title: s.title || storyTitle,
          summary: s.summary,
          topic: selectedTopic,
          lengthMin: lengthMinutes,
          voice,
          backgroundMusic,
          customPrompt,
          storyTitle,
          audioUrl: s.audioUrl || null,
          isPublic: false,
          createdAt: serverTimestamp(),
        });
        created.push({ ...s, id: ref.id, isPublic: false });
      }
      return created;
    } catch (e) {
      console.error('Error writing to Firestore', e);
      return stories;
    }
  };

  const debitCredits = async (cost = 1) => {
    const user = auth.currentUser;
    if (!user) {
      alert('You must be logged in.');
      return { ok: false, userRef: null, cost };
    }
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      alert('User not found. Try logging out and back in.');
      return { ok: false, userRef, cost };
    }
    const current = snap.data().credits || 0;
    if (current < cost) {
      alert('Not enough credits! Please buy more credits to generate a story.');
      return { ok: false, userRef, cost };
    }
    await updateDoc(userRef, { credits: increment(-cost) });
    return { ok: true, userRef, cost };
  };

  const handleGenerate = async () => {
    if (!selectedTopic) {
      alert('Please select at least one topic!');
      return;
    }

    setIsGenerating(true);
    setApiError(null);

    const { ok, userRef, cost } = await debitCredits(1);
    if (!ok) {
      setIsGenerating(false);
      return;
    }

    try {
      const res = await fetch('/api/generateStories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopic,
          numSummaries: 1,
          lengthMinutes,
          voice,
          backgroundMusic,
          customPrompt,
          storyTitle
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }

      const { stories: fetched } = await res.json();
      const stored = await saveToFirestore(fetched);
      saveToLocal(stored);
      setSummaries(stored);
      setSuccessModal(true);
    } catch (err) {
      console.error(err);
      setApiError(err.message || 'Generation failed');
      if (userRef) {
        await updateDoc(userRef, { credits: increment(cost) }).catch(() => {});
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const addPromptToCustom = (prompt) => {
    setCustomPrompt(prev => prev ? `${prev} ${prompt}` : prompt);
  };

  // Story selection view
  if (summaries.length > 0 && !successModal) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <button
          onClick={() => setSummaries([])}
          className={`text-sm hover:underline mb-4 transition-colors duration-300 ${
            darkMode ? 'text-purple-300' : 'text-purple-600'
          }`}
        >
          ← Change Options
        </button>

        <Swiper slidesPerView={1} spaceBetween={20} pagination={{ clickable: true }} className="h-auto">
          {summaries.map((s, i) => (
            <SwiperSlide key={i}>
              <div className={`rounded-xl shadow p-4 transition-colors duration-300 ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
              }`}>
                <h3 className="font-bold mb-2 truncate">{s.title}</h3>
                <p className={`text-sm line-clamp-3 mb-4 transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>{s.summary}</p>

                {/* ✅ Open PlayerControls directly */}
                <button
                  onClick={() =>
                    onNavigate('player', {
                      storyData: buildStoryData(s)
                    })
                  }
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                  Play this
                </button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  }

  return (
    <>
      {darkMode && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-0 transition-opacity duration-300"></div>
      )}

      <div className={`rounded-3xl shadow-2xl backdrop-blur-sm bg-opacity-95 p-6 max-w-7xl mx-auto relative z-10 transition-all duration-300 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-xl font-semibold flex items-center transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            Generate Your Bedtime Story
          </h1>
          <button 
            onClick={() => onNavigate('home')}
            className={`p-2 rounded-full transition-all duration-300 ${
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Topic Selection */}
          <div>
            <h2 className={`text-lg font-bold mb-4 transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>Topic</h2>
            <div className="grid grid-cols-1 gap-2">
              {topicOptions.map((topic) => (
                <label key={topic.id} className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="topic"
                    value={topic.id}
                    checked={selectedTopic === topic.id}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`flex items-center justify-center w-4 h-4 border-2 rounded-full mr-3 transition-all duration-200 ${
                    selectedTopic === topic.id
                      ? 'bg-purple-600 border-purple-600'
                      : (darkMode 
                        ? 'border-gray-500 group-hover:border-purple-400' 
                        : 'border-gray-400 group-hover:border-purple-400')
                  }`}>
                    {selectedTopic === topic.id && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className={`text-sm transition-colors duration-200 ${
                    selectedTopic === topic.id 
                      ? 'text-purple-700 font-medium' 
                      : (darkMode 
                        ? 'text-gray-300 group-hover:text-purple-400' 
                        : 'text-gray-700 group-hover:text-purple-600')
                  }`}>
                    {topic.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Settings Column */}
          <div className="space-y-6">
            {/* Story Length */}
            <div>
              <h2 className={`text-lg font-bold mb-4 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>Narration Length</h2>
              <div className="space-y-2">
                {[5, 10, 20].map(length => (
                  <label key={length} className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="length"
                      value={length}
                      checked={lengthMinutes === length}
                      onChange={() => setLengthMinutes(length)}
                      className="sr-only"
                    />
                    <div className={`flex items-center justify-center w-4 h-4 border-2 rounded-full mr-3 transition-all duration-200 ${
                      lengthMinutes === length
                        ? 'bg-purple-600 border-purple-600'
                        : (darkMode 
                          ? 'border-gray-500 group-hover:border-purple-400' 
                          : 'border-gray-400 group-hover:border-purple-400')
                    }`}>
                      {lengthMinutes === length && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className={`text-sm transition-colors duration-200 ${
                      lengthMinutes === length 
                        ? 'text-purple-700 font-medium' 
                        : (darkMode 
                          ? 'text-gray-300 group-hover:text-purple-400' 
                          : 'text-gray-700 group-hover:text-purple-600')
                    }`}>
                      {length} min
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Background Music */}
            <div>
              <h2 className={`text-lg font-bold mb-4 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>Background Music</h2>
              <div className="space-y-2">
                {musicOptions.map((music) => (
                  <label key={music.id} className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="backgroundMusic"
                      value={music.id}
                      checked={backgroundMusic === music.id}
                      onChange={(e) => setBackgroundMusic(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`flex items-center justify-center w-4 h-4 border-2 rounded-full mr-3 transition-all duration-200 ${
                      backgroundMusic === music.id
                        ? 'bg-purple-600 border-purple-600'
                        : (darkMode 
                          ? 'border-gray-500 group-hover:border-purple-400' 
                          : 'border-gray-400 group-hover:border-purple-400')
                    }`}>
                      {backgroundMusic === music.id && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className={`text-sm transition-colors duration-200 ${
                      backgroundMusic === music.id 
                        ? 'text-purple-700 font-medium' 
                        : (darkMode 
                          ? 'text-gray-300 group-hover:text-purple-400' 
                          : 'text-gray-700 group-hover:text-purple-600')
                    }`}>
                      {music.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Voice Selection */}
            <div>
              <h2 className={`text-lg font-bold mb-4 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>Voice</h2>
              <div className="space-y-2">
                {['female', 'male'].map(v => (
                  <label key={v} className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="voice"
                      value={v}
                      checked={voice === v}
                      onChange={(e) => setVoice(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`flex items-center justify-center w-4 h-4 border-2 rounded-full mr-3 transition-all duration-200 ${
                      voice === v
                        ? 'bg-purple-600 border-purple-600'
                        : (darkMode 
                          ? 'border-gray-500 group-hover:border-purple-400' 
                          : 'border-gray-400 group-hover:border-purple-400')
                    }`}>
                      {voice === v && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className={`text-sm transition-colors duration-200 ${
                      voice === v 
                        ? 'text-purple-700 font-medium' 
                        : (darkMode 
                          ? 'text-gray-300 group-hover:text-purple-400' 
                          : 'text-gray-700 group-hover:text-purple-600')
                    }`}>
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Custom Settings Column */}
          <div className="space-y-6">
            {/* Story Title */}
            <div>
              <h2 className={`text-lg font-bold mb-4 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>Add Title</h2>
              <input
                type="text"
                placeholder="e.g., 'Magical Forest Adventure'"
                value={storyTitle}
                onChange={(e) => setStoryTitle(e.target.value)}
                className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all duration-300 ${
                  darkMode 
                    ? 'border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400' 
                    : 'border-gray-300 bg-white text-gray-700 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Custom Prompt */}
            <div>
              <h2 className={`text-lg font-bold mb-4 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>Custom Prompt</h2>
              <div className={`flex items-center rounded-xl p-3 mb-4 transition-colors duration-300 ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <svg className={`w-5 h-5 mr-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-400'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                <textarea
                  placeholder="Further tweaks or story directions..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className={`flex-1 bg-transparent focus:outline-none text-sm resize-none h-20 transition-colors duration-300 ${
                    darkMode ? 'text-gray-200 placeholder-gray-400' : 'text-gray-700 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>

            {/* Story Enhancement Prompts */}
            <div>
              <h3 className={`text-sm font-medium mb-3 transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Enhance your story:</h3>
              <div className="flex flex-wrap gap-2">
                {storyPrompts.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => addPromptToCustom(prompt)}
                    className={`px-3 py-1.5 border-2 rounded-full text-xs font-medium transition-all duration-200 transform hover:scale-105 ${
                      darkMode 
                        ? 'border-purple-400 hover:border-purple-300 text-purple-300 hover:text-purple-200 bg-gray-700 hover:bg-gray-600' 
                        : 'border-purple-300 hover:border-purple-500 text-purple-700 hover:text-purple-800 bg-white hover:bg-purple-50'
                    }`}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedTopic}
            className={`px-8 py-3 rounded-xl font-bold text-base transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center ${
              isGenerating || !selectedTopic
                ? (darkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-300 text-gray-500')
                : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                Generate My Story
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {apiError && (
          <p className={`mt-4 text-center transition-colors duration-300 ${
            darkMode ? 'text-red-400' : 'text-red-600'
          }`}>
            {apiError}
          </p>
        )}
      </div>

      {/* Success Modal */}
      {successModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 pt-20">
          <div className={`rounded-3xl p-8 max-w-md w-full mx-4 relative transition-colors duration-300 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <button 
              onClick={() => setSuccessModal(false)}
              className={`absolute top-6 right-6 p-2 rounded-full transition-all duration-300 ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <svg className={`w-6 h-6 transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex justify-center mb-8 mt-4">
              <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <div className="text-center mb-8">
              <p className={`text-lg transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Your story <span className="text-purple-600 font-medium">
                  {storyTitle ? `"${storyTitle}"` : summaries[0]?.title || '(Untitled)'}
                </span> has been successfully created
              </p>
            </div>

            {/* ✅ Open PlayerControls with the first generated story */}
            <button
              onClick={() => {
                setSuccessModal(false);
                const first = summaries[0];
                onNavigate('player', {
                  storyData: buildStoryData(first)
                });
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold text-base rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Play Story
            </button>
          </div>
        </div>
      )}
    </>
  );
}
