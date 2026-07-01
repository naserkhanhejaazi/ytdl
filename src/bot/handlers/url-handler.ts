import { Context } from 'grammy';
import { ytdlpService } from '../../services/ytdlp';
import { Database } from '../../database';
import { extractYouTubeUrl } from '../../utils/validators';
import { buildVideoInfoMessage } from '../../utils/formatters';
import { buildMainKeyboard } from '../keyboards/quality-keyboard';
import { STICKERS } from '../../utils/constants';

export async function handleYoutubeUrl(ctx: Context) {
  const text = ctx.message?.text;
  if (!text) return;

  const result = extractYouTubeUrl(text);
  if (!result) return;

  await ctx.replyWithChatAction('typing');

  try {
    const info = await ytdlpService.getVideoInfo(result.url);
    const db = Database.getInstance();

    db.metadata.upsert({
      videoId: info.id,
      title: info.title,
      description: info.description,
      thumbnailUrl: info.thumbnail,
      duration: info.duration,
      likeCount: info.likeCount,
      commentCount: info.commentCount,
      channelName: info.channel,
      rawJson: JSON.stringify(info.rawJson),
    });

    db.downloads.create({
      userId: ctx.from!.id,
      videoId: info.id,
      url: result.url,
      title: info.title,
    });

    const message = buildVideoInfoMessage(info);
    const keyboard = buildMainKeyboard(info.id);

    if (info.thumbnail) {
      try {
        await ctx.replyWithPhoto(info.thumbnail, {
          caption: message,
          parse_mode: 'HTML',
          reply_markup: keyboard,
        });
        return;
      } catch {}
    }

    await ctx.reply(message, {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    });
  } catch (error: any) {
    await ctx.reply(
      `${STICKERS.error} Failed to fetch video information.\n\n` +
      `Please check the URL and try again.\n` +
      `Error: ${error.message || 'Unknown error'}`
    );
  }
}
