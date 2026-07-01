import { Bot } from 'grammy';
import { config } from './config';
import { Database } from './database';
import { ensureTempDir } from './utils/file-manager';
import { authMiddleware } from './bot/middlewares/auth';
import { rateLimitMiddleware } from './bot/middlewares/rate-limit';
import { startCommand } from './bot/commands/start';
import { helpCommand } from './bot/commands/help';
import { adminCommand } from './bot/commands/admin';
import { handleYoutubeUrl } from './bot/handlers/url-handler';
import { handleCallbacks } from './bot/handlers/callback-handler';
import { handleBroadcastMessage, isBroadcasting, clearBroadcasting } from './bot/handlers/admin-handler';
import { extractYouTubeUrl } from './utils/validators';

const PROXY_URL = process.env.HTTP_PROXY || process.env.HTTPS_PROXY;

let bot: Bot;
if (PROXY_URL) {
  const { HttpsProxyAgent } = require('https-proxy-agent');
  const nodeFetch = require('node-fetch');
  const agent = new HttpsProxyAgent(PROXY_URL);
  const customFetch: any = (url: any, init?: any) => {
    return nodeFetch(url, { ...init, agent });
  };
  bot = new Bot(config.BOT_TOKEN, { client: { fetch: customFetch } });
  console.log(`Using proxy: ${PROXY_URL}`);
} else {
  bot = new Bot(config.BOT_TOKEN);
}
const db = Database.getInstance();

bot.use(async (ctx, next) => {
  try {
    await next();
  } catch (err: any) {
    console.error(`Handler error [${ctx.update.update_id}]:`, err.message || err);
    try {
      await ctx.reply('❌ An error occurred. Please try again.');
    } catch {}
  }
});

bot.use(authMiddleware);
bot.use(rateLimitMiddleware);

bot.command('start', startCommand);
bot.command('help', helpCommand);
bot.command('admin', adminCommand);

bot.on('callback_query:data', async (ctx) => {
  try {
    await handleCallbacks(ctx);
  } catch (err: any) {
    console.error('Callback error:', err.message || err);
    try { await ctx.answerCallbackQuery('An error occurred'); } catch {}
  }
});

bot.on('message:text', async (ctx) => {
  const text = ctx.message.text;

  if (text === '/cancel' && isBroadcasting(ctx.from.id)) {
    clearBroadcasting(ctx.from.id);
    await ctx.reply('Broadcast cancelled.');
    return;
  }

  if (isBroadcasting(ctx.from.id)) {
    clearBroadcasting(ctx.from.id);
    await handleBroadcastMessage(ctx, text);
    return;
  }

  if (extractYouTubeUrl(text)) {
    await handleYoutubeUrl(ctx);
  }
});

bot.catch((err) => {
  console.error('Bot error:', err);
});

async function main() {
  await ensureTempDir();

  console.log('Bot starting...');

  try {
    const me = await bot.api.getMe();
    console.log(`Connected! Bot: @${me.username}`);
  } catch (err: any) {
    console.error('Failed to connect to Telegram:', err.message);
    process.exit(1);
  }

  bot.start({
    onStart: () => console.log('Bot is running! Listening for messages...'),
    drop_pending_updates: true,
  });
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
