
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

export default function LibraryPage({ onNavigate }) {
  const [activeTab, setActiveTab]           = useState('private');
  const [privateFS, setPrivateFS]           = useState([]);       // stories from Firestore
  const [community, setCommunity]           = useState([]);       // public stories
  const [localStories, setLocalStories]     = useState([]);       // stories from localStorage
  const [syncing, setSyncing]               = useState(false);

  // 1) Listen to Firestore: your own stories
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const colRef = collection(db, 'users', user.uid, 'stories');
    const q      = query(colRef, orderBy('createdAt', 'desc'));
    const unsub  = onSnapshot(q, snap => {
      setPrivateFS(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // 2) Listen to Firestore: community shared stories
  useEffect(() => {
    const q = query(
      collectionGroup(db, 'stories'),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setCommunity(snap.docs.map(d => {
        const data = d.data();
        // extract author UID from path "users/{uid}/stories/{sid}"
        const parts = d.ref.path.split('/');
        return { id: d.id, author: parts[1], ...data };
      }));
    });
    return unsub;
  }, []);

  // 3) Read localStorage once on mount
  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem('myStories') || '[]');
      setLocalStories(arr);
    } catch {
      setLocalStories([]);
    }
  }, []);

  // 4) Sync all local → Firestore (add audioUrl support)
  const syncLocalToFS = async () => {
    if (localStories.length === 0) return;
    setSyncing(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not signed in');
      const colRef = collection(db, 'users', user.uid, 'stories');

      await Promise.all(localStories.map(s =>
        addDoc(colRef, {
          title:      s.title,
          summary:    s.summary,
          topic:      s.topic,
          lengthMin:  s.lengthMin,
          voice:      s.voice,
          backgroundMusic: s.backgroundMusic,
          customPrompt: s.customPrompt,
          audioUrl:   s.audioUrl || null, // <--- ADDED!
          isPublic:   false,
          createdAt:  serverTimestamp()
        })
      ));

      // clear localStorage & state
      localStorage.removeItem('myStories');
      setLocalStories([]);
    } catch (e) {
      console.error('Sync failed', e);
      alert('Failed to sync to Firestore: ' + e.message);
    } finally {
      setSyncing(false);
    }
  };

  // 5) Privacy toggle for FS stories
  const togglePrivacy = async (story) => {
    const user = auth.currentUser;
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'stories', story.id);
    await updateDoc(ref, { isPublic: !story.isPublic });
  };

  // Which list to render?
  const privateCombined = [
    // local ones first
    ...localStories.map((s, i) => ({ ...s, _local: true, key: `L${i}` })),
    // then Firestore ones
    ...privateFS.map(s => ({ ...s, _local: false, key: s.id }))
  ];
  const current = activeTab === 'private' ? privateCombined : community;

  return (
    <div className="bg-white rounded-3xl shadow p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('private')}
            className={`px-4 py-2 rounded ${activeTab==='private'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Private
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`px-4 py-2 rounded ${activeTab==='community'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Community
          </button>
        </div>
        {activeTab === 'private' && localStories.length > 0 && (
          <button
            onClick={syncLocalToFS}
            disabled={syncing}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {syncing ? 'Syncing…' : 'Sync Local → Firestore'}
          </button>
        )}
      </div>

      {current.length === 0 ? (
        <p className="text-center text-gray-400 py-12">
          No {activeTab} stories yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {current.map((story, idx) => (
            <div key={story.key || idx} className="bg-purple-200 rounded-xl shadow p-6">
              <h3 className="font-bold mb-1">{story.title}</h3>
              <p className="text-xs text-gray-500 mb-2">
                {story._local && story.savedAt
                  ? `Local • saved ${new Date(story.savedAt).toLocaleDateString()}`
                  : story.createdAt && story.createdAt.toDate
                  ? new Date(story.createdAt.toDate()).toLocaleDateString()
                  : ''}
              </p>
              <p className="text-gray-700 mb-4 line-clamp-3">{story.summary}</p>

              {/* Audio player (if audioUrl exists) */}
              {story.audioUrl && (
                <audio controls className="w-full mb-2">
                  <source src={story.audioUrl} type="audio/mp3" />
                  Your browser does not support the audio element.
                </audio>
              )}

              <div className="flex justify-between items-center">
                <button
                  onClick={() => onNavigate('playback', { stories: [story] })}
                  className="text-purple-600 hover:underline"
                >
                  ▶ Play
                </button>
                {activeTab === 'private' && !story._local && (
                  <button
                    onClick={() => togglePrivacy(story)}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    {story.isPublic ? '🔓 Unshare' : '🔒 Share'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
