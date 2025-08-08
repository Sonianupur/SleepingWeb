// app/layout.js
import { Roboto } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import { useEffect } from "react";
import { initPostHog } from "./instrumentation-client";

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
  useEffect(() => {
    initPostHog();
  }, []);

  return (
    <html lang="en">
      <body className={`${roboto.variable} font-roboto antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
