import { Context } from 'grammy';
import { executeDownload } from './download-executor';
import { STICKERS } from '../../utils/constants';

export async function handleQualitySelect(ctx: Context) {
  const data = ctx.callbackQuery?.data;
  if (!data?.startsWith('quality:')) return;

  const parts = data.split(':');
  if (parts.length !== 4) return;

  const [, videoId, formatId, formatType] = parts;

  const progressMsgPromise = ctx.reply(
    `${STICKERS.downloadStart} <b>Preparing download...</b>`,
    { parse_mode: 'HTML' }
  );

  ctx.answerCallbackQuery({ text: 'Preparing download...' }).catch(() => {});

  const progressMsg = await progressMsgPromise;

  await executeDownload(
    ctx,
    videoId,
    formatId,
    formatType as 'video' | 'audio',
    progressMsg
  );
}
