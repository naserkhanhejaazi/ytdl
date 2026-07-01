import { JsonDB } from './db';
import { VideoMetadataRecord } from '../types';

export class MetadataRepository {
  private db: JsonDB;

  constructor() {
    this.db = JsonDB.getInstance();
  }

  upsert(data: {
    videoId: string;
    title?: string;
    description?: string;
    thumbnailUrl?: string;
    duration?: number;
    likeCount?: number;
    commentCount?: number;
    channelName?: string;
    rawJson?: string;
  }): void {
    const existing = this.db.metadata.find((m: any) => m.video_id === data.videoId);

    if (existing) {
      existing.title = data.title || existing.title;
      existing.description = data.description || existing.description;
      existing.thumbnail_url = data.thumbnailUrl || existing.thumbnail_url;
      existing.duration = data.duration || existing.duration;
      existing.like_count = data.likeCount || existing.like_count;
      existing.comment_count = data.commentCount || existing.comment_count;
      existing.channel_name = data.channelName || existing.channel_name;
      existing.raw_json = data.rawJson || existing.raw_json;
      existing.fetched_at = new Date().toISOString();
      this.db.persist();
      return;
    }

    const record: VideoMetadataRecord = {
      id: this.db.nextId('metadata'),
      video_id: data.videoId,
      title: data.title || null,
      description: data.description || null,
      thumbnail_url: data.thumbnailUrl || null,
      duration: data.duration || null,
      like_count: data.likeCount || null,
      comment_count: data.commentCount || null,
      channel_name: data.channelName || null,
      fetched_at: new Date().toISOString(),
      raw_json: data.rawJson || null,
    };

    this.db.metadata.push(record);
    this.db.persist();
  }

  getByVideoId(videoId: string): VideoMetadataRecord | undefined {
    return this.db.metadata.find((m: any) => m.video_id === videoId);
  }
}
