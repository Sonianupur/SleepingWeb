"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { auth } from "../firebase";

export default function EngagementTracker() {
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        posthog.capture("user_active", { uid: user.uid, email: user.email });
      }
    });
    return () => unsubscribe();
  }, []);

  return null;
}
