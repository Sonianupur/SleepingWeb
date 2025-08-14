export const runtime = 'nodejs';

export async function GET() {
  return Response.json({
    has_FIREBASE_SERVICE_ACCOUNT_KEY: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    has_GOOGLE_APPLICATION_CREDENTIALS: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || null,
    NODE_ENV: process.env.NODE_ENV,
  });
}
