// app/components/PostHogInit.jsx
'use client';

import { useEffect } from 'react';
import { initPostHog } from '../instrumentation-client';

export default function PostHogInit() {
  useEffect(() => {
    initPostHog();
  }, []);
  return null;
}
