import { Context } from 'grammy';
import { Database } from '../../database';
import { buildAdminKeyboard, buildUserListKeyboard, buildBanKeyboard } from '../keyboards/admin-keyboard';
import { STICKERS } from '../../utils/constants';
import { formatBytes } from '../../utils/formatters';

export async function handleAdminCallback(ctx: Context) {
  const data = ctx.callbackQuery?.data;
  if (!data?.startsWith('admin:')) return;

  const parts = data.split(':');
  const action = parts[1];

  const db = Database.getInstance();
  const userId = ctx.from?.id;
  if (!userId) return;

  const user = db.users.getByTelegramId(userId);
  if (!user?.is_admin) {
    await ctx.answerCallbackQuery('Access denied');
    return;
  }

  await ctx.answerCallbackQuery();

  switch (action) {
    case 'stats':
      return handleStats(ctx);
    case 'users':
      return handleUserList(ctx);
    case 'user':
      return handleUserProfile(ctx, parts[2]);
    case 'ban':
      return handleBan(ctx, parts[2], true);
    case 'unban':
      return handleBan(ctx, parts[2], false);
    case 'bans':
      return handleBanList(ctx);
    case 'broadcast':
      return handleBroadcastPrompt(ctx);
    case 'back':
      return handleBackToAdmin(ctx);
  }
}

async function handleStats(ctx: Context) {
  const db = Database.getInstance();
  const stats = db.stats.getOverall();
  const userStats = db.users.getUserStats();

  let text =
    `${STICKERS.stats} <b>Overall Statistics</b>\n\n` +
    `👥 Total Users: ${stats.totalUsers}\n` +
    `📥 Total Downloads: ${stats.totalDownloads}\n` +
    `✅ Completed: ${stats.completedDownloads}\n` +
    `❌ Failed: ${stats.failedDownloads}\n` +
    `💾 Total Bandwidth: ${formatBytes(stats.totalBandwidth)}\n\n`;

  if (userStats.length > 0) {
    text += `<b>Top Users:</b>\n`;
    userStats.slice(0, 5).forEach((s, i) => {
      const name = s.username ? `@${s.username}` : `ID:${s.telegram_id}`;
      text += `${i + 1}. ${name} - ${s.total_downloads} downloads (${formatBytes(s.total_bandwidth_bytes)})\n`;
    });
  }

  const keyboard = new (await import('grammy')).InlineKeyboard().text('Back', 'admin:back');
  await ctx.editMessageText(text, {
    parse_mode: 'HTML',
    reply_markup: keyboard,
  });
}

async function handleUserList(ctx: Context) {
  const db = Database.getInstance();
  const users = db.users.getAll();

  let text = `${STICKERS.user} <b>All Users</b> (${users.length})\n\n`;

  users.slice(0, 20).forEach((user, i) => {
    const status = user.is_banned ? STICKERS.ban : STICKERS.success;
    const name = user.username ? `@${user.username}` : `ID:${user.telegram_id}`;
    text += `${i + 1}. ${status} ${name}\n   Downloads: ${user.total_downloads}\n`;
  });

  if (users.length > 20) {
    text += `\n... and ${users.length - 20} more users`;
  }

  const keyboard = buildUserListKeyboard(users);
  await ctx.editMessageText(text, {
    parse_mode: 'HTML',
    reply_markup: keyboard,
  });
}

async function handleUserProfile(ctx: Context, telegramIdStr?: string) {
  if (!telegramIdStr) return;

  const telegramId = parseInt(telegramIdStr);
  const db = Database.getInstance();
  const user = db.users.getByTelegramId(telegramId);

  if (!user) {
    await ctx.reply('User not found.');
    return;
  }

  const status = user.is_banned ? `${STICKERS.ban} Banned` : `${STICKERS.success} Active`;
  const name = user.username ? `@${user.username}` : 'N/A';

  const text =
    `${STICKERS.user} <b>User Profile</b>\n\n` +
    `ID: ${user.telegram_id}\n` +
    `Username: ${name}\n` +
    `Name: ${user.first_name || ''} ${user.last_name || ''}\n` +
    `Status: ${status}\n` +
    `Admin: ${user.is_admin ? 'Yes' : 'No'}\n` +
    `Downloads: ${user.total_downloads}\n` +
    `Bandwidth: ${formatBytes(user.total_bandwidth_bytes)}\n` +
    `Joined: ${user.created_at}`;

  const keyboard = buildBanKeyboard(telegramId, !!user.is_banned);
  await ctx.editMessageText(text, {
    parse_mode: 'HTML',
    reply_markup: keyboard,
  });
}

async function handleBan(ctx: Context, telegramIdStr?: string, ban: boolean = true) {
  if (!telegramIdStr) return;

  const telegramId = parseInt(telegramIdStr);
  const db = Database.getInstance();

  db.users.setBanned(telegramId, ban);

  const action = ban ? 'banned' : 'unbanned';
  await ctx.reply(`${STICKERS.success} User ${action} successfully.`);

  return handleUserProfile(ctx, telegramIdStr);
}

async function handleBanList(ctx: Context) {
  const db = Database.getInstance();
  const users = db.users.getAll().filter(u => u.is_banned);

  let text = `${STICKERS.ban} <b>Banned Users</b> (${users.length})\n\n`;

  if (users.length === 0) {
    text += 'No banned users.';
  } else {
    users.forEach((user, i) => {
      const name = user.username ? `@${user.username}` : `ID:${user.telegram_id}`;
      text += `${i + 1}. ${name}\n`;
    });
  }

  const keyboard = new (await import('grammy')).InlineKeyboard().text('Back', 'admin:back');
  await ctx.editMessageText(text, {
    parse_mode: 'HTML',
    reply_markup: keyboard,
  });
}

const broadcastCallbacks = new Set<number>();

export function isBroadcasting(userId: number): boolean {
  return broadcastCallbacks.has(userId);
}

export function clearBroadcasting(userId: number): void {
  broadcastCallbacks.delete(userId);
}

async function handleBroadcastPrompt(ctx: Context) {
  if (!ctx.from) return;
  broadcastCallbacks.add(ctx.from.id);

  await ctx.editMessageText(
    `${STICKERS.broadcast} <b>Broadcast Message</b>\n\n` +
    `Send me the message you want to broadcast to all users.\n` +
    `Send /cancel to abort.`,
    { parse_mode: 'HTML' }
  );
}

async function handleBackToAdmin(ctx: Context) {
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

  await ctx.editMessageText(text, {
    parse_mode: 'HTML',
    reply_markup: keyboard,
  });
}

export async function handleBroadcastMessage(ctx: Context, message: string) {
  if (!ctx.from) return;

  const db = Database.getInstance();
  const user = db.users.getByTelegramId(ctx.from.id);
  if (!user?.is_admin) return;

  const users = db.users.getAll();
  let sent = 0;
  let failed = 0;

  const statusMsg = await ctx.reply(
    `${STICKERS.broadcast} Broadcasting to ${users.length} users...`
  );

  for (const u of users) {
    try {
      await ctx.api.sendMessage(u.telegram_id, message);
      sent++;
    } catch {
      failed++;
    }
  }

  await ctx.api.editMessageText(
    ctx.chat!.id,
    statusMsg.message_id,
    `${STICKERS.success} <b>Broadcast complete!</b>\n\n` +
    `✅ Sent: ${sent}\n` +
    `❌ Failed: ${failed}`,
    { parse_mode: 'HTML' }
  );
}
