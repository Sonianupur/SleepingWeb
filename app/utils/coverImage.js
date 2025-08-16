// app/utils/coverImage.js
export const COVER_MAP = {
  // exact title matches first (lowercase)
  'echoes in the void': 'echoes-void.jpg',
  'road to slumber': 'road-slumber.jpg',
  'tropical drift': 'tropical-drift.jpg',
  'neon nightfall': 'neon-nightfall.jpg',
  'ocean dreams': 'ocean-dreams.jpg',
  'forest whispers': 'forest-whispers.jpg',

  // topic fallbacks
  nature: 'nature.jpg',
  science: 'science.jpg',
  history: 'history.jpg',
  philosophy: 'philosophy.jpg',
  fantasy: 'fantasy.jpg',
  space: 'science.jpg' // use science.jpg as a space fallback
};

export function pickCover({ title = '', topic = '' } = {}) {
  const t = String(title).toLowerCase().trim();
  const k = String(topic).toLowerCase().trim();

  // prefer title keyword match
  for (const [key, file] of Object.entries(COVER_MAP)) {
    if (t && t.includes(key)) return `/images/${file}`;
  }
  // then topic match
  if (COVER_MAP[k]) return `/images/${COVER_MAP[k]}`;

  // final fallback
  return '/images/sleepingai-bg.jpg';
}
