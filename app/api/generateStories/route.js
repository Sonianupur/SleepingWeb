
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

const BUCKET = process.env.FIREBASE_STORAGE_BUCKET;
const SERVICE_JSON = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!BUCKET) throw new Error('Missing env: FIREBASE_STORAGE_BUCKET');
if (!SERVICE_JSON) throw new Error('Missing env: FIREBASE_SERVICE_ACCOUNT_KEY');

if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(SERVICE_JSON)),
    storageBucket: BUCKET,
  });
}
const bucket = getStorage().bucket();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function synthesizeAudio(text) {
  console.time('TTS generation');
  const res = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'shimmer',
    input: text,
    response_format: 'mp3',
    speed: 1,
  });
  const buf = Buffer.from(await res.arrayBuffer());
  console.timeEnd('TTS generation');
  return buf;
}

async function uploadAudio(buffer, filename) {
  console.time(`Upload ${filename}`);
  const file = bucket.file(filename);
  await file.save(buffer, {
    resumable: false,
    metadata: {
      contentType: 'audio/mpeg',
      cacheControl: 'public, max-age=31536000',
    },
  });
  await file.makePublic();
  console.timeEnd(`Upload ${filename}`);
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filename)}?alt=media`;
}

export async function POST(req) {
  try {
    const { topic, numSummaries = 1, lengthMinutes = 10 } = await req.json();
    if (!topic || typeof topic !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid "topic"' }, { status: 400 });
    }

    const prompt = `
You are an adult bedtime storyteller.
Generate ${numSummaries} story summaries about "${topic}", each suitable for a ${lengthMinutes}-minute narrated sleep story.
OUTPUT ONLY a JSON array like:
[
  { "title": "…", "summary": "…" }
]`;

    console.time('OpenAI completion');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 400,
    });
    console.timeEnd('OpenAI completion');

    const raw = completion.choices?.[0]?.message?.content ?? '';
    const match = raw.match(/\[.*\]/s);
    if (!match) return NextResponse.json({ error: 'AI returned no JSON array' }, { status: 500 });

    let stories;
    try {
      stories = JSON.parse(match[0]);
    } catch {
      return NextResponse.json({ error: 'JSON parse failed' }, { status: 500 });
    }

    const storiesWithAudio = await Promise.all(
      stories.map(async (s) => {
        try {
          const text = `${s.title}. ${s.summary}`;
          const audioBuffer = await synthesizeAudio(text);
          const safeTitle = (s.title || 'story').replace(/[^a-z0-9]+/gi, '_').toLowerCase();
          const filename = `stories_audio/${Date.now()}_${safeTitle}_${Math.floor(Math.random() * 1e6)}.mp3`;
          const audioUrl = await uploadAudio(audioBuffer, filename);
          return { ...s, audioUrl };
        } catch (e) {
          console.error('Audio gen/upload failed:', e);
          return { ...s, audioUrl: null };
        }
      })
    );

    return NextResponse.json({ stories: storiesWithAudio });
  } catch (err) {
    console.error('Generation error:', err);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
