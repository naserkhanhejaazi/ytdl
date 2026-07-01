import { JsonDB } from './db';
import { UserRecord } from '../types';

export class UserRepository {
  private db: JsonDB;

  constructor() {
    this.db = JsonDB.getInstance();
  }

  upsert(telegramId: number, data: { username?: string; first_name?: string; last_name?: string }): UserRecord {
    const existing = this.db.users.find((u: any) => u.telegram_id === telegramId);

    if (existing) {
      existing.username = data.username || existing.username;
      existing.first_name = data.first_name || existing.first_name;
      existing.last_name = data.last_name || existing.last_name;
      existing.updated_at = new Date().toISOString();
      this.db.persist();
      return existing;
    }

    const newUser: UserRecord = {
      id: this.db.nextId('users'),
      telegram_id: telegramId,
      username: data.username || null,
      first_name: data.first_name || null,
      last_name: data.last_name || null,
      is_admin: 0,
      is_banned: 0,
      total_downloads: 0,
      total_bandwidth_bytes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.db.users.push(newUser);
    this.db.persist();
    return newUser;
  }

  getByTelegramId(telegramId: number): UserRecord | undefined {
    return this.db.users.find((u: any) => u.telegram_id === telegramId);
  }

  getAll(): UserRecord[] {
    return [...this.db.users].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  setAdmin(telegramId: number, isAdmin: boolean): void {
    const user = this.db.users.find((u: any) => u.telegram_id === telegramId);
    if (user) {
      user.is_admin = isAdmin ? 1 : 0;
      this.db.persist();
    }
  }

  setBanned(telegramId: number, isBanned: boolean): void {
    const user = this.db.users.find((u: any) => u.telegram_id === telegramId);
    if (user) {
      user.is_banned = isBanned ? 1 : 0;
      this.db.persist();
    }
  }

  incrementDownloads(telegramId: number, bandwidthBytes: number): void {
    const user = this.db.users.find((u: any) => u.telegram_id === telegramId);
    if (user) {
      user.total_downloads += 1;
      user.total_bandwidth_bytes += bandwidthBytes;
      user.updated_at = new Date().toISOString();
      this.db.persist();
    }
  }

  getUserStats(): { telegram_id: number; username: string | null; first_name: string | null; total_downloads: number; total_bandwidth_bytes: number }[] {
    return this.db.users
      .filter((u: any) => u.total_downloads > 0)
      .sort((a: any, b: any) => b.total_downloads - a.total_downloads)
      .map((u: any) => ({
        telegram_id: u.telegram_id,
        username: u.username,
        first_name: u.first_name,
        total_downloads: u.total_downloads,
        total_bandwidth_bytes: u.total_bandwidth_bytes,
      }));
  }
}
