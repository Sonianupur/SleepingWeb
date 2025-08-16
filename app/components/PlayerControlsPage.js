'use client';

import { useState, useEffect, useRef } from 'react';

export default function PlayerControls({
  onNavigate,
  storyData = null,
  darkMode = false,
  setDarkMode
}) {
  const audioRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);

  const storyTitle   = storyData?.title    || 'Road to Slumber';
  const narrator     = storyData?.narrator || 'Female Voice';
  const storyContent = storyData?.content  || `As the last ember of sunlight disappeared...`;
  const audioUrl     = storyData?.audioUrl || null;

  const formatTime = (seconds) => {
    const s = Math.max(0, Number.isFinite(seconds) ? Math.floor(seconds) : 0);
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const progressPercent = totalTime > 0 ? (currentTime / totalTime) * 100 : 0;

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onLoaded = () => setTotalTime(Math.floor(Number.isFinite(el.duration) ? el.duration : 0));
    const onTime   = () => setCurrentTime(Math.floor(el.currentTime || 0));
    const onEnd    = () => setPlaying(false);

    el.addEventListener('loadedmetadata', onLoaded);
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('ended', onEnd);

    el.volume = volume / 100;
    el.muted  = muted;

    return () => {
      el.removeEventListener('loadedmetadata', onLoaded);
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('ended', onEnd);
    };
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  const togglePlay = async () => {
    const el = audioRef.current;
    if (!el || !audioUrl) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      try {
        await el.play();
        setPlaying(true);
      } catch (e) {
        setPlaying(false);
        console.warn('Audio play failed:', e);
      }
    }
  };

  const skipBackward = () => {
    const el = audioRef.current;
    if (!el) return;
    const t = Math.max(0, (el.currentTime || 0) - 15);
    el.currentTime = t;
    setCurrentTime(Math.floor(t));
  };

  const skipForward = () => {
    const el = audioRef.current;
    if (!el) return;
    const t = Math.min(totalTime || (el.duration || 0), (el.currentTime || 0) + 15);
    el.currentTime = t;
    setCurrentTime(Math.floor(t));
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width || 1;
    const newTime = Math.floor((clickX / width) * (totalTime || 0));
    if (audioRef.current) audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVol = parseInt(e.target.value);
    setVolume(newVol);
    setMuted(newVol === 0);
  };

  const toggleMute = () => setMuted(m => !m);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? 'text-white' : 'text-gray-900'
      } bg-transparent`}
    >
      {/* Small top row: Back + Dark Mode */}
      <div className="max-w-5xl mx-auto px-6 pt-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate('generate')}
          className={`text-sm ${darkMode ? 'text-purple-300 hover:text-purple-200' : 'text-purple-700 hover:text-purple-800'}`}
        >
          ← Back to Generate
        </button>
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
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-10">
        {/* WHITE CARD: Story text ONLY */}
        <div className={`mt-6 rounded-2xl p-6 shadow-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
          <div className="leading-relaxed text-lg whitespace-pre-line">
            {storyContent}
          </div>
        </div>

        {/* PURPLE CONTROL BAR — NO GRAY HOLDER */}
        <div className="mt-8">
          <div className="rounded-2xl p-4 shadow-lg bg-gradient-to-r from-purple-600 to-purple-700">
            <div className="flex items-center gap-4">
              {/* Cover */}
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex-shrink-0 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=56&h=56&fit=crop&crop=center"
                  alt="Story artwork"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-white text-lg truncate">{storyTitle}</h3>
                <p className="text-purple-200 text-sm">{narrator}</p>
              </div>

              {/* Playback controls */}
              <div className="flex items-center gap-2 mx-6">
                <button onClick={skipBackward} className="p-2 hover:bg-purple-500 rounded-full transition-colors" aria-label="Back 15s">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                  </svg>
                </button>

                <button
                  onClick={togglePlay}
                  disabled={!audioUrl}
                  className={`p-3 rounded-full text-purple-600 shadow-lg ${
                    audioUrl ? 'bg-white hover:bg-gray-100' : 'bg-gray-300 text-gray-400 cursor-not-allowed'
                  }`}
                  aria-label={playing ? 'Pause' : 'Play'}
                >
                  {playing ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                <button onClick={skipForward} className="p-2 hover:bg-purple-500 rounded-full transition-colors" aria-label="Forward 15s">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                  </svg>
                </button>
              </div>

              {/* Progress */}
              <div className="flex-1 mx-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-purple-100 text-xs min-w-max">{formatTime(currentTime)}</span>

                  <div className="flex-1 h-1 bg-purple-400 rounded-full cursor-pointer relative" onClick={handleSeek} aria-label="Seek">
                    <div className="h-full bg-white rounded-full relative" style={{ width: `${progressPercent}%` }}>
                      <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
                    </div>
                  </div>

                  <span className="text-purple-100 text-xs min-w-max">{formatTime(totalTime)}</span>
                </div>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="p-1" aria-label="Toggle mute">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    {muted || volume === 0 ? (
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    ) : (
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    )}
                  </svg>
                </button>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-purple-300 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, white 0%, white ${muted ? 0 : volume}%, rgba(255,255,255,0.3) ${muted ? 0 : volume}%, rgba(255,255,255,0.3) 100%)`
                  }}
                  aria-label="Volume"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} preload="metadata" style={{ display: 'none' }} />
      )}
    </div>
  );
}
