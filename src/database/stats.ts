import { JsonDB } from './db';
import { OverallStats } from '../types';

export class StatsRepository {
  private db: JsonDB;

  constructor() {
    this.db = JsonDB.getInstance();
  }

  getOverall(): OverallStats {
    const users = this.db.users;
    const downloads = this.db.downloads;

    return {
      totalUsers: users.length,
      totalDownloads: downloads.length,
      totalBandwidth: users.reduce((sum: number, u: any) => sum + (u.total_bandwidth_bytes || 0), 0),
      completedDownloads: downloads.filter((d: any) => d.status === 'completed').length,
      failedDownloads: downloads.filter((d: any) => d.status === 'failed').length,
    };
  }
}
