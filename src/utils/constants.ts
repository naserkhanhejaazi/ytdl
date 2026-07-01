export const STICKERS = {
  welcome: '🎵',
  videoInfo: '📹',
  downloadStart: '⏳',
  downloadProgress: '🔄',
  downloadComplete: '✅',
  audio: '🎧',
  comments: '💬',
  admin: '🔐',
  success: '✅',
  error: '❌',
  ban: '🚫',
  user: '👤',
  stats: '📊',
  broadcast: '📢',
  help: '❓',
  settings: '⚙️',
} as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

export const RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
} as const;

export const YOUTUBE_URL_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([\w-]{11})/;

export const MAX_DESCRIPTION_LENGTH = 200;
export const MAX_COMMENTS_DISPLAY = 5;
