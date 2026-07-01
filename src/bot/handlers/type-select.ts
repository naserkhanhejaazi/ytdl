import { Context } from 'grammy';
import { ytdlpService } from '../../services/ytdlp';
import { buildVideoInfoMessage } from '../../utils/formatters';
import { buildVideoQualityKeyboard, buildAudioQualityKeyboard, buildMainKeyboard } from '../keyboards/quality-keyboard';
import { Database } from '../../database';

export async function handleTypeSelect(ctx: Context) {
  const data = ctx.callbackQuery?.data;
  if (!data?.startsWith('type:')) return;

  const parts = data.split(':');
  const videoId = parts[1];
  const type = parts[2];

  await ctx.answerCallbackQuery();

  const db = Database.getInstance();
  const metadata = db.metadata.getByVideoId(videoId);

  let info;
  if (metadata?.raw_json) {
    try {
      const raw = JSON.parse(metadata.raw_json);
      const formats = (ytdlpService as any).extractFormats(raw.formats || [], raw.duration || 0);
      info = {
        id: videoId,
        title: metadata.title || 'Video',
        thumbnail: metadata.thumbnail_url || '',
        description: metadata.description || '',
        duration: metadata.duration || 0,
        viewCount: 0,
        likeCount: metadata.like_count || 0,
        commentCount: metadata.comment_count || 0,
        channel: metadata.channel_name || '',
        formats,
      };
    } catch {}
  }

  if (!info) {
    try {
      info = await ytdlpService.getVideoInfo(`https://www.youtube.com/watch?v=${videoId}`);
    } catch {
      await ctx.reply('Failed to load video info.');
      return;
    }
  }

  const caption = buildVideoInfoMessage(info);

  if (type === 'video') {
    const keyboard = buildVideoQualityKeyboard(info.formats, videoId);
    try {
      await ctx.editMessageCaption({ caption, parse_mode: 'HTML', reply_markup: keyboard });
    } catch {
      await ctx.editMessageReplyMarkup({ reply_markup: keyboard });
    }
  } else if (type === 'audio') {
    const keyboard = buildAudioQualityKeyboard(info.formats, videoId);
    try {
      await ctx.editMessageCaption({ caption, parse_mode: 'HTML', reply_markup: keyboard });
    } catch {
      await ctx.editMessageReplyMarkup({ reply_markup: keyboard });
    }
  }
}

export async function handleBackToMain(ctx: Context) {
  const data = ctx.callbackQuery?.data;
  if (!data?.startsWith('back:')) return;

  const videoId = data.split(':')[1];
  await ctx.answerCallbackQuery();

  const db = Database.getInstance();
  const metadata = db.metadata.getByVideoId(videoId);

  let caption = '';
  if (metadata) {
    caption = `📹 <b>${metadata.title || 'Video'}</b>\n📺 ${metadata.channel_name || ''}`;
  }

  const keyboard = buildMainKeyboard(videoId);
  try {
    await ctx.editMessageCaption({ caption, parse_mode: 'HTML', reply_markup: keyboard });
  } catch {
    await ctx.editMessageReplyMarkup({ reply_markup: keyboard });
  }
}
