'use client';

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  collectionGroup,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  addDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

/* ---------- Cover image helper (front-end only) ---------- */
const COVER_MAP = {
  // exact/contains (title keywords)
  'echoes in the void': 'echoes-void.jpg',
  'road to slumber': 'road-slumber.jpg',
  'tropical drift': 'tropical-drift.jpg',
  'neon nightfall': 'neon-nightfall.jpg',
  'ocean dreams': 'ocean-dreams.jpg',
  'forest whispers': 'forest-whispers.jpg',

  // topic fallbacks
  nature: 'nature.jpg',
  science: 'science.jpg',
  history: 'history.jpg',
  philosophy: 'philosophy.jpg',
  fantasy: 'fantasy.jpg',
  space: 'science.jpg', // reuse science.jpg for space fallback
};

function pickCover({ title = '', topic = '' } = {}) {
  const t = String(title).toLowerCase().trim();
  const k = String(topic).toLowerCase().trim();

  // try title keyword contains
  for (const [key, file] of Object.entries(COVER_MAP)) {
    if (t && t.includes(key)) return `/images/${file}`;
  }
  // topic fallback
  if (COVER_MAP[k]) return `/images/${COVER_MAP[k]}`;

  // default background
  return '/images/sleepingai-bg.jpg';
}
/* --------------------------------------------------------- */

