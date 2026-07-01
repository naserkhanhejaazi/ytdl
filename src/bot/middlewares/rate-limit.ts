import { Context, NextFunction } from 'grammy';
import { RATE_LIMIT } from '../../utils/constants';

const userRequests = new Map<number, number[]>();

export async function rateLimitMiddleware(ctx: Context, next: NextFunction) {
  if (!ctx.from) return next();

  const userId = ctx.from.id;
  const now = Date.now();
  const windowStart = now - RATE_LIMIT.windowMs;

  const timestamps = userRequests.get(userId) || [];
  const recentTimestamps = timestamps.filter(t => t > windowStart);

  if (recentTimestamps.length >= RATE_LIMIT.maxRequests) {
    await ctx.reply('⏳ Too many requests. Please wait a moment.');
    return;
  }

  recentTimestamps.push(now);
  userRequests.set(userId, recentTimestamps);

  return next();
}
