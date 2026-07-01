export interface VideoInfo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  channel: string;
  formats: FormatOption[];
}

export interface FormatOption {
  formatId: string;
  label: string;
  size: number;
  type: 'video' | 'audio';
  ext: string;
  height?: number;
  fps?: number;
  vcodec?: string;
  acodec?: string;
}

export interface DownloadOptions {
  formatId: string;
  formatType: 'video' | 'audio';
  outputPath: string;
}

export interface DownloadRecord {
  id: number;
  user_id: number;
  video_id: string;
  video_url: string;
  title: string | null;
  duration: number | null;
  file_size: number | null;
  quality: string | null;
  format: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface UserRecord {
  id: number;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  is_admin: number;
  is_banned: number;
  total_downloads: number;
  total_bandwidth_bytes: number;
  created_at: string;
  updated_at: string;
}

export interface VideoMetadataRecord {
  id: number;
  video_id: string;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
  duration: number | null;
  like_count: number | null;
  comment_count: number | null;
  channel_name: string | null;
  fetched_at: string;
  raw_json: string | null;
}

export interface OverallStats {
  totalUsers: number;
  totalDownloads: number;
  totalBandwidth: number;
  completedDownloads: number;
  failedDownloads: number;
}

export interface UserStats {
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  total_downloads: number;
  total_bandwidth_bytes: number;
}
