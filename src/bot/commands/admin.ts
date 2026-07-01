import { Context } from 'grammy';
import { Database } from '../../database';
import { buildAdminKeyboard } from '../keyboards/admin-keyboard';
import { STICKERS } from '../../utils/constants';
import { formatBytes } from '../../utils/formatters';

export async function adminCommand(ctx: Context) {
  if (!ctx.from) return;

  const db = Database.getInstance();
  const stats = db.stats.getOverall();
  const keyboard = buildAdminKeyboard();

  const text =
    `${STICKERS.admin} <b>Admin Panel</b>\n\n` +
    `${STICKERS.stats} <b>Statistics</b>\n` +
    `├ 👥 Total Users: ${stats.totalUsers}\n` +
    `├ 📥 Total Downloads: ${stats.totalDownloads}\n` +
    `├ ✅ Completed: ${stats.completedDownloads}\n` +
    `├ ❌ Failed: ${stats.failedDownloads}\n` +
    `└ 💾 Bandwidth: ${formatBytes(stats.totalBandwidth)}\n\n` +
    `Use buttons below to manage the bot:`;

  await ctx.reply(text, {
    parse_mode: 'HTML',
    reply_markup: keyboard,
  });
}
