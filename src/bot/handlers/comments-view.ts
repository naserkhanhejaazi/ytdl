import { Context } from 'grammy';
import { ytdlpService } from '../../services/ytdlp';
import { Database } from '../../database';
import { buildCommentsMessage } from '../../utils/formatters';
import { buildCommentsCloseKeyboard } from '../keyboards/comments-keyboard';
import { STICKERS } from '../../utils/constants';

export async function showComments(ctx: Context) {
  const data = ctx.callbackQuery?.data;
  if (!data?.startsWith('comments:')) return;

  const videoId = data.split(':')[1];

  await ctx.answerCallbackQuery({ text: 'Loading comments...' });

  try {
    const comments = await ytdlpService.getComments(videoId);
    const db = Database.getInstance();
    const metadata = db.metadata.getByVideoId(videoId);
    const title = metadata?.title || 'Video';
    const totalCount = metadata?.comment_count || comments.length;

    if (comments.length === 0) {
      await ctx.reply(
        `${STICKERS.comments} No comments available for this video.`,
        { parse_mode: 'HTML' }
      );
      return;
    }

    const message = buildCommentsMessage(title, comments, totalCount);
    const keyboard = buildCommentsCloseKeyboard(videoId);

    await ctx.reply(message, {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    });
  } catch (err: any) {
    await ctx.reply(
      `${STICKERS.error} Failed to load comments: ${err.message || 'Unknown error'}`
    );
  }
}

export async function closeComments(ctx: Context) {
  const data = ctx.callbackQuery?.data;
  if (!data?.startsWith('close_comments:')) return;

  await ctx.answerCallbackQuery();

  if (ctx.callbackQuery?.message) {
    try {
      await ctx.api.deleteMessage(
        ctx.callbackQuery.message.chat.id,
        ctx.callbackQuery.message.message_id
      );
    } catch {}
  }
}
