"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { initPostHog } from "./posthogClient";

export default function RouteChangeTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Ensure PostHog is initialized once
  useEffect(() => {
    initPostHog();
  }, []);

  // Fire a $pageview on route changes
  useEffect(() => {
    if (!pathname) return;

    const query = searchParams?.toString() || "";
    posthog.capture("$pageview", {
      path: pathname,
      query,
      url:
        typeof window !== "undefined" ? window.location.href : undefined,
    });
  }, [pathname, searchParams]);

  return null;
}
