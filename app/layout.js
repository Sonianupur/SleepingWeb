import { Roboto } from 'next/font/google';
import './globals.css';
import AuthProvider from './components/AuthProvider';
import { AnalyticsProvider } from './analytics';
import EngagementTracker from './components/EngagementTracker';
import { ThemeProvider } from 'next-themes';
import { Suspense } from 'react';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
});

export const metadata = {
  title: 'SleepingAI - Your Bedtime, Reimagined',
  description: 'AI-generated bedtime stories for better sleep',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.variable} font-roboto antialiased bg-white text-black dark:bg-darkOuter dark:text-white`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="sleepingai-theme"
        >
          {/* Wrap providers that might read router/search in Suspense (safe no-op if they don't) */}
          <Suspense fallback={null}>
            <AnalyticsProvider />
          </Suspense>

          <Suspense fallback={null}>
            <EngagementTracker />
          </Suspense>

          <AuthProvider>
            {/* Critical: ensure ALL pages (including 404 render path) are inside a Suspense boundary */}
            <Suspense fallback={null}>
              {children}
            </Suspense>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
