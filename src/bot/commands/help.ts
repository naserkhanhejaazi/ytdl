import { Context } from 'grammy';
import { STICKERS } from '../../utils/constants';

export async function helpCommand(ctx: Context) {
  await ctx.reply(
    `${STICKERS.help} <b>How to use this bot:</b>\n\n` +
    `1️⃣ Send a YouTube URL\n` +
    `2️⃣ View video information\n` +
    `3️⃣ Select quality option\n` +
    `4️⃣ Wait for download\n` +
    `5️⃣ Receive your file!\n\n` +
    `<b>Commands:</b>\n` +
    `/start - Welcome message\n` +
    `/help - This help message\n` +
    `/admin - Admin panel (admin only)\n\n` +
    `<b>Tips:</b>\n` +
    `• Videos over 50MB won't be sent\n` +
    `• Audio extracts as MP3\n` +
    `• Click "View Comments" to see video comments`,
    { parse_mode: 'HTML' }
  );
}