export default function LibraryPage({ onNavigate, darkMode = false }) {
  const [currentTab, setCurrentTab]     = useState('private'); // 'private' | 'community'
  const [privateFS, setPrivateFS]       = useState([]);        // your stories from Firestore
  const [community, setCommunity]       = useState([]);        // public stories
  const [localStories, setLocalStories] = useState([]);        // stories from localStorage
  const [syncing, setSyncing]           = useState(false);

  // 1) Listen to Firestore: your own stories
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const colRef = collection(db, 'users', user.uid, 'stories');
    const qRef = query(colRef, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(qRef, snap => {
      setPrivateFS(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // 2) Listen to Firestore: public stories
  useEffect(() => {
    const qRef = query(
      collectionGroup(db, 'stories'),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(qRef, snap => {
      setCommunity(
        snap.docs.map(d => {
          const parts = d.ref.path.split('/'); // users/{uid}/stories/{sid}
          return { id: d.id, author: parts[1], ...d.data() };
        })
      );
    });
    return unsub;
  }, []);

  // 3) Read localStorage once
  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem('myStories') || '[]');
      setLocalStories(arr);
    } catch {
      setLocalStories([]);
    }
  }, []);

  // 4) Sync local → Firestore (kept as-is; safe)
  const syncLocalToFS = async () => {
    if (localStories.length === 0) return;
    setSyncing(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not signed in');
      const colRef = collection(db, 'users', user.uid, 'stories');

      await Promise.all(
        localStories.map(s =>
          addDoc(colRef, {
            title: s.title,
            summary: s.summary,
            topic: s.topic,
            lengthMin: s.lengthMin,
            voice: s.voice,
            backgroundMusic: s.backgroundMusic,
            customPrompt: s.customPrompt,
            audioUrl: s.audioUrl || null,
            // (not required) you could also store `image` if you later want
            isPublic: false,
            createdAt: serverTimestamp(),
          })
        )
      );

      localStorage.removeItem('myStories');
      setLocalStories([]);
    } catch (e) {
      console.error('Sync failed', e);
      alert('Failed to sync to Firestore: ' + e.message);
    } finally {
      setSyncing(false);
    }
  };

  // 5) Toggle share/unshare for your Firestore stories
  const togglePrivacy = async (story) => {
    const user = auth.currentUser;
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'stories', story.id);
    await updateDoc(ref, { isPublic: !story.isPublic });
  };

  // Rename (local or Firestore)
  const renameStory = async (story) => {
    const newTitle = prompt('New title:', story.title || 'Untitled');
    if (!newTitle) return;

    if (story._local) {
      try {
        const arr = JSON.parse(localStorage.getItem('myStories') || '[]');
        const idx = arr.findIndex(
          s =>
            s.title === story.title &&
            s.summary === story.summary &&
            s.savedAt === story.savedAt
        );
        if (idx >= 0) {
          arr[idx].title = newTitle;
          localStorage.setItem('myStories', JSON.stringify(arr));
          setLocalStories(arr);
        }
      } catch (e) {
        console.error('Failed to rename local story', e);
      }
      return;
    }

    const user = auth.currentUser;
    if (!user || !story.id) return;
    const ref = doc(db, 'users', user.uid, 'stories', story.id);
    await updateDoc(ref, { title: newTitle });
  };

  // Download (MP3 if present; else TXT of summary)
  const downloadStory = (story) => {
    if (story.audioUrl) {
      const a = document.createElement('a');
      a.href = story.audioUrl;
      a.download = `${(story.title || 'story').replace(/\s+/g, '_')}.mp3`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }
    const blob = new Blob([story.summary || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(story.title || 'story').replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Build payload for PlayerControls
  const buildStoryData = (s) => ({
    title: s?.title || 'Untitled',
    narrator: s?.voice ? String(s.voice).charAt(0).toUpperCase() + String(s.voice).slice(1) : 'Narrator',
    content: s?.summary || 'Your story is ready.',
    audioUrl: s?.audioUrl || null,
  });

  // Combine local + firestore for private tab
  const privateCombined = [
    ...localStories.map((s, i) => ({ ...s, _local: true, key: `L${i}` })),
    ...privateFS.map(s => ({ ...s, _local: false, key: s.id })),
  ];
  const stories = currentTab === 'private' ? privateCombined : community;

  const dateLabel = (s) => {
    if (s._local && s.savedAt) return new Date(s.savedAt).toLocaleDateString();
    if (s.createdAt && typeof s.createdAt.toDate === 'function') {
      return new Date(s.createdAt.toDate()).toLocaleDateString();
    }
    return '';
  };

  return (
    <>
      {darkMode && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-0 transition-opacity duration-300"></div>
      )}

      <div
        className={`backdrop-blur-md rounded-3xl shadow-2xl border transition-all duration-300 p-4 w-[950px] mx-auto relative z-10 min-h-[450px] ${
          darkMode
            ? 'bg-gray-800 bg-opacity-90 border-gray-700'
            : 'bg-white bg-opacity-90 border-white border-opacity-30'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-center mb-4">
          <h1
            className={`text-xl font-light text-center tracking-tight transition-colors duration-300 flex items-center ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}
            style={{ textShadow: darkMode ? '2px 2px 6px rgba(0,0,0,0.9)' : '' }}
          >
            <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Library
          </h1>
          <button
            onClick={() => onNavigate('home')}
            className={`absolute top-4 right-4 backdrop-blur-sm rounded-xl p-2 transition-all duration-300 shadow-lg border ${
              darkMode
                ? 'bg-gray-800 bg-opacity-80 border-gray-700 hover:bg-opacity-90 text-gray-300'
                : 'bg-white bg-opacity-80 border-white border-opacity-30 hover:bg-opacity-90 text-gray-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Tabs + Sync */}
        <div className="flex justify-center mb-6 gap-2">
          <button
            onClick={() => setCurrentTab('private')}
            className={`px-6 py-2 rounded-xl font-medium text-base transition-all duration-300 shadow-lg border ${
              currentTab === 'private'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-600'
                : darkMode
                ? 'bg-gray-800 bg-opacity-80 border-gray-700 text-gray-300 hover:bg-opacity-90'
                : 'bg-white bg-opacity-80 border-white border-opacity-30 text-gray-700 hover:bg-opacity-90'
            }`}
          >
            Private
          </button>
          <button
            onClick={() => setCurrentTab('community')}
            className={`px-6 py-2 rounded-xl font-medium text-base transition-all duration-300 shadow-lg border ${
              currentTab === 'community'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-600'
                : darkMode
                ? 'bg-gray-800 bg-opacity-80 border-gray-700 text-gray-300 hover:bg-opacity-90'
                : 'bg-white bg-opacity-80 border-white border-opacity-30 text-gray-700 hover:bg-opacity-90'
            }`}
          >
            Community
          </button>

          {currentTab === 'private' && localStories.length > 0 && (
            <button
              onClick={syncLocalToFS}
              disabled={syncing}
              className="ml-2 px-4 py-2 rounded-xl font-medium text-base transition-all duration-300 shadow-lg border bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
            >
              {syncing ? 'Syncing…' : 'Sync Local → Firestore'}
            </button>
          )}
        </div>

        {/* Cards grid */}
        {stories.length === 0 ? (
          <div className="text-center py-8">
            <div className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} text-5xl mb-3`}>📚</div>
            <h3
              className={`text-xl font-light mb-2 tracking-tight transition-colors duration-300 ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}
              style={{ textShadow: darkMode ? '2px 2px 6px rgba(0,0,0,0.9)' : '' }}
            >
              No {currentTab} stories yet
            </h3>
            <p
              className={`text-base font-normal opacity-90 transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
              style={{ textShadow: darkMode ? '1px 1px 3px rgba(0,0,0,0.8)' : '' }}
            >
              {currentTab === 'private'
                ? 'Create your first story to see it here!'
                : 'Check back later for community stories.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 min-w-[800px]">
            {stories.map((story, idx) => {
              const coverSrc = story.image
                ? `/images/${story.image}`
                : pickCover({ title: story.title, topic: story.topic });

              return (
                <div
                  key={story.key || story.id || idx}
                  className={`backdrop-blur-md rounded-2xl shadow-lg border overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                    darkMode
                      ? 'bg-gray-800 bg-opacity-90 border-gray-700'
                      : 'bg-white bg-opacity-90 border-white border-opacity-30'
                  }`}
                >
                  {/* Cover */}
                  <div className="w-full h-32 relative overflow-hidden">
                    <img src={coverSrc} alt={story.title || 'Story cover'} className="w-full h-full object-cover" />
                  </div>

                  <div className="p-3">
                    <h3
                      className={`font-medium text-base mb-1 tracking-tight transition-colors duration-300 ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}
                      style={{ textShadow: darkMode ? '1px 1px 3px rgba(0,0,0,0.8)' : '' }}
                    >
                      {story.title || 'Untitled'}
                    </h3>

                    <div
                      className={`text-sm mb-1 font-normal opacity-90 transition-colors duration-300 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                      style={{ textShadow: darkMode ? '1px 1px 3px rgba(0,0,0,0.8)' : '' }}
                    >
                      <span>{story.lengthMin ? `${story.lengthMin} min` : '—'}</span> •{' '}
                      <span>{story.voice || 'Narrator'}</span>
                    </div>

                    <div
                      className={`text-sm mb-2 font-normal opacity-90 transition-colors duration-300 ${
                        darkMode ? 'text-gray-200' : 'text-gray-600'
                      }`}
                      style={{ textShadow: darkMode ? '1px 1px 3px rgba(0,0,0,0.8)' : '' }}
                    >
                      {dateLabel(story)}
                    </div>

                    <div className="text-sm text-purple-500 mb-2 font-medium">
                      by {currentTab === 'community' ? story.author || 'Unknown' : 'You'}
                    </div>

                    <div
                      className={`text-sm mb-3 font-normal opacity-90 transition-colors duration-300 line-clamp-3 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                      style={{ textShadow: darkMode ? '1px 1px 3px rgba(0,0,0,0.8)' : '' }}
                    >
                      <span className="font-medium">Comment:</span> {story.customPrompt || '—'}
                    </div>

                    <div className="flex items-center justify-between">
                      {/* ▶ Play -> PlayerControls */}
                      <button
                        onClick={() => onNavigate('player', { storyData: buildStoryData(story) })}
                        className="flex items-center text-purple-600 hover:text-purple-500 font-medium text-sm transition-colors duration-300"
                      >
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        Play
                      </button>

                      {/* Share/Unshare for your FS stories */}
                      {currentTab === 'private' && !story._local && story.id && (
                        <button
                          onClick={() => togglePrivacy(story)}
                          className={`flex items-center font-medium text-sm transition-colors duration-300 ${
                            darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                          }`}
                          title={story.isPublic ? 'Unshare' : 'Share'}
                        >
                          {story.isPublic ? '🔓 Unshare' : '🔒 Share'}
                        </button>
                      )}

                      {/* Rename (private only) */}
                      {currentTab === 'private' && (
                        <button
                          onClick={() => renameStory(story)}
                          className={`flex items-center font-medium text-sm transition-colors duration-300 ${
                            darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                          }`}
                          title="Rename"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Rename
                        </button>
                      )}

                      {/* Download */}
                      <button
                        onClick={() => downloadStory(story)}
                        className={`flex items-center font-medium text-sm transition-colors duration-300 ${
                          darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                        }`}
                        title="Download"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
