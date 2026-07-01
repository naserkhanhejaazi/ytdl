import { InlineKeyboard } from 'grammy';

export function buildCommentsCloseKeyboard(videoId: string): InlineKeyboard {
  return new InlineKeyboard().text('Close', `close_comments:${videoId}`);
}
