'use client';

import { useEffect } from 'react';
import { initPostHog } from './posthogClient';
import RouteChangeTracker from './RouteChangeTracker';

export default function AnalyticsProvider() {
  useEffect(() => {
    initPostHog();
  }, []);
  return <RouteChangeTracker />;
}
