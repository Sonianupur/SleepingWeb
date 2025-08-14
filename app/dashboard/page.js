
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Header       from '../components/Header';
import HomePage     from '../components/HomePage';
import GeneratePage from '../components/GeneratePage';
import LibraryPage  from '../components/LibraryPage';
import ProfilePage  from '../components/ProfilePage';
import PlaybackPage from '../components/PlaybackPage';
//import SettingsPage from '../components/SettingsPage';

import { auth, db }        from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { identifyUser, trackSignup, trackActiveUser } from '../analytics';
//import SettingsPage from '../components/SettingsPage';
//import SettingsPage from '../components/SettingsPage';




export default function Dashboard() {
  // ----- Dashboard state -----
  const [credits, setCredits]                 = useState(12);
  const [selectedTopic, setSelectedTopic]     = useState(1);
  const [visualRotation, setVisualRotation]   = useState(-72);
  const [showMenu, setShowMenu]               = useState(false);
  const [currentView, setCurrentView]         = useState('home');

  // 🆕 For playback
  const [stories, setStories]                 = useState([]);
  const [playbackSettings, setPlaybackSettings] = useState({});

  const router = useRouter();

  // ----- Real-time credits listener -----
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const userDoc    = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDoc, snap => {
      const data = snap.data();
      if (data?.credits != null) {
        setCredits(data.credits);
      }
    });
    return () => unsubscribe();
  }, []);

  // ----- Navigation handler -----
  const handleNavigate = (page, payload) => {
    if (page === 'landing') {
      router.push('/');
      return;
    }

    if (page === 'playback') {
      // stash both stories + settings
      setStories(payload.stories);
      setPlaybackSettings(payload.settings || {});
      setCurrentView('playback');
      return;
    }

    if (['home', 'generate', 'library', 'profile'].includes(page)) {
      setCurrentView(page);
      return;
    }

    alert(`${page.charAt(0).toUpperCase() + page.slice(1)} page coming soon!`);
  };

  // ----- Topics data -----
  const topics = [
    {
      id: 'philosophy',
      title: 'Philosophy and Dreams',
      image: 'philosophy.jpg',
      description: 'Adventures and Ideas: Simple Paths to Big Dreams'
    },
    {
      id: 'science',
      title: 'Science & Space',
      image: 'science.jpg',
      description: 'Journey through the cosmos and scientific discoveries'
    },
    {
      id: 'nature',
      title: 'Nature Escapes',
      image: 'nature.jpg',
      description: 'Explore the wonders of the natural world'
    },
    {
      id: 'fantasy',
      title: 'Fantasy Realms',
      image: 'fantasy.jpg',
      description: 'Enter magical realms and mystical adventures'
    },
    {
      id: 'history',
      title: 'Historical Echoes',
      image: 'history.jpg',
      description: 'Discover ancient civilizations and cultural treasures'
    }
  ];

  // ----- Render logic -----
  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomePage
            topics={topics}
            selectedTopic={selectedTopic}
            setSelectedTopic={setSelectedTopic}
            visualRotation={visualRotation}
            setVisualRotation={setVisualRotation}
            credits={credits}
            onNavigate={handleNavigate}
          />
        );

      case 'generate':
        return <GeneratePage onNavigate={handleNavigate} />;

      case 'library':
        return <LibraryPage onNavigate={handleNavigate} />;

      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} />;

      case 'playback':
        return (
          <PlaybackPage
            stories={stories}
            settings={playbackSettings}
            onNavigate={handleNavigate}
          />
        );

      default:
        return (
          <HomePage
            topics={topics}
            selectedTopic={selectedTopic}
            setSelectedTopic={setSelectedTopic}
            visualRotation={visualRotation}
            setVisualRotation={setVisualRotation}
            credits={credits}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-300 to-teal-400 flex flex-col font-roboto"
      style={{ fontSize: '16px' }}
    >
      <Header
        credits={credits}
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        onNavigate={handleNavigate}
        currentView={currentView}
      />
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        {renderCurrentView()}
      </div>
    </div>
  );
}
