'use client';
import posthog from 'posthog-js';

// Call this with your Survey ID from PostHog (e.g., 'sry_ABC123...')
export function showSurvey(surveyId) {
  if (typeof window === 'undefined' || !surveyId) return;

  // If PostHog hasn't finished loading yet, retry shortly
  const tryShow = () => {
    if (posthog && typeof posthog.showSurvey === 'function') {
      posthog.showSurvey(surveyId);
    } else {
      setTimeout(tryShow, 200);
    }
  };
  tryShow();
}
