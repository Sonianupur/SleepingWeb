
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { showSurvey } from '../analytics/surveys';

const SURVEY_ID = 'sry_YOUR_SURVEY_ID_HERE'; // ← paste your PostHog Survey ID

export default function PlaybackPage({ stories, onNavigate, settings = {} }) {
  const bgAudioRef = useRef(null);        // background loop
  const narrAudioRef = useRef(null);      // narration <audio>
  const progressTimerRef = useRef(null);

  const [bgVolume, setBgVolume] = useState(0.3);
  const [isLoading, setLoading] = useState(false);
  const [isPlaying, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const rate = settings.rate ?? 1.0;

  // ---------- init / reload background music ----------
  useEffect(() => {
    const id = settings.backgroundMusic ?? 'no-music';
    const url = `/music/${encodeURIComponent(id)}.mp3`;

    try {
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
        bgAudioRef.current.src = '';
      }
      const bg = new Audio(url);
      bg.loop = true;
      bg.volume = bgVolume;
      bgAudioRef.current = bg;
    } catch {}
    return () => {
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
        bgAudioRef.current.src = '';
      }
    };
  }, [settings.backgroundMusic]);

  // keep volume synced
  useEffect(() => {
    if (bgAudioRef.current) bgAudioRef.current.volume = bgVolume;
  }, [bgVolume]);

  // ---------- helpers ----------
  const clearTimers = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  // pass completed=true when audio/TTS finishes naturally
  const stopAll = (completed = false) => {
    clearTimers();
    try { window.speechSynthesis.cancel(); } catch {}
    setPlaying(false);
    setLoading(false);
    setProgress(0);

    if (narrAudioRef.current) {
      try {
        narrAudioRef.current.pause();
        narrAudioRef.current.src = '';
        narrAudioRef.current.removeAttribute('src');
        narrAudioRef.current.load();
      } catch {}
      narrAudioRef.current = null;
    }
    if (bgAudioRef.current) {
      try {
        bgAudioRef.current.pause();
        bgAudioRef.current.currentTime = 0;
      } catch {}
    }

    // ✅ Trigger PostHog survey only when playback completes
    if (completed && SURVEY_ID) {
      showSurvey(SURVEY_ID);
    }
  };

  const playWithTTS = (text) => {
    stopAll();
    setLoading(true);

    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = rate;

    utt.onstart = () => {
      setLoading(false);
      setPlaying(true);
      bgAudioRef.current?.play().catch(() => {});
      // rough progress estimate (3 wps)
      const words = text.trim().split(/\s+/).length;
      const totalSec = Math.max(words / 3, 1) / rate;
      let elapsed = 0;
      clearTimers();
      progressTimerRef.current = setInterval(() => {
        elapsed += 0.25;
        setProgress(Math.min(elapsed / totalSec, 1));
        if (elapsed >= totalSec) clearTimers();
      }, 250);
    };

    // mark natural completion
    utt.onend = () => stopAll(true);

    try {
      window.speechSynthesis.speak(utt);
    } catch (e) {
      console.error('TTS failed:', e);
      setLoading(false);
      alert('Your browser blocked TTS.');
    }
  };

  const playStory = (story) => {
    stopAll();

    // Prefer uploaded MP3
    if (story.audioUrl) {
      setLoading(true);

      // Create a *fresh* audio element for each play (avoids stale state)
      const audio = new Audio(story.audioUrl);
      audio.preload = 'auto';

      audio.addEventListener('canplay', () => {
        setLoading(false);
        setPlaying(true);

        audio.addEventListener('timeupdate', () => {
          if (Number.isFinite(audio.duration) && audio.duration > 0) {
            setProgress(Math.min(audio.currentTime / audio.duration, 1));
          }
        });

        bgAudioRef.current?.play().catch(() => {});
        audio.play().catch((err) => {
          console.error('Narration play rejected:', err);
          alert('Autoplay was blocked — click Play again.');
        });
      });

      // ✅ survey when narration ends naturally
      audio.addEventListener('ended', () => stopAll(true));
      audio.addEventListener('error', (e) => {
        console.error('Audio element error:', e);
        setLoading(false);
        alert('Could not play narration audio.');
      });

      narrAudioRef.current = audio;
      audio.load();
      return;
    }

    // Fallback: Browser TTS
    const text = `${story.title}. ${story.summary}`;
    playWithTTS(text);
  };

  // ---------- UI ----------
  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <button
        onClick={() => { stopAll(false); onNavigate('generate'); }}
        className="mb-6 text-sm text-purple-600 hover:underline"
      >
        ← Back to Generate
      </button>

      <div className="mb-4 flex items-center space-x-2">
        <label className="text-sm font-medium">Music volume:</label>
        <input
          type="range"
          min="0" max="1" step="0.01"
          value={bgVolume}
          onChange={(e) => setBgVolume(parseFloat(e.target.value))}
        />
      </div>

      <Swiper slidesPerView={1} centeredSlides pagination={{ clickable: true }}>
        {stories.map((s, i) => (
          <SwiperSlide key={i}>
            <div className="bg-white rounded-3xl shadow-2xl p-6">
              <h3 className="text-2xl font-semibold mb-2">{s.title}</h3>
              <p className="text-gray-700 mb-4">{s.summary}</p>

              {s.audioUrl && (
                <p className="text-xs text-gray-500 mb-2 break-all">
                  Audio:{" "}
                  <a className="underline" href={s.audioUrl} target="_blank" rel="noreferrer">
                    {s.audioUrl}
                  </a>
                </p>
              )}

              <div className="w-full bg-gray-200 h-2 rounded-full mb-4">
                <div
                  className="h-full bg-purple-600 transition-all"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => playStory(s)}
                  disabled={isPlaying || isLoading}
                  className={`px-4 py-2 rounded-2xl font-medium transition-all duration-200 ${
                    (isPlaying || isLoading)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {isLoading ? 'Loading…' : (isPlaying ? 'Playing…' : 'Play')}
                </button>

                <button
                  onClick={() => stopAll(false)}  // manual stop, no survey
                  disabled={!isPlaying && !isLoading}
                  className={`px-4 py-2 rounded-2xl font-medium transition-all duration-200 ${
                    (isPlaying || isLoading)
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Stop
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
