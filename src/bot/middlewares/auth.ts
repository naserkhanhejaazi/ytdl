import { Context, NextFunction } from 'grammy';
import { Database } from '../../database';
import { adminIds } from '../../config';

export async function authMiddleware(ctx: Context, next: NextFunction) {
  if (!ctx.from) return next();

  const db = Database.getInstance();
  const user = db.users.getByTelegramId(ctx.from.id);

  if (!user) {
    const newUser = db.users.upsert(ctx.from.id, {
      username: ctx.from.username,
      first_name: ctx.from.first_name,
      last_name: ctx.from.last_name,
    });

    if (adminIds.includes(ctx.from.id)) {
      db.users.setAdmin(ctx.from.id, true);
    }
  } else {
    if (user.is_banned) {
      await ctx.reply('🚫 You are banned from using this bot.');
      return;
    }

    db.users.upsert(ctx.from.id, {
      username: ctx.from.username,
      first_name: ctx.from.first_name,
      last_name: ctx.from.last_name,
    });
  }

  return next();
}
