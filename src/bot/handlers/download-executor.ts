import { Context, InputFile } from 'grammy';
import { ytdlpService } from '../../services/ytdlp';
import { Database } from '../../database';
import { getTempPath, cleanupTempFile } from '../../utils/file-manager';
import { STICKERS } from '../../utils/constants';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';

export async function executeDownload(
  ctx: Context,
  videoId: string,
  formatId: string,
  formatType: 'video' | 'audio',
  existingProgressMsg?: any
) {
  const userId = ctx.from!.id;
  const chatId = ctx.chat!.id;

  const progressMsg = existingProgressMsg || await ctx.reply(
    `${STICKERS.downloadStart} <b>Preparing download...</b>`,
    { parse_mode: 'HTML' }
  );

  const db = Database.getInstance();

  try {
    const ext = formatType === 'audio' ? 'mp3' : 'mp4';
    const outputPath = getTempPath(videoId, ext);

    db.downloads.updateStatus(videoId, userId, 'downloading');

    await ytdlpService.download(
      `https://www.youtube.com/watch?v=${videoId}`,
      { formatId, formatType, outputPath },
      async (progress) => {
        try {
          const emoji = progress < 50 ? STICKERS.downloadStart : progress < 100 ? STICKERS.downloadProgress : STICKERS.downloadComplete;
          await ctx.api.editMessageText(
            chatId,
            progressMsg.message_id,
            `${emoji} <b>Downloading:</b> ${progress.toFixed(1)}%`,
            { parse_mode: 'HTML' }
          );
        } catch {}
      }
    );

    const stat = await fs.stat(outputPath);
    const fileStream = fsSync.createReadStream(outputPath);
    const inputFile = new InputFile(fileStream, path.basename(outputPath));

    if (formatType === 'audio') {
      await ctx.api.sendAudio(chatId, inputFile, {
        title: `Audio - ${videoId}`,
      });
    } else {
      await ctx.api.sendVideo(chatId, inputFile);
    }

    db.users.incrementDownloads(userId, stat.size);
    db.downloads.updateStatus(videoId, userId, 'completed', { file_size: stat.size });

    await ctx.api.editMessageText(
      chatId,
      progressMsg.message_id,
      `${STICKERS.downloadComplete} <b>Download complete!</b>`,
      { parse_mode: 'HTML' }
    );

    await cleanupTempFile(outputPath);
  } catch (error: any) {
    db.downloads.updateStatus(videoId, userId, 'failed', {
      error_message: error.message,
    });

    await ctx.api.editMessageText(
      chatId,
      progressMsg.message_id,
      `${STICKERS.error} <b>Download failed.</b>\n\n` +
      `The file may exceed 50MB or be unavailable.\n` +
      `Error: ${error.message || 'Unknown error'}`,
      { parse_mode: 'HTML' }
    );
  }
}
