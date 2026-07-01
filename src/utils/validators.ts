import { YOUTUBE_URL_REGEX } from './constants';

export function extractYouTubeUrl(text: string): { url: string; videoId: string } | null {
  const match = text.match(YOUTUBE_URL_REGEX);
  if (!match) return null;

  const videoId = match[1];
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  return { url, videoId };
}

export function isValidYouTubeUrl(text: string): boolean {
  return YOUTUBE_URL_REGEX.test(text);
}
