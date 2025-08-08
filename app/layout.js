// app/layout.js
import { Roboto } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import Script from "next/script";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata = {
  title: "SleepingAI - Your Bedtime, Reimagined",
  description: "AI-generated bedtime stories for better sleep",
};

export default function RootLayout({ children }) {
  // Default to EU host to match your PostHog project
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY || "";

  return (
    <html lang="en">
      <body className={`${roboto.variable} font-roboto antialiased`}>
        <AuthProvider>{children}</AuthProvider>

        {/* --- PostHog (autocapture + debug test event) --- */}
        <Script src={`${apiHost}/static/array.js`} strategy="afterInteractive" />
        <Script
          id="posthog-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  if (!"${apiKey}") {
                    console.warn("[PostHog] NEXT_PUBLIC_POSTHOG_KEY not set");
                    return;
                  }
                  window.posthog = window.posthog || [];
                  posthog.init("${apiKey}", { api_host: "${apiHost}", autocapture: true });

                  // Send a one-off test event so you can verify in PostHog -> Activity
                  setTimeout(function(){
                    if (window.posthog && posthog.capture) {
                      posthog.capture("test_event", { env: "prod", ts: Date.now() });
                      console.log("[PostHog] test_event sent");
                    } else {
                      console.warn("[PostHog] capture not ready");
                    }
                  }, 800);
                } catch (e) {
                  console.warn("[PostHog] init error:", e);
                }
              })();
            `,
          }}
        />
        {/* --- /PostHog --- */}
      </body>
    </html>
  );
}
