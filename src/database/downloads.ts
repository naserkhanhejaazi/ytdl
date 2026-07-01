import { JsonDB } from './db';
import { DownloadRecord } from '../types';

export class DownloadRepository {
  private db: JsonDB;

  constructor() {
    this.db = JsonDB.getInstance();
  }

  create(data: { userId: number; videoId: string; url: string; title?: string }): DownloadRecord {
    const record: DownloadRecord = {
      id: this.db.nextId('downloads'),
      user_id: data.userId,
      video_id: data.videoId,
      video_url: data.url,
      title: data.title || null,
      duration: null,
      file_size: null,
      quality: null,
      format: null,
      status: 'pending',
      error_message: null,
      created_at: new Date().toISOString(),
      completed_at: null,
    };

    this.db.downloads.push(record);
    this.db.persist();
    return record;
  }

  updateStatus(videoId: string, userId: number, status: string, extra?: { file_size?: number; error_message?: string }): void {
    const record = this.db.downloads.find(
      (d: any) => d.video_id === videoId && d.user_id === userId && d.status !== 'completed'
    );

    if (record) {
      record.status = status;
      if (extra?.file_size !== undefined) record.file_size = extra.file_size;
      if (extra?.error_message !== undefined) record.error_message = extra.error_message;
      if (status === 'completed') record.completed_at = new Date().toISOString();
      this.db.persist();
    }
  }

  getByVideoAndUser(videoId: string, userId: number): DownloadRecord | undefined {
    return this.db.downloads
      .filter((d: any) => d.video_id === videoId && d.user_id === userId)
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  }

  getRecent(limit: number = 10): DownloadRecord[] {
    return [...this.db.downloads]
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }
}
