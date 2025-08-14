"use client";
import posthog from "posthog-js";

let inited = false;

export function initPostHog() {
  if (inited) return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
    autocapture: true,
  });

  inited = true;
  posthog.capture("$pageview");
}

export function identifyUser(userId, props = {}) {
  if (!userId) return;
  posthog.identify(userId, props);
}

export function trackActiveUser(props = {}) {
  posthog.capture("active_user", props);
}

// ✅ Used when a new user signs up
export function trackSignup(props = {}) {
  posthog.capture("signup", props);
}
