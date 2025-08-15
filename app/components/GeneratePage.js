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

export default function GeneratePage({ onNavigate, darkMode = false  }) {
  const topicOptions = [
    'Nature',
    'Music',
    'Science',
    'Inventions & Technology',
    'Space & Astronomy',
    'Mythology',
    'Mindfulness & Emotions',
    'History',
  ];

  const musicOptions = [
    { id: 'ambience', label: 'Ambience' },
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [summaries, setSummaries] = useState([]);

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
          title: s.title,
          summary: s.summary,
          topic: selectedTopic,
          lengthMin: lengthMinutes,
          voice,
          backgroundMusic,
          customPrompt,
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
      alert('Please pick a topic first!');
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
        body: JSON.stringify({ topic: selectedTopic, numSummaries: 1, lengthMinutes, voice, backgroundMusic, customPrompt })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }

      const { stories: fetched } = await res.json();
      const stored = await saveToFirestore(fetched);
      saveToLocal(stored);
      setSummaries(stored);
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

  if (summaries.length === 0) {
    return (
      
      <div className="bg-white dark:bg-darkInner text-gray-800 dark:text-white rounded-lg shadow  px-8 py-8 max-w-7xl mx-auto relative">
        <h1 className="text-2xl font-semibold mb-4">Generate Your Bedtime Story</h1>

        <label className="block mb-4">
          <span className="block font-medium mb-1">Topic</span>
          <select
            value={selectedTopic}
            onChange={e => setSelectedTopic(e.target.value)}
            className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">— select a topic —</option>
            {topicOptions.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <label className="block mb-4">
          <span className="block font-medium mb-1">Narration Length</span>
          <div className="flex space-x-6">
            {[5, 10, 20].map(n => (
              <label key={n} className="flex items-center space-x-1">
                <input type="radio" name="length" value={n} checked={lengthMinutes === n} onChange={() => setLengthMinutes(n)} className="form-radio" />
                <span>{n} min</span>
              </label>
            ))}
          </div>
        </label>

        <label className="block mb-4">
          <span className="block font-medium mb-1">Voice</span>
          <div className="flex space-x-6">
            {['female','male'].map(v => (
              <label key={v} className="flex items-center space-x-1">
                <input type="radio" name="voice" value={v} checked={voice === v} onChange={() => setVoice(v)} className="form-radio" />
                <span>{v.charAt(0).toUpperCase()+v.slice(1)}</span>
              </label>
            ))}
          </div>
        </label>

        <label className="block mb-4">
          <span className="block font-medium mb-1">Background Music</span>
          <div className="flex space-x-6">
            {musicOptions.map(m => (
              <label key={m.id} className="flex items-center space-x-1">
                <input type="radio" name="music" value={m.id} checked={backgroundMusic === m.id} onChange={() => setBackgroundMusic(m.id)} className="form-radio" />
                <span>{m.label}</span>
              </label>
            ))}
          </div>
        </label>

        <div className="mb-4">
          <span className="block font-medium mb-1">Enhance your story:</span>
          <div className="flex flex-wrap gap-2">
            {storyPrompts.map(p => (
              <button
                key={p}
                onClick={() => setCustomPrompt(cp => cp ? `${cp} ${p}` : p)}
                className="px-3 py-1 border border-purple-300 text-purple-700 dark:text-purple-300 rounded-full hover:bg-purple-50 dark:hover:bg-gray-700 text-xs"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <label className="block mb-6">
          <span className="block font-medium mb-1">Custom Prompt</span>
          <textarea
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            className="w-full border rounded px-3 py-2 h-24 resize-none dark:bg-gray-800 dark:border-gray-700"
            placeholder="Further tweaks or story directions…"
          />
        </label>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`w-full py-2 rounded text-white font-semibold transition ${isGenerating ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'}`}
        >
          {isGenerating ? 'Generating…' : 'Generate Summaries'}
        </button>

        {apiError && <p className="mt-4 text-red-600 text-center">{apiError}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 dark:text-white">
      <button
        onClick={() => setSummaries([])}
        className="text-sm text-purple-600 dark:text-purple-300 hover:underline mb-4"
      >
        ← Change Options
      </button>

      <Swiper slidesPerView={1} spaceBetween={20} pagination={{ clickable: true }} className="h-auto">
        {summaries.map((s, i) => (
          <SwiperSlide key={i}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
              <h3 className="font-bold mb-2 truncate">{s.title}</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3 mb-4">{s.summary}</p>

              <button
                onClick={() =>
                  onNavigate('playback', {
                    stories: [s],
                    settings: { lengthMinutes, voice, backgroundMusic, customPrompt },
                  })
                }
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                Select
              </button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
