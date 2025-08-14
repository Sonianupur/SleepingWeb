

import Store from '../components/Store';
import Link from 'next/link';

export default function StorePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #dad4ec 0%, #dad4ec 1%, #f3e7e9 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 12px',
      }}
    >
      {        /* Back to Dashboard Button */}
      <div style={{ width: '100%', maxWidth: 600, marginBottom: 24 }}>
        <Link href="/dashboard">
          <button
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(90deg,#5c258d,#4389a2)',
              color: '#fff',
              fontWeight: 600,
              boxShadow: '0 2px 6px #0001',
              cursor: 'pointer',
              marginBottom: 16,
            }}
          >
            ← Back to Dashboard
          </button>
        </Link>
      </div>

      {/* Store Title and Description */}
      <div style={{ maxWidth: 600, width: '100%', textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 36, margin: '0 0 10px 0', color: '#5c258d' }}>Buy Credits</h1>
        <p style={{ fontSize: 18, color: '#444', margin: 0 }}>
          Purchase credits to unlock and enjoy more AI-generated bedtime stories.
        </p>
        <p style={{ color: '#888', marginTop: 8, fontSize: 14 }}>
          Payments are securely processed by Stripe. You can use test cards while developing.
        </p>
      </div>

      {/* Store Component */}
      <div style={{ maxWidth: 500, width: '100%' }}>
        <Store />
      </div>
    </div>
  );
}
