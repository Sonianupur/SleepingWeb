"use client";
export { default as AnalyticsProvider } from "./AnalyticsProvider";
export { default as RouteChangeTracker } from "./RouteChangeTracker";
export { showSurvey } from "./surveys";
export {
  initPostHog,
  identifyUser,
  trackActiveUser,
  trackSignup,      // ✅ re-export
} from "./posthogClient";
