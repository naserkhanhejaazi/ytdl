import { InlineKeyboard } from 'grammy';
import { FormatOption } from '../../types';
import { STICKERS } from '../../utils/constants';
import { formatBytes } from '../../utils/formatters';

export function buildMainKeyboard(videoId: string): InlineKeyboard {
  return new InlineKeyboard()
    .text('🎬 Video', `type:${videoId}:video`)
    .text('🎧 Audio', `type:${videoId}:audio`)
    .row()
    .text(`${STICKERS.comments} View Comments`, `comments:${videoId}`);
}

export function buildVideoQualityKeyboard(formats: FormatOption[], videoId: string): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  const videoFormats = formats.filter(f => f.type === 'video');

  for (const fmt of videoFormats) {
    const size = formatBytes(fmt.size);
    keyboard.text(`${fmt.label} [${size}]`, `quality:${videoId}:${fmt.formatId}:video`);
    keyboard.row();
  }

  keyboard.text('← Back', `back:${videoId}`);
  return keyboard;
}

export function buildAudioQualityKeyboard(formats: FormatOption[], videoId: string): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  const audioFormats = formats.filter(f => f.type === 'audio');

  for (const fmt of audioFormats) {
    const size = formatBytes(fmt.size);
    keyboard.text(`${fmt.label} [${size}]`, `quality:${videoId}:${fmt.formatId}:audio`);
    keyboard.row();
  }

  keyboard.text('← Back', `back:${videoId}`);
  return keyboard;
}
