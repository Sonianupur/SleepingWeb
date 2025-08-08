// app/instrumentation-client.js
"use client";

import posthog from "posthog-js";

export function initPostHog() {
  if (typeof window !== "undefined") {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      console.warn("[PostHog] API key missing");
      return;
    }

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
      autocapture: true,
    });

    // Force pageview
    posthog.capture("$pageview");

    // Send test event so you can see it appear instantly in PostHog
    setTimeout(() => {
      posthog.capture("test_event", { env: "prod", ts: Date.now() });
      console.log("[PostHog] test_event sent");
    }, 800);
  }
}
