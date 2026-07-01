import { spawn } from 'child_process';
import * as path from 'path';
import { VideoInfo, DownloadOptions, FormatOption } from '../types';
import { MAX_FILE_SIZE } from '../utils/constants';

const TARGET_VIDEO_HEIGHTS = [144, 240, 360, 480, 720, 1080];
const TARGET_AUDIO_BITRATES = [128, 320];

const YTDLP_PATH = process.env.YTDLP_PATH || 'yt-dlp';
const COOKIES_FILE = process.env.COOKIES_FILE || '';

function ytdlp(args: string[]): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const finalArgs = COOKIES_FILE ? ['--cookies', COOKIES_FILE, ...args] : args;
    const proc = spawn(YTDLP_PATH, finalArgs);
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
    proc.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });
    proc.on('close', (code) => {
      if (code !== 0) reject(new Error(stderr || `yt-dlp exited with code ${code}`));
      else resolve({ stdout, stderr });
    });
    proc.on('error', (err) => reject(err));
  });
}

export class YtdlpService {
  async getVideoInfo(url: string): Promise<VideoInfo & { rawJson: any }> {
    const { stdout } = await ytdlp([
      '--dump-json', '--no-download', '--no-warnings', '--no-playlist', url,
    ]);
    const raw = JSON.parse(stdout);
    return this.parseVideoInfo(raw);
  }

  async download(
    url: string,
    options: DownloadOptions,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const args = this.buildDownloadArgs(url, options);
      if (COOKIES_FILE) args.splice(0, 0, '--cookies', COOKIES_FILE);
      const proc = spawn(YTDLP_PATH, args);
      let stderr = '';

      proc.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
        const match = data.toString().match(/(\d+\.?\d*)%/);
        if (match && onProgress) onProgress(parseFloat(match[1]));
      });

      proc.on('close', (code) => {
        if (code !== 0) reject(new Error(stderr || 'Download failed'));
        else resolve(options.outputPath);
      });
      proc.on('error', (err) => reject(err));
    });
  }

  async getComments(videoId: string): Promise<any[]> {
    try {
      const { stdout } = await ytdlp([
        '--dump-json', '--no-download', '--no-warnings', '--write-comments',
        '--extractor-args', 'youtube:max_comments=10,10,10',
        `https://www.youtube.com/watch?v=${videoId}`,
      ]);
      const raw = JSON.parse(stdout);
      return raw.comments || [];
    } catch {
      return [];
    }
  }

  private buildDownloadArgs(url: string, options: DownloadOptions): string[] {
    const args = ['--no-warnings', '--no-playlist', '-o', options.outputPath, '--max-filesize', '50M'];

    if (options.formatType === 'audio') {
      args.push('-x', '--audio-format', 'mp3', '--audio-quality', '320');
    } else if (options.formatId) {
      args.push('-f', `${options.formatId}+bestaudio/best`);
      args.push('--merge-output-format', 'mp4');
    }

    args.push(url);
    return args;
  }

  private parseVideoInfo(raw: any): VideoInfo & { rawJson: any } {
    return {
      id: raw.id,
      title: raw.title || 'Unknown Title',
      description: raw.description || '',
      thumbnail: raw.thumbnail || raw.thumbnails?.[raw.thumbnails.length - 1]?.url || '',
      duration: raw.duration || 0,
      viewCount: raw.view_count || 0,
      likeCount: raw.like_count || 0,
      commentCount: raw.comment_count || 0,
      channel: raw.channel || raw.uploader || 'Unknown',
      formats: this.extractFormats(raw.formats || [], raw.duration || 0),
      rawJson: raw,
    };
  }

  private estimateFilesize(f: any, duration: number): number {
    if (f.filesize || f.filesize_approx) return f.filesize || f.filesize_approx;
    if (duration > 0 && f.tbr) return Math.round((f.tbr * 1000 / 8) * duration * 1.1);
    if (duration > 0 && f.abr) return Math.round((f.abr * 1000 / 8) * duration * 1.1);
    return 0;
  }

  private closestTarget(height: number | null | undefined): number | null {
    if (!height) return null;
    let closest = TARGET_VIDEO_HEIGHTS[0];
    let minDiff = Math.abs(height - closest);
    for (const t of TARGET_VIDEO_HEIGHTS) {
      const d = Math.abs(height - t);
      if (d < minDiff) { minDiff = d; closest = t; }
    }
    return closest;
  }

  private closestAudioTarget(abr: number | null | undefined): number | null {
    if (!abr) return null;
    let closest = TARGET_AUDIO_BITRATES[0];
    let minDiff = Math.abs(abr - closest);
    for (const t of TARGET_AUDIO_BITRATES) {
      const d = Math.abs(abr - t);
      if (d < minDiff) { minDiff = d; closest = t; }
    }
    return closest;
  }

  extractFormats(formats: any[], duration: number): FormatOption[] {
    const videoByTarget = new Map<number, { fmt: any; size: number }>();
    const audioByTarget = new Map<number, { fmt: any; size: number }>();

    for (const f of formats) {
      const hasVideo = f.vcodec && f.vcodec !== 'none';
      const hasAudio = f.acodec && f.acodec !== 'none';
      const filesize = this.estimateFilesize(f, duration);

      if (hasVideo) {
        const target = this.closestTarget(f.height);
        if (target === null) continue;
        const existing = videoByTarget.get(target);
        if (!existing || filesize < existing.size) {
          videoByTarget.set(target, { fmt: f, size: filesize });
        }
      } else if (hasAudio) {
        const target = this.closestAudioTarget(f.abr || f.tbr);
        if (target === null) continue;
        const existing = audioByTarget.get(target);
        if (!existing || filesize < existing.size) {
          audioByTarget.set(target, { fmt: f, size: filesize });
        }
      }
    }

    const result: FormatOption[] = [];

    for (const target of TARGET_VIDEO_HEIGHTS.filter(h => videoByTarget.has(h)).sort((a, b) => a - b)) {
      const { fmt, size } = videoByTarget.get(target)!;
      result.push({
        formatId: fmt.format_id, label: `🎬 ${target}p (${fmt.ext})`,
        size, type: 'video', ext: fmt.ext, height: fmt.height,
        fps: fmt.fps, vcodec: fmt.vcodec, acodec: fmt.acodec,
      });
    }

    for (const target of TARGET_AUDIO_BITRATES.filter(b => audioByTarget.has(b)).sort((a, b) => a - b)) {
      const { fmt, size } = audioByTarget.get(target)!;
      result.push({
        formatId: fmt.format_id, label: `🎧 Audio ${target}kbps (mp3)`,
        size, type: 'audio', ext: 'mp3',
        height: undefined, fps: undefined, vcodec: fmt.vcodec, acodec: fmt.acodec,
      });
    }

    return result;
  }
}

export const ytdlpService = new YtdlpService();
