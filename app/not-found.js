'use client';

import { Suspense } from 'react';

function NotFoundInner() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold mb-2">404 — Page not found</h1>
        <p className="text-gray-600">The page you’re looking for doesn’t exist.</p>
      </div>
    </main>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={null}>
      <NotFoundInner />
    </Suspense>
  );
}
