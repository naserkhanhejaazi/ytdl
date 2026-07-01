import { UserRepository } from './users';
import { DownloadRepository } from './downloads';
import { MetadataRepository } from './metadata';
import { StatsRepository } from './stats';

export class Database {
  private static instance: Database;
  public users: UserRepository;
  public downloads: DownloadRepository;
  public metadata: MetadataRepository;
  public stats: StatsRepository;

  private constructor() {
    this.users = new UserRepository();
    this.downloads = new DownloadRepository();
    this.metadata = new MetadataRepository();
    this.stats = new StatsRepository();
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}
