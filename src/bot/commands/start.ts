import { Context } from 'grammy';
import { STICKERS } from '../../utils/constants';

export async function startCommand(ctx: Context) {
  const name = ctx.from?.first_name || 'there';
  await ctx.reply(
    `${STICKERS.welcome} <b>Hello, ${name}!</b>\n\n` +
    `I'm your YouTube Downloader Bot.\n\n` +
    `Send me a YouTube link and I'll help you download it!\n\n` +
    `<b>Features:</b>\n` +
    `📹 Download videos in multiple qualities\n` +
    `🎧 Extract audio from videos\n` +
    `💬 View video comments\n` +
    `📊 Track your downloads\n\n` +
    `Just paste a YouTube URL to get started!`,
    { parse_mode: 'HTML' }
  );
}
