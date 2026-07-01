import { VideoInfo, FormatOption } from '../types';
import { STICKERS, MAX_DESCRIPTION_LENGTH } from './constants';

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
}

export function buildVideoInfoMessage(info: VideoInfo): string {
  const desc = info.description
    ? info.description.substring(0, MAX_DESCRIPTION_LENGTH) + (info.description.length > MAX_DESCRIPTION_LENGTH ? '...' : '')
    : 'No description';

  return `${STICKERS.videoInfo} <b>${escapeHtml(info.title)}</b>

📺 <b>Channel:</b> ${escapeHtml(info.channel)}
⏱ <b>Duration:</b> ${formatDuration(info.duration)}
👁 <b>Views:</b> ${formatNumber(info.viewCount)}
👍 <b>Likes:</b> ${formatNumber(info.likeCount)}
💬 <b>Comments:</b> ${formatNumber(info.commentCount)}

📝 <b>Description:</b>
${escapeHtml(desc)}

${STICKERS.downloadStart} <i>Select a quality option below to download:</i>`;
}

export function buildCommentsMessage(title: string, comments: any[], totalCount: number): string {
  let text = `${STICKERS.comments} <b>Comments</b> (${formatNumber(totalCount)} total)\n\n`;

  if (comments.length === 0) {
    text += 'No comments available for this video.';
  } else {
    comments.slice(0, 5).forEach((comment: any, i: number) => {
      const author = comment.author || comment.username || 'Unknown';
      const commentText = (comment.text || '').substring(0, 100);
      const likes = comment.like_count || comment.likes || 0;
      text += `<b>${i + 1}. ${escapeHtml(author)}</b>\n`;
      text += `${escapeHtml(commentText)}${(comment.text || '').length > 100 ? '...' : ''}\n`;
      text += `👍 ${likes}\n\n`;
    });
  }

  return text;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
